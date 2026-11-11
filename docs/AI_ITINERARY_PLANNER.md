# AI Itinerary Planner — VietnamTravel MVP

## Lộ trình sử dụng

1. Vào bản đồ Việt Nam, chọn một tỉnh (ví dụ Đà Nẵng).
2. Chọn **Lập lịch trình bằng AI**.
3. Nhập 1–14 ngày, 1–20 người, ngân sách nhóm, phong cách (ẩm thực/thiên nhiên/nghỉ dưỡng/văn hóa/khám phá), ngày bắt đầu nếu có và sở thích.
4. Nếu muốn tính cả vé đến/khỏi điểm đến, chọn checkbox và **nhập dự toán vé cả nhóm**; AI không tự đoán giá vé.
5. Nhấn **Tạo lịch trình bằng AI**, xem ngày 1, 2, 3...
6. Sửa khung giờ, mô tả, món/hoạt động, số tiền và danh mục; có thể xóa/thêm hoạt động hoặc **tạo lại riêng một ngày**.
7. Đăng nhập để **Lưu lịch trình**. Trong Planner, phần **Lịch trình đã lưu** cho phép mở lại, sửa, cập nhật hoặc xóa.

Không cần tạo tài khoản để *xem bản nháp AI* khi local database đang sẵn sàng. Lưu lịch trình yêu cầu đăng nhập.

## Kiến trúc

- UI: `src/app/components/AiItineraryPlanner.tsx`
- Models/validators: `src/utils/itinerary.ts`
- Gemini API chung với chat: `api/_lib/gemini.ts`
- Generate: `POST /api/itineraries/generate` (dữ liệu JSON, không tự lưu)
- Per-user CRUD: `GET / POST / PATCH / DELETE /api/itineraries`
- SQLite/Turso schema: bảng riêng `travel_plans` trong `api/_lib/database.ts`

### Request tạo mẫu

```json
{
  "provinceId": "Da Nang",
  "days": 3,
  "partySize": 2,
  "totalBudgetVnd": 3000000,
  "style": "food",
  "startDate": null,
  "includeArrivalTransport": false,
  "arrivalTransportVnd": 0,
  "preferences": {
    "preferAffordablePlaces": true,
    "minimizeTravel": true,
    "notes": ""
  }
}
```

Response trả về `{ "plan": { "schemaVersion": 1, "title": "...", "schedule": [ ... ], "budgetBreakdown": { ... }, "estimatedSpendVnd": 0, "budgetRemainingVnd": 0, "warnings": [] } }`.

Lập lại riêng ngày 2: gửi request gốc cùng `"regenerateDay": 2` và `"currentPlan": <plan hiện tại>`. API xác thực bản nháp hiện tại, chỉ thay ngày số 2 và giữ các ngày còn lại. Việc tạo lại không tự động lưu; người dùng phải bấm lưu.

### Lưu dữ liệu tài khoản

- `POST /api/itineraries` body `{ "plan": <plan> }`, trả `{ "item": { "id", "revision", "createdAt", "updatedAt", "plan" } }`.
- `GET /api/itineraries` trả `{ "items": [...] }`, tối đa 50 lịch trình/user.
- `PATCH /api/itineraries` body `{ "id", "revision", "plan" }`. Nếu revision khác vì đã bị chỉnh ở phiên khác → HTTP 409. Chỉ cập nhật row thuộc đúng session user.
- `DELETE /api/itineraries?id=<uuid>` xóa đúng row của session user, không bao giờ xóa của người khác.

Bảng riêng `travel_plans` được tạo tự động khi kết nối, không thay thế cột `user_travel_data.itineraries` (lịch trình dạng văn bản cũ). Trong UI hai loại lịch trình xuất hiện ở hai mục khác nhau để không gây mất dữ liệu cũ.

## Ngân sách và độ tin cậy

Ngân sách bao gồm tổng cho **toàn nhóm**, không phải mỗi người. Phần ngân sách dự kiến dành cho ăn uống, khách sạn, đi lại, tham quan và dự phòng được tính bằng code. Số tiền các hoạt động AI đề xuất được cộng lại ở server. Nếu vượt, một cảnh báo đỏ/âm ngân sách sẽ xuất hiện và người dùng cần chỉnh.

Giá cả chỉ là **ước tính**, tuyệt đối không phải giá vé/phòng/quán đang áp dụng. Nếu đặt `includeArrivalTransport=true`, người dùng phải nhập khoản dự toán `arrivalTransportVnd` từ 1 VND đến ngân sách trừ 200.000 VND; khoản đó nằm trong nhóm chi phí đi lại, không tự cộng thêm lần hai.

Địa điểm/nhà hàng do AI đề xuất **chưa được xác minh**. Nút **Tìm trên Google Maps** chỉ mở trang tìm kiếm theo tên và tỉnh, không khẳng định đúng địa chỉ hoặc đưa tuyến đường đã được tối ưu. Không bịa thông tin dựa trên thời gian thực.

## Giới hạn và bảo mật

- Chỉ frontend gọi server `/api/itineraries/generate`, không để lộ Gemini/Turso key.
- Giới hạn tạo 8 lượt mỗi giờ/IP qua bảng `rate_limits`. Vẫn có giới hạn dữ liệu đầu vào, timeout và fallback model.
- Ứng dụng chỉ lưu kế hoạch sau khi người dùng bấm **Lưu lịch trình**.
- Mọi thao tác CRUD xác thực `vt_session` và ràng buộc SQL bởi `user_id`.
- Các trường tiêu đề, khung giờ, VND, số ngày, số người, tỉnh và nội dung lịch trình được xác thực lại trên server.
- Bản production **cần TURSO_DATABASE_URL + TURSO_AUTH_TOKEN** theo hướng dẫn ở README (nhánh PR #4). Local sử dụng SQLite mặc định.
- Không có Google routing API: thứ tự điểm đến hiện theo gợi ý AI, chưa tính khoảng cách/chỉ đường thực tế.
- Chưa có dữ liệu thời tiết trực tiếp, giá vé xác minh hoặc chức năng đặt dịch vụ.

## QA trước khi merge

- [ ] `npm ci`, `npm run typecheck`, `npm run typecheck:api`, `npm run test:api`, `node --test scripts/local-api.test.mjs` và `npm run build` đều PASS.
- [ ] Nhập Đà Nẵng, 3 ngày, 2 người, 3 triệu, Food. Hiển thị đủ 3 tab và ngân sách.
- [ ] Sửa/xóa/thêm hoạt động làm tổng chi phí tính lại, cảnh báo khi vượt.
- [ ] Ngày 2 được tạo lại không ghi đè Ngày 1 và Ngày 3.
- [ ] Đăng nhập, lưu, reload, mở lại, sửa và xóa lịch trình; người dùng B không thấy dữ liệu người A.
- [ ] Kiểm tra không thể cập nhật với revision cũ (HTTP 409).
- [ ] Guest xem bản nháp nhưng lưu bị khóa; không lộ thông tin riêng.
- [ ] Nhập vé di chuyển > ngân sách phải báo lỗi, không âm tiền.
- [ ] Test Gemini thật (trả JSON hợp lệ và không hợp lệ), timeout, rate limit 8 lượt/giờ.
- [ ] Kiểm tra thao tác/keyboard/modal trên màn hình 320px, 375px, 430px.
- [ ] Test Turso thật qua Vercel Preview sau khi đã cấu hình secret.

Không merge PR #5 trước khi PR #4 (SQLite/Turso) đã được duyệt/merge và kiểm tra đầy đủ.


## Bản đồ lịch trình theo ngày (PR: daily map)

- Mỗi tab **Ngày 1 / Ngày 2 / ...** có bản đồ OpenStreetMap với các ghim đánh số theo thứ tự hoạt động. Có phóng to, thu nhỏ, đặt lại khung nhìn và nhấn ghim để xác minh trên Google Maps.
- **Chỉ đường Google Maps** dùng Directions URLs theo tên địa điểm; tự chia thành chặng tối đa 5 điểm, nối tiếp chặng trước. Không dùng Gemini để đoán khoảng cách, giờ chạy, tọa độ hoặc tình trạng giao thông.
- `POST /api/itineraries/locations` nhận `{ provinceId, stops: [{ id, title, category }] }` tối đa 12 điểm mỗi ngày, trả `{ points: [{ id, lat, lon, label }], unlocatedIds, pending, retryAfterMs }`. Không cần API key Google Maps mới.
- Định vị bằng Nominatim công khai **chỉ sau khi người dùng mở lịch trình/ngày**, không tìm kiếm gợi ý theo từng phím. API giới hạn tối đa một yêu cầu định vị mới trên toàn hệ thống mỗi 1,6 giây bằng khóa nguyên tử trong SQLite/Turso. Chỉ định vị tối đa một địa điểm chưa có cache mỗi lần, kết quả thành công lưu 60 ngày, không tìm được lưu 14 ngày.
- Món ăn chung (ví dụ `Mì Quảng`), hoạt động chung và di chuyển không được coi là một địa điểm cụ thể. Nếu Nominatim không trả đúng tỉnh, **không tạo ghim**; thay vào đó giữ nút tìm Google Maps.
- Nền bản đồ lấy tile từ OpenStreetMap theo khung nhìn thực tế, có attribution © OpenStreetMap contributors, không tải hàng loạt tile và tuân thủ cache của trình duyệt.
- Đường nét đứt là **đoạn nối trực quan giữa ghim**, không phải đường đi thực tế. Người dùng cần kiểm tra lại địa điểm, tuyến và giờ mở cửa trong Google Maps.
- Phần bản đồ được tách trong `src/app/components/ItineraryDayMap.tsx`; phần tính URL nằm trong `src/utils/itinerary-map.ts`. Không thay đổi schema JSON của lịch trình và không ghi tọa độ vào dữ liệu lịch trình AI.
- Cách QA: Đà Nẵng 3 ngày, chọn Ngày 1 / Ngày 2 / Ngày 3; một ngày có `Cầu Rồng` và `Bà Nà Hills` sẽ thử định vị; món chung `Mì Quảng` không ghim bừa. Thử nút chỉ đường, chỉnh sửa tên địa điểm, đổi ngày, mở lịch trình đã lưu, màn hình nhỏ; thử mạng không có Nominatim để bảo đảm fallback.
- Public Nominatim/tile service không có SLA và không phù hợp nếu ứng dụng đông người. Nếu tăng quy mô, chuyển nhà cung cấp bản đồ/định vị có hạn mức rõ ràng thay vì tăng tần suất gọi public API.

Tham khảo chính sách: https://operations.osmfoundation.org/policies/nominatim/ và https://operations.osmfoundation.org/policies/tiles/

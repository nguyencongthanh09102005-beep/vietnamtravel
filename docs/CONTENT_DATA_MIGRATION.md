# VietnamTravel — Nâng cấp dữ liệu tự cập nhật theo từng đợt

## Đợt 1 — Bảo vệ và chuẩn hóa dữ liệu (đã thêm vào code)

**Nguồn dữ liệu gốc vẫn nguyên vẹn:** `src/data/provinceDetailsData.ts`.
Không xóa, chuyển tên hoặc ghi đè file này. Nó vẫn là nguồn hiển thị của website
cho đến khi bộ đọc dữ liệu mới được kiểm thử xong.

- `src/utils/contentArchive.ts` chuẩn hóa dữ liệu thủ công thành các bản ghi:
  `provinceId`, `section`, `position`, `id`, `origin`, `editorialStatus`,
  `sourceFile`, `payload`. Mọi ảnh, mô tả, sự kiện lịch sử, thống kê, banner
  và nguồn hành chính được giữ nguyên.
- Các ID bám tên nội dung (không phụ thuộc thứ tự). Nếu trùng tên, vẫn tạo
  bản ghi riêng, tuyệt đối không tự bỏ nội dung.
- `restoreLegacyCatalog` khôi phục lại cấu trúc cũ. Kiểm thử đối chiếu
  toàn bộ dữ liệu trước/sau với `deepEqual`, bao gồm 36 khu vực trong code
  hiện tại (34 tỉnh/thành và 2 quần đảo).
- Bảng Turso/SQLite mới `travel_content_versions` và `travel_content_items`
  được tạo theo kiểu cộng thêm (CREATE TABLE IF NOT EXISTS), có chỗ cho
  nguồn, trạng thái duyệt, phiên bản và khả năng chuyển phiên bản.
  **Chưa import dữ liệu hay thay đổi nội dung website** trong đợt 1.

### Tạo bản sao lưu trên máy

```powershell
cd "D:\dự án\vietnamtravel"
git pull origin main
npm ci
npm run catalog:backup
```

Kết quả được lưu tại `.data/backups/legacy-province-catalog.v1.json`,
kèm SHA-256 trong terminal. Thư mục `.data/` đã có trong `.gitignore`,
không đưa nội dung local (đặc biệt dữ liệu tài khoản) lên GitHub.
Lệnh này chỉ đọc file nguồn và ghi bản sao lưu local, **không gửi dữ liệu lên
Turso/Vercel và không cần Gemini API**.

Để kiểm tra quá trình chuẩn hóa:

```powershell
npm run test:api
```

Đợt 1 chỉ chuẩn bị hạ tầng và chứng minh dữ liệu có thể phục hồi. Không thay
đổi giao diện hiện tại. Dữ liệu thủ công vẫn được giữ trong lịch sử Git.

## Đợt 2 — Thẻ nội dung và popup chi tiết

Giữ nguyên bản đồ bên trái và banner/tab tỉnh ở bên phải. Nhấn thẻ
Địa điểm/Ẩm thực sẽ mở một **modal chồng lên trang hiện tại**, tối ưu mobile,
đóng để trở lại vị trí cuộn cũ. Ảnh, mô tả, lịch sử/nguồn gốc, nguồn xác minh,
liên kết Google Maps theo loại nội dung.

## Đợt 3 — Đọc dữ liệu động và chuyển an toàn

Thêm API public chỉ đọc phiên bản **đã duyệt**, có cache và fallback về
`provinceDetailsData.ts` khi DB lỗi hoặc thiếu dữ liệu. Chuyển dữ liệu thủ
công vào DB bằng lệnh import riêng có dry-run, bản sao lưu và cơ chế rollback;
không ghi đè dữ liệu đang được người dùng xem khi chưa xác minh.

## Đợt 4 — Công cụ phát hiện thay đổi

Bộ xử lý chạy định kỳ ở phía máy chủ: lấy nguồn hợp pháp, kiểm chứng, phát
hiện khác biệt, chuẩn hóa và **đưa vào hàng chờ duyệt**. Chỉ bản được đánh dấu
approved mới có thể xuất bản. Không cho Gemini/LLM tự bịa nguồn, giờ mở cửa,
giá vé hay ảnh. Phân biệt `AI đề xuất` và `đã đối chiếu nguồn`.

## Đợt 5 — Hành chính và bản đồ động

Phát hiện văn bản chính thức về sáp nhập/đổi tên, lập ánh xạ tỉnh cũ → mới,
kiểm thử địa giới và dữ liệu SVG/bản đồ. Giữ tỉnh cũ làm dữ liệu lịch sử/alias,
không làm mất liên kết lịch trình đã lưu. Đây là thay đổi hệ thống, **không
nên cho AI trực tiếp sửa SVG hoặc lịch sử nếu thiếu bản đồ và văn bản chính thức**.

## Nguyên tắc vận hành

- Khách mở trang sẽ đọc dữ liệu **đã lưu**, không chờ tác vụ AI.
- AI tự động chỉ hoạt động theo lịch, có giới hạn API, cache, retry và
  thông báo lỗi; thất bại phải giữ phiên bản ổn định.
- Dữ liệu có nguồn kiểm tra được, thời điểm cập nhật, lịch sử phiên bản.
- Giữ phong cách Clean & Minimal, không thay toàn bộ layout.
- Kiểm thử CI mỗi đợt; **chưa phát hành phiên bản mới lên Production** trước
  khi hoàn thiện và xác minh đủ phạm vi mong muốn.

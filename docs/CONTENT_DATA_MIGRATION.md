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

### Đợt 4 — Mã nguồn đã triển khai (chế độ an toàn)

- `vercel.json`: chạy `/api/content/refresh` lúc **02:00 UTC hằng ngày** (sau khi bản mới được deploy và cấu hình).
- `CRON_SECRET`: bắt buộc, tối thiểu 32 ký tự; Vercel Cron gửi `Authorization: Bearer <CRON_SECRET>`. Không đặt bí mật trong GitHub hay frontend.
- Bộ lấy dữ liệu Wikipedia tiếng Việt chạy nền, tối đa 3 tỉnh/ngày, 2 truy vấn/tỉnh; kiểm tra liên kết nguồn, độ dài, tên và lọc trùng. Ảnh Wikimedia có cờ **phải kiểm tra giấy phép/tác giả** trước khi xuất bản.
- Các đề xuất mới chỉ lưu `travel_content_versions.reviewed_status=pending`, **không tự công khai**. Đây là rào an toàn vì một nguồn cộng đồng chưa đủ chứng minh vị trí/giờ mở cửa/nguồn gốc món ăn. Website vẫn đọc dữ liệu đã được duyệt ngay.
- API nội bộ `/api/content/review` yêu cầu **CONTENT_REVIEW_SECRET** riêng; hỗ trợ xem đề xuất, duyệt/từ chối, khôi phục một phiên bản đã duyệt. Không sử dụng cookie đăng nhập người dùng để cấp quyền duyệt.
- Nếu `CRON_SECRET` chưa cài trên Vercel hoặc Vercel không thể triển khai, tác vụ **chưa hoạt động tự động**. Không nên tuyên bố dữ liệu đã tự cập nhật.
- Bước tiếp theo để đạt **tự xuất bản**: tích hợp thêm nguồn địa lý/thông tin chính thức độc lập và quy tắc xác minh đủ nghiêm trước khi tự chuyển `pending → approved`. Những nội dung hành chính có rủi ro cao luôn yêu cầu đối chiếu nguồn công bố chính thức.

#### Kiểm thử local

```powershell
npm run test:api
node --test scripts/local-api.test.mjs
```

Không chạy tác vụ cập nhật thật trên Production khi chưa thiết lập bí mật và chưa kiểm tra điều khoản sử dụng dữ liệu, ảnh.

## Đợt 5 — Hành chính và bản đồ động

Phát hiện văn bản chính thức về sáp nhập/đổi tên, lập ánh xạ tỉnh cũ → mới,
kiểm thử địa giới và dữ liệu SVG/bản đồ. Giữ tỉnh cũ làm dữ liệu lịch sử/alias,
không làm mất liên kết lịch trình đã lưu. Đây là thay đổi hệ thống, **không
nên cho AI trực tiếp sửa SVG hoặc lịch sử nếu thiếu bản đồ và văn bản chính thức**.

### Đợt 5 — Đã triển khai ở mức phát hiện và giữ tương thích

- Danh sách **29 tên tỉnh cũ** từ Nghị quyết số 202/2025/QH15 được giữ làm bí danh tìm kiếm trong `src/data/historicalProvinceAliases.ts`. Ví dụ: **Hà Giang → Tuyên Quang**, **Tiền Giang → Đồng Tháp**, **Bà Rịa – Vũng Tàu → TP.HCM**. Link `?province=...` cũ sẽ tự tìm về tỉnh hiện hành, không xóa dữ liệu lịch trình.
- Nguồn: `https://xaydungchinhsach.chinhphu.vn/chi-tiet-34-don-vi-hanh-chinh-cap-tinh-tu-12-6-2025-119250612141845533.htm` (Báo Điện tử Chính phủ, văn bản 202/2025/QH15) và trang tin `https://xaydungchinhsach.chinhphu.vn/sap-nhap.html`.
- `/api/administration/check` được lên lịch Vercel Cron hằng ngày lúc **03:00 UTC**. Khi được cấu hình `CRON_SECRET` và deploy, nó đọc nguồn chính thức, so sánh số lượng đơn vị hành chính với 34 tỉnh/thành hiện có và tạo bản ghi khi thấy thông tin mới, thay vì tự sửa dữ liệu nguồn.
- `/api/administration/aliases` có thể đọc alias đã duyệt từ database và thêm bí danh mới bằng `CONTENT_REVIEW_SECRET` qua API quản trị; không cho xóa hoặc thay đổi bí danh cũ không kiểm chứng.
- Hai bảng theo dõi `travel_admin_checks`, `travel_admin_candidates` và bảng bí danh `travel_province_aliases` được bổ sung mà không thay đổi dữ liệu người dùng.

**Giới hạn bắt buộc:** Hệ thống hiện **tự phát hiện nguồn và đặt cảnh báo**, nhưng **chưa tự thay đổi địa giới hoặc tên tỉnh hiện tại**. Bản đồ đang dùng SVG cố định; muốn tự áp dụng sáp nhập trong tương lai phải có dữ liệu ranh giới số được cơ quan có thẩm quyền cung cấp, giấy phép phù hợp, kiểm tra tọa độ/topology và quy trình di chuyển provinceId có khả năng phục hồi. Không thể suy ra đường ranh giới từ văn bản tin tức, và không nên ghi đè các lịch trình đã lưu khi chưa xác minh.

Trong năm 2026, nguồn chính thức hiện vẫn công bố **34 tỉnh/thành**; không tự giả định có đợt sáp nhập mới.

## Nguyên tắc vận hành

- Khách mở trang sẽ đọc dữ liệu **đã lưu**, không chờ tác vụ AI.
- AI tự động chỉ hoạt động theo lịch, có giới hạn API, cache, retry và
  thông báo lỗi; thất bại phải giữ phiên bản ổn định.
- Dữ liệu có nguồn kiểm tra được, thời điểm cập nhật, lịch sử phiên bản.
- Giữ phong cách Clean & Minimal, không thay toàn bộ layout.
- Kiểm thử CI mỗi đợt; **chưa phát hành phiên bản mới lên Production** trước
  khi hoàn thiện và xác minh đủ phạm vi mong muốn.

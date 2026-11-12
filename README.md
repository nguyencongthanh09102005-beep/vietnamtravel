# VietnamTravel

VietnamTravel là web khám phá bản đồ Việt Nam, các tỉnh thành, lịch sử, ẩm thực và trợ lý AI du lịch theo tỉnh. Có tài khoản cá nhân, tỉnh yêu thích/đã đi, lịch trình và lịch sử chat AI.

## Chạy local — một lệnh

Yêu cầu **Node.js 22.13+** (khuyên dùng Node 22 LTS; `node:sqlite` có trên Node 22).

```bash
npm ci
npm run dev
```

Truy cập địa chỉ Vite hiển thị, thường là http://localhost:5173. **Không cần Vercel CLI, Supabase hay database server riêng.** Lần đầu đăng ký, app tự tạo SQLite tại `.data/vietnamtravel.sqlite` trên máy. File và phiên đăng nhập của mỗi tài khoản chỉ lưu cục bộ khi bạn chạy local.

Copy `.env.example` thành `.env` rồi điền **Gemini API key**. Có thể để trống toàn bộ mục Turso/Resend khi chỉ phát triển local. **Đừng commit file .env, .data hay token**.

## Đợt 1 — Chuẩn bị dữ liệu du lịch tự cập nhật

Dữ liệu tỉnh thành, lịch sử, địa điểm và ẩm thực **do bạn tự viết** tại
`src/data/provinceDetailsData.ts` vẫn được giữ nguyên, tiếp tục hiển thị
bình thường. Có thể xuất bản sao lưu local và kiểm tra phục hồi đầy đủ:

```bash
npm run catalog:backup
```

Lệnh ghi `.data/backups/legacy-province-catalog.v1.json` (được gitignore),
**không gửi dữ liệu lên Turso**, không thay đổi nội dung website. Đã bổ sung
schema lưu phiên bản nội dung; API đọc dữ liệu động và việc tự tìm/cập nhật
sẽ triển khai trong các đợt tiếp theo.

Xem [Lộ trình chuẩn hóa và tự động cập nhật dữ liệu](docs/CONTENT_DATA_MIGRATION.md).

## AI Itinerary Planner (MVP)

Chọn tỉnh trên bản đồ và nhấn **Lập lịch trình bằng AI** để tạo hành trình theo ngày, ngân sách, số người và phong cách du lịch. Ví dụ: **Đà Nẵng, 3 ngày, 2 người, 3.000.000đ, ưu tiên ẩm thực**.

- Tạo lịch trình có cấu trúc theo các buổi trong ngày, xem lại từng ngày và tổng ngân sách cho cả nhóm.
- Sửa tên, giờ, chi phí, loại hoạt động; thêm/xóa hoạt động và tạo lại riêng một ngày mà không ghi đè các ngày khác.
- Đăng nhập để lưu/mở lại/cập nhật/xóa lịch trình vào bảng `travel_plans` của SQLite/Turso; bản nháp của khách không tự lưu.
- Bản đồ lịch trình **theo từng ngày** dùng OpenStreetMap: ghim đánh số cho các địa điểm đủ cụ thể và được dịch vụ geocoding tìm thấy. Món ăn chung/điểm không xác minh được sẽ không có ghim; có nút Google Maps để tự kiểm tra.
- Nút **Mở chỉ đường Google Maps** đưa các địa điểm theo thứ tự vào Directions (chia thành các chặng nhỏ nếu nhiều điểm); nét đứt trên bản đồ chỉ minh họa thứ tự, **không phải tuyến đường thực tế**. Vị trí từ Nominatim công khai có cache và được giới hạn truy vấn.
- Giá và vị trí chỉ là gợi ý ước tính; địa điểm, tuyến và giờ mở cửa cần được xác minh trước khi đi.
- Sử dụng chung Gemini API với chatbot hiện có, hạn thời gian và model dự phòng.

**Tài liệu:** [AI Itinerary Planner — kiến trúc, JSON contract và QA](docs/AI_ITINERARY_PLANNER.md).

## Lưu trữ tài khoản

- **Trên máy:** SQLite native của Node.js; tên, email, mật khẩu băm bằng `scrypt`, phiên đăng nhập HTTP-only và tỉnh/lịch trình/chat đều lưu ở `.data/vietnamtravel.sqlite`. Không cần dịch vụ bên ngoài để đăng ký/đăng nhập.
- **Trên Vercel:** phải có database từ xa để lưu bền vững vì hệ thống file của Vercel Functions không tồn tại bền vững qua mỗi lần chạy. Chọn **Turso/libSQL** (dùng giao thức HTTPS v2) và thiết lập `TURSO_DATABASE_URL` cùng `TURSO_AUTH_TOKEN` trong Vercel → Project → Settings → Environment Variables. Không cần thêm npm dependency.
- **Schema:** tự tạo khi kết nối lần đầu; không chạy SQL thủ công. Hệ thống sử dụng các bảng `users`, `sessions`, `user_travel_data`, `travel_plans`, `password_resets`, `rate_limits`.
- **Bảo mật:** mật khẩu lưu bằng scrypt với salt riêng, token đăng nhập chỉ lưu hash SHA-256 trong database, cookie HttpOnly/SameSite=Lax/Secure trên Vercel; có giới hạn thử đăng nhập/đăng ký và email khôi phục. Không trả mật khẩu hay token session trong JSON.
- **Quên mật khẩu:** nếu muốn gửi email đặt lại, cấu hình `RESEND_API_KEY`, `AUTH_EMAIL_FROM` và `AUTH_PUBLIC_URL` (URL domain website). Nếu chưa cấu hình dịch vụ email, đăng nhập và đăng ký vẫn hoạt động nhưng nút quên mật khẩu sẽ báo chưa sẵn sàng.

## Triển khai online

1. Tạo database tại [Turso](https://turso.tech/) (hoặc dịch vụ libSQL tương thích Hrana HTTP v2). Lấy Database URL và Auth Token.
2. Mở Vercel Project → Settings → Environment Variables, khai báo: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `GEMINI_API_KEY` và tùy chọn `GOOGLE_MAPS_API_KEY`. Với khôi phục mật khẩu, khai báo thêm các biến Resend bên trên.
3. Redeploy dự án, kiểm tra `/api/auth/me` trả `configured:true`. Sau đó thử đăng ký và đăng nhập từ một cửa sổ trình duyệt khác.
4. **Không sử dụng SQLite local làm database online trên Vercel**; nó không có filesystem lưu bền vững.

## Dữ liệu tài khoản cũ

Hệ thống **không còn dùng Supabase**. Tài khoản Supabase cũ sẽ không tự hoạt động do mật khẩu cũ không thể chuyển sang hệ thống mới mà không có quy trình xác thực/migration riêng. Người dùng cần **đăng ký lại** trên cơ sở dữ liệu mới. Dữ liệu yêu thích, nơi đã đi, lịch trình và lịch sử chat trước đây **không được tự động di chuyển**; phải xuất từ nguồn cũ và nhập riêng nếu vẫn truy cập được. **Đừng xóa dự án Supabase cũ khi chưa sao lưu dữ liệu cần giữ.**

## API

Các API vẫn giữ đúng đường dẫn cũ, giao diện không cần thay đổi:
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `PATCH /api/auth/profile`, `POST /api/auth/recover`, `POST /api/auth/reset-password`
- `GET/PATCH /api/user-data`, `POST /api/ai`

## Kiểm thử

```bash
npm run typecheck
npm run typecheck:api
node scripts/check-assets.mjs
node --test scripts/content-integrity.test.mjs
npm run test:api
node --test scripts/local-api.test.mjs
npm run build
```

**Giới hạn:** test Turso từ xa và email thật cần credentials hợp lệ trên Preview; CI dùng mock và SQLite local, không chứng minh dịch vụ online đã được cấu hình hay thông suốt.

## Giao diện và dữ liệu

Bản đồ Việt Nam SVG tương tác; 34 tỉnh/thành và 2 quần đảo; 4 tab tổng quan, lịch sử, địa điểm, ẩm thực; tìm kiếm không dấu; URL chia sẻ từng tỉnh; link Google Maps; Gemini theo tỉnh với lịch sử chat, lưu lịch trình và tỉnh yêu thích. Phần frontend React/Vite/Tailwind vẫn giữ nguyên.

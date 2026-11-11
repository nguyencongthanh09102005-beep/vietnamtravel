# VietnamTravel — checklist kiểm thử trước khi merge

> Dành cho PR #2. Các mục bên dưới là các **ca cần kiểm thử thủ công**, không phải kết quả PASS. CI chỉ kiểm tra typecheck, dữ liệu ảnh, hành vi API mô phỏng và production build.

## Môi trường

- [ ] Mở Preview Deployment từ PR trên điện thoại và máy tính (không dùng production/main).
- [ ] Vercel Preview có \`GEMINI_API_KEY\`, \`GEMINI_MODEL\`, \`GEMINI_FALLBACK_MODEL\`, \`SUPABASE_URL\`, \`SUPABASE_ANON_KEY\`; chỉ cấu hình \`GOOGLE_MAPS_API_KEY\` nếu dùng Google Places.
- [ ] Supabase đã chạy \`supabase/schema.sql\`; trong Auth → URL Configuration đã allowlist domain preview và production cho email recovery.

## Bản đồ, tìm kiếm, liên kết

- [ ] Chọn Hà Nội, Quảng Ninh, Đồng Tháp, Hoàng Sa, Trường Sa: banner/tabs hiển thị đúng và không có ảnh lỗi.
- [ ] Gõ "ha noi"/"Hà Nội"; dùng Arrow Up/Down, Enter, Escape và Tab. Dùng trình đọc màn hình nếu có.
- [ ] Click đường biên SVG, nền bản đồ và nút zoom: không chọn tỉnh không tồn tại.
- [ ] Sao chép liên kết \`?province=Ha%20Noi\`, mở tab mới: chọn đúng Hà Nội (qua màn hình đăng nhập/khách nếu cần).
- [ ] Chọn nhiều tỉnh, dùng Back/Forward của trình duyệt: thông tin và bản đồ đồng bộ.
- [ ] Nhấn "Xem trên Google Maps" tại thẻ địa điểm: mở tìm kiếm đúng địa danh.

## Tài khoản

- [ ] Đăng ký, xác thực email nếu được yêu cầu, đăng nhập, đăng xuất; kiểm tra session sau khi làm mới trang.
- [ ] Đổi tên hiển thị, thêm URL avatar HTTPS, làm mới trang: dữ liệu vẫn còn. URL không hợp lệ phải bị từ chối.
- [ ] Nhấn "Quên mật khẩu?", yêu cầu email recovery, mở link trên trình duyệt chưa đăng nhập, đặt mật khẩu mới rồi đăng nhập.
- [ ] Mở link recovery trong lúc đang đăng nhập: vẫn hiện form đặt lại mật khẩu; không còn token trong URL bar.
- [ ] Thử link reset đã hết hạn và mật khẩu ngắn: phải có lỗi rõ ràng.
- [ ] Chế độ khách không được truy cập dữ liệu cá nhân.

## Hành trình của tôi

- [ ] Lưu/bỏ yêu thích Hà Nội, đánh dấu/huỷ đánh dấu Đồng Tháp đã đi.
- [ ] Làm mới trình duyệt và đăng nhập máy thứ hai: tỉnh lưu/đã đi vẫn đúng.
- [ ] Tạo lịch trình thủ công, sửa tiêu đề/nội dung, xóa (có xác nhận); kiểm tra giới hạn 50 lịch trình.
- [ ] Yêu cầu AI gợi ý lịch trình và nhấn "Lưu lịch trình này": form được điền bằng phản hồi AI; lưu và xem lại.
- [ ] Tắt kết nối mạng trước khi mở bộ sưu tập: không được ghi đè dữ liệu cloud bằng danh sách rỗng.
- [ ] Tắt mạng lúc nhấn lưu: hiện lỗi và cho phép thử lại, không đánh dấu lưu thành công.

## AI và đồng bộ chat

- [ ] Chat đúng tỉnh trả lời; hỏi sang tỉnh khác bị từ chối theo phạm vi.
- [ ] Gợi ý quán/địa điểm khi Google Places có key: card có địa chỉ và liên kết Maps.
- [ ] Tạm bỏ Google Places key ở preview: AI/Google Maps URL vẫn có thể dùng với dữ liệu nội bộ.
- [ ] Mô phỏng Gemini lỗi 429/503 hoặc request chậm: không chờ vô hạn, hiện thông báo và link Maps dự phòng.
- [ ] Khi cloud chat load lỗi, không gửi lịch sử rỗng lên cloud; dùng "Thử lại" rồi kiểm tra lịch sử cũ.
- [ ] Sau khi gửi câu hỏi, làm mới trang: lịch sử chat còn nếu đồng bộ đã thành công.

## Mobile và hiệu năng

- [ ] iPhone/Android 320px, 375px, 430px: bản đồ, thẻ tỉnh, menu, chat và dialog không tràn ngang.
- [ ] Mở bàn phím khi chat: ô nhập, nút gửi và nút đóng vẫn thao tác được.
- [ ] Test zoom/pan bằng cảm ứng, chạm tỉnh và cuộn trong modal hành trình.
- [ ] Chạy Lighthouse mobile/desktop trên **Preview**: ghi lại LCP, CLS, INP, kích thước trang và ảnh cần tối ưu.
- [ ] Thử 3G chậm, ảnh ngoài bị chặn và khi backend API ngắt: hiển thị fallback phù hợp.

## Các giới hạn còn lại

- Rate limiting AI hiện **chưa có bộ đếm tập trung** giữa các Vercel Functions. Cần Redis/managed rate limiting hoặc Vercel Firewall trước khi phát hành cho lượng người dùng lớn.
- Avatar hiện hỗ trợ **URL HTTPS**, chưa có thao tác tải ảnh từ máy lên Storage.
- Chưa có bộ E2E trình duyệt tự động và chưa có kết quả Lighthouse thực tế.
- Dữ liệu số liệu dân số/giá vé/giờ mở cửa thay đổi theo thời gian cần kiểm chứng trước mục đích thương mại.

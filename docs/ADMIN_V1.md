# VietnamTravel Admin V1 — vận hành an toàn trên nhánh thử nghiệm

## Phạm vi và giao diện

Một route `/admin` duy nhất, dashboard Clean & Minimal (không sidebar):
- Bốn ô: 34 tỉnh/thành, số ảnh còn thiếu, món ăn chưa có URL nguồn, ảnh trong hàng chờ.
- **Nội dung**: tìm kiếm, lọc tỉnh/loại/chất lượng, thêm mới, sửa theo phiên bản, gỡ và khôi phục; form bên phải trên desktop và toàn màn hình trên điện thoại.
- **Duyệt**: danh sách phiên bản pending, hai URL đối chiếu, từ chối hoặc duyệt & xuất bản; ảnh ứng viên hiển thị theo nhóm tên và tỉnh với tác giả, giấy phép, URL file nguồn.
- **Cập nhật**: yêu cầu tìm nguồn hoặc ảnh theo một tỉnh (chỉ tạo job, không đợi tải ngay); xem kết quả queued/running/completed/failed.
- **Báo cáo**: thống kê chất lượng theo 34 tỉnh và nhật ký admin.

Không thay đổi phần UI dành cho khách. Chỉ nhập/sửa/xóa mềm các mục **địa điểm và ẩm thực**, không cho thao tác thủ công trực tiếp vào địa giới, bản đồ SVG, thống kê hành chính hay lịch sử tỉnh.

## Quyền truy cập

Backend `/api/admin` yêu cầu **đồng thời** phiên đăng nhập `vt_session` hợp lệ và email trong `ADMIN_EMAILS`, kiểm tra **ở mọi request**. Frontend **không chứa** admin secret. POST yêu cầu Origin cùng gốc và JSON + header chuyên biệt, rate limit dùng DB. Không dùng email trên frontend làm quyền truy cập.

Trên máy Windows:

```powershell
cd "D:\dự án\vietnamtravel"
git switch feature/vietnamtravel-map-affiliate-osm-20261114
git pull --ff-only origin feature/vietnamtravel-map-affiliate-osm-20261114
```

Trong **`.env.local`** (không commit), điền email đang dùng để **đăng nhập VietnamTravel**:

```dotenv
ADMIN_EMAILS=your-registered-admin@example.com
LOCAL_CONTENT_AUTORUN=0
```

Khi cần pipeline quét nền hoặc dùng hàng đợi local tự xử lý, bỏ dòng `LOCAL_CONTENT_AUTORUN=0` (hoặc đặt `1`) sau khi cân nhắc các kết nối/nguồn bên ngoài; server cần khởi động lại để đọc env mới. Lưu ý: dev adapter chỉ chạy admin worker trên SQLite local, không chạy trên Turso online. `LOCAL_CONTENT_AUTORUN=0` hiện cũng tắt dev worker. Với tài khoản admin chưa đăng ký, hãy đăng ký/đăng nhập trên VietnamTravel trước.

```powershell
npm run typecheck
npm run typecheck:api
npm run test:api
npm run build
npm run dev
```

Đăng nhập tại `http://localhost:5173/` bằng email admin, sau đó truy cập `http://localhost:5173/admin`.

Nếu `/admin` báo không có quyền: xác nhận `.env.local` có `ADMIN_EMAILS` đúng email tài khoản đã đăng nhập; khởi động lại Vite. **Không** đưa mật khẩu, `CONTENT_REVIEW_SECRET`, `CRON_SECRET`, `TURSO_AUTH_TOKEN` vào frontend hay commit GitHub.

## Quy trình nội dung

1. Admin tạo/sửa: yêu cầu tên/tỉnh/loại/mô tả và ít nhất 2 URL HTTPS thuộc **hai tổ chức độc lập**. Kiểm tra tên chủ thể và nội dung URL bằng mắt, vì việc có hai domain **không bảo đảm thông tin chính xác**. Wikimedia/Wikidata/Wikipedia cùng hệ nguồn được xem như một nhóm.
2. Admin có thể bấm **AI biên tập 2–3 câu**, yêu cầu `GEMINI_API_KEY`; Gemini chỉ diễn đạt dựa trên dữ kiện admin cung cấp. Không tự truy cập URL và không được công bố kết quả tự động. Kiểm tra lại từng ý trước khi lưu.
3. Phiên bản mới ở `pending`; chỉ admin được phép duyệt mới chuyển thành `approved`, gắn `current_version_id`.
4. Nội dung đã công bố vẫn hiển thị cho tới khi phiên bản sửa mới được duyệt. Gỡ chỉ ghi vào `travel_content_quarantine`, giữ lịch sử phiên bản. Khôi phục từ quarantine là thao tác khác với khôi phục **một phiên bản cũ** (`restore-version`).
5. Hệ thống tự phát hiện Wikipedia chỉ tạo phiên bản chờ duyệt, không tự đăng; chưa tự đối chiếu đủ hai nguồn chính thống. **AI không thay thế xác minh của admin.**

## Quy trình ảnh và tác vụ

- Ảnh thiếu ở **catalog gốc** cũng được tìm kiếm khi chạy hàng đợi, không chỉ nội dung `auto_v2`. Ưu tiên Commons, Openverse sau; Flickr chỉ khi chủ dự án có quyền dùng API thương mại. Ảnh phải thực sự đúng chủ thể và giữ link trang nguồn, tên tác giả, giấy phép.
- Chỉ đưa ảnh **CC0 / CC BY / CC BY-SA / public domain** được bộ lọc hỗ trợ vào danh sách; NC/ND không được chọn. Gắn nguồn hay tải ảnh báo chí không tự tạo quyền tái sử dụng.
- Ảnh có license hợp lệ trong kết quả tìm kiếm vẫn chỉ là **ứng viên chờ duyệt**; không tự xuất bản. Duyệt ảnh là một thao tác nội dung có phiên bản và nhật ký.
- `/api/admin` chỉ đưa yêu cầu vào `travel_admin_jobs`. Worker xử lý từng đơn vị có checkpoint. Local worker trong Vite chạy theo chu kỳ khi `LOCAL_CONTENT_AUTORUN` bật và không dùng Turso; endpoint cron `/api/admin/worker` đòi `CRON_SECRET` dài tối thiểu 32 ký tự, cron khai báo trong `vercel.json` nhưng **không chạy cho đến khi được triển khai sau khi có sự cho phép riêng**.
- Nếu API bên ngoài timeout/hết quyền hoặc job bị ngắt, trạng thái `failed` sẽ hiện trong UI; có thể tạo yêu cầu mới. Worker không bảo đảm hoàn thành toàn bộ một tỉnh trong một lần; trên serverless cần chú ý giới hạn thời gian chạy thực tế.

## Migration, fallback và những giới hạn chưa hoàn tất

- **Không tự chạy `catalog:import -- --apply`** hoặc bật `CONTENT_DB_CANONICAL=1` khi chưa lập backup, kiểm tra catalog gốc + approved và nhập đủ nội dung vào database đích. Script import hiện **chỉ cho local SQLite**, không hỗ trợ tự nhập Turso online.
- Ở chế độ mặc định, API vẫn ghép catalog gốc + phiên bản approved, nhưng có lớp **quarantine** để tránh card đã gỡ tự hiện lại. Khi DB lỗi, endpoint public chỉ giữ tổng quan/lịch sử, **không trả danh sách địa điểm/món ăn chưa thể xác minh quyền hiển thị**.
- Chế độ `CONTENT_DB_CANONICAL=1` là chuẩn bị cho bước DB làm nguồn duy nhất; muốn bật phải nhập, so sánh đủ dữ liệu gốc và chuẩn bị rollback cả local lẫn Turso. **V1 không tự thay đổi DB production.**
- Kết quả kiểm toán ban đầu (trên máy của bạn, trước khi sửa): 14 ảnh thiếu, 199 ảnh thiếu thông tin ghi công, 100 món thiếu link nguồn. Các con số là **việc cần rà soát**, không đồng nghĩa ảnh vi phạm bản quyền. Code **không tự bổ sung** toàn bộ nguồn và ảnh đó, cũng không khẳng định đã xác minh đủ 34 tỉnh.
- Những bản ghi thuộc catalog gốc vẫn có ảnh/nguồn cũ chưa đủ metadata; admin có thể lọc để sửa dần. Không tự xóa hay thay ảnh hàng loạt.
- Đường cũ `/api/content/review` dùng `CONTENT_REVIEW_SECRET` riêng; giữ bí mật và không đưa token này ra browser.

## Ràng buộc phát triển

Chỉ nhánh `feature/vietnamtravel-map-affiliate-osm-20261114`. Không merge `main`, không deploy Vercel, không áp dụng migration Turso production khi chưa được bạn đồng ý riêng. GitHub Actions kiểm thử ở môi trường tạm với SQLite, **không phải** test database/website production.

**Lệnh cũ `npm run catalog:photos` nay chỉ tạo ứng viên chờ duyệt; không tự gắn ảnh lên nội dung công khai.**

## Tìm nguồn tự động / Duyệt tất cả

- Trong panel **Thêm/Sửa**, bấm **AI tìm nguồn**. Chương trình trả các **link gợi ý**, bạn mở từng link gốc, kiểm chứng, rồi bấm **Chọn nguồn** để điền vào hai ô URL. Không dùng hai URL cùng một tổ chức làm hai nguồn độc lập. Tên nút đề cập AI theo trải nghiệm sản phẩm, nhưng nguồn được tìm qua chỉ mục web; AI không tự chấp nhận bằng chứng.
- Trong tab **Cập nhật**, bấm **Tìm nguồn tất cả**. Khi chưa chọn tỉnh, tạo một job cho tất cả 34 tỉnh; nếu đã chọn tỉnh thì chỉ quét tỉnh đó. Job lưu danh sách bản ghi còn thiếu tối thiểu 2 nguồn và xử lý **một mục mỗi lần worker chạy**. Có thể mất nhiều vòng cron; không cam kết tìm đủ nguồn.
- Muốn tìm trên web rộng, khai báo biến **`BRAVE_SEARCH_API_KEY`** vào `.env.local` (dịch vụ Brave Search API bên ngoài, có gói và chi phí/giới hạn riêng) rồi **khởi động lại server**. Không có key thì chỉ dò từ metadata RSS đã lưu trong SQLite/Turso; sẽ không thể bổ sung đủ 100 món nếu không có bài phù hợp. Không tải ảnh, không tự scrape nội dung bài.
- Mọi kết quả mới được lưu ở bảng `travel_content_source_suggestions` với trạng thái **suggested**, không tự ghi vào `travel_content_versions`, không tự đánh dấu nguồn đã xác minh. **Dùng nguồn** chỉ mở panel cho bạn tự đối chiếu và chọn trước khi lưu phiên bản pending.
- Trong tab **Duyệt**, có **Chọn tất cả đủ điều kiện** và **Duyệt tất cả đã chọn** (tối đa **20 phiên bản/lần**). Bạn phải tick xác nhận đã đọc/đối chiếu từng mục. Server kiểm tra lại quyền admin, nguồn độc lập, giấy phép/ghi công ảnh, trạng thái pending và quarantine trước mỗi quyết định. Mục không đạt được báo lý do và bỏ qua; không tự duyệt ảnh theo lô.
- Mở rộng bộ nguồn trong tương lai cần kiểm tra điều khoản Brave và các nguồn cung cấp. Tìm được URL khác domain **không tự chứng minh** nguồn phù hợp, nội dung có thật hay hai tổ chức độc lập.

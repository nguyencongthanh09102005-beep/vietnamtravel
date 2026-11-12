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

## Đợt 6 — Tự bổ sung nội dung ngay trên localhost

Đợt 6 thay đổi bộ quét từ **chỉ tạo ứng viên** sang **tự đăng các mục đạt
điều kiện kiểm chứng tối thiểu**. Không cần Vercel, không chạy AI mỗi lần
khách xem trang.

### Khi chạy npm run dev

- Sau khi Vite bắt đầu, tác vụ chạy **ở phía sau**, ưu tiên Thanh Hóa, Hà Nội,
  Đồng Tháp, TP.HCM, Đà Nẵng rồi đến các tỉnh còn lại.
- Tìm nhiều trang Wikipedia tiếng Việt cho địa điểm/đặc sản của cả tỉnh hiện
  tại và các tỉnh cũ được sáp nhập.
- Chỉ công khai các mục có bài viết nêu đúng tỉnh, định danh Wikidata,
  ảnh pageimage thực sự từ Wikimedia Commons, giấy phép cho phép sử dụng
  thương mại và ghi công tác giả. Địa điểm còn cần tọa độ.
- **Những mục còn thiếu bằng chứng vẫn để pending; không tự bịa nội dung hay
  dùng ảnh tỉnh thay cho ảnh món ăn.** Các nguồn thuộc Wikimedia không phải
  nhiều nguồn độc lập, nên kiểm tra này chưa thể đảm bảo chính xác tuyệt đối.
- Lưu phiên bản đã duyệt vào SQLite local; dữ liệu thủ công được giữ nguyên.
  Nếu nguồn tìm thấy một mục **trùng đúng tên thẻ cũ**, có thể nâng cấp mô tả
  và ảnh dưới dạng **phiên bản mới**, không xóa bản cũ và có đường phục hồi.
  Khi tab tỉnh đang mở, giao diện sẽ đọc lại nội dung sau mỗi 45 giây hoặc
  khi bạn quay lại tab.
- Ghi nhận từng nhóm tỉnh đã quét; không kiểm tra lại trong vòng 7 ngày trừ
  khi yêu cầu `--force`. Có thể tắt bộ quét tự động bằng cách cấu hình
  `LOCAL_CONTENT_AUTORUN=0` trong môi trường trước khi chạy Vite.

### Quét ngay một tỉnh trên localhost

```powershell
cd "D:\dự án\vietnamtravel"
git pull origin main
npm run catalog:enrich -- --province "Thanh Hoa" --force
npm run dev
```

Lệnh `catalog:enrich` dùng SQLite local `.data/vietnamtravel.sqlite`,
không ghi vào Turso online và không cần Gemini API key. Tên tỉnh phải là
ID từ `src/data/provincesData.ts` (ví dụ: `Dong Thap`, `Ha Noi`).
Không truyền `--province` sẽ quét mọi tỉnh, mất nhiều thời gian hơn.

Theo dõi terminal với thông báo `new N, pending M`. Nếu N = 0, nguồn có
thể thiếu bài viết, ảnh đúng hoặc giấy phép phù hợp; đây không phải bằng chứng
rằng có 8–15 điểm/món của tỉnh. **Không tạo mục giả để đủ số lượng.**

**Nếu localhost đang kết nối Turso qua `TURSO_DATABASE_URL`:** bộ quét tự
động khi chạy Vite chủ động bỏ qua để bảo vệ dữ liệu online. Để thử trên
SQLite cục bộ, chạy với cấu hình Turso trống. Khi triển khai Production,
Cron đã có logic kiểm chứng tương tự, nhưng còn cần `CRON_SECRET`,
cấu hình backend và một lần triển khai Vercel.

### Phần chưa hoàn thành

- Quét và chuẩn hóa tất cả mốc **lịch sử hình thành** từ nguồn chính thức.
- Tự động phát hành các mục không có ảnh Wikimedia đạt chuẩn hoặc không có
  thông tin địa phương đầy đủ.
- Dữ liệu chuẩn về từng món ăn và địa điểm từ nhiều nguồn độc lập.
- Tự sửa địa giới hành chính mới và bản đồ SVG.

## Sửa lỗi chất lượng dữ liệu tự đăng (sau phản hồi 7 ảnh)

**Vấn đề đã xác nhận:** Trước đây bộ quét chỉ tìm keyword trong tóm tắt
Wikipedia, không kiểm chứng **chủ thể thực sự**. Vì vậy người Dao hoặc
đoàn chèo có thể lọt vào Ẩm thực; tin sập cầu có thể lọt vào Địa điểm;
Quảng Bình (tỉnh) bị đưa vào Địa điểm Quảng Trị; Don (món ăn) bị trùng
với Don Quảng Ngãi.

### Nguyên tắc mới

1. Bản ghi tự tạo từ bộ lọc cũ có ID phiên bản `auto_...` sẽ **không
   xuất hiện trên giao diện** ngay khi cập nhật code. Điều này áp dụng cho
   cả những mục cũ đúng: cần kiểm chứng lại trước khi công khai.
2. Muốn tự đăng mới cần chứng cứ phân loại từ **cả chuyên mục bài viết
   Wikipedia lẫn mô tả Wikidata**, tên chủ thể, liên hệ tỉnh trong phần
   mở đầu, tọa độ nếu là Địa điểm. Bản mới đánh dấu `auto_v2_` và
   `taxonomyGateVersion=2`. Một số bài vẫn có thể sai; hệ thống ưu tiên
   không đăng hơn đăng nhầm.
3. Tin tai nạn/sự cố, dân tộc, đoàn nghệ thuật, tỉnh/thành phố và giống
   vật nuôi không phải đối tượng của Địa điểm/Ẩm thực. Thực phẩm/đặc sản
   chưa chắc là **món ăn chế biến**, cần gọi đúng tên nhóm.
4. Chuẩn hóa tên vùng và hậu tố `(món ăn)` để tránh hai thẻ cùng một
   đặc sản (ví dụ Don Quảng Ngãi và Don (món ăn)).
5. Dữ liệu thủ công trong `provinceDetailsData.ts` không bị xóa.
   Cơ sở dữ liệu chỉ lưu bản ghi/phiên bản bổ sung.

### Dọn sạch dữ liệu đã đăng sai trên LOCALHOST

Dừng `npm run dev` trước khi chạy lệnh làm sạch database trên máy.
Tại terminal:

```powershell
cd "D:\dự án\vietnamtravel"
git pull origin main
npm run catalog:quarantine
npm run catalog:quarantine -- --apply
npm run catalog:enrich -- --force
npm run dev
```

- Lệnh **không có `--apply`** chỉ liệt kê mục tự động cũ sẽ bị cách ly.
- Lệnh có `--apply` sao lưu danh sách vào
  `.data/backups/legacy-auto-content-quarantine.json`, ghi nhật ký vào
  `travel_content_quarantine` và **bỏ liên kết đang hiển thị**
  của các phiên bản `auto_` đời cũ trong local SQLite.
- **Không xóa `travel_content_versions`**, cũng không chạm tài khoản
  hay lịch trình đã lưu. Bản gốc trong code vẫn hiển thị.
- Đợt quét mới dùng checkpoint `taxonomy-v2:` để chủ động kiểm tra
  lại nguồn, không bị vướng cache 7 ngày của hệ cũ.
- Tác vụ local sẽ không tự cập nhật Turso online. Nếu đã bật biến Turso
  trong terminal, lệnh cách ly sẽ từ chối vì lý do an toàn.

**Giới hạn:** Nguồn Wikipedia và Wikidata có thể thiếu phân loại hoặc
dữ liệu cũ, nên số mục mới có thể giảm đáng kể. Đây là sửa **độ đúng**,
không phải cam kết đạt 8–15 mục ngay. Muốn bổ sung nhiều mục chất lượng
hơn cần thêm nguồn du lịch chính thức, OpenStreetMap và quy trình xác
minh chéo không đánh đồng kết quả tìm kiếm với địa điểm thật.

## Nguồn xác minh và ảnh đúng địa điểm (đợt kế tiếp)

### Danh sách nguồn được kiểm tra

`src/data/trustedSources.ts` phân tách nguồn theo đúng mục đích:

- **Hành chính:** chinhphu.vn, vanban.chinhphu.vn; khi cập nhật cần kiểm tra **Nghị quyết 202/2025/QH15** (hiện là 34 tỉnh/thành). `gso.gov.vn` hỗ trợ số liệu thống kê theo từng năm, không được mang số liệu cũ áp vào đơn vị sáp nhập mới.
- **Du lịch:** vietnamtourism.gov.vn, visithcmc.vn; thông tin điểm đến phải có nguồn đối chiếu, không tự copy nội dung/ảnh nếu chưa có quyền sử dụng.
- **Ẩm thực:** `vcca.vn` (Hiệp hội Văn hóa Ẩm thực Việt Nam). **KHÔNG dùng `vcca.org.vn`** (Hiệp hội Sáng tạo và Bản quyền tác giả Việt Nam).
- **Gợi ý cộng đồng:** vi.wikivoyage.org và vi.wikipedia.org + Wikidata; không coi bách khoa mở là nguồn chính thức duy nhất.
- **RSS phát hiện tin:** vnexpress.net/rss/du-lich.rss, tuoitre.vn/rss/du-lich.rss, thanhnien.vn/rss/du-lich.rss; chỉ lưu metadata tối thiểu và link, tránh cào bài đầy đủ.
- **Ảnh:** Wikimedia Commons cần kiểm tra giấy phép, nguồn file và ghi công. Unsplash API chỉ phù hợp ảnh banner/cảnh quan có người duyệt, cần API key, hotlink/attribution đúng quy định; **chưa tự động lấy ảnh món ăn từ Unsplash** vì dễ sai món.

### Cách chạy nguồn RSS và Gemini trong localhost

```powershell
npm run catalog:sources
npm run catalog:sources -- --ai
```

- Lệnh thứ nhất đọc RSS trên danh sách cố định rồi lưu bảng
  `travel_source_leads` với `review_status=pending`, không đăng lên web.
- `--ai` sử dụng GEMINI_API_KEY từ `.env.local` để **phân loại tiêu đề và
  tóm tắt ngắn** (địa điểm, ẩm thực, lịch sử, tin tức), không tự tạo địa điểm,
  món ăn, tọa độ, ảnh hoặc nội dung không được nguồn chứng minh. Kết quả AI
  vẫn chờ đối chiếu độc lập trước khi đưa vào danh mục.
- Khi mở `npm run dev`, nguồn RSS cũng được kiểm tra nền hằng ngày, nhưng
  mặc định **không phát sinh chi phí Gemini**. Muốn bật AI phân loại nguồn ở
  chế độ dev, đặt biến môi trường `LOCAL_SOURCE_AI_CLASSIFY=1` trong
  `.env.local` (chỉ khi đã có GEMINI_API_KEY).
- Không đồng bộ bộ quét source với Production Turso nếu môi trường local đang
  có `TURSO_DATABASE_URL`; không cho user-facing request đợi AI.

### Bổ sung ảnh cho các thẻ đã có sẵn

```powershell
npm run catalog:photos
```

- Chỉ bổ sung ảnh cho **thẻ tự động được xác minh ở bộ taxonomy v2** và
  đang trống ảnh, không ghi đè ảnh thủ công.
- Dùng **Wikidata P18** (ảnh của chính thực thể) hoặc ảnh cover của đúng
  bài Wikipedia làm gợi ý; kiểm tra file Commons qua API, chỉ nhận ảnh với
  giấy phép cho phép tái sử dụng và có tên tác giả/trang nguồn.
- Ghi nguồn ảnh, ghi công và giấy phép trong phần popup; giữ nguyên phiên bản
  cũ trong `travel_content_versions` để có thể rollback.
- Nếu không tìm được ảnh chính xác, **giữ placeholder** thay vì ảnh sai tỉnh
  hoặc ảnh món ăn không liên quan.
- Khi `npm run dev` chạy, local sẽ chủ động sửa ảnh thiếu cho một nhóm
  thẻ mỗi lượt; có thể chạy lệnh trên để xử lý nhiều thẻ nhanh hơn.

### Chưa thay đổi gì

- Website **chưa tự đăng** bài từ báo RSS; muốn xuất bản cần bước trích xuất
  nội dung được cấp phép và kiểm chứng thực thể.
- Cổng du lịch/vcca.vn hiện **được cấu hình thành nguồn hợp lệ** nhưng chưa
  có bộ trích xuất có thể đảm bảo áp dụng cho mọi URL của từng website.
- Không tự lấy ảnh từ báo hoặc trang du lịch thương mại rồi đăng lại.
- Không đảm bảo tìm được ảnh cho tất cả địa danh/món ăn; tính đúng chủ thể,
  giấy phép và nguồn vẫn được ưu tiên hơn sự đầy đủ hình ảnh.

## Sửa lỗi phân loại RSS đã lưu & bổ sung ảnh có xác minh

Dấu hiệu nhận biết từ người dùng:

```text
catalog:photos: checked 27, new licensed photos 1, unavailable 26, errors 0
catalog:sources: scanned 72, inserted 72, classified 0
catalog:sources -- --ai: scanned 72, inserted 0, classified 0
```

- **RSS:** trước đây `INSERT OR IGNORE` chỉ lưu 72 bài ban đầu ở trạng thái
  `unknown`. Khi chạy `--ai` sau, bộ quét bỏ qua bản đã có nên AI
  **không cập nhật dữ liệu lưu** dù có thể đã gọi model. Giờ đây sẽ
  truy vấn các bản `kind=unknown, review_status=pending` trong SQLite,
  phân loại theo nhóm tối đa 8 bài/lượt, rồi `UPDATE` trực tiếp chỉ các
  bản đang chờ. Các bài đã phân loại sẽ không cần gọi AI lần nữa.
- Output thêm `aiBatches`, `remainingUnclassified`, `aiConfigured`.
  `classified` là số bài **thực sự được lưu nhãn mới**, không phải số
  bài AI nhìn thấy hoặc số bài được xuất bản. Khi thiếu Gemini key hoặc
  model lỗi, báo rõ trong Terminal.
- **Ảnh:** nhiều trang Wikidata không có P18. Khi backfill, nếu P18 trống,
  hệ thống kiểm tra `pageimage` từ **đúng bài Wikipedia** của mục đó,
  xác nhận `wikibase_item` trùng với QID rồi mới tải metadata giấy phép
  từ Commons. Không dùng ảnh kết quả tìm kiếm chung theo từ khóa.
- **Giới hạn:** vẫn có thể chỉ tìm được một phần ảnh. Dữ liệu không có
  ảnh được xác minh sẽ tiếp tục dùng ô trạng thái trung tính.

### Chạy trên localhost

```powershell
cd "D:\dự án\vietnamtravel"
git pull origin main
npm run catalog:sources -- --ai
npm run catalog:photos
npm run dev
```

Lệnh RSS sẽ xử lý cả bài đã lưu từ lượt chạy trước, không tạo 72 bản trùng.
RSS chỉ tạo đề xuất **chờ kiểm chứng**, không tự đưa các tin tức lên
danh sách Địa điểm/Ẩm thực. Bản thủ công không bị sửa, dữ liệu trên Turso
online không bị đụng vào.

## Nguyên tắc vận hành

- Khách mở trang sẽ đọc dữ liệu **đã lưu**, không chờ tác vụ AI.
- AI tự động chỉ hoạt động theo lịch, có giới hạn API, cache, retry và
  thông báo lỗi; thất bại phải giữ phiên bản ổn định.
- Dữ liệu có nguồn kiểm tra được, thời điểm cập nhật, lịch sử phiên bản.
- Giữ phong cách Clean & Minimal, không thay toàn bộ layout.
- Kiểm thử CI mỗi đợt; **chưa phát hành phiên bản mới lên Production** trước
  khi hoàn thiện và xác minh đủ phạm vi mong muốn.

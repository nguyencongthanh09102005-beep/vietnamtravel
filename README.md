# Vietnam Travel

Vietnam Travel là ứng dụng web tương tác giúp người dùng khám phá Việt Nam thông qua bản đồ SVG, thông tin tổng quan, lịch sử, địa điểm nổi bật, ẩm thực và trợ lý AI theo từng tỉnh thành.

## Điểm nổi bật

- Bản đồ Việt Nam dạng SVG có thể click, zoom, pan và reset.
- Tìm tỉnh thành bằng tiếng Việt có dấu hoặc không dấu.
- Chọn tỉnh từ ô tìm kiếm sẽ tự đồng bộ và zoom bản đồ tới khu vực tương ứng.
- Nội dung được chia thành 4 nhóm: Tổng quan, Lịch sử, Địa điểm và Ẩm thực.
- Trợ lý AI du lịch dạng chat, thu gọn/mở rộng ngay bên cạnh phần thông tin tỉnh.
- Mỗi tỉnh có lịch sử chat riêng; AI bị khóa ngữ cảnh theo tỉnh đang chọn.
- AI hỗ trợ gợi ý lịch trình, địa điểm đáng đến, ẩm thực, quán ăn và cách di chuyển.
- Tích hợp Google Maps URL để tìm địa điểm và mở chỉ đường mà không cần API key.
- Có thể dùng Google Places API (New) để bổ sung dữ liệu quán ăn/địa điểm trực tiếp khi cấu hình key.
- Dữ liệu hành chính của các đơn vị hình thành sau sắp xếp năm 2025 có nguồn tham khảo chính thức ngay trong giao diện.
- Giao diện responsive cho desktop và thiết bị di động.
- Có loading/error state cho bản đồ và fallback khi hình ảnh bị lỗi.
- Có TypeScript strict checking và production build trong GitHub Actions.

## Công nghệ

- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion
- Lucide React
- react-zoom-pan-pinch
- Vercel Functions
- Gemini API
- Google Maps URLs
- Google Places API (tùy chọn)

## Cấu trúc chính

```text
api/
└── ai.ts

src/
├── app/
│   ├── App.tsx
│   └── components/
│       ├── ProvinceDetails.tsx
│       ├── TravelAiAssistant.tsx
│       ├── VietnamMap.tsx
│       └── figma/
│           └── ImageWithFallback.tsx
├── data/
│   ├── provincesData.ts
│   └── provinceDetailsData.ts
├── imports/
│   └── vietnam_map_split_new_01_07_(1).svg
├── styles/
│   └── utilities.css
└── utils/
    ├── googleMaps.ts
    └── text.ts
```

`provincesData.ts` là nguồn metadata duy nhất cho tên hiển thị và banner. `provinceDetailsData.ts` chứa nội dung chi tiết; component `ProvinceDetails` chỉ chịu trách nhiệm render giao diện.

`TravelAiAssistant.tsx` quản lý giao diện và lịch sử chat theo từng tỉnh. `api/ai.ts` chạy server-side trên Vercel để giữ API key khỏi frontend, kiểm tra phạm vi tỉnh, lấy dữ liệu Google Places khi có cấu hình và gửi ngữ cảnh tới Gemini.

## Chạy dự án

Yêu cầu Node.js phiên bản LTS hiện hành.

```bash
npm install
npm run dev
```

Kiểm tra TypeScript và build production:

```bash
npm run typecheck
npm run build
npm run preview
```

## Cấu hình AI trên Vercel

Không đưa API key vào source code hoặc commit lên GitHub.

Trong Vercel Project → Settings → Environment Variables, thêm:

```text
GEMINI_API_KEY=<Gemini API key của bạn>
GEMINI_MODEL=gemini-3.7-flash
```

`GEMINI_MODEL` là tùy chọn. Nếu không khai báo, backend dùng `gemini-3.7-flash`.

Sau khi thêm biến môi trường, redeploy Production để Vercel Function nhận key mới.

## Google Maps và Google Places

### Google Maps URL

Các nút tìm kiếm và chỉ đường dùng Google Maps URL nên hoạt động mà không cần API key. Khi mở chỉ đường và không chỉ định điểm xuất phát, Google Maps có thể sử dụng vị trí hiện tại của người dùng.

### Google Places API (tùy chọn)

Nếu muốn AI tham chiếu dữ liệu địa điểm trực tiếp như tên quán, địa chỉ và rating, bật Places API (New) trong Google Cloud và thêm biến môi trường:

```text
GOOGLE_MAPS_API_KEY=<Google Maps Platform API key>
```

Backend chỉ gọi Places API cho các câu hỏi có ý định rõ ràng như quán ăn, địa điểm, lịch trình; nếu không có key thì AI vẫn dùng dữ liệu nội bộ và các nút Google Maps vẫn hoạt động.

## Quy tắc phạm vi của AI

- AI chỉ trả lời về tỉnh/thành đang được chọn trên bản đồ.
- Nếu câu hỏi nhắc tới một tỉnh khác, backend trả lời yêu cầu người dùng đổi tỉnh trước.
- Mỗi tỉnh lưu một luồng chat riêng ở phía giao diện trong phiên sử dụng hiện tại.
- Khi lập lịch trình, AI ưu tiên dữ liệu địa điểm/ẩm thực của tỉnh đang chọn và dữ liệu Places trực tiếp nếu có.
- Với chỉ đường, AI chỉ mô tả ở mức hỗ trợ; đường đi thời gian thực được mở bằng Google Maps.

## Cách hoạt động của bản đồ

SVG bản đồ chứa `id` cho từng tỉnh/thành. Ứng dụng tải SVG nội bộ, xác định vùng được click, đồng bộ tỉnh đang chọn với panel thông tin và dùng `react-zoom-pan-pinch` để phóng tới vùng tương ứng.

Danh sách trong `src/data/provincesData.ts` dùng cùng `id` với SVG để tránh phải duy trì nhiều bảng ánh xạ khác nhau.

## Dữ liệu hành chính

Các đơn vị cấp tỉnh hình thành sau đợt sắp xếp năm 2025 được cập nhật diện tích, dân số và mốc vận hành chính quyền địa phương mới dựa trên thông tin công bố chính thức liên quan Nghị quyết 202/2025/QH15.

Nguồn tham khảo chính:

- Cổng Thông tin điện tử Chính phủ / Xây dựng chính sách: thông tin chi tiết 34 đơn vị hành chính cấp tỉnh sau sắp xếp năm 2025.

Nội dung du lịch, địa điểm và ẩm thực trong dự án phục vụ mục đích học tập và trình diễn portfolio; các thông tin có tính thời điểm nên được tiếp tục đối chiếu khi sử dụng cho mục đích chính thức.

## Kiểm tra chất lượng

GitHub Actions trên `main` chạy:

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`

Ngoài ra project có script kiểm tra asset và tối ưu ảnh đã được sử dụng trong đợt refactor ban đầu.

## Nguồn và attribution

Một phần giao diện ban đầu được khởi tạo từ Figma Make rồi được chỉnh sửa và phát triển thêm. Xem `ATTRIBUTIONS.md` để biết thông tin về tài nguyên bên thứ ba.

## Hướng phát triển tiếp

- Lưu lịch sử chat vào localStorage hoặc tài khoản người dùng.
- Bổ sung user location để cá nhân hóa gợi ý gần vị trí hiện tại.
- Bổ sung URL routing cho từng tỉnh để chia sẻ trực tiếp.
- Thêm test cho assistant, search và tương tác bản đồ.
- Theo dõi Lighthouse/Core Web Vitals trên bản production.

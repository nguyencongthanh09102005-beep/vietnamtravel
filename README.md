# Vietnam Travel

Vietnam Travel là ứng dụng web tương tác giúp người dùng khám phá Việt Nam thông qua bản đồ SVG, thông tin tổng quan, lịch sử, địa điểm nổi bật và ẩm thực của từng tỉnh thành.

## Điểm nổi bật

- Bản đồ Việt Nam dạng SVG có thể click, zoom, pan và reset.
- Tìm tỉnh thành bằng tiếng Việt có dấu hoặc không dấu.
- Chọn tỉnh từ ô tìm kiếm sẽ tự đồng bộ và zoom bản đồ tới khu vực tương ứng.
- Nội dung được chia thành 4 nhóm: Tổng quan, Lịch sử, Địa điểm và Ẩm thực.
- Dữ liệu hành chính của các đơn vị hình thành sau sắp xếp năm 2025 có nguồn tham khảo chính thức ngay trong giao diện.
- Giao diện responsive cho desktop và thiết bị di động.
- Có loading/error state cho bản đồ và fallback khi hình ảnh bị lỗi.
- Ảnh dung lượng lớn được tối ưu tự động trong quy trình cleanup.
- Có TypeScript strict checking và production build trong GitHub Actions.

## Công nghệ

- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion
- Lucide React
- react-zoom-pan-pinch

## Cấu trúc chính

```text
src/
├── app/
│   ├── App.tsx
│   └── components/
│       ├── ProvinceDetails.tsx
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
    └── text.ts
```

`provincesData.ts` là nguồn metadata duy nhất cho tên hiển thị và banner. `provinceDetailsData.ts` chứa nội dung chi tiết; component `ProvinceDetails` chỉ chịu trách nhiệm render giao diện, không còn ôm toàn bộ data và chuỗi điều kiện theo từng tỉnh.

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

## Cách hoạt động của bản đồ

SVG bản đồ chứa `id` cho từng tỉnh/thành. Ứng dụng tải SVG nội bộ, xác định vùng được click, đồng bộ tỉnh đang chọn với panel thông tin và dùng `react-zoom-pan-pinch` để phóng tới vùng tương ứng.

Danh sách trong `src/data/provincesData.ts` dùng cùng `id` với SVG để tránh phải duy trì nhiều bảng ánh xạ khác nhau.

## Dữ liệu hành chính

Các đơn vị cấp tỉnh hình thành sau đợt sắp xếp năm 2025 được cập nhật diện tích, dân số và mốc vận hành chính quyền địa phương mới dựa trên thông tin công bố chính thức liên quan Nghị quyết 202/2025/QH15.

Nguồn tham khảo chính:

- Cổng Thông tin điện tử Chính phủ / Xây dựng chính sách: thông tin chi tiết 34 đơn vị hành chính cấp tỉnh sau sắp xếp năm 2025.

Nội dung du lịch, địa điểm và ẩm thực trong dự án phục vụ mục đích học tập và trình diễn portfolio; các thông tin có tính thời điểm nên được tiếp tục đối chiếu khi sử dụng cho mục đích chính thức.

## Chất lượng repository

Branch refactor sử dụng workflow để:

1. Tách dữ liệu khỏi component lớn theo cách xác định, tránh copy tay hàng nghìn dòng.
2. Kiểm tra toàn bộ đường dẫn ảnh được tham chiếu.
3. Loại bỏ bộ UI sinh sẵn không được ứng dụng sử dụng.
4. Cài dependency tối giản.
5. Chạy `tsc --noEmit`.
6. Build production bằng Vite.
7. Tối ưu ảnh quá lớn mà vẫn giữ nguyên đường dẫn file.

## Nguồn và attribution

Một phần giao diện ban đầu được khởi tạo từ Figma Make rồi được chỉnh sửa và phát triển thêm. Xem `ATTRIBUTIONS.md` để biết thông tin về tài nguyên bên thứ ba.

## Hướng phát triển tiếp

- Bổ sung test tương tác cho tìm kiếm và bản đồ.
- Bổ sung URL routing cho từng tỉnh để có thể chia sẻ trực tiếp.
- Deploy bản demo công khai và theo dõi Lighthouse/Core Web Vitals.

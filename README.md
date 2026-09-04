# Vietnam Travel

Vietnam Travel là ứng dụng web tương tác giúp người dùng khám phá Việt Nam thông qua bản đồ SVG, thông tin tổng quan, lịch sử, địa điểm nổi bật và ẩm thực của từng tỉnh thành.

## Điểm nổi bật

- Bản đồ Việt Nam dạng SVG có thể click, zoom, pan và reset.
- Tìm tỉnh thành bằng tiếng Việt có dấu hoặc không dấu.
- Khi chọn tỉnh từ ô tìm kiếm, bản đồ tự zoom đến khu vực tương ứng.
- Nội dung được chia thành 4 nhóm: Tổng quan, Lịch sử, Địa điểm và Ẩm thực.
- Hiệu ứng chuyển cảnh bằng Framer Motion / Motion.
- Giao diện responsive cho desktop và thiết bị di động.
- Có trạng thái loading, lỗi tải bản đồ và fallback khi hình ảnh bị lỗi.

## Công nghệ

- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion / Motion
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
│   └── provincesData.ts
├── imports/
│   └── vietnam_map_split_new_01_07_(1).svg
├── styles/
└── utils/
    └── text.ts
```

## Chạy dự án

Yêu cầu Node.js phiên bản LTS hiện hành.

```bash
npm install
npm run dev
```

Build bản production:

```bash
npm run build
npm run preview
```

## Cách hoạt động của bản đồ

SVG bản đồ chứa `id` cho từng tỉnh/thành. Ứng dụng tải SVG, xác định vùng được click, đồng bộ tỉnh đang chọn với panel thông tin và dùng `react-zoom-pan-pinch` để phóng đến vùng tương ứng.

Danh sách tỉnh trong `src/data/provincesData.ts` dùng cùng `id` với SVG để tránh phải ánh xạ thủ công giữa giao diện tìm kiếm và bản đồ.

## Dữ liệu và hình ảnh

Nội dung du lịch được tổng hợp phục vụ mục đích học tập và trình diễn dự án. Khi sử dụng dữ liệu hành chính, dân số hoặc lịch sử cho mục đích chính thức, cần đối chiếu nguồn cơ quan nhà nước và cập nhật theo thời điểm sử dụng.

Một số thành phần giao diện ban đầu được tạo từ Figma Make; dự án sau đó được chỉnh sửa và phát triển thêm. Thông tin attribution nằm trong `ATTRIBUTIONS.md`.

## Hướng phát triển

- Chuẩn hóa dữ liệu tỉnh/thành thành một data model duy nhất.
- Bổ sung nguồn tham khảo cho các số liệu hành chính.
- Tối ưu toàn bộ ảnh sang WebP/AVIF và responsive images.
- Bổ sung test cho tìm kiếm và tương tác bản đồ.
- Deploy bản demo công khai.

## License / attribution

Xem `ATTRIBUTIONS.md` để biết nguồn của các thành phần và hình ảnh bên thứ ba được sử dụng trong dự án.

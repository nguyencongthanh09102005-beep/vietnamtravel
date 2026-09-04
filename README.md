# Vietnam Travel

Vietnam Travel là ứng dụng web tương tác giúp người dùng khám phá Việt Nam thông qua bản đồ SVG, thông tin tổng quan, lịch sử, địa điểm nổi bật, ẩm thực, tài khoản cá nhân và trợ lý AI theo từng tỉnh thành.

## Điểm nổi bật

- Bản đồ Việt Nam dạng SVG có thể click, zoom, pan và reset.
- Tìm tỉnh thành bằng tiếng Việt có dấu hoặc không dấu.
- Chọn tỉnh từ ô tìm kiếm sẽ tự đồng bộ và zoom bản đồ tới khu vực tương ứng.
- Nội dung được chia thành 4 nhóm: Tổng quan, Lịch sử, Địa điểm và Ẩm thực.
- Đăng ký/đăng nhập bằng email, session lưu bằng HttpOnly cookie.
- Có chế độ khách để vẫn dùng website khi chưa đăng nhập.
- Dữ liệu tài khoản có thể lưu riêng theo từng user bằng Supabase + Row Level Security.
- Trợ lý AI du lịch dạng chat, thu gọn/mở rộng ngay bên cạnh phần thông tin tỉnh.
- Mỗi tỉnh có lịch sử chat riêng; AI bị khóa ngữ cảnh theo tỉnh đang chọn.
- Lịch sử chat AI tự đồng bộ cloud khi người dùng đã đăng nhập.
- AI hỗ trợ gợi ý lịch trình, địa điểm đáng đến, ẩm thực, quán ăn và cách di chuyển.
- Tích hợp Google Maps URL để tìm địa điểm và mở chỉ đường mà không cần API key.
- Có thể dùng Google Places API (New) để bổ sung dữ liệu quán ăn/địa điểm trực tiếp khi cấu hình key.
- Dữ liệu hành chính của các đơn vị hình thành sau sắp xếp năm 2025 có nguồn tham khảo chính thức ngay trong giao diện.
- Giao diện responsive cho desktop và thiết bị di động.
- Có loading/error state cho bản đồ và fallback khi hình ảnh bị lỗi.
- Có TypeScript strict checking cho frontend và API Functions trong GitHub Actions.

## Công nghệ

- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion
- Lucide React
- react-zoom-pan-pinch
- Vercel Functions
- Supabase Auth + PostgreSQL + Row Level Security
- Gemini API
- Google Maps URLs
- Google Places API (tùy chọn)

## Cấu trúc chính

```text
api/
├── _lib/
│   └── supabase.ts
├── auth/
│   ├── login.ts
│   ├── logout.ts
│   ├── me.ts
│   └── register.ts
├── ai.ts
└── user-data.ts

supabase/
└── schema.sql

src/
├── app/
│   ├── App.tsx
│   └── components/
│       ├── AuthScreen.tsx
│       ├── ProvinceDetails.tsx
│       ├── TravelAiAssistant.tsx
│       ├── UserMenu.tsx
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
├── types/
│   └── auth.ts
└── utils/
    ├── googleMaps.ts
    └── text.ts
```

`provincesData.ts` là nguồn metadata duy nhất cho tên hiển thị và banner. `provinceDetailsData.ts` chứa nội dung chi tiết; component `ProvinceDetails` chỉ chịu trách nhiệm render giao diện.

`TravelAiAssistant.tsx` quản lý giao diện và lịch sử chat theo từng tỉnh. Khi người dùng đã đăng nhập, lịch sử chat được đọc/ghi qua `api/user-data.ts` và lưu vào bản ghi riêng của user.

## Chạy dự án

Yêu cầu Node.js phiên bản LTS hiện hành.

```bash
npm install
npm run dev
```

Kiểm tra TypeScript và build production:

```bash
npm run typecheck
npm run typecheck:api
npm run build
npm run preview
```

## Biến môi trường

Không đưa API key hoặc token bí mật vào source code hay commit lên GitHub. Xem `.env.example` để biết tên biến cần cấu hình.

Trên Vercel Project → Settings → Environment Variables:

```text
GEMINI_API_KEY=<Gemini API key>
GEMINI_MODEL=gemini-3.7-flash
GOOGLE_MAPS_API_KEY=<Google Maps Platform API key, tùy chọn>
SUPABASE_URL=<Supabase project URL>
SUPABASE_ANON_KEY=<Supabase anon/public key>
```

Sau khi thay đổi biến môi trường, redeploy Production để Vercel Functions nhận cấu hình mới.

## Đăng ký, đăng nhập và dữ liệu người dùng

### 1. Tạo project Supabase

Tạo một Supabase project rồi lấy Project URL và anon/public key. Không cần dùng `service_role` key trong website này.

### 2. Tạo bảng và Row Level Security

Mở Supabase SQL Editor và chạy toàn bộ file:

```text
supabase/schema.sql
```

Schema tạo:

- `profiles`: tên hiển thị và avatar của user.
- `user_travel_data`: tỉnh đã lưu, tỉnh đã đi, lịch sử chat AI và lịch trình.
- Trigger tự tạo dữ liệu mặc định khi có user mới.
- RLS policy đảm bảo user chỉ SELECT/INSERT/UPDATE bản ghi có `user_id = auth.uid()`.

### 3. Session

Frontend không lưu access token trong JavaScript. Vercel Functions gọi Supabase Auth và đặt access/refresh token trong cookie `HttpOnly`, `SameSite=Lax` và `Secure` ở production.

Các endpoint:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET/PATCH /api/user-data`

Nếu Supabase chưa được cấu hình, website vẫn cho phép **Tiếp tục với tư cách khách** để không khóa phần bản đồ/AI hiện có.

## Cấu hình AI trên Vercel

Trong Vercel Project → Settings → Environment Variables, thêm:

```text
GEMINI_API_KEY=<Gemini API key của bạn>
GEMINI_MODEL=gemini-3.7-flash
```

`GEMINI_MODEL` là tùy chọn. Nếu không khai báo, backend dùng `gemini-3.7-flash`.

## Google Maps và Google Places

### Google Maps URL

Các nút tìm kiếm và chỉ đường dùng Google Maps URL nên hoạt động mà không cần API key. Khi mở chỉ đường và không chỉ định điểm xuất phát, Google Maps có thể sử dụng vị trí hiện tại của người dùng.

### Google Places API (tùy chọn)

Nếu muốn AI tham chiếu dữ liệu địa điểm trực tiếp như tên quán, địa chỉ và rating, bật Places API (New) trong Google Cloud và thêm:

```text
GOOGLE_MAPS_API_KEY=<Google Maps Platform API key>
```

Backend chỉ gọi Places API cho các câu hỏi có ý định rõ ràng như quán ăn, địa điểm, lịch trình; nếu không có key thì AI vẫn dùng dữ liệu nội bộ và các nút Google Maps vẫn hoạt động.

## Quy tắc phạm vi của AI

- AI chỉ trả lời về tỉnh/thành đang được chọn trên bản đồ.
- Nếu câu hỏi nhắc tới một tỉnh khác, backend yêu cầu người dùng đổi tỉnh trước.
- Mỗi tỉnh có một luồng chat riêng.
- Với tài khoản đã đăng nhập, chat được đồng bộ vào `user_travel_data.ai_chats`; chế độ khách chỉ giữ dữ liệu cục bộ trong phiên.
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
3. `npm run typecheck:api`
4. `npm run build`

Ngoài ra project có script kiểm tra asset và tối ưu ảnh đã được sử dụng trong đợt refactor ban đầu.

## Nguồn và attribution

Một phần giao diện ban đầu được khởi tạo từ Figma Make rồi được chỉnh sửa và phát triển thêm. Xem `ATTRIBUTIONS.md` để biết thông tin về tài nguyên bên thứ ba.

## Hướng phát triển tiếp

- Thêm giao diện bookmark tỉnh / đã đi để dùng hai trường dữ liệu có sẵn.
- Thêm trang quản lý lịch trình cá nhân.
- Bổ sung user location để cá nhân hóa gợi ý gần vị trí hiện tại.
- Bổ sung URL routing cho từng tỉnh để chia sẻ trực tiếp.
- Thêm test cho auth, assistant, search và tương tác bản đồ.
- Theo dõi Lighthouse/Core Web Vitals trên bản production.

# renTrek — Frontend

ReactJS (Vite) cho hệ thống thuê đồ trekking / cắm trại **renTrek**.

> **Đọc trước khi code:** [`docs/01-CONVENTIONS.md`](docs/01-CONVENTIONS.md) — naming, flow request/response, Git.
> API: `BE/docs/03-API-CONTRACT.md`.

## Yêu cầu

- Node.js ≥ 20 (khuyến nghị bản LTS mới nhất)
- npm ≥ 10

## Cài đặt & chạy

```bash
npm install
cp .env.example .env.local   # sửa VITE_API_BASE_URL trỏ tới BE đang chạy
npm run dev                  # http://localhost:5173
```

> Nếu BE chạy HTTPS với chứng chỉ dev, mở URL BE trên trình duyệt 1 lần để tin cậy chứng chỉ,
> và BE phải cho phép CORS từ `http://localhost:5173`.

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production vào `dist/` |
| `npm run preview` | Chạy thử bản build |
| `npm run lint` | Kiểm tra ESLint |
| `npm run lint:fix` | Tự sửa lỗi ESLint |
| `npm run format` | Format code bằng Prettier |

## Biến môi trường

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL của BE, đã gồm `/api/v1` | `https://localhost:7000/api/v1` |

## Cấu trúc

Xem [mục 2 — Cấu trúc thư mục](docs/01-CONVENTIONS.md#2-cấu-trúc-thư-mục).
Feature mẫu để copy khi làm module mới: `src/features/products/`.

## Danh sách và chi tiết sản phẩm

- `/products`: danh sách sản phẩm thuê / bán, tìm kiếm, lọc danh mục / hình thức, sắp xếp và phân trang.
- `/products/:productId`: ảnh, biến thể, giá bán và bảng giá thuê theo số ngày.
- Dùng React Query → productService → Axios instance chung. Các API ghi và chức năng khác giữ nguyên.
- Chạy migration và script mẫu `BE/docs/database/seed_product_catalog.sql` nếu cần dữ liệu demo.
  Ảnh SVG đi kèm là minh hoạ cho dữ liệu mẫu.

Kiểm tra tích hợp Axios và React render (BE đang chạy, có dữ liệu demo, Node 24+, chứng chỉ dev đã trust):

```bash
node --use-system-ca --test tests/product-catalog.render.test.mjs
```

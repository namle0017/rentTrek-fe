# 03 — API Contract

> Hợp đồng API giữa Backend và Frontend của **renTrek**.
> Cấu trúc request/response chung tuân theo [`01-CONVENTIONS.md`](01-CONVENTIONS.md#4-cấu-trúc-response).
> Căn cứ theo **RenTrekk Design System** (`Screen_Spec.md`, `PRD_RenTrekk.md`), mockups giao diện (`RenTrekk Batch 1 - 6`) và cơ sở dữ liệu `supabase_schema.sql`.
> Mỗi khi thêm / sửa API phải cập nhật file này và ghi vào [Changelog](#changelog).

| Thông tin | Giá trị |
|---|---|
| Version | `v1` |
| Base URL (Local) | `https://localhost:<port>/api/v1` |
| Base URL (Staging) | `https://staging-api.rentrek.vn/api/v1` |
| Base URL (Production) | `https://api.rentrek.vn/api/v1` |
| Swagger UI | `https://localhost:<port>/swagger` |
| Authentication | JWT Bearer — header `Authorization: Bearer {accessToken}` |
| Content-Type | `application/json` |

---

## Mục lục

- [Quy ước chung](#quy-ước-chung)
- [Danh sách Endpoint](#danh-sách-endpoint)
- [1. Auth](#1-auth)
- [2. Users (Cá nhân)](#2-users-cá-nhân)
- [3. Admin: Dashboard & Cảnh báo (Màn O01)](#3-admin-dashboard--cảnh-báo-màn-o01)
- [4. Admin: Quản lý Người dùng & Phân quyền (Màn O02, O03)](#4-admin-quản-lý-người-dùng--phân-quyền-màn-o02-o03)
- [5. Admin: Danh mục, Địa điểm, Tags & Kỹ năng (Màn O04, O33)](#5-admin-danh-mục-địa-điểm-tags--kỹ-năng-màn-o04-o33)
- [6. Admin: Quản lý Tour & Phiên bản (Màn O05, O06, O07)](#6-admin-quản-lý-tour--phiên-bản-màn-o05-o06-o07)
- [7. Admin: Lịch lặp & Tự động sinh chuyến (Màn O08)](#7-admin-lịch-lặp--tự-động-sinh-chuyến-màn-o08)
- [8. Admin: Quản lý Chuyến & Điều hành khởi hành (Màn O09, O10, O11)](#8-admin-quản-lý-chuyến--điều-hành-khởi-hành-màn-o09-o10-o11)
- [9. Admin: Chia nhóm Chuyến - Kanban (Màn O12)](#9-admin-chia-nhóm-chuyến---kanban-màn-o12)
- [10. Admin: Đồ cấp Chuyến & Quản lý Asset chuyến (Màn O13)](#10-admin-đồ-cấp-chuyến--quản-lý-asset-chuyến-màn-o13)
- [11. Admin: Điểm danh Hoạt động Tour (Màn O14)](#11-admin-điểm-danh-hoạt-động-tour-màn-o14)
- [12. Admin: Quản lý Đơn hàng Tổng hợp & Đơn Tour (Màn O38, O15)](#12-admin-quản-lý-đơn-hàng-tổng-hợp--đơn-tour-màn-o38-o15)
- [13. Admin: Sản phẩm, Biến thể, Bảng giá & Combo (Màn O16, O17, O18, O19)](#13-admin-sản-phẩm-biến-thể-bảng-giá--combo-màn-o16-o17-o18-o19)
- [14. Admin: Quản lý Thiết bị (Asset) & Lịch Gantt (Màn O20, O21)](#14-admin-quản-lý-thiết-bị-asset--lịch-gantt-màn-o20-o21)
- [15. Admin: Đơn thuê & Quy trình Giao nhận (Màn O22, O23, O24, O25)](#15-admin-đơn-thuê--quy-trình-giao-nhận-màn-o22-o23-o24-o25)
- [16. Admin: Phí phát sinh & Quyết toán Đơn thuê (Màn O26)](#16-admin-phí-phát-sinh--quyết-toán-đơn-thuê-màn-o26)
- [17. Admin: Giao dịch, Hoàn tiền & Đối soát (Màn O27, O28)](#17-admin-giao-dịch-hoàn-tiền--đối-soát-màn-o27-o28)
- [18. Admin: Chương trình Khuyến mãi (Màn O29, O30, O31)](#18-admin-chương-trình-khuyến-mãi-màn-o29-o30-o31)
- [19. Admin: Quản lý Bài viết & Nội dung Hướng dẫn (Màn O32)](#19-admin-quản-lý-bài-viết--nội-dung-hướng-dẫn-màn-o32)
- [20. Admin: Chính sách Hoàn tiền (Màn O34)](#20-admin-chính-sách-hoàn-tiền-màn-o34)
- [21. Admin: Cấu hình Hệ thống & Nhật ký Audit (Màn O35, O36)](#21-admin-cấu-hình-hệ-thống--nhật-ký-audit-màn-o35-o36)
- [22. Admin: Báo cáo Vận hành & Phân tích (Màn O37)](#22-admin-báo-cáo-vận-hành--phân-tích-màn-o37)
- [23. Admin: Kiểm duyệt Đánh giá - Review (Màn O39)](#23-admin-kiểm-duyệt-đánh-giá---review-màn-o39)
- [24. Guide: Khu vực Hướng dẫn viên Thực địa (Màn G01 – G06)](#24-guide-khu-vực-hướng-dẫn-viên-thực-địa-màn-g01--g06)
- [Phụ lục: Enum](#phụ-lục-enum)
- [Phụ lục: Mã lỗi nghiệp vụ](#phụ-lục-mã-lỗi-nghiệp-vụ)
- [Template endpoint](#template-endpoint)
- [Changelog](#changelog)

---

## Quy ước chung

### 1. Cấu trúc Response wrapper (áp dụng cho mọi API)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "string",
  "data": {},
  "errors": null,
  "timestamp": "2026-10-06T08:30:00Z"
}
```

### 2. Cấu trúc Paged data (`data` của API danh sách)

```json
{
  "items": [],
  "pageNumber": 1,
  "pageSize": 10,
  "totalItems": 0,
  "totalPages": 0,
  "hasPrevious": false,
  "hasNext": false
}
```

### 3. Query chung cho API danh sách
- `pageNumber` (`int`, default `1`): Trang hiện tại.
- `pageSize` (`int`, default `10`): Số dòng mỗi trang (tối đa `100`).
- `search` (`string`, optional): Từ khóa tìm kiếm tự do.
- `sortBy` (`string`, optional): Tên trường sắp xếp (dạng camelCase, ví dụ: `createdAt`, `startAt`).
- `sortOrder` (`string`, optional): `asc` hoặc `desc` (mặc định `desc`).

### 4. Triết lý phân rã API (Decoupling) trong Phân hệ Quản trị Admin
1. **Không gộp toàn bộ màn hình thành 1 API khổng lồ:** Các màn hình phức tạp (Tour Editor, Điều hành Chuyến, Đơn thuê, Kho thiết bị) được bóc tách theo từng tài nguyên con (sub-resources) và nạp dữ liệu theo Tab (Lazy loading) giúp giảm tải payload và tăng tốc độ hiển thị.
2. **Độc lập luồng vận hành (Concurrency Isolation):** Tách riêng các tác vụ của nhiều bộ phận trên cùng một thực thể (ví dụ trên Chuyến đi: điều phối chia nhóm Kanban, thủ kho quét mã gán đồ cấp, hướng dẫn viên điểm danh) nhằm tránh xung đột ghi đè dữ liệu (`row_version`).
3. **Bảo vệ tính toàn vẹn của máy trạng thái (State Machine):** Các hành động nhạy cảm như Mở bán, Khóa lịch trình, Hủy chuyến, Khóa tài khoản, Duyệt hoàn tiền, Báo mất thiết bị được tách thành các endpoint hành động chuyên biệt có xác thực điều kiện tiên quyết và ghi nhật ký kiểm toán (`AUDIT_LOGS`) bắt buộc có lý do.
4. **Hỗ trợ thao tác máy quét Barcode/QR tức thời:** Quy trình bàn giao và thu hồi thiết bị gọi API xác thực theo từng lần quét mã để phản hồi lỗi ngay tại hiện trường.

### 5. Cấu trúc Error Response (Chuẩn xử lý lỗi toàn hệ thống)

Tất cả các trường hợp lỗi (từ HTTP 400 đến 502) đều trả về cấu trúc thống nhất theo `ApiResponse<T>` với `success = false`, `data = null`, mã HTTP status tương ứng, thông báo tiếng Việt (`message`), object chi tiết lỗi (`errors`) và thời điểm phát sinh (`timestamp`).

#### 5.1. Cấu trúc tổng quát Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Thông báo lỗi tiếng Việt hiển thị cho người dùng",
  "data": null,
  "errors": {
    "code": ["MÃ_LỖI_NGHIỆP_VỤ"],
    "fieldName": ["Chi tiết lỗi cụ thể nếu có"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

#### 5.2. Chi tiết các dạng Error Response chuẩn theo HTTP Status Code

##### a. Lỗi Validation Dữ liệu Đầu vào (`400 Bad Request`)
Khi dữ liệu gửi lên không đúng định dạng, thiếu trường bắt buộc hoặc vi phạm kiểm tra FluentValidation:

```json
HTTP 400 Bad Request
{
  "success": false,
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ",
  "data": null,
  "errors": {
    "code": ["VALIDATION_ERROR"],
    "name": ["Tên tour không được để trống"],
    "basePrice": ["Giá cơ sở phải lớn hơn 0"],
    "durationDays": ["Số ngày phải lớn hơn hoặc bằng 1"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

##### b. Lỗi Vi phạm Quy tắc Nghiệp vụ (`400 Bad Request` hoặc `409 Conflict`)
Khi dữ liệu đúng format nhưng vi phạm điều kiện logic của hệ thống. Mã lỗi nghiệp vụ luôn nằm trong `errors.code`:

```json
HTTP 400 Bad Request
{
  "success": false,
  "statusCode": 400,
  "message": "Lịch trình tour đã bị khóa do đã có chuyến phát sinh người đặt mua.",
  "data": null,
  "errors": {
    "code": ["ITINERARY_LOCKED"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

##### c. Lỗi Xác thực & Hết hạn phiên (`401 Unauthorized`)
Chưa gửi kèm header Authorization hoặc access token đã hết hạn/không hợp lệ:

```json
HTTP 401 Unauthorized
{
  "success": false,
  "statusCode": 401,
  "message": "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng làm mới token hoặc đăng nhập lại.",
  "data": null,
  "errors": {
    "code": ["UNAUTHORIZED"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

##### d. Lỗi Không đủ quyền hạn (`403 Forbidden`)
Đã đăng nhập nhưng vai trò (Role) không đủ thẩm quyền (ví dụ: Staff cố truy cập API của Admin):

```json
HTTP 403 Forbidden
{
  "success": false,
  "statusCode": 403,
  "message": "Bạn không có quyền thực hiện thao tác này. Chỉ Quản trị viên (Admin) mới có quyền truy cập.",
  "data": null,
  "errors": {
    "code": ["FORBIDDEN"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

##### e. Lỗi Không tìm thấy tài nguyên (`404 Not Found`)
Mã định danh (GUID, OrderCode, AssetCode) không tồn tại trong cơ sở dữ liệu:

```json
HTTP 404 Not Found
{
  "success": false,
  "statusCode": 404,
  "message": "Không tìm thấy chuyến đi với ID '88888888-9999-aaaa-bbbb-111111111111'.",
  "data": null,
  "errors": {
    "code": ["NOT_FOUND"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

##### f. Lỗi Xung đột Dữ liệu đồng thời (`409 Conflict`)
Khi dữ liệu bị chỉnh sửa cùng lúc bởi người khác (`row_version`) hoặc trùng khóa duy nhất:

```json
HTTP 409 Conflict
{
  "success": false,
  "statusCode": 409,
  "message": "Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang và thử lại.",
  "data": null,
  "errors": {
    "code": ["CONCURRENCY_CONFLICT"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

##### g. Lỗi Giới hạn tần suất gọi API (`429 Too Many Requests`)
Áp dụng cho các API ghi nhận nhạy cảm (như duyệt hoàn tiền SePay: tối đa 10 request / 60 giây mỗi user). Header trả về kèm `Retry-After: 45` (số giây cần đợi):

```json
HTTP 429 Too Many Requests
{
  "success": false,
  "statusCode": 429,
  "message": "Thao tác quá nhanh. Vui lòng đợi 45 giây trước khi thử lại.",
  "data": null,
  "errors": {
    "code": ["TOO_MANY_REQUESTS"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

##### h. Lỗi Cổng thanh toán / Đối tác bên thứ ba (`502 Bad Gateway`)
Khi cổng thanh toán SePay hoặc API ngân hàng bị gián đoạn, từ chối hoặc timeout:

```json
HTTP 502 Bad Gateway
{
  "success": false,
  "statusCode": 502,
  "message": "Cổng thanh toán SePay gặp sự cố kết nối hoặc phản hồi quá thời gian quy định.",
  "data": null,
  "errors": {
    "code": ["PAYMENT_PROVIDER_ERROR"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

##### i. Lỗi Hệ thống ngoài dự kiến (`500 Internal Server Error`)
Lỗi máy chủ chưa được kiểm soát (Unhandled Exception):

```json
HTTP 500 Internal Server Error
{
  "success": false,
  "statusCode": 500,
  "message": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ bộ phận kỹ thuật.",
  "data": null,
  "errors": {
    "code": ["INTERNAL_SERVER_ERROR"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

## Danh sách Endpoint

| # | Module | Method | Endpoint | Auth | Mô tả | Lý do cần tách API riêng | Trạng thái |
|---|---|---|---|---|---|---|---|
| **1.1** | Auth | `POST` | `/auth/register` | Public | Đăng ký tài khoản khách hàng | Tạo tài khoản kèm profile người dùng | ⬜ TODO |
| **1.2** | Auth | `POST` | `/auth/login` | Public | Đăng nhập hệ thống | Xác thực thông tin, cấp cặp Access/Refresh Token | ⬜ TODO |
| **1.3** | Auth | `POST` | `/auth/refresh-token` | Public | Làm mới access token | Cơ chế xoay vòng token gia hạn phiên | ⬜ TODO |
| **1.4** | Auth | `POST` | `/auth/logout` | User | Đăng xuất | Thu hồi refresh token của phiên hiện tại | ⬜ TODO |
| **2.1** | Users | `GET` | `/users/me` | User | Lấy thông tin cá nhân | Tải profile người dùng đang đăng nhập | ⬜ TODO |
| **2.2** | Users | `PUT` | `/users/me` | User | Cập nhật thông tin cá nhân | Sửa avatar, họ tên, số điện thoại, ngày sinh | ⬜ TODO |
| **3.1** | Dashboard | `GET` | `/admin/dashboard/stats` | Staff/Admin | Số liệu đếm tổng hợp nhanh | Tải badge số liệu nhẹ, không nghẽn trang | ⬜ TODO |
| **3.2** | Dashboard | `GET` | `/admin/dashboard/alerts` | Staff/Admin | Danh sách cảnh báo vận hành khẩn | Tập trung các sự vụ cần xử lý ngay | ⬜ TODO |
| **3.3** | Dashboard | `GET` | `/admin/dashboard/kpis` | Admin | Các chỉ số KPI tuần/tháng | Tải bất đồng bộ các biểu đồ doanh thu, lấp chỗ | ⬜ TODO |
| **4.1** | Users | `GET` | `/admin/users` | Admin | Danh sách người dùng | Phân trang, tìm kiếm, lọc theo vai trò và trạng thái | ⬜ TODO |
| **4.2** | Users | `POST` | `/admin/users/staff` | Admin | Tạo tài khoản Staff/Guide | Cấp tài khoản nhân sự nội bộ | ⬜ TODO |
| **4.3** | Users | `GET` | `/admin/users/{userId}` | Admin | Chi tiết người dùng | Thông tin tài khoản, hồ sơ và thống kê vai trò | ⬜ TODO |
| **4.4** | Users | `PUT` | `/admin/users/{userId}/profile` | Admin | Cập nhật hồ sơ user | Admin hỗ trợ sửa thông tin sai sót của khách | ⬜ TODO |
| **4.5** | Users | `PATCH` | `/admin/users/{userId}/role` | Admin | Đổi vai trò (Role) | Phân quyền bảo mật cao, tách khỏi sửa hồ sơ | ⬜ TODO |
| **4.6** | Users | `POST` | `/admin/users/{userId}/lock` | Admin | Khóa tài khoản | Bắt buộc nhập lý do, lập tức thu hồi phiên | ⬜ TODO |
| **4.7** | Users | `POST` | `/admin/users/{userId}/unlock` | Admin | Mở khóa tài khoản | Khôi phục trạng thái hoạt động | ⬜ TODO |
| **4.8** | Users | `GET` | `/admin/users/{userId}/sessions` | Admin | Xem các phiên đăng nhập | Lazy-load tab bảo mật, kiểm tra thiết bị đăng nhập | ⬜ TODO |
| **4.9** | Users | `DELETE` | `/admin/users/{userId}/sessions/{sessionId}` | Admin | Thu hồi 1 phiên đăng nhập | Cưỡng chế ngắt kết nối thiết bị đáng ngờ | ⬜ TODO |
| **4.10**| Users | `DELETE` | `/admin/users/{userId}/sessions` | Admin | Thu hồi tất cả phiên đăng nhập | Đăng xuất toàn bộ khi phát hiện rủi ro | ⬜ TODO |
| **4.11**| Users | `GET` | `/admin/users/{userId}/activities` | Admin | Lịch sử hoạt động của user | Lazy-load tab Audit log theo user | ⬜ TODO |
| **5.1** | Catalog | `GET` | `/admin/categories` | Staff/Admin | Danh sách danh mục | Lọc theo loại (Tour/Equipment/Bundle) | ⬜ TODO |
| **5.2** | Catalog | `POST` | `/admin/categories` | Admin | Tạo danh mục mới | Master data phân loại hệ thống | ⬜ TODO |
| **5.3** | Catalog | `PUT` | `/admin/categories/{categoryId}` | Admin | Sửa danh mục | Cập nhật tên, mô tả danh mục | ⬜ TODO |
| **5.4** | Catalog | `DELETE`| `/admin/categories/{categoryId}` | Admin | Xóa (ẩn) danh mục | Soft-delete `is_deleted = 1` | ⬜ TODO |
| **5.5** | Catalog | `GET` | `/admin/locations` | Staff/Admin | Danh sách địa điểm | Hiển thị tọa độ bản đồ & số tour gắn kèm | ⬜ TODO |
| **5.6** | Catalog | `POST` | `/admin/locations` | Admin | Tạo địa điểm mới | Nhập tên, địa chỉ, kinh độ, vĩ độ | ⬜ TODO |
| **5.7** | Catalog | `PUT` | `/admin/locations/{locationId}` | Admin | Sửa địa điểm | Cập nhật thông tin điểm đến | ⬜ TODO |
| **5.8** | Catalog | `DELETE`| `/admin/locations/{locationId}` | Admin | Xóa địa điểm | Chặn xóa nếu đang có tour sử dụng | ⬜ TODO |
| **5.9** | Catalog | `GET` | `/admin/tags` | Staff/Admin | Danh sách tag bài viết | Gắn nhãn bài viết hướng dẫn | ⬜ TODO |
| **5.10**| Catalog | `POST` | `/admin/tags` | Admin | Tạo tag mới | Quản trị taxonomy | ⬜ TODO |
| **5.11**| Catalog | `PUT` | `/admin/tags/{tagId}` | Admin | Sửa tag | Đổi tên/slug | ⬜ TODO |
| **5.12**| Catalog | `DELETE`| `/admin/tags/{tagId}` | Admin | Xóa tag | Xóa liên kết nhãn | ⬜ TODO |
| **5.13**| Catalog | `GET` | `/admin/soft-skills` | Staff/Admin | Danh sách kỹ năng mềm | Định danh kỹ năng chuẩn bị cho trekking | ⬜ TODO |
| **5.14**| Catalog | `POST` | `/admin/soft-skills` | Admin | Tạo kỹ năng mềm | Master data nội dung | ⬜ TODO |
| **5.15**| Catalog | `PUT` | `/admin/soft-skills/{skillId}` | Admin | Sửa kỹ năng mềm | Cập nhật mô tả kỹ năng | ⬜ TODO |
| **5.16**| Catalog | `DELETE`| `/admin/soft-skills/{skillId}` | Admin | Xóa kỹ năng mềm | Ẩn kỹ năng không áp dụng | ⬜ TODO |
| **6.1** | Tours | `GET` | `/admin/tours` | Staff/Admin | Danh sách tour vận hành | Lọc trạng thái, chỉ lấy version mới nhất | ⬜ TODO |
| **6.2** | Tours | `POST` | `/admin/tours` | Admin | Tạo tour mới (Draft) | Khởi tạo thông tin cơ bản của tour | ⬜ TODO |
| **6.3** | Tours | `GET` | `/admin/tours/{tourId}` | Staff/Admin | Chi tiết thông tin chung tour | Tải tab 1 O06, kiểm tra cờ khóa lịch trình | ⬜ TODO |
| **6.4** | Tours | `PUT` | `/admin/tours/{tourId}` | Admin | Sửa thông tin chung tour | Sửa tên, giá cơ sở, số ngày/đêm | ⬜ TODO |
| **6.5** | Tours | `POST` | `/admin/tours/{tourId}/publish` | Admin | Xuất bản tour | Đưa tour lên trạng thái Published công khai | ⬜ TODO |
| **6.6** | Tours | `POST` | `/admin/tours/{tourId}/archive` | Admin | Lưu trữ / Ẩn tour | Dừng hiển thị tour ra ngoài công chúng | ⬜ TODO |
| **6.7** | Tours | `GET` | `/admin/tours/{tourId}/images` | Staff/Admin | Danh sách ảnh tour | Lazy-load tab Ảnh, giảm dung lượng thông tin chung | ⬜ TODO |
| **6.8** | Tours | `POST` | `/admin/tours/{tourId}/images` | Admin | Thêm ảnh vào tour | Tải ảnh mới lên thư viện tour | ⬜ TODO |
| **6.9** | Tours | `PUT` | `/admin/tours/{tourId}/images/reorder`| Admin | Sắp xếp ảnh & chọn ảnh đại diện | Thao tác kéo thả giao diện | ⬜ TODO |
| **6.10**| Tours | `DELETE`| `/admin/tours/{tourId}/images/{imageId}` | Admin | Xóa ảnh khỏi tour | Xóa liên kết ảnh | ⬜ TODO |
| **6.11**| Tours | `GET` | `/admin/tours/{tourId}/activities` | Staff/Admin | Lịch trình các ngày của tour | Lazy-load tab Lịch trình, nhóm theo ngày | ⬜ TODO |
| **6.12**| Tours | `POST` | `/admin/tours/{tourId}/activities` | Admin | Thêm hoạt động vào lịch trình | Chặn nếu lịch trình đã bị khóa do có đơn đặt | ⬜ TODO |
| **6.13**| Tours | `PUT` | `/admin/tours/{tourId}/activities/{activityId}` | Admin | Sửa hoạt động trong ngày | Cập nhật giờ, tên, mô tả hoạt động | ⬜ TODO |
| **6.14**| Tours | `DELETE`| `/admin/tours/{tourId}/activities/{activityId}` | Admin | Xóa hoạt động | Xóa bước lịch trình | ⬜ TODO |
| **6.15**| Tours | `PUT` | `/admin/tours/{tourId}/activities/reorder` | Admin | Sắp xếp lại thứ tự hoạt động | Kéo thả builder timeline theo ngày | ⬜ TODO |
| **6.16**| Tours | `GET` | `/admin/tours/{tourId}/preparation-items` | Staff/Admin | Danh sách đồ tự mang | Lazy-load tab Đồ tự mang | ⬜ TODO |
| **6.17**| Tours | `PUT` | `/admin/tours/{tourId}/preparation-items` | Admin | Cập nhật danh sách đồ tự mang | Cập nhật checklist cho khách chuẩn bị | ⬜ TODO |
| **6.18**| Tours | `GET` | `/admin/tours/{tourId}/provided-items` | Staff/Admin | Danh sách đồ cấp cấu hình cho tour | Lazy-load tab Đồ cấp | ⬜ TODO |
| **6.19**| Tours | `POST` | `/admin/tours/{tourId}/provided-items` | Admin | Thêm cấu hình đồ cấp | Chọn variant, số lượng, cơ sở tính (khách/nhóm) | ⬜ TODO |
| **6.20**| Tours | `PUT` | `/admin/tours/{tourId}/provided-items/{itemId}` | Admin | Sửa cấu hình đồ cấp | Thay đổi định mức cấp phát | ⬜ TODO |
| **6.21**| Tours | `DELETE`| `/admin/tours/{tourId}/provided-items/{itemId}` | Admin | Xóa cấu hình đồ cấp | Xóa định mức | ⬜ TODO |
| **6.22**| Tours | `GET` | `/admin/tours/{tourId}/posts` | Staff/Admin | Danh sách bài viết gắn vào tour | Lazy-load tab Bài viết | ⬜ TODO |
| **6.23**| Tours | `PUT` | `/admin/tours/{tourId}/posts` | Admin | Cập nhật bài viết gắn vào tour | Thay đổi bài viết kiến thức bắt buộc đọc | ⬜ TODO |
| **6.24**| Tours | `GET` | `/admin/tours/{tourId}/versions` | Staff/Admin | Lịch sử phiên bản tour | Drawer O07 tra cứu cây phiên bản | ⬜ TODO |
| **6.25**| Tours | `POST` | `/admin/tours/{tourId}/versions/clone` | Admin | Tạo phiên bản mới (Clone) | Nhân bản cấu trúc tour sang version mới (Draft) | ⬜ TODO |
| **6.26**| Tours | `GET` | `/admin/tours/{tourId}/versions/diff` | Staff/Admin | So sánh 2 phiên bản tour | So sánh sai khác lịch trình giữa 2 phiên bản | ⬜ TODO |
| **7.1** | Recurrence| `GET` | `/admin/tours/{tourId}/recurrence-rules` | Staff/Admin | Danh sách quy tắc lặp chuyến | Cấu hình lặp sinh chuyến của tour O08 | ⬜ TODO |
| **7.2** | Recurrence| `POST`| `/admin/tours/{tourId}/recurrence-rules` | Admin | Tạo quy tắc lặp mới | Thiết lập tần suất, thứ trong tuần, số chỗ, giá | ⬜ TODO |
| **7.3** | Recurrence| `PUT` | `/admin/recurrence-rules/{ruleId}` | Admin | Sửa quy tắc lặp | Không làm ảnh hưởng chuyến đã sinh ra trước đó | ⬜ TODO |
| **7.4** | Recurrence| `DELETE`|`/admin/recurrence-rules/{ruleId}`| Admin | Xóa quy tắc lặp | Dừng lặp tự động | ⬜ TODO |
| **7.5** | Recurrence| `POST`| `/admin/recurrence-rules/{ruleId}/preview` | Staff/Admin | Xem trước lịch sinh chuyến | Kiểm tra lịch trước khi chạy, tránh trùng ngày | ⬜ TODO |
| **7.6** | Recurrence| `POST`| `/admin/recurrence-rules/{ruleId}/generate` | Admin | Kích hoạt sinh chuyến hàng loạt | Batch generate hàng loạt chuyến đi vào DB | ⬜ TODO |
| **8.1** | Trips | `GET` | `/admin/trips` | Staff/Admin | Danh sách chuyến đi (Table/Calendar) | Lọc tour, trạng thái, khoảng ngày | ⬜ TODO |
| **8.2** | Trips | `POST` | `/admin/trips` | Admin/Staff | Tạo chuyến đi thủ công | Khởi tạo chuyến với ngày, số chỗ, giá, guide | ⬜ TODO |
| **8.3** | Trips | `GET` | `/admin/trips/{tripId}` | Staff/Admin | Chi tiết tổng quan chuyến đi | Tab 1 O10, kiểm tra tiến độ bán chỗ | ⬜ TODO |
| **8.4** | Trips | `PUT` | `/admin/trips/{tripId}` | Admin/Staff | Sửa thông tin chuyến đi | Chặn giảm chỗ nhỏ hơn số khách đã mua | ⬜ TODO |
| **8.5** | Trips | `GET` | `/admin/trips/{tripId}/readiness-checklist` | Staff/Admin | Checklist sẵn sàng khởi hành | Tổng hợp 5 điều kiện khởi hành (FR-D07) | ⬜ TODO |
| **8.6** | Trips | `POST` | `/admin/trips/{tripId}/open-booking` | Admin/Staff | Mở bán chuyến | Chuyển trạng thái Draft -> Open | ⬜ TODO |
| **8.7** | Trips | `POST` | `/admin/trips/{tripId}/close-booking`| Admin/Staff | Đóng cổng nhận khách | Chuyển trạng thái Open -> ClosedForBooking | ⬜ TODO |
| **8.8** | Trips | `POST` | `/admin/trips/{tripId}/start` | Admin/Staff | Bắt đầu chuyến đi | Chuyển sang InProgress khi khách lên đường | ⬜ TODO |
| **8.9** | Trips | `POST` | `/admin/trips/{tripId}/complete` | Admin/Staff | Hoàn thành chuyến đi | Chuyển sang Completed, kích hoạt quyền review | ⬜ TODO |
| **8.10**| Trips | `POST` | `/admin/trips/{tripId}/cancel` | Admin | Hủy chuyến đi | Tính toán hoàn tiền, giải phóng kho thiết bị | ⬜ TODO |
| **8.11**| Trips | `GET` | `/admin/trips/{tripId}/bookings` | Staff/Admin | Danh sách booking và khách của chuyến| Tab Booking O11 | ⬜ TODO |
| **8.12**| Trips | `GET` | `/admin/trips/{tripId}/manifest` | Staff/Admin | Xuất danh sách khách (Manifest) | Báo cáo in ấn danh sách hành khách theo nhóm | ⬜ TODO |
| **9.1** | Groups | `GET` | `/admin/trips/{tripId}/groups-board` | Staff/Admin | Bảng Kanban chia nhóm | Lấy cột chưa xếp + các cột nhóm và guide O12 | ⬜ TODO |
| **9.2** | Groups | `POST` | `/admin/trips/{tripId}/groups` | Admin/Staff | Tạo nhóm mới trong chuyến | Tạo nhóm kèm sĩ số tối đa và gán Guide | ⬜ TODO |
| **9.3** | Groups | `PUT` | `/admin/trips/{tripId}/groups/{groupId}` | Admin/Staff | Cập nhật thông tin nhóm | Đổi guide, đổi tên nhóm | ⬜ TODO |
| **9.4** | Groups | `DELETE`| `/admin/trips/{tripId}/groups/{groupId}` | Admin/Staff | Giải tán nhóm | Chuyển toàn bộ khách về cột chưa chia nhóm | ⬜ TODO |
| **9.5** | Groups | `PATCH`| `/admin/trips/{tripId}/participants/assign-group` | Admin/Staff | Gán / Chuyển nhóm cho khách | Kéo thả Kanban, kiểm tra sức chứa nhóm | ⬜ TODO |
| **9.6** | Groups | `POST` | `/admin/trips/{tripId}/auto-group` | Admin/Staff | Tự động chia nhóm theo thuật toán | Thuật toán gom nhóm giữ nguyên các đơn đi chung | ⬜ TODO |
| **9.7** | Groups | `POST` | `/admin/trips/{tripId}/bookings/{bookingId}/split-approve` | Admin/Staff | Duyệt tách booking đi chung | Bắt buộc nhập lý do tách đoàn, lưu audit | ⬜ TODO |
| **10.1**| Gear | `GET` | `/admin/trips/{tripId}/provided-items` | Staff/Admin | Danh sách đồ cấp cần chuẩn bị | Tab O13 tính nhu cầu dựa theo số khách/nhóm | ⬜ TODO |
| **10.2**| Gear | `GET` | `/admin/trips/{tripId}/provided-items/{itemId}/available-assets` | Staff/Admin | Tra cứu thiết bị trống trong kho | Tìm asset khả dụng trong khung ngày chuyến đi | ⬜ TODO |
| **10.3**| Gear | `POST` | `/admin/trips/{tripId}/provided-items/{itemId}/assignments` | Staff/Admin | Gán thiết bị cụ thể cho chuyến | Giữ chỗ asset (`Reserved`) | ⬜ TODO |
| **10.4**| Gear | `DELETE`| `/admin/trips/{tripId}/assignments/{assignmentId}` | Staff/Admin | Hủy gán thiết bị | Giải phóng asset trả về kho | ⬜ TODO |
| **10.5**| Gear | `POST` | `/admin/trips/{tripId}/provided-items/issue` | Staff/Admin | Quét barcode xuất kho giao đoàn | Chuyển trạng thái sang `Issued` trước khi đi | ⬜ TODO |
| **10.6**| Gear | `POST` | `/admin/trips/{tripId}/provided-items/return` | Staff/Admin | Quét barcode thu hồi sau chuyến | Ghi nhận tình trạng khi nhận lại thiết bị | ⬜ TODO |
| **11.1**| Attendance| `GET` | `/admin/trips/{tripId}/attendance-matrix` | Staff/Admin | Ma trận điểm danh chuyến | Lấy lưới 2 chiều (khách × hoạt động tour) O14 | ⬜ TODO |
| **11.2**| Attendance| `PUT` | `/admin/trips/{tripId}/attendances` | Staff/Admin/Guide | Ghi nhận/Cập nhật điểm danh | Cập nhật trạng thái điểm danh, bắt buộc lý do nếu sửa | ⬜ TODO |
| **11.3**| Attendance| `GET` | `/admin/trips/{tripId}/attendances/history` | Staff/Admin | Lịch sử sửa đổi điểm danh | Audit trail chi tiết cho từng ô điểm danh | ⬜ TODO |
| **12.1**| Orders | `GET` | `/admin/orders` | Staff/Admin | Danh sách đơn hàng tổng hợp | Màn O38 lọc cả đơn tour & đơn thuê, hạn đối soát | ⬜ TODO |
| **12.2**| Orders | `GET` | `/admin/orders/{orderCode}` | Staff/Admin | Chi tiết đơn hàng cho vận hành | Màn O15 xem toàn bộ khách, khuyến mãi, thanh toán | ⬜ TODO |
| **12.3**| Orders | `PATCH`| `/admin/orders/{orderCode}/participants/{participantId}` | Staff/Admin | Sửa thông tin participant thay khách | Hỗ trợ sửa sai sót họ tên/SĐT, ghi audit | ⬜ TODO |
| **12.4**| Orders | `POST` | `/admin/orders/{orderCode}/manual-payment` | Admin | Ghi nhận thanh toán thủ công | Xử lý trường hợp khách chuyển khoản trực tiếp | ⬜ TODO |
| **12.5**| Orders | `POST` | `/admin/orders/{orderCode}/cancel-by-admin` | Admin | Admin hủy đơn thay khách | Hủy đơn khẩn cấp, sinh yêu cầu hoàn tiền | ⬜ TODO |
| **13.1**| Products | `GET` | `/admin/products` | Staff/Admin | Danh sách sản phẩm cho thuê | Màn O16 kèm số variant, tổng asset khả dụng | ⬜ TODO |
| **13.2**| Products | `POST` | `/admin/products` | Admin | Tạo sản phẩm mới | Khởi tạo sản phẩm cha | ⬜ TODO |
| **13.3**| Products | `GET` | `/admin/products/{productId}` | Staff/Admin | Chi tiết sản phẩm & biến thể | Màn O17 master-detail | ⬜ TODO |
| **13.4**| Products | `PUT` | `/admin/products/{productId}` | Admin | Sửa thông tin sản phẩm | Cập nhật tên, danh mục, mô tả | ⬜ TODO |
| **13.5**| Products | `DELETE`| `/admin/products/{productId}` | Admin | Xóa sản phẩm | Ẩn sản phẩm khỏi danh mục thuê | ⬜ TODO |
| **13.6**| Products | `POST` | `/admin/products/{productId}/variants` | Admin | Tạo biến thể sản phẩm | Tạo SKU, màu sắc, kích thước mới | ⬜ TODO |
| **13.7**| Products | `PUT` | `/admin/variants/{variantId}` | Admin | Sửa biến thể sản phẩm | Cập nhật thông tin chi tiết biến thể | ⬜ TODO |
| **13.8**| Products | `DELETE`| `/admin/variants/{variantId}` | Admin | Xóa biến thể | Dừng kinh doanh biến thể | ⬜ TODO |
| **13.9**| Products | `POST` | `/admin/variants/{variantId}/images` | Admin | Thêm ảnh biến thể | Quản lý media của biến thể | ⬜ TODO |
| **13.10**| Products | `DELETE`| `/admin/variants/{variantId}/images/{imageId}` | Admin | Xóa ảnh biến thể | Xóa ảnh media | ⬜ TODO |
| **13.11**| Products | `GET` | `/admin/variants/{variantId}/price-tiers` | Staff/Admin | Bảng giá thuê theo ngày của biến thể | Xem các bậc giá theo khoảng ngày | ⬜ TODO |
| **13.12**| Products | `PUT` | `/admin/variants/{variantId}/price-tiers` | Admin | Cập nhật bậc giá thuê của biến thể | Validate khoảng ngày không chồng lấn | ⬜ TODO |
| **13.13**| Products | `GET` | `/admin/pricing` | Staff/Admin | Bảng giá thuê tổng hợp | Màn O18 tra cứu tổng thể bảng giá toàn kho | ⬜ TODO |
| **13.14**| Bundles | `GET` | `/admin/bundles` | Staff/Admin | Danh sách combo thiết bị | Màn O19 danh sách combo | ⬜ TODO |
| **13.15**| Bundles | `POST` | `/admin/bundles` | Admin | Tạo combo mới | Tạo thông tin gói combo | ⬜ TODO |
| **13.16**| Bundles | `GET` | `/admin/bundles/{bundleId}` | Staff/Admin | Chi tiết combo, thành phần & giá | Lấy đầy đủ cấu hình combo | ⬜ TODO |
| **13.17**| Bundles | `PUT` | `/admin/bundles/{bundleId}` | Admin | Sửa thông tin combo | Cập nhật tên, mô tả combo | ⬜ TODO |
| **13.18**| Bundles | `DELETE`| `/admin/bundles/{bundleId}` | Admin | Xóa combo | Ẩn combo | ⬜ TODO |
| **13.19**| Bundles | `PUT` | `/admin/bundles/{bundleId}/items` | Admin | Cập nhật thành phần của combo | Chọn các variant thành phần và số lượng | ⬜ TODO |
| **13.20**| Bundles | `GET` | `/admin/bundles/{bundleId}/price-tiers` | Staff/Admin | Bảng giá thuê của combo | Xem các bậc giá thuê theo số ngày combo | ⬜ TODO |
| **13.21**| Bundles | `PUT` | `/admin/bundles/{bundleId}/price-tiers` | Admin | Cập nhật bậc giá thuê của combo | Thiết lập đơn giá thuê combo | ⬜ TODO |
| **14.1**| Assets | `GET` | `/admin/assets` | Staff/Admin | Danh sách thiết bị cụ thể | Màn O20 lọc mã asset, SKU, tình trạng máy | ✅ Done |
| **14.2**| Assets | `POST` | `/admin/assets/bulk-create` | Admin | Tạo hàng loạt thiết bị (Asset) | Sinh hàng loạt mã barcode theo tiền tố | ✅ Done |
| **14.3**| Assets | `GET` | `/admin/assets/{assetCode}` | Staff/Admin | Chi tiết thiết bị & trạng thái dùng | Drawer tra cứu thiết bị đang giao cho ai | ✅ Done |
| **14.4**| Assets | `PATCH`| `/admin/assets/{assetCode}/status` | Staff/Admin | Đổi tình trạng máy | Đổi sang Sẵn sàng, Bảo trì, Hỏng, Mất | ✅ Done |
| **14.5**| Assets | `GET` | `/admin/assets/{assetCode}/history` | Staff/Admin | Lịch sử phân bổ của thiết bị | Tra cứu toàn bộ các lần thuê/cấp chuyến | ✅ Done |
| **14.6**| Assets | `GET` | `/admin/assets/schedule-gantt` | Staff/Admin | Biểu đồ Gantt phân bổ thiết bị | Màn O21 xem trực quan lịch chiếm dụng kho | ✅ Done |
| **15.1**| Rentals | `GET` | `/admin/rental-orders` | Staff/Admin | Danh sách đơn thuê vận hành | Màn O22 lọc tab giao hôm nay, nhận hôm nay | ⬜ TODO |
| **15.2**| Rentals | `POST` | `/admin/rental-orders/{orderCode}/claim` | Staff/Admin | Nhân viên nhận xử lý đơn thuê | Gán `handled_by_user_id` | ⬜ TODO |
| **15.3**| Rentals | `GET` | `/admin/rental-orders/{orderCode}` | Staff/Admin | Chi tiết đơn thuê vận hành | Màn O23 xem các món đồ, combo, asset đã gán | ⬜ TODO |
| **15.4**| Rentals | `GET` | `/admin/rental-orders/{orderCode}/handover-checklist` | Staff/Admin | Danh sách thiết bị cần bàn giao | Màn O24 bảng tiến độ quét bàn giao | ⬜ TODO |
| **15.5**| Rentals | `POST` | `/admin/rental-orders/{orderCode}/handover/scan` | Staff/Admin | Quét barcode kiểm tra & giao từng món | Phản hồi ngay kết quả quét barcode từng thiết bị | ⬜ TODO |
| **15.6**| Rentals | `POST` | `/admin/rental-orders/{orderCode}/handover/complete` | Staff/Admin | Hoàn tất bàn giao thiết bị | Chuyển trạng thái đơn sang `InFulfillment` | ⬜ TODO |
| **15.7**| Rentals | `GET` | `/admin/rental-orders/{orderCode}/return-checklist` | Staff/Admin | Danh sách thiết bị cần thu hồi | Màn O25 bảng tiến độ nhận lại đồ | ⬜ TODO |
| **15.8**| Rentals | `POST` | `/admin/rental-orders/{orderCode}/return/scan` | Staff/Admin | Quét barcode nhận lại & kiểm tra tình trạng | Ghi nhận tình trạng (Bình thường, Hư hỏng, Thiếu) | ⬜ TODO |
| **15.9**| Rentals | `POST` | `/admin/rental-orders/{orderCode}/return/report-lost` | Staff/Admin | Báo mất thiết bị | Chuyển asset sang Lost, gợi ý tạo phí đền bù | ⬜ TODO |
| **15.10**| Rentals | `POST` | `/admin/rental-orders/{orderCode}/return/complete` | Staff/Admin | Hoàn tất quy trình nhận đồ | Đóng phần kiểm kê thiết bị vật lý | ⬜ TODO |
| **16.1**| Charges | `GET` | `/admin/rental-orders/{orderCode}/charges` | Staff/Admin | Danh sách phí phát sinh của đơn | Màn O26 bảng các khoản phí phạt | ⬜ TODO |
| **16.2**| Charges | `POST` | `/admin/rental-orders/{orderCode}/charges` | Staff/Admin | Lập biên bản phí phát sinh mới | Tạo khoản phí ở trạng thái `Draft` | ⬜ TODO |
| **16.3**| Charges | `POST` | `/admin/charges/{chargeId}/assess` | Staff/Admin | Chốt phí phát sinh | Chuyển từ Draft sang `Assessed` để yêu cầu trả | ⬜ TODO |
| **16.4**| Charges | `POST` | `/admin/charges/{chargeId}/void` | Admin | Hủy phí phát sinh | Chỉ Admin được duyệt xóa phí, bắt buộc lý do | ⬜ TODO |
| **16.5**| Charges | `POST` | `/admin/rental-orders/{orderCode}/charges/request-payment` | Staff/Admin | Tạo yêu cầu thanh toán phí | Sinh giao dịch Collection AdditionalCharge SePay | ⬜ TODO |
| **16.6**| Charges | `POST` | `/admin/rental-orders/{orderCode}/complete` | Staff/Admin | Nghiệm thu đóng toàn bộ đơn thuê | Kiểm tra hết đồ trả, hết phí nợ -> `Completed` | ⬜ TODO |
| **17.1**| Payments | `GET` | `/admin/payments` | Staff/Admin | Danh sách giao dịch tài chính | Màn O27 toàn bộ giao dịch Thu và Hoàn | ⬜ TODO |
| **17.2**| Payments | `GET` | `/admin/refunds` | Admin | Hàng đợi yêu cầu hoàn tiền | Màn O28 tab Chờ duyệt, Thất bại, Cần đối soát | ⬜ TODO |
| **17.3**| Payments | `POST` | `/admin/refunds/{paymentId}/approve` | Admin | Duyệt hoàn tiền qua SePay | Gọi API cổng SePay thực hiện chuyển khoản | ⬜ TODO |
| **17.4**| Payments | `POST` | `/admin/refunds/{paymentId}/retry` | Admin | Thử lại giao dịch hoàn tiền lỗi | Tối đa thử 3 lần nếu SePay gián đoạn | ⬜ TODO |
| **17.5**| Payments | `POST` | `/admin/refunds/{paymentId}/mark-manual` | Admin | Đánh dấu đã hoàn tiền thủ công | Dành cho hoàn tiền mặt/chuyển khoản ngoài | ⬜ TODO |
| **17.6**| Payments | `POST` | `/admin/orders/{orderId}/reconcile-accept` | Admin | Chấp nhận khoản tiền đối soát | Xác nhận đơn và tự hoàn phần tiền thừa | ⬜ TODO |
| **17.7**| Payments | `POST` | `/admin/orders/{orderId}/reconcile-refund` | Admin | Hoàn toàn bộ & Hủy đơn đối soát | Hủy đơn và trả lại tiền khi khách chuyển sai hạn | ⬜ TODO |
| **18.1**| Promos | `GET` | `/admin/promotions` | Staff/Admin | Danh sách chương trình khuyến mãi | Màn O29 tra cứu khuyến mãi | ⬜ TODO |
| **18.2**| Promos | `POST` | `/admin/promotions` | Admin | Tạo chương trình khuyến mãi mới | Thiết lập mã, thời gian, phạm vi áp dụng | ⬜ TODO |
| **18.3**| Promos | `GET` | `/admin/promotions/{promotionId}` | Staff/Admin | Chi tiết khuyến mãi & các bậc | Màn O30 editor thông tin | ⬜ TODO |
| **18.4**| Promos | `PUT` | `/admin/promotions/{promotionId}` | Admin | Sửa thông tin khuyến mãi | Cập nhật điều kiện chung | ⬜ TODO |
| **18.5**| Promos | `PATCH`| `/admin/promotions/{promotionId}/status` | Admin | Bật / Tắt / Tạm dừng khuyến mãi | Đổi trạng thái Active, Paused, Expired | ⬜ TODO |
| **18.6**| Promos | `PUT` | `/admin/promotions/{promotionId}/tiers` | Admin | Cập nhật các bậc giảm giá & quà tặng | Bảng bậc tỷ lệ %, số tiền hoặc quà tặng kèm | ⬜ TODO |
| **18.7**| Promos | `GET` | `/admin/promotions/{promotionId}/usage` | Staff/Admin | Lịch sử áp dụng khuyến mãi | Màn O31 danh sách đơn hàng đã dùng mã | ⬜ TODO |
| **19.1**| Posts | `GET` | `/admin/posts` | Staff/Admin | Danh sách bài viết & cẩm nang | Màn O32 danh sách bài viết | ⬜ TODO |
| **19.2**| Posts | `POST` | `/admin/posts` | Staff/Admin | Tạo bài viết mới (Draft) | Khởi tạo bài viết | ⬜ TODO |
| **19.3**| Posts | `GET` | `/admin/posts/{postId}` | Staff/Admin | Chi tiết bài viết & nội dung | Trình soạn thảo rich-text, tags, soft-skills | ⬜ TODO |
| **19.4**| Posts | `PUT` | `/admin/posts/{postId}` | Staff/Admin | Sửa bài viết | Cập nhật nội dung bài hướng dẫn | ⬜ TODO |
| **19.5**| Posts | `DELETE`| `/admin/posts/{postId}` | Admin | Xóa bài viết | Xóa bài viết | ⬜ TODO |
| **19.6**| Posts | `POST` | `/admin/posts/{postId}/publish` | Staff/Admin | Xuất bản bài viết | Chuyển trạng thái Published | ⬜ TODO |
| **19.7**| Posts | `POST` | `/admin/posts/{postId}/archive` | Staff/Admin | Lưu trữ bài viết | Ẩn bài viết cũ | ⬜ TODO |
| **19.8**| Posts | `GET` | `/admin/posts/{postId}/read-analytics` | Staff/Admin | Báo cáo lượt đọc bài viết | Thống kê số khách đã đọc trước chuyến đi | ⬜ TODO |
| **20.1**| Policies| `GET` | `/admin/refund-policies` | Staff/Admin | Danh sách chính sách hoàn tiền | Màn O34 danh sách chính sách Tour & Thuê | ⬜ TODO |
| **20.2**| Policies| `POST` | `/admin/refund-policies` | Admin | Tạo chính sách hoàn tiền mới | Thiết lập chính sách | ⬜ TODO |
| **20.3**| Policies| `GET` | `/admin/refund-policies/{policyId}` | Staff/Admin | Chi tiết chính sách & quy tắc | Xem các bậc % hoàn theo mốc thời gian | ⬜ TODO |
| **20.4**| Policies| `PUT` | `/admin/refund-policies/{policyId}` | Admin | Sửa chính sách hoàn tiền | Chỉ cho phép khi chưa có chuyến nào áp dụng | ⬜ TODO |
| **20.5**| Policies| `PUT` | `/admin/refund-policies/{policyId}/rules` | Admin | Cập nhật bảng quy tắc hoàn tiền | Bảng giờ trước khởi hành vs % hoàn | ⬜ TODO |
| **20.6**| Policies| `POST` | `/admin/refund-policies/{policyId}/clone-version` | Admin | Nhân bản chính sách sang bản mới | Đóng bản cũ và tạo version mới khi đã dùng | ⬜ TODO |
| **21.1**| Settings| `GET` | `/admin/settings` | Admin | Danh sách cấu hình hệ thống | Màn O35 tra cứu các tham số toàn cục | ⬜ TODO |
| **21.2**| Settings| `PUT` | `/admin/settings/{configKey}` | Admin | Cập nhật giá trị cấu hình | Sửa hạn giữ chỗ, phí trễ, có ghi audit | ⬜ TODO |
| **21.3**| Audit | `GET` | `/admin/audit-logs` | Admin | Tra cứu nhật ký hệ thống | Màn O36 tra cứu audit log toàn diện | ⬜ TODO |
| **22.1**| Reports | `GET` | `/admin/reports/revenue` | Admin | Báo cáo doanh thu & dòng tiền | Màn O37 doanh thu ròng theo tour & thuê | ⬜ TODO |
| **22.2**| Reports | `GET` | `/admin/reports/trip-occupancy` | Admin | Báo cáo tỷ lệ lấp chỗ chuyến đi | Đo lường hiệu quả bán chỗ các chuyến | ⬜ TODO |
| **22.3**| Reports | `GET` | `/admin/reports/asset-utilization` | Admin | Báo cáo hiệu suất khai thác thiết bị| Thống kê ngày hoạt động của thiết bị kho | ⬜ TODO |
| **22.4**| Reports | `GET` | `/admin/reports/refunds-and-charges` | Admin | Báo cáo hoàn tiền & phạt phát sinh | Thống kê số tiền hoàn và tiền bồi thường | ⬜ TODO |
| **23.1**| Reviews | `GET` | `/admin/reviews` | Staff/Admin | Danh sách đánh giá của khách | Màn O39 lọc số sao, tour, chuyến, guide | ⬜ TODO |
| **23.2**| Reviews | `POST` | `/admin/reviews/{reviewId}/hide` | Admin | Ẩn đánh giá vi phạm tiêu chuẩn | Bắt buộc nhập lý do ẩn, ghi audit | ⬜ TODO |
| **23.3**| Reviews | `POST` | `/admin/reviews/{reviewId}/unhide` | Admin | Khôi phục hiển thị đánh giá | Bỏ cờ ẩn đánh giá | ⬜ TODO |
| **24.1**| Guide | `GET` | `/guide/trips` | Guide | Danh sách chuyến của Guide | Màn G01 xem chuyến hôm nay / sắp tới / đã xong | ⬜ TODO |
| **24.2**| Guide | `GET` | `/guide/trips/{tripId}/group` | Guide | Chi tiết nhóm & danh sách khách | Màn G02 danh sách thành viên trong nhóm kèm số phone | ⬜ TODO |
| **24.3**| Guide | `GET` | `/guide/participants/{participantId}` | Guide | Chi tiết thông tin khách & cứu hộ | Màn G03 liên hệ khẩn cấp & danh sách đồ cấp của khách | ⬜ TODO |
| **24.4**| Guide | `POST` | `/guide/trips/{tripId}/attendances/batch` | Guide | Điểm danh thực địa nhanh (Batch) | Màn G04 điểm danh Present/Absent/Late, hỗ trợ offline sync | ⬜ TODO |
| **24.5**| Guide | `GET` | `/guide/trips/{tripId}/itinerary` | Guide | Timeline lịch trình hoạt động chuyến | Màn G05 timeline hoạt động kèm tỉ lệ điểm danh | ⬜ TODO |
| **24.6**| Guide | `GET` | `/guide/trips/{tripId}/provided-items` | Guide | Danh sách đồ cấp giao cho nhóm | Màn G06 kiểm tra đồ cấp, thiết bị trước khi leo | ⬜ TODO |

> Trạng thái: ⬜ TODO · 🟨 In progress · ✅ Done · 🔁 Changed

---

## 1. Auth

### 1.1. Đăng ký tài khoản
`POST /auth/register` · **Auth:** Public

**Mô tả:** Đăng ký tài khoản khách hàng mới. Tạo bản ghi `accounts` và `profiles` liên kết, mặc định vai trò `Customer`.

**Request body**

| Field | Type | Required | Validation | Mô tả |
|---|---|---|---|---|
| `email` | `string` | ✔ | Email hợp lệ | Email đăng nhập |
| `password` | `string` | ✔ | Tối thiểu 8 ký tự, gồm chữ hoa, số | Mật khẩu tài khoản |
| `fullName` | `string` | ✔ | Không rỗng | Họ và tên hiển thị |
| `phone` | `string` | ✘ | Đúng định dạng SĐT VN | Số điện thoại |

```json
{
  "email": "customer@gmail.com",
  "password": "Password123@",
  "fullName": "Nguyễn Văn A",
  "phone": "0987654321"
}
```

**Response `201 Created`**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "customer@gmail.com",
    "fullName": "Nguyễn Văn A",
    "userCode": "CUS-8921",
    "role": "Customer"
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

**Lỗi:** `400 BadRequest` (Dữ liệu không hợp lệ) · `409 Conflict` (`EMAIL_ALREADY_EXISTS`).

---

### 1.2. Đăng nhập
`POST /auth/login` · **Auth:** Public

**Mô tả:** Xác thực đăng nhập bằng email và mật khẩu, trả về cặp JWT Access Token và Refresh Token.

**Request body**

```json
{
  "email": "admin@rentrek.vn",
  "password": "Password123@"
}
```

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "d7a8b9c0...",
    "expiresIn": 3600,
    "user": {
      "userId": "11111111-2222-3333-4444-555555555555",
      "email": "admin@rentrek.vn",
      "fullName": "Quản Trị Viên",
      "role": "Admin",
      "userCode": "ADM-0001",
      "avatarUrl": null
    }
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 1.3. Làm mới token
`POST /auth/refresh-token` · **Auth:** Public

**Request body**

```json
{
  "refreshToken": "d7a8b9c0..."
}
```

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Làm mới phiên thành công",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "e8b9c0d1...",
    "expiresIn": 3600
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 1.4. Đăng xuất
`POST /auth/logout` · **Auth:** User

**Request body**

```json
{
  "refreshToken": "e8b9c0d1..."
}
```

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Đăng xuất thành công",
  "data": null,
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

## 2. Users (Cá nhân)

### 2.1. Lấy thông tin cá nhân
`GET /users/me` · **Auth:** User

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "userId": "11111111-2222-3333-4444-555555555555",
    "email": "admin@rentrek.vn",
    "fullName": "Quản Trị Viên",
    "phone": "0901234567",
    "userCode": "ADM-0001",
    "role": "Admin",
    "avatarUrl": "https://cdn.rentrek.vn/avatars/adm.png",
    "dateOfBirth": "1990-05-15",
    "address": "TP. Hồ Chí Minh",
    "bio": "Quản trị viên vận hành hệ thống",
    "createdAt": "2026-01-01T00:00:00Z"
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 2.2. Cập nhật thông tin cá nhân
`PUT /users/me` · **Auth:** User

**Request body**

```json
{
  "fullName": "Quản Trị Viên",
  "phone": "0909888999",
  "avatarUrl": "https://cdn.rentrek.vn/avatars/adm2.png",
  "dateOfBirth": "1990-05-15",
  "address": "TP. Hồ Chí Minh",
  "bio": "Cập nhật tiểu sử"
}
```

**Response `200 OK`** (Trả về profile đã cập nhật).

---

## 3. Admin: Dashboard & Cảnh báo (Màn O01)

### 3.1. Số liệu đếm tổng hợp nhanh
`GET /admin/dashboard/stats` · **Auth:** Staff / Admin

- **Mục đích:** Hiển thị số đếm huy hiệu (badges) trên các ô chỉ số của màn hình Dashboard vận hành O01.
- **Tại sao cần API này:** Tách riêng API đếm nhanh (lightweight count queries) để nạp tức thì trong vòng 100ms khi vào trang Dashboard, không bắt người dùng đợi các truy vấn phân tích nặng.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "pendingPaymentExpiringCount": 3,
    "tripsDepartingIn7DaysCount": 8,
    "unassignedParticipantsCount": 14,
    "missingProvidedItemsCount": 5,
    "underCapacityTripsCount": 2,
    "overdueRentalAssetsCount": 4,
    "pendingApprovalRefundsCount": 6,
    "failedRefundsCount": 1,
    "needsReconciliationOrdersCount": 2,
    "draftRentalChargesCount": 3
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 3.2. Danh sách cảnh báo vận hành khẩn
`GET /admin/dashboard/alerts` · **Auth:** Staff / Admin

- **Mục đích:** Hiển thị danh sách các mục sự vụ khẩn cấp cần nhân viên xử lý ngay (như chuyến khởi hành thiếu đồ cấp, thiết bị quá hạn trả, hoàn tiền SePay lỗi).
- **Tại sao cần API này:** Gom các vấn đề cần hành động (Actionable alerts) kèm link dẫn thẳng tới màn hình chi tiết tương ứng (O12, O13, O25, O28).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "alertType": "TripMissingGear",
      "severity": "High",
      "title": "Chuyến Tà Năng - Phan Dũng thiếu 3 Đèn đội đầu",
      "message": "Khởi hành ngày 05/11/2026 nhưng đồ cấp chưa được gán đủ tài sản.",
      "relatedEntity": "Trip",
      "entityId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "actionUrl": "/ops/trips/a1b2c3d4-e5f6-7890-abcd-ef1234567890/provided-items"
    },
    {
      "alertType": "OverdueRental",
      "severity": "Medium",
      "title": "Đơn thuê R-2026-0045 quá hạn trả 1 ngày",
      "message": "Khách hàng Nguyễn Văn B chưa hoàn trả 2 lều cắm trại 4 người.",
      "relatedEntity": "RentalOrder",
      "entityId": "R-2026-0045",
      "actionUrl": "/ops/rentals/R-2026-0045"
    }
  ],
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 3.3. Các chỉ số KPI vận hành & doanh thu
`GET /admin/dashboard/kpis` · **Auth:** Admin

- **Mục đích:** Hiển thị biểu đồ và chỉ số hiệu quả kinh doanh trong tuần/tháng (booking mới, tỷ lệ lấp chỗ trung bình, doanh thu ròng, thiết bị đang khai thác).
- **Tại sao cần API này:** Dành riêng cho quản trị viên, tính toán các chỉ số tài chính (tổng thu trừ tổng hoàn) tách biệt khỏi phần điều phối của Staff.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "weeklyBookingsCount": 42,
    "averageOccupancyRate": 82.5,
    "netRevenueVnd": 125400000,
    "activeRentedAssetsCount": 86,
    "totalAvailableAssetsCount": 150
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

## 4. Admin: Quản lý Người dùng & Phân quyền (Màn O02, O03)

### 4.1. Danh sách người dùng
`GET /admin/users` · **Auth:** Admin

- **Mục đích:** Tìm kiếm, lọc và phân trang toàn bộ tài khoản người dùng trên hệ thống tại màn O02.
- **Tại sao cần API này:** Phục vụ quản trị danh tính tập trung, hỗ trợ lọc theo vai trò (`Customer`, `Staff`, `Guide`, `Admin`) và trạng thái (`Active`, `Locked`).

**Query params**

| Param | Type | Required | Default | Mô tả |
|---|---|---|---|---|
| `pageNumber` | `int` | ✘ | `1` | Trang hiện tại |
| `pageSize` | `int` | ✘ | `10` | Số lượng mỗi trang |
| `search` | `string` | ✘ | | Tìm theo tên, email, SĐT, userCode |
| `role` | `string` | ✘ | | Lọc theo vai trò (`Customer`, `Staff`, `Guide`, `Admin`) |
| `status` | `string` | ✘ | | Lọc theo trạng thái (`Active`, `Locked`) |

**Response `200 OK`** (`data` là Paged data)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "userId": "12345678-aaaa-bbbb-cccc-111122223333",
        "userCode": "STA-0012",
        "email": "staff1@rentrek.vn",
        "fullName": "Trần Thị B",
        "phone": "0912345678",
        "role": "Staff",
        "status": "Active",
        "avatarUrl": null,
        "lastLoginAt": "2026-10-31T10:15:00Z",
        "createdAt": "2026-05-10T00:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 145,
    "totalPages": 15,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 4.2. Tạo tài khoản nhân sự nội bộ (Staff / Guide)
`POST /admin/users/staff` · **Auth:** Admin

- **Mục đích:** Nút "Tạo tài khoản Staff/Guide" tại màn O02.
- **Tại sao cần API này:** Khách hàng tự đăng ký chỉ nhận role `Customer`. Các role nội bộ có quyền điều phối hoặc dẫn tour phải do Admin tạo thủ công có kiểm soát.

**Request body**

```json
{
  "email": "guide.nam@rentrek.vn",
  "fullName": "Lê Văn Nam",
  "phone": "0988776655",
  "role": "Guide",
  "password": "TemporaryPassword123@",
  "careerStartDate": "2020-01-01"
}
```

**Response `201 Created`**

---

### 4.3. Chi tiết người dùng
`GET /admin/users/{userId}` · **Auth:** Admin

- **Mục đích:** Hiển thị chi tiết màn hình O03 (thông tin hồ sơ, vai trò, số chuyến đã dẫn/điều phối/đơn hàng đã đặt).

---

### 4.4. Cập nhật hồ sơ người dùng (Admin)
`PUT /admin/users/{userId}/profile` · **Auth:** Admin

- **Mục đích:** Admin hỗ trợ cập nhật thông tin cá nhân sai sót (họ tên, ngày sinh, địa chỉ, năm vào nghề của Guide).

---

### 4.5. Đổi vai trò tài khoản
`PATCH /admin/users/{userId}/role` · **Auth:** Admin

- **Mục đích:** Tab Quyền màn O03 — thay đổi quyền hạn giữa Staff, Guide, Customer.
- **Tại sao cần API này:** Phân tách khỏi API sửa thông tin cá nhân vì thay đổi vai trò là tác vụ đặc biệt nhạy cảm, yêu cầu ghi nhận audit log và kiểm tra quyền quản trị viên cấp cao.

**Request body**

```json
{
  "role": "Staff",
  "reason": "Điều chuyển nhân sự từ Guide sang Staff điều phối tour"
}
```

---

### 4.6. Khóa tài khoản
`POST /admin/users/{userId}/lock` · **Auth:** Admin

- **Mục đích:** Khóa tài khoản vi phạm chính sách hoặc nghỉ việc.
- **Tại sao cần API này:** Thao tác khóa tài khoản không đơn giản là đổi `status = Locked`. Hệ thống bắt buộc phải nhận lý do khóa, tự động thu hồi (revoke) toàn bộ Refresh Token của user đó trên mọi thiết bị và ghi nhật ký kiểm toán `AUDIT_LOGS`.

**Request body**

```json
{
  "reason": "Phát hiện hành vi gian lận mã khuyến mãi nhiều lần"
}
```

**Response `200 OK`**

---

### 4.7. Mở khóa tài khoản
`POST /admin/users/{userId}/unlock` · **Auth:** Admin

- **Mục đích:** Mở lại quyền truy cập cho tài khoản sau khi giải quyết khiếu nại.

---

### 4.8. Danh sách phiên đăng nhập của người dùng
`GET /admin/users/{userId}/sessions` · **Auth:** Admin

- **Mục đích:** Tab Phiên đăng nhập màn O03 — hiển thị danh sách các phiên thiết bị đang hoạt động (`refresh_tokens`), thời điểm bắt đầu, hết hạn.
- **Tại sao cần API này:** Lazy-load tab bảo mật theo nhu cầu, tránh tải nặng khi chỉ xem thông tin hồ sơ.

---

### 4.9. Thu hồi một phiên đăng nhập
`DELETE /admin/users/{userId}/sessions/{sessionId}` · **Auth:** Admin

- **Mục đích:** Cưỡng chế đăng xuất một thiết bị lạ hoặc nghi ngờ bị lộ phiên của người dùng.

---

### 4.10. Thu hồi tất cả phiên đăng nhập
`DELETE /admin/users/{userId}/sessions` · **Auth:** Admin

- **Mục đích:** Đăng xuất người dùng trên toàn bộ mọi thiết bị.

---

### 4.11. Lịch sử hoạt động người dùng (Audit Log)
`GET /admin/users/{userId}/activities` · **Auth:** Admin

- **Mục đích:** Tab Hoạt động màn O03 — hiển thị toàn bộ thao tác do user này thực hiện hoặc tác động lên user này.

---

## 5. Admin: Danh mục, Địa điểm, Tags & Kỹ năng (Màn O04, O33)

### 5.1. Danh sách danh mục
`GET /admin/categories` · **Auth:** Staff / Admin

- **Mục đích:** Liệt kê các danh mục phân loại phục vụ Tour, Thiết bị hoặc Combo tại màn O04.
- **Tại sao cần API này:** Phục vụ dropdown bộ lọc và bảng quản trị danh mục; hỗ trợ lọc theo trường `categoryType` (`Tour`, `Equipment`, `Bundle`).

**Query params:** `categoryType` (`string`, optional), `search` (`string`, optional).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "categoryId": "22222222-3333-4444-5555-666666666666",
      "name": "Trekking Núi cao",
      "categoryType": "Tour",
      "description": "Các cung đường chinh phục đỉnh núi trên 2000m",
      "isActive": true,
      "createdAt": "2026-02-01T00:00:00Z"
    }
  ],
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 5.2. Tạo danh mục mới
`POST /admin/categories` · **Auth:** Admin

**Request body**

```json
{
  "name": "Lều trại & Nghỉ đêm",
  "categoryType": "Equipment",
  "description": "Các loại lều dã ngoại, túi ngủ, đệm hơi"
}
```

**Response `201 Created`**

---

### 5.3. Sửa danh mục
`PUT /admin/categories/{categoryId}` · **Auth:** Admin

**Request body**

```json
{
  "name": "Lều trại & Túi ngủ",
  "description": "Cập nhật mô tả danh mục",
  "isActive": true
}
```

---

### 5.4. Xóa (Ẩn) danh mục
`DELETE /admin/categories/{categoryId}` · **Auth:** Admin

- **Mục đích:** Ẩn danh mục khỏi hệ thống (`is_deleted = 1`). Chặn xóa cứng để bảo vệ khóa ngoại của các sản phẩm/tour cũ.

---

### 5.5. Danh sách địa điểm
`GET /admin/locations` · **Auth:** Staff / Admin

- **Mục đích:** Tab Địa điểm màn O04 — hiển thị danh sách các điểm trekking, kèm tọa độ GPS kinh độ/vĩ độ và số lượng tour đang xuất phát hoặc đi qua địa điểm đó.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "locationId": "33333333-4444-5555-6666-777777777777",
      "name": "Vườn quốc gia Bidoup Núi Bà",
      "address": "Huyện Lạc Dương, Tỉnh Lâm Đồng",
      "latitude": 12.0954,
      "longitude": 108.6472,
      "toursCount": 4,
      "createdAt": "2026-03-01T00:00:00Z"
    }
  ],
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 5.6. Tạo địa điểm mới
`POST /admin/locations` · **Auth:** Admin

**Request body**

```json
{
  "name": "Đỉnh Tà Xùa",
  "address": "Bắc Yên, Sơn La",
  "latitude": 21.4167,
  "longitude": 104.4500
}
```

---

### 5.7. Sửa địa điểm
`PUT /admin/locations/{locationId}` · **Auth:** Admin

---

### 5.8. Xóa địa điểm
`DELETE /admin/locations/{locationId}` · **Auth:** Admin

- **Ràng buộc:** Trả về lỗi `400 BadRequest` (`LOCATION_IN_USE`) nếu đang có tour sử dụng địa điểm này làm `main_location_id`.

---

### 5.9 – 5.12. Quản lý Tag bài viết (Tags)
- `GET /admin/tags` · Staff/Admin: Lấy danh sách tag và số bài viết đang gắn nhãn.
- `POST /admin/tags` · Admin: Tạo tag mới (`name`, `slug`).
- `PUT /admin/tags/{tagId}` · Admin: Sửa tên/slug của tag.
- `DELETE /admin/tags/{tagId}` · Admin: Xóa tag.

---

### 5.13 – 5.16. Quản lý Kỹ năng mềm (Soft Skills)
- `GET /admin/soft-skills` · Staff/Admin: Lấy danh sách kỹ năng mềm bổ trợ (như Kỹ năng sinh tồn, Dựng lều, Sơ cấp cứu).
- `POST /admin/soft-skills` · Admin: Tạo kỹ năng mới (`name`, `description`).
- `PUT /admin/soft-skills/{skillId}` · Admin: Sửa kỹ năng.
- `DELETE /admin/soft-skills/{skillId}` · Admin: Xóa kỹ năng.

---

## 6. Admin: Quản lý Tour & Phiên bản (Màn O05, O06, O07)

### 6.1. Danh sách tour vận hành
`GET /admin/tours` · **Auth:** Staff / Admin

- **Mục đích:** Hiển thị danh sách tour tại màn O05. Mặc định chỉ hiển thị phiên bản (version) mới nhất của mỗi nhóm tour (`tour_family_id`).
- **Query params:** `pageNumber`, `pageSize`, `search`, `status` (`Draft`, `Published`, `Archived`), `categoryId`, `locationId`.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "tourId": "44444444-5555-6666-7777-888888888888",
        "tourFamilyId": "44444444-0000-0000-0000-888888888888",
        "name": "Chinh phục Tà Năng - Phan Dũng",
        "categoryName": "Trekking Núi cao",
        "mainLocationName": "Lâm Đồng - Bình Thuận",
        "durationDays": 3,
        "durationNights": 2,
        "basePrice": 3200000,
        "version": 2,
        "isItineraryLocked": true,
        "status": "Published",
        "primaryImageUrl": "https://cdn.rentrek.vn/tours/tnpd-cover.jpg",
        "upcomingTripsCount": 5
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 18,
    "totalPages": 2,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 6.2. Tạo tour mới (Draft)
`POST /admin/tours` · **Auth:** Admin

- **Mục đích:** Khởi tạo một tour mới ở trạng thái `Draft` (nháp). Tạo mới một `tour_family_id` và gán `version = 1`.

**Request body**

```json
{
  "name": "Khám phá Vườn quốc gia Bạch Mã",
  "categoryId": "22222222-3333-4444-5555-666666666666",
  "mainLocationId": "33333333-4444-5555-6666-777777777777",
  "description": "Cung đường xuyên rừng nhiệt đới ngắm Ngũ Hồ và Thác Đỗ Quyên",
  "durationDays": 2,
  "durationNights": 1,
  "durationMinutes": 1800,
  "basePrice": 2100000
}
```

**Response `201 Created`**

---

### 6.3. Chi tiết thông tin chung của tour
`GET /admin/tours/{tourId}` · **Auth:** Staff / Admin

- **Mục đích:** Tải dữ liệu Tab Thông tin chung tại màn O06.
- **Tại sao cần API này:** Tách biệt thông tin metadata cơ bản với lịch trình hoạt động và danh sách đồ đạc, giúp trang load nhanh và báo cho FE biết cờ `itinerary_locked_at` để vô hiệu hóa nút sửa nếu tour đã có khách mua.

---

### 6.4. Sửa thông tin chung của tour
`PUT /admin/tours/{tourId}` · **Auth:** Admin

- **Mục đích:** Cập nhật tên, mô tả, giá cơ sở hoặc số ngày đêm của tour.

---

### 6.5. Xuất bản tour (Publish)
`POST /admin/tours/{tourId}/publish` · **Auth:** Admin

- **Mục đích:** Đưa tour từ trạng thái `Draft` lên `Published` để khách hàng có thể nhìn thấy và hệ thống bắt đầu mở bán chuyến.
- **Điều kiện kiểm tra (Invariants):** Phải có ít nhất 1 ảnh đại diện, có ít nhất 1 hoạt động lịch trình, và đã thiết lập đồ cấp/đồ tự mang.

---

### 6.6. Lưu trữ / Ẩn tour (Archive)
`POST /admin/tours/{tourId}/archive` · **Auth:** Admin

- **Mục đích:** Chuyển trạng thái sang `Archived`. Dừng hiển thị trên trang chủ và danh sách khám phá. Các chuyến đã tạo từ tour này trong quá khứ vẫn giữ nguyên dữ liệu lịch sử.

---

### 6.7 – 6.10. Quản lý Thư viện Ảnh Tour (Tab Media O06)
- `GET /admin/tours/{tourId}/images` · Lấy danh sách ảnh, thứ tự `display_order`, và cờ `is_primary`.
- `POST /admin/tours/{tourId}/images` · Thêm ảnh mới vào tour (`imageUrl`, `displayOrder`, `isPrimary`).
- `PUT /admin/tours/{tourId}/images/reorder` · Cập nhật lại thứ tự hiển thị và đặt ảnh đại diện (phục vụ thao tác kéo thả ảnh trên UI).
- `DELETE /admin/tours/{tourId}/images/{imageId}` · Xóa ảnh khỏi thư viện tour.

---

### 6.11. Lấy lịch trình hoạt động của tour
`GET /admin/tours/{tourId}/activities` · **Auth:** Staff / Admin

- **Mục đích:** Tải Tab Lịch trình màn O06 — danh sách các hoạt động phân theo từng ngày (`day_number` từ 1 đến N).
- **Tại sao cần API này:** Danh sách hoạt động có cấu trúc dạng bảng/timeline chi tiết với hàng chục mục. Tách riêng giúp FE lazy-load khi người dùng chuyển sang Tab Lịch trình.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "activityId": "55555555-6666-7777-8888-999999999999",
      "dayNumber": 1,
      "startTime": "07:30:00",
      "durationMinutes": 180,
      "name": "Tập trung tại bìa rừng & khởi động",
      "description": "Hướng dẫn viên phổ biến an toàn và phát gậy trekking",
      "displayOrder": 1
    },
    {
      "activityId": "55555555-6666-7777-8888-000000000000",
      "dayNumber": 1,
      "startTime": "12:00:00",
      "durationMinutes": 60,
      "name": "Nghỉ trưa tại Đồi Thông",
      "description": "Dùng bữa trưa dã ngoại và nghỉ ngơi",
      "displayOrder": 2
    }
  ],
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 6.12. Thêm hoạt động vào lịch trình
`POST /admin/tours/{tourId}/activities` · **Auth:** Admin

- **Ràng buộc:** Nếu tour đã có `itinerary_locked_at` (do đã có chuyến phát sinh booking), hệ thống từ chối thêm hoạt động mới và trả lỗi `ITINERARY_LOCKED`. Yêu cầu người dùng nhân bản phiên bản mới (`versions/clone`).

**Lỗi (Error Responses)**

```json
HTTP 400 Bad Request
{
  "success": false,
  "statusCode": 400,
  "message": "Lịch trình tour đã bị khóa do đã có chuyến phát sinh người đặt mua.",
  "data": null,
  "errors": {
    "code": ["ITINERARY_LOCKED"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

| Status | Khi nào | Code | Hành động của FE |
|---|---|---|---|
| `400` | Tour đã bị khóa lịch trình | `ITINERARY_LOCKED` | Hiển thị banner khóa và nút "Tạo phiên bản mới (Clone)" |
| `404` | Không tìm thấy tour | `NOT_FOUND` | Hiển thị lỗi 404 |

---

### 6.13. Sửa hoạt động trong lịch trình
`PUT /admin/tours/{tourId}/activities/{activityId}` · **Auth:** Admin

---

### 6.14. Xóa hoạt động
`DELETE /admin/tours/{tourId}/activities/{activityId}` · **Auth:** Admin

---

### 6.15. Sắp xếp lại thứ tự hoạt động trong ngày
`PUT /admin/tours/{tourId}/activities/reorder` · **Auth:** Admin

**Request body**

```json
{
  "dayNumber": 1,
  "activityIdsInOrder": [
    "55555555-6666-7777-8888-999999999999",
    "55555555-6666-7777-8888-000000000000"
  ]
}
```

---

### 6.16 – 6.17. Quản lý Đồ tự mang (Tab Đồ tự mang O06)
- `GET /admin/tours/{tourId}/preparation-items` · Lấy danh sách đồ dùng khách tự chuẩn bị.
- `PUT /admin/tours/{tourId}/preparation-items` · Cập nhật toàn bộ danh sách đồ tự mang (`itemName`, `note`).

---

### 6.18. Danh sách đồ cấp cấu hình cho tour
`GET /admin/tours/{tourId}/provided-items` · **Auth:** Staff / Admin

- **Mục đích:** Tab Đồ cấp màn O06 — danh sách các thiết bị công ty cung cấp cho khách trong tour này.
- **Tại sao cần API này:** Mỗi dòng đồ cấp liên kết với một biến thể sản phẩm cụ thể (`product_variant_id`), có số lượng định mức và cơ sở tính (`PerPerson`: theo mỗi khách, `PerGroup`: theo mỗi nhóm, `PerTrip`: theo cả chuyến).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "tourProvidedItemId": "66666666-7777-8888-9999-000000000001",
      "productVariantId": "77777777-8888-9999-0000-111111111111",
      "sku": "HEADLAMP-PETZL-TIKKA-BLK",
      "productName": "Đèn đội đầu Petzl Tikka",
      "variantName": "Đen - 350 Lumens",
      "quantity": 1,
      "quantityBasis": "PerPerson",
      "note": "Phát cho mỗi khách tại điểm tập kết"
    },
    {
      "tourProvidedItemId": "66666666-7777-8888-9999-000000000002",
      "productVariantId": "77777777-8888-9999-0000-222222222222",
      "sku": "FIRST-AID-KIT-ADVANCED",
      "productName": "Túi y tế dã ngoại chuyên sâu",
      "variantName": "Tiêu chuẩn đoàn",
      "quantity": 1,
      "quantityBasis": "PerGroup",
      "note": "Phát cho Guide phụ trách nhóm giữ"
    }
  ],
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 6.19. Thêm định mức đồ cấp cho tour
`POST /admin/tours/{tourId}/provided-items` · **Auth:** Admin

---

### 6.20. Sửa định mức đồ cấp
`PUT /admin/tours/{tourId}/provided-items/{itemId}` · **Auth:** Admin

---

### 6.21. Xóa định mức đồ cấp
`DELETE /admin/tours/{tourId}/provided-items/{itemId}` · **Auth:** Admin

---

### 6.22 – 6.23. Quản lý Bài viết gắn kèm Tour (Tab Bài viết O06)
- `GET /admin/tours/{tourId}/posts` · Lấy danh sách bài viết cẩm nang gắn với tour này.
- `PUT /admin/tours/{tourId}/posts` · Cập nhật danh sách bài viết và thứ tự đọc bắt buộc (`postId`, `displayOrder`).

---

### 6.24. Lịch sử các phiên bản của tour
`GET /admin/tours/{tourId}/versions` · **Auth:** Staff / Admin

- **Mục đích:** Drawer O07 — liệt kê tất cả các phiên bản trong cùng một họ tour (`tour_family_id`), số chuyến đang chạy trên từng bản và thời điểm khóa lịch trình.

---

### 6.25. Nhân bản tạo phiên bản mới (Clone Tour Version)
`POST /admin/tours/{tourId}/versions/clone` · **Auth:** Admin

- **Mục đích:** Khi tour đã có khách mua khiến lịch trình bị khóa (`itinerary_locked_at`), nhưng ban quản lý cần điều chỉnh lịch trình hoặc định mức đồ cho các chuyến tương lai: API này thực hiện sao chép toàn bộ cây thực thể (Tour, Activities, Preparation, Provided, Images) sang một bản ghi mới với `version = version_hiện_tại + 1`, trạng thái `Draft`.
- **Tại sao cần API này:** Đảm bảo nguyên tắc bảo toàn dữ liệu thương mại (G-05): việc sửa đổi sau này không làm sai lệch chuyến đi cũ của khách hàng trong quá khứ.

**Response `201 Created`** (Trả về `tourId` của phiên bản mới).

---

### 6.26. So sánh sai khác giữa 2 phiên bản tour (Diff)
`GET /admin/tours/{tourId}/versions/diff?compareWithVersionId={targetTourId}` · **Auth:** Staff / Admin

- **Mục đích:** So sánh trực quan giữa 2 phiên bản tour để người điều phối thấy rõ các thay đổi trong lịch trình, giờ xuất phát hoặc đồ cấp.

---

## 7. Admin: Lịch lặp & Tự động sinh chuyến (Màn O08)

### 7.1. Danh sách quy tắc lặp chuyến của tour
`GET /admin/tours/{tourId}/recurrence-rules` · **Auth:** Staff / Admin

- **Mục đích:** Màn O08 — hiển thị các luật sinh chuyến định kỳ (Hằng tuần, Hằng tháng) của tour.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "recurrenceRuleId": "77777777-8888-9999-aaaa-111111111111",
      "tourId": "44444444-5555-6666-7777-888888888888",
      "frequency": "Weekly",
      "intervalValue": 1,
      "daysOfWeek": "Friday,Saturday",
      "startTime": "06:00:00",
      "startDate": "2026-11-01",
      "endDate": "2027-04-30",
      "defaultTotalSlots": 20,
      "defaultPrice": 3200000,
      "isActive": true,
      "createdAt": "2026-10-15T00:00:00Z"
    }
  ],
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 7.2. Tạo quy tắc lặp chuyến mới
`POST /admin/tours/{tourId}/recurrence-rules` · **Auth:** Admin

**Request body**

```json
{
  "frequency": "Weekly",
  "intervalValue": 1,
  "daysOfWeek": "Friday",
  "startTime": "06:00:00",
  "startDate": "2026-12-01",
  "endDate": "2027-02-28",
  "defaultTotalSlots": 25,
  "defaultPrice": 3200000,
  "isActive": true
}
```

---

### 7.3. Sửa quy tắc lặp
`PUT /admin/recurrence-rules/{ruleId}` · **Auth:** Admin

- **Ghi chú:** Sửa đổi quy tắc lặp chỉ áp dụng cho các lần sinh chuyến trong tương lai, không làm thay đổi các chuyến đã sinh ra trước đó.

---

### 7.4. Xóa quy tắc lặp
`DELETE /admin/recurrence-rules/{ruleId}` · **Auth:** Admin

---

### 7.5. Xem trước lịch các chuyến sẽ sinh (Preview)
`POST /admin/recurrence-rules/{ruleId}/preview` · **Auth:** Staff / Admin

- **Mục đích:** Giả lập và trả về danh sách các ngày sẽ khởi hành chuyến từ nay đến `endDate`. Đánh dấu các ngày đã có chuyến thực tế trong DB để người vận hành kiểm tra tránh trùng lặp trước khi sinh thật.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "startAt": "2026-12-04T06:00:00Z",
      "endAt": "2026-12-06T18:00:00Z",
      "isAlreadyGenerated": false
    },
    {
      "startAt": "2026-12-11T06:00:00Z",
      "endAt": "2026-12-13T18:00:00Z",
      "isAlreadyGenerated": true,
      "existingTripId": "88888888-9999-aaaa-bbbb-111111111111"
    }
  ],
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 7.6. Kích hoạt sinh chuyến tự động hàng loạt (Generate)
`POST /admin/recurrence-rules/{ruleId}/generate` · **Auth:** Admin

- **Mục đích:** Tạo hàng loạt bản ghi chuyến đi (`trips`) thực tế vào cơ sở dữ liệu dựa trên quy tắc lặp. Bỏ qua các ngày đã tồn tại chuyến của luật này.
- **Response `200 OK`:** Trả về số lượng chuyến đã sinh mới (ví dụ: `{"createdCount": 12}`).

---

## 8. Admin: Quản lý Chuyến & Điều hành khởi hành (Màn O09, O10, O11)

### 8.1. Danh sách chuyến đi (Table & Calendar View)
`GET /admin/trips` · **Auth:** Staff / Admin

- **Mục đích:** Màn O09 — hiển thị lịch khởi hành của tất cả các chuyến đi dưới dạng bảng hoặc lịch (Calendar block màu).
- **Query params:** `pageNumber`, `pageSize`, `tourId`, `status` (`Draft`, `Open`, `ClosedForBooking`, `InProgress`, `Completed`, `Cancelled`), `fromStartAt`, `toStartAt`, `managedByUserId`.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "tripId": "88888888-9999-aaaa-bbbb-111111111111",
        "tourId": "44444444-5555-6666-7777-888888888888",
        "tourName": "Chinh phục Tà Năng - Phan Dũng",
        "tourVersion": 2,
        "startAt": "2026-11-20T06:00:00Z",
        "endAt": "2026-11-22T18:00:00Z",
        "totalSlots": 20,
        "soldSlots": 16,
        "minParticipants": 10,
        "pricePerPerson": 3200000,
        "managerFullName": "Nguyễn Điều Phối",
        "source": "RecurrenceRule",
        "status": "Open",
        "isUnderCapacity": false
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 45,
    "totalPages": 5,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 8.2. Tạo chuyến đi thủ công
`POST /admin/trips` · **Auth:** Admin / Staff

- **Mục đích:** Nút "Tạo chuyến thủ công" trên màn O09.
- **Ràng buộc:** Tour được chọn phải ở trạng thái `Published`. Phải chọn chính sách hoàn tiền (`refundPolicyId`) đang kích hoạt (`Active`). Thời gian kết thúc phải sau thời gian bắt đầu (`endAt > startAt`). Sức chứa tối thiểu phải nhỏ hơn hoặc bằng tổng sức chứa (`minParticipants <= totalSlots`).

**Request body**

```json
{
  "tourId": "44444444-5555-6666-7777-888888888888",
  "startAt": "2026-12-15T06:00:00Z",
  "endAt": "2026-12-17T18:00:00Z",
  "totalSlots": 25,
  "minParticipants": 12,
  "pricePerPerson": 3200000,
  "refundPolicyId": "99999999-0000-1111-2222-333333333333",
  "managedByUserId": "12345678-aaaa-bbbb-cccc-111122223333"
}
```

**Response `201 Created`**

---

### 8.3. Chi tiết chuyến đi
`GET /admin/trips/{tripId}` · **Auth:** Staff / Admin

- **Mục đích:** Tab 1 Tổng quan màn O10 — hiển thị chi tiết chuyến, tiến độ bán chỗ, doanh thu dự kiến, phiên bản lịch trình được áp dụng.

---

### 8.4. Cập nhật thông tin chuyến đi
`PUT /admin/trips/{tripId}` · **Auth:** Admin / Staff

- **Ràng buộc nghiệp vụ (Invariants):** Không được sửa `totalSlots` thấp hơn số chỗ đã cam kết thanh toán (`soldSlots`). Nếu dữ liệu bị người khác sửa cùng lúc, cơ chế chống ghi đè (`row_version`) sẽ trả mã lỗi `409 Conflict`.

---

### 8.5. Checklist sẵn sàng khởi hành (Readiness Checklist)
`GET /admin/trips/{tripId}/readiness-checklist` · **Auth:** Staff / Admin

- **Mục đích:** Widget kiểm tra điều kiện an toàn khởi hành trước giờ G tại màn O10 (FR-D07).
- **Tại sao cần API này:** Tổng hợp kiểm tra 5 điều kiện tiên quyết mà không bắt FE phải gọi 5 API khác nhau để tự suy luận:
  1. Số khách tham gia đã đạt mức tối thiểu (`soldSlots >= minParticipants`).
  2. Mọi hành khách đã được phân nhóm (`unassignedCount == 0`).
  3. Mọi nhóm đều đã có Hướng dẫn viên phụ trách (`unassignedGuidesCount == 0`).
  4. Toàn bộ thiết bị cấp phát cho đoàn đã đủ trong kho (`missingGearCount == 0`).
  5. Toàn bộ đơn đặt chỗ của khách đã thanh toán hợp lệ (`unpaidOrdersCount == 0`).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "isReadyToDepart": false,
    "checklist": {
      "minParticipantsMet": { "passed": true, "current": 16, "required": 10 },
      "allParticipantsGrouped": { "passed": false, "unassignedCount": 2 },
      "allGroupsHaveGuides": { "passed": true, "assignedGroups": 2, "totalGroups": 2 },
      "allProvidedItemsReady": { "passed": true, "missingItemsCount": 0 },
      "allOrdersPaid": { "passed": true, "unpaidOrdersCount": 0 }
    }
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 8.6 – 8.9. Máy trạng thái vòng đời chuyến đi (Trip State Machine)
Các API chuyển trạng thái có điều kiện kiểm tra nghiêm ngặt:

- **`POST /admin/trips/{tripId}/open-booking`** · Admin/Staff: Chuyển từ `Draft` sang `Open` (bắt đầu mở bán trên cổng khách hàng).
- **`POST /admin/trips/{tripId}/close-booking`** · Admin/Staff: Chuyển từ `Open` sang `ClosedForBooking` (chốt danh sách, không nhận thêm khách).
- **`POST /admin/trips/{tripId}/start`** · Admin/Staff: Chuyển từ `ClosedForBooking` sang `InProgress` khi đoàn bắt đầu xuất phát.
- **`POST /admin/trips/{tripId}/complete`** · Admin/Staff: Chuyển từ `InProgress` sang `Completed` khi chuyến đi kết thúc. Hệ thống tự động kích hoạt quyền gửi review cho các hành khách đã tham gia.

---

### 8.10. Hủy chuyến đi (Cancel Trip)
`POST /admin/trips/{tripId}/cancel` · **Auth:** Admin

- **Mục đích:** Xử lý hủy chuyến khẩn cấp do thiên tai, thời tiết hoặc không đủ số lượng người tối thiểu.
- **Tại sao cần API riêng biệt:** Thao tác hủy chuyến kích hoạt một chuỗi hành động phức tạp của hệ thống:
  1. Hủy toàn bộ booking của chuyến, tự động sinh các giao dịch hoàn tiền `Refund` ở trạng thái `PendingApproval`.
  2. Giải phóng toàn bộ thiết bị đang giữ kho (`asset_assignments`).
  3. Gửi thông báo khẩn cấp (Push / Email / SMS) cho toàn bộ khách hàng và Hướng dẫn viên.
  4. Bắt buộc nhập lý do hủy chuyến và ghi nhận `AUDIT_LOGS`.

**Request body**

```json
{
  "reason": "Thời tiết mưa bão sạt lở nguy hiểm tại cung đường Tà Năng theo cảnh báo kiểm lâm"
}
```

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hủy chuyến thành công",
  "data": {
    "tripId": "88888888-9999-aaaa-bbbb-111111111111",
    "affectedBookingsCount": 8,
    "affectedParticipantsCount": 16,
    "totalRefundAmount": 51200000,
    "releasedAssetsCount": 24
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

**Lỗi (Error Responses)**

```json
HTTP 400 Bad Request
{
  "success": false,
  "statusCode": 400,
  "message": "Chuyến đi đã kết thúc hoặc đã bị hủy trước đó.",
  "data": null,
  "errors": {
    "code": ["TRIP_NOT_CANCELLABLE"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

| Status | Khi nào | Code | Hành động của FE |
|---|---|---|---|
| `400` | Thiếu lý do hủy chuyến | `VALIDATION_ERROR` | Bắt buộc nhập trường `reason` |
| `400` | Chuyến đã kết thúc hoặc đã hủy | `TRIP_NOT_CANCELLABLE` | Khóa nút Hủy chuyến và thông báo |
| `403` | Không phải vai trò Admin | `FORBIDDEN` | Staff không được quyền tự ý hủy chuyến |
| `404` | Không tìm thấy chuyến đi | `NOT_FOUND` | Hiển thị lỗi 404 |

---

### 8.11. Danh sách Booking và Khách của chuyến (Tab Booking O11)
`GET /admin/trips/{tripId}/bookings` · **Auth:** Staff / Admin

- **Mục đích:** Hiển thị toàn bộ các đơn đặt chỗ của chuyến, mở rộng từng dòng để xem danh sách khách đi kèm (`booking_participants`), người liên hệ khẩn cấp và trạng thái ghép nhóm.

---

### 8.12. Xuất danh sách hành khách (Manifest Export)
`GET /admin/trips/{tripId}/manifest?format={csv|pdf}` · **Auth:** Staff / Admin

- **Mục đích:** Xuất danh sách khách đoàn chính thức phân theo nhóm và hướng dẫn viên (phục vụ in ấn bàn giao cho kiểm lâm, bảo hiểm du lịch hoặc điểm danh thực địa).

---

## 9. Admin: Chia nhóm Chuyến - Kanban (Màn O12)

### 9.1. Lấy dữ liệu bảng Kanban chia nhóm
`GET /admin/trips/{tripId}/groups-board` · **Auth:** Staff / Admin

- **Mục đích:** Màn O12 — lấy toàn bộ dữ liệu hiển thị bảng chia nhóm dạng Kanban: cột 1 là danh sách khách chưa xếp nhóm (nhóm theo booking, có viền màu theo `orderCode`), các cột tiếp theo là các nhóm đã tạo kèm thông tin Guide phụ trách và sĩ số hiện tại.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "unassignedParticipants": [
      {
        "participantId": "aaaa1111-2222-3333-4444-555555555555",
        "fullName": "Nguyễn Hoàng Nam",
        "phone": "0987111222",
        "orderCode": "ORD-2026-1001",
        "groupingPreference": "Đi chung nhóm với đơn",
        "hasAccount": true
      }
    ],
    "groups": [
      {
        "groupId": "bbbb1111-2222-3333-4444-555555555555",
        "groupName": "Nhóm Đại Bàng",
        "maxParticipants": 10,
        "currentCount": 8,
        "guide": {
          "userId": "cccc1111-2222-3333-4444-555555555555",
          "fullName": "Lê Văn Nam (Guide)",
          "avatarUrl": "https://cdn.rentrek.vn/avatars/guide1.png"
        },
        "participants": [
          {
            "participantId": "dddd1111-2222-3333-4444-555555555555",
            "fullName": "Trần Thị Mai",
            "orderCode": "ORD-2026-0995"
          }
        ]
      }
    ]
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 9.2. Tạo nhóm mới trong chuyến
`POST /admin/trips/{tripId}/groups` · **Auth:** Admin / Staff

**Request body**

```json
{
  "groupName": "Nhóm Báo Đốm",
  "maxParticipants": 10,
  "guideUserId": "cccc1111-2222-3333-4444-555555555555"
}
```

- **Ràng buộc:** Tên nhóm không được trùng trong cùng chuyến. Hệ thống cảnh báo nếu Guide này đang được phân công ở một chuyến khác có trùng khoảng thời gian.

---

### 9.3. Sửa thông tin nhóm
`PUT /admin/trips/{tripId}/groups/{groupId}` · **Auth:** Admin / Staff

---

### 9.4. Giải tán nhóm
`DELETE /admin/trips/{tripId}/groups/{groupId}` · **Auth:** Admin / Staff

- **Mục đích:** Xóa nhóm. Tự động đưa toàn bộ các participant trong nhóm này trở lại cột "Chưa xếp nhóm" (`trip_group_id = null`).

---

### 9.5. Gán / Chuyển nhóm cho khách (Kéo thả Kanban)
`PATCH /admin/trips/{tripId}/participants/assign-group` · **Auth:** Admin / Staff

- **Mục đích:** Phục vụ sự kiện thả thẻ khách hàng vào cột nhóm mới.
- **Ràng buộc:** Chặn thao tác nếu nhóm đích đã đầy sĩ số (`currentCount >= maxParticipants`).

**Request body**

```json
{
  "participantId": "aaaa1111-2222-3333-4444-555555555555",
  "targetGroupId": "bbbb1111-2222-3333-4444-555555555555"
}
```

---

### 9.6. Tự động chia nhóm theo thuật toán (Auto-group)
`POST /admin/trips/{tripId}/auto-group` · **Auth:** Admin / Staff

- **Mục đích:** Nút "Tự động chia nhóm". Thuật toán tự động phân bổ hành khách chưa xếp nhóm vào các nhóm đang mở, ưu tiên giữ các khách trong cùng một đơn đặt (`order_code`) ở chung một nhóm.

---

### 9.7. Duyệt tách booking đi chung
`POST /admin/trips/{tripId}/bookings/{bookingId}/split-approve` · **Auth:** Admin / Staff

- **Mục đích:** Khi đoàn khách đông hơn sức chứa của 1 nhóm và có nguyện vọng đi chung nhưng buộc phải chia sang 2 nhóm khác nhau: người điều phối phải mở modal xác nhận, nhập lý do tách đoàn.
- **Ghi nhận DB:** Ghi `TRIP_BOOKING_ORDERS.is_split = 1`, `split_reason`, `split_approved_by_user_id`, `split_at` và lưu audit log.

---

## 10. Admin: Đồ cấp Chuyến & Quản lý Asset chuyến (Màn O13)

### 10.1. Danh sách đồ cấp cần chuẩn bị
`GET /admin/trips/{tripId}/provided-items` · **Auth:** Staff / Admin

- **Mục đích:** Màn O13 — tính toán nhu cầu thiết bị thực tế dựa trên định mức tour và số khách/nhóm hiện tại của chuyến.
- **Công thức:** `requiredQuantity` được tự động tính lại khi số người hoặc số nhóm thay đổi. Hiển thị cột: Cần, Đã gán, Còn thiếu, Người chuẩn bị, Trạng thái (`Missing`, `Ready`, `Recovered`).

---

### 10.2. Tra cứu thiết bị trống trong kho theo khung ngày
`GET /admin/trips/{tripId}/provided-items/{itemId}/available-assets` · **Auth:** Staff / Admin

- **Mục đích:** Drawer gán đồ O13 — tìm kiếm danh sách các thiết bị vật lý cụ thể (`EQUIPMENT_ASSETS`) của variant đó đang ở tình trạng `Available` và không bị trùng lịch giữ chỗ (`ASSET_ASSIGNMENTS`) trong khoảng `[startAt, endAt]` của chuyến đi.

---

### 10.3. Gán thiết bị từ kho cho chuyến
`POST /admin/trips/{tripId}/provided-items/{itemId}/assignments` · **Auth:** Staff / Admin

- **Mục đích:** Gán danh sách các mã thiết bị (`assetCodes`) cụ thể vào chuyến đi, tạo bản ghi `ASSET_ASSIGNMENTS` với trạng thái `Reserved`.

**Request body**

```json
{
  "assetCodes": ["HL-PETZL-0012", "HL-PETZL-0013", "HL-PETZL-0014"]
}
```

---

### 10.4. Hủy gán thiết bị
`DELETE /admin/trips/{tripId}/assignments/{assignmentId}` · **Auth:** Staff / Admin

- **Mục đích:** Gỡ một thiết bị khỏi danh sách cấp của chuyến, trả thiết bị về trạng thái sẵn sàng cho đơn khác.

---

### 10.5. Xuất kho bàn giao thiết bị cho đoàn (Issue Gear)
`POST /admin/trips/{tripId}/provided-items/issue` · **Auth:** Staff / Admin

- **Mục đích:** Quét barcode bàn giao thiết bị cho Hướng dẫn viên tại điểm tập kết trước khi khởi hành. Chuyển trạng thái phân bổ từ `Reserved` sang `Issued`, lưu `assigned_at = now`.

---

### 10.6. Thu hồi thiết bị sau chuyến (Return Gear)
`POST /admin/trips/{tripId}/provided-items/return` · **Auth:** Staff / Admin

- **Mục đích:** Khi đoàn trở về, thủ kho quét mã thu hồi thiết bị, chuyển trạng thái sang `Returned`, ghi nhận tình trạng trả đồ (`Normal`, `Damaged`, `MissingAccessory`, `Lost`). Nếu hỏng hoặc mất, tự động cập nhật `EQUIPMENT_ASSETS.asset_status` tương ứng.

---

## 11. Admin: Điểm danh Hoạt động Tour (Màn O14)

### 11.1. Ma trận điểm danh chuyến đi
`GET /admin/trips/{tripId}/attendance-matrix` · **Auth:** Staff / Admin / Guide

- **Mục đích:** Màn O14 — hiển thị lưới điểm danh 2 chiều:
  - Chiều dọc (Hàng): Danh sách hành khách tham gia chuyến (lọc được theo nhóm).
  - Chiều ngang (Cột): Danh sách các hoạt động trong tour (Ngày X · Giờ · Tên hoạt động).
  - Từng ô: Trạng thái điểm danh (`Present`: Có mặt, `Absent`: Vắng, `Late`: Đến muộn, `Excused`: Có phép, hoặc Chưa điểm danh), kèm người ghi nhận và thời điểm.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "activities": [
      {
        "activityId": "55555555-6666-7777-8888-999999999999",
        "dayNumber": 1,
        "name": "Tập trung bìa rừng",
        "startTime": "07:30:00"
      }
    ],
    "participants": [
      {
        "participantId": "aaaa1111-2222-3333-4444-555555555555",
        "fullName": "Nguyễn Hoàng Nam",
        "groupName": "Nhóm Đại Bàng",
        "attendances": {
          "55555555-6666-7777-8888-999999999999": {
            "status": "Present",
            "checkedAt": "2026-11-20T07:35:00Z",
            "checkedBy": "Lê Văn Nam (Guide)"
          }
        }
      }
    ]
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 11.2. Cập nhật điểm danh hoạt động
`PUT /admin/trips/{tripId}/attendances` · **Auth:** Staff / Admin / Guide

- **Mục đích:** Bấm chọn trạng thái điểm danh cho một hoặc nhiều khách trong một hoạt động.
- **Ràng buộc:** Nếu ô điểm danh đã có giá trị trước đó và người dùng bấm sửa lại: bắt buộc phải nhập lý do điều chỉnh (`reason`) và hệ thống tự động ghi nhật ký kiểm toán `AUDIT_LOGS`.

**Request body**

```json
{
  "activityId": "55555555-6666-7777-8888-999999999999",
  "records": [
    {
      "participantId": "aaaa1111-2222-3333-4444-555555555555",
      "status": "Late",
      "reason": "Khách đến muộn 15 phút do hỏng xe trên đường đến điểm tập kết"
    }
  ]
}
```

---

### 11.3. Lịch sử chỉnh sửa điểm danh
`GET /admin/trips/{tripId}/attendances/history` · **Auth:** Staff / Admin

- **Mục đích:** Tra cứu audit trail xem ai đã sửa điểm danh của khách nào, từ trạng thái gì sang trạng thái gì và vì lý do gì.

---

## 12. Admin: Quản lý Đơn hàng Tổng hợp & Đơn Tour (Màn O38, O15)

### 12.1. Danh sách đơn hàng tổng hợp vận hành
`GET /admin/orders` · **Auth:** Staff / Admin

- **Mục đích:** Màn O38 — danh sách chung tập trung cho cả hai loại đơn: Đơn đặt Tour (`Tour`) và Đơn thuê thiết bị (`Rental`).
- **Tại sao cần API này:** Nhân viên vận hành cần một màn hình duy nhất để theo dõi các đơn hàng sắp hết hạn giữ chỗ (`hold_expires_at`), các đơn chuyển khoản thừa/thiếu tiền cần đối soát (`reconciliation_deadline_at`) và các đơn phát sinh yêu cầu hoàn tiền.
- **Phân quyền dữ liệu:** Staff chỉ thấy đơn tour của các chuyến mình điều phối (`TRIPS.managed_by_user_id`) và đơn thuê do mình tiếp nhận (`RENTAL_ORDERS.handled_by_user_id`); Admin xem toàn bộ hệ thống.
- **Query params:** `pageNumber`, `pageSize`, `orderType` (`Tour`, `Rental`), `status` (`PendingPayment`, `Confirmed`, `InFulfillment`, `Completed`, `Cancelled`, `Expired`), `paymentStatus` (`Unpaid`, `PartiallyPaid`, `Paid`, `NeedsReconciliation`, `Refunded`), `search` (tìm mã đơn, email khách), `tab` (`All`, `PendingPayment`, `NeedsReconciliation`, `PendingRefund`, `Cancelled`).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "orderId": "11112222-3333-4444-5555-666677778888",
        "orderCode": "TRIP-2026-0421",
        "orderType": "Tour",
        "customer": {
          "userId": "aaaa1111-2222-3333-4444-555555555555",
          "fullName": "Nguyễn Hoàng Nam",
          "email": "nam.nguyen@gmail.com",
          "phone": "0987111222"
        },
        "serviceSummary": "Tour Tà Năng (20/11 - 22/11) · 2 người",
        "totalAmount": 6400000,
        "status": "Confirmed",
        "paymentStatus": "Paid",
        "holdExpiresAt": null,
        "reconciliationDeadlineAt": null,
        "hasPendingRefund": false,
        "createdAt": "2026-11-01T08:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 128,
    "totalPages": 13,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 12.2. Chi tiết đơn hàng cho vận hành
`GET /admin/orders/{orderCode}` · **Auth:** Staff / Admin

- **Mục đích:** Màn O15 (đối với tour) hoặc màn O23 (đối với thuê đồ).
- **Tại sao cần API riêng cho Admin:** Ngoài các trường thông tin khách xem được (C11/C13), API Admin bổ sung:
  - Mã người dùng nội bộ `PROFILES.user_code`.
  - Danh sách chi tiết các lần thanh toán, mã giao dịch nhà cung cấp SePay (`provider_transaction_id`).
  - Lịch sử áp dụng và đảo ngược mã khuyến mãi (`APPLIED_PROMOTIONS`).
  - Toàn bộ dòng nhật ký kiểm toán `AUDIT_LOGS` gắn với đơn hàng này.

---

### 12.3. Sửa thông tin hành khách thay khách (Admin/Staff Override)
`PATCH /admin/orders/{orderCode}/participants/{participantId}` · **Auth:** Staff / Admin

- **Mục đích:** Hỗ trợ khách hàng cập nhật sai sót về số điện thoại, ngày sinh, số CCCD hoặc thông tin người liên hệ khẩn cấp trước khi khởi hành.
- **Ràng buộc:** Bắt buộc nhập lý do thay đổi và tự động ghi `AUDIT_LOGS`.

**Request body**

```json
{
  "fullName": "Nguyễn Hoàng Nam",
  "phone": "0987111333",
  "dateOfBirth": "1995-10-20",
  "emergencyContactName": "Nguyễn Thị Hương (Mẹ)",
  "emergencyContactPhone": "0912345678",
  "reason": "Khách gọi hotline báo đổi số điện thoại do mất SIM"
}
```

---

### 12.4. Ghi nhận thanh toán thủ công ngoài hệ thống (FR-F04)
`POST /admin/orders/{orderCode}/manual-payment` · **Auth:** Admin

- **Mục đích:** Xử lý trường hợp khách hàng chuyển khoản trực tiếp vào tài khoản công ty không qua mã VietQR tự động hoặc thanh toán tiền mặt tại quầy.
- **Tại sao cần API riêng:** Tránh để nhân viên tự ý đổi cờ `paymentStatus = Paid`. API này sẽ tạo một bản ghi `PAYMENTS` (loại `Collection`, trạng thái `Succeeded`, phương thức `Manual`), cập nhật trạng thái đơn và ghi rõ ai là người chịu trách nhiệm xác nhận thu tiền.

**Request body**

```json
{
  "amount": 6400000,
  "paymentMethod": "BankTransfer",
  "manualReference": "VCB-MB-20261101-998822",
  "reason": "Khách chuyển khoản đúng STK nhưng quên ghi mã đơn trong nội dung chuyển khoản"
}
```

---

### 12.5. Admin hủy đơn hàng khẩn cấp
`POST /admin/orders/{orderCode}/cancel-by-admin` · **Auth:** Admin

- **Mục đích:** Hủy đơn hàng từ phía quản trị (ví dụ: phát hiện tài khoản gian lận, khách vi phạm điều khoản nghiêm trọng). Tự động tạo yêu cầu hoàn tiền `PendingApproval` và giải phóng chỗ/thiết bị đã giữ.

---

## 13. Admin: Sản phẩm, Biến thể, Bảng giá & Combo (Màn O16, O17, O18, O19)

### 13.1. Danh sách sản phẩm cho thuê
`GET /admin/products` · **Auth:** Staff / Admin

- **Mục đích:** Màn O16 — danh sách các sản phẩm (sản phẩm cha).
- **Trường bổ sung:** Tổng số biến thể con (`COUNT(product_variants)`), tổng số tài sản vật lý đang có và số tài sản đang sẵn sàng phục vụ cho thuê (`asset_status = Available`).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "productId": "99990000-1111-2222-3333-444455556666",
        "name": "Lều cắm trại chống nước 4 người",
        "categoryName": "Lều trại & Nghỉ đêm",
        "primaryImageUrl": "https://cdn.rentrek.vn/products/tent-4p-thumb.jpg",
        "variantsCount": 3,
        "totalAssetsCount": 20,
        "availableAssetsCount": 14,
        "status": "Active",
        "createdAt": "2026-04-10T00:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 32,
    "totalPages": 4,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 13.2. Tạo sản phẩm mới
`POST /admin/products` · **Auth:** Admin

**Request body**

```json
{
  "name": "Balo trợ lực dã ngoại 50L - Osprey Rook",
  "categoryId": "22222222-3333-4444-5555-666666666666",
  "description": "Balo leo núi chuyên dụng có khung trợ lực thoáng khí",
  "status": "Draft"
}
```

---

### 13.3. Chi tiết sản phẩm & danh sách biến thể
`GET /admin/products/{productId}` · **Auth:** Staff / Admin

- **Mục đích:** Màn O17 — hiển thị chi tiết sản phẩm cha và danh sách các biến thể con (SKU, size, màu sắc, tình trạng).

---

### 13.4. Sửa sản phẩm
`PUT /admin/products/{productId}` · **Auth:** Admin

---

### 13.5. Xóa sản phẩm
`DELETE /admin/products/{productId}` · **Auth:** Admin

- **Mục đích:** Ẩn sản phẩm khỏi hệ thống (`status = Discontinued` hoặc `is_deleted = 1`).

---

### 13.6. Tạo biến thể sản phẩm (SKU Variant)
`POST /admin/products/{productId}/variants` · **Auth:** Admin

- **Mục đích:** Thêm một biến thể cụ thể (ví dụ: Size M, Màu Đen). Mã `sku` là duy nhất toàn hệ thống (UQ).

**Request body**

```json
{
  "sku": "BACKPACK-OSPREY-50L-M-BLK",
  "variantName": "Size M - Đen",
  "size": "M",
  "color": "Đen",
  "status": "Active"
}
```

---

### 13.7. Sửa biến thể
`PUT /admin/variants/{variantId}` · **Auth:** Admin

---

### 13.8. Xóa biến thể
`DELETE /admin/variants/{variantId}` · **Auth:** Admin

---

### 13.9 – 13.10. Quản lý Ảnh Biến thể
- `POST /admin/variants/{variantId}/images` · Admin: Thêm ảnh cho biến thể (`imageUrl`, `displayOrder`, `isPrimary`).
- `DELETE /admin/variants/{variantId}/images/{imageId}` · Admin: Xóa ảnh biến thể.

---

### 13.11. Bảng giá thuê theo ngày của biến thể (Price Tiers)
`GET /admin/variants/{variantId}/price-tiers` · **Auth:** Staff / Admin

- **Mục đích:** Xem các bậc giá thuê theo số ngày (ví dụ: thuê 1-2 ngày giá 100k/ngày, 3-5 ngày giá 85k/ngày, từ ngày thứ 6 giá 70k/ngày).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "priceTierId": "aaaa0000-1111-2222-3333-444455556666",
      "minDays": 1,
      "maxDays": 2,
      "dailyPrice": 100000
    },
    {
      "priceTierId": "aaaa0000-1111-2222-3333-444455556667",
      "minDays": 3,
      "maxDays": 5,
      "dailyPrice": 85000
    },
    {
      "priceTierId": "aaaa0000-1111-2222-3333-444455556668",
      "minDays": 6,
      "maxDays": null,
      "dailyPrice": 70000
    }
  ],
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 13.12. Cập nhật bảng bậc giá thuê của biến thể
`PUT /admin/variants/{variantId}/price-tiers` · **Auth:** Admin

- **Quy tắc kiểm tra (Invariants):**
  - Các khoảng ngày `[minDays, maxDays]` phải liên tục và không được chồng lấn nhau (no overlap).
  - Bậc cuối cùng có thể để `maxDays = null` (áp dụng cho từ X ngày trở lên).
  - Thay đổi giá thuê chỉ áp dụng cho các đơn đặt mới, không làm thay đổi giá của các đơn đã chốt (do giá đã chốt được lưu snapshot tại `RENTAL_ORDER_ITEMS.daily_price`).

---

### 13.13. Bảng giá thuê tổng hợp toàn hệ thống
`GET /admin/pricing` · **Auth:** Staff / Admin

- **Mục đích:** Màn O18 — một bảng tổng hợp duy nhất hiển thị giá thuê của tất cả các SKU biến thể và Combo để nhân viên đối chiếu nhanh. Hỗ trợ lọc theo danh mục.

---

### 13.14. Danh sách Combo thiết bị (Bundles)
`GET /admin/bundles` · **Auth:** Staff / Admin

- **Mục đích:** Màn O19 — danh sách các gói combo (như Combo Lều Trại Cơ Bản, Combo Leo Núi Mùa Đông).

---

### 13.15. Tạo combo mới
`POST /admin/bundles` · **Auth:** Admin

**Request body**

```json
{
  "name": "Combo Trekking Đầy Đủ 2 Người",
  "categoryId": "22222222-3333-4444-5555-666666666666",
  "description": "Gồm 1 lều 2P, 2 túi ngủ, 2 đệm hơi và 2 đèn đội đầu",
  "status": "Draft"
}
```

---

### 13.16. Chi tiết combo (Thành phần + Bảng giá)
`GET /admin/bundles/{bundleId}` · **Auth:** Staff / Admin

- **Mục đích:** Lấy toàn bộ cấu hình gói combo: thông tin, danh sách các biến thể thành phần (`product_bundle_items`) và các bậc giá thuê của combo.

---

### 13.17. Sửa thông tin combo
`PUT /admin/bundles/{bundleId}` · **Auth:** Admin

---

### 13.18. Xóa combo
`DELETE /admin/bundles/{bundleId}` · **Auth:** Admin

---

### 13.19. Cập nhật danh sách thành phần của combo
`PUT /admin/bundles/{bundleId}/items` · **Auth:** Admin

- **Ràng buộc:** Số lượng mỗi món phải `> 0`. Không được chọn trùng một biến thể 2 lần trong cùng 1 combo.

**Request body**

```json
{
  "items": [
    {
      "productVariantId": "77777777-8888-9999-0000-111111111111",
      "quantity": 1
    },
    {
      "productVariantId": "77777777-8888-9999-0000-222222222222",
      "quantity": 2
    }
  ]
}
```

---

### 13.20 – 13.21. Quản lý Bảng giá thuê Combo
- `GET /admin/bundles/{bundleId}/price-tiers` · Lấy danh sách bậc giá thuê của combo.
- `PUT /admin/bundles/{bundleId}/price-tiers` · Cập nhật bậc giá thuê combo (validate tương tự bậc giá variant).

---

## 14. Admin: Quản lý Thiết bị (Asset) & Lịch Gantt (Màn O20, O21)

### 14.1. Danh sách thiết bị cụ thể (Equipment Assets)
`GET /admin/assets` · **Auth:** Staff / Admin

- **Mục đích:** Màn O20 — quản lý từng món đồ vật lý có gắn mã vạch/barcode thực tế trong kho.
- **Query params:** `pageNumber`, `pageSize`, `search` (tìm mã asset, tên đồ), `productVariantId`, `assetStatus` (`Available`, `Maintenance`, `Damaged`, `Lost`, `Retired`).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "assetId": "bbbb1111-2222-3333-4444-555566667777",
        "assetCode": "TENT-4P-0015",
        "sku": "TENT-EUREKA-4P-ORANGE",
        "productName": "Lều cắm trại 4 người Eureka",
        "variantName": "Màu Cam",
        "assetStatus": "Available",
        "conditionNote": "Tình trạng tốt, khung lều nguyên vẹn",
        "currentAssignment": null,
        "createdAt": "2026-05-01T00:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 85,
    "totalPages": 9,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 14.2. Thêm hàng loạt thiết bị vật lý vào kho (Bulk Create)
`POST /admin/assets/bulk-create` · **Auth:** Admin

- **Mục đích:** Nút "Thêm hàng loạt" trên màn O20 khi nhập một lô hàng mới về kho.
- **Cơ chế:** Nhập variant, số lượng cần tạo và tiền tố (prefix). Hệ thống tự sinh mã duy nhất toàn hệ thống (`asset_code`), sẵn sàng in tem mã vạch QR.

**Request body**

```json
{
  "productVariantId": "77777777-8888-9999-0000-111111111111",
  "quantity": 10,
  "codePrefix": "HL-PETZL-",
  "initialConditionNote": "Hàng mới nhập kho nguyên seal"
}
```

**Response `201 Created`** (Trả về danh sách 10 mã asset vừa sinh).

---

### 14.3. Chi tiết thiết bị & trạng thái sử dụng hiện tại
`GET /admin/assets/{assetCode}` · **Auth:** Staff / Admin

- **Mục đích:** Drawer chi tiết màn O20 — tra cứu thiết bị đang nằm trong kho hay đang được giữ bởi Đơn thuê nào (`rental_order_item_id`), Chuyến tour nào (`trip_provided_item_id`) hoặc Quà tặng khuyến mãi nào (`applied_promotion_id`).

---

### 14.4. Đổi tình trạng kỹ thuật thiết bị
`PATCH /admin/assets/{assetCode}/status` · **Auth:** Staff / Admin

- **Mục đích:** Đổi trạng thái thiết bị sang `Maintenance` (Bảo trì), `Damaged` (Hỏng), `Lost` (Mất) hoặc `Retired` (Ngừng dùng thanh lý). Bắt buộc nhập ghi chú tình trạng và ghi `AUDIT_LOGS`.

---

### 14.5. Lịch sử phân bổ của thiết bị
`GET /admin/assets/{assetCode}/history` · **Auth:** Staff / Admin

- **Mục đích:** Xem toàn bộ lịch sử các lần thiết bị này được cấp phát, khoảng thời gian sử dụng, người nhận, tình trạng khi trả (`return_condition`) và các biên bản phạt hư hại liên quan.

---

### 14.6. Biểu đồ Gantt phân bổ thiết bị theo dòng thời gian
`GET /admin/assets/schedule-gantt` · **Auth:** Staff / Admin

- **Mục đích:** Màn O21 — biểu đồ Gantt trực quan thể hiện tình trạng chiếm dụng thiết bị của toàn bộ kho:
  - Trục dọc (Y): Danh sách các Asset (gom nhóm theo từng biến thể sản phẩm).
  - Trục ngang (X): Trục ngày trong tháng.
  - Các thanh: Các khoảng thời gian từ `reserved_from` đến `reserved_until` của bản ghi `ASSET_ASSIGNMENTS`. Màu sắc phân biệt theo nguồn sử dụng (Đơn thuê, Đồ cấp chuyến, Quà khuyến mãi). Kiểu nét thể hiện trạng thái (`Reserved` nét đứt, `Issued` nét liền, `Returned` mờ, `LostOrException` gạch chéo).
  - Hàng tổng: Thống kê số lượng "Khả dụng / Tổng" của từng ngày, tự động tô đỏ cảnh báo nếu ngày đó nhu cầu vượt quá số lượng tồn kho.
- **Query params:** `from`: ngày bắt đầu xem, `to`: ngày kết thúc xem, `categoryId`, `productVariantId`.

---

## 15. Admin: Đơn thuê & Quy trình Giao nhận (Màn O22, O23, O24, O25)

### 15.1. Danh sách đơn thuê vận hành
`GET /admin/rental-orders` · **Auth:** Staff / Admin

- **Mục đích:** Màn O22 — danh sách chuyên biệt để nhân viên kho và giao nhận theo dõi việc chuẩn bị đồ, giao đồ và nhận đồ hàng ngày.
- **Tabs nhanh:**
  - `PickupToday`: Cần giao hôm nay.
  - `ReturnToday`: Cần nhận lại hôm nay.
  - `Overdue`: Quá hạn trả đồ (now > `rental_end_at` nhưng còn tài sản chưa trả).
  - `InFulfillment`: Đang trong thời gian khách thuê.
  - `All`: Toàn bộ đơn thuê.
- **Cột tiến độ giao/nhận:** Tỷ lệ số món đã giao/nhận (`Issued / Total` và `Returned / Total`).
- **Query params:** `pageNumber`, `pageSize`, `tab`, `handledByUserId` (lọc đơn mình phụ trách hoặc `unassigned`), `search`.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "orderId": "22223333-4444-5555-6666-777788889999",
        "orderCode": "RENT-2026-0089",
        "customer": {
          "fullName": "Trần Văn Cường",
          "phone": "0933444555"
        },
        "rentalPeriod": {
          "startAt": "2026-11-01T08:00:00Z",
          "endAt": "2026-11-03T18:00:00Z"
        },
        "totalItemsCount": 5,
        "issuedItemsCount": 5,
        "returnedItemsCount": 0,
        "totalAmount": 1250000,
        "handlerFullName": "Lê Nhân Viên Kho",
        "status": "InFulfillment",
        "paymentStatus": "Paid",
        "isOverdue": false
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 24,
    "totalPages": 3,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 15.2. Nhân viên tiếp nhận xử lý đơn thuê (Claim)
`POST /admin/rental-orders/{orderCode}/claim` · **Auth:** Staff / Admin

- **Mục đích:** Nút "Nhận xử lý" trên màn O22 — gán `RENTAL_ORDERS.handled_by_user_id` thành tài khoản của nhân viên đang thao tác, ghi nhật ký kiểm toán `AUDIT_LOGS`.

---

### 15.3. Chi tiết đơn thuê vận hành
`GET /admin/rental-orders/{orderCode}` · **Auth:** Staff / Admin

- **Mục đích:** Màn O23 — xem chi tiết từng món đồ thuê lẻ và thành phần combo (`RENTAL_BUNDLE_ITEM_SNAPSHOTS`), danh sách các mã thiết bị cụ thể (`EQUIPMENT_ASSETS`) đã được hệ thống giữ chỗ cho đơn này.

---

### 15.4. Danh sách thiết bị cần bàn giao (Handover Checklist)
`GET /admin/rental-orders/{orderCode}/handover-checklist` · **Auth:** Staff / Admin

- **Mục đích:** Màn O24 — hiển thị bảng kiểm tra trước khi giao đồ cho khách: từng món/combo cần bao nhiêu cái, đã quét mã barcode được bao nhiêu cái.

---

### 15.5. Quét barcode kiểm tra & bàn giao từng thiết bị
`POST /admin/rental-orders/{orderCode}/handover/scan` · **Auth:** Staff / Admin

- **Mục đích:** Ô quét mã vạch trên màn O24 — mỗi khi nhân viên cầm đầu đọc barcode bấm "bíp" vào tem QR của một thiết bị:
  - Hệ thống kiểm tra: Mã này có tồn tại không? Thuộc đúng biến thể SKU của đơn không? Có đang ở trạng thái `Reserved` cho đơn này không? Tình trạng kỹ thuật có tốt không?
  - Nếu hợp lệ: Cập nhật `ASSET_ASSIGNMENTS.status = Issued`, ghi nhận `assigned_at = now`.
- **Tại sao cần API này:** Phản hồi ngay lập tức cho nhân viên kho tại hiện trường nếu quét nhầm mã đồ hoặc đồ đang bị hỏng.

**Request body**

```json
{
  "assetCode": "TENT-4P-0015"
}
```

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Quét mã bàn giao hợp lệ",
  "data": {
    "assetCode": "TENT-4P-0015",
    "sku": "TENT-EUREKA-4P-ORANGE",
    "productName": "Lều cắm trại 4 người Eureka",
    "scannedAt": "2026-11-01T08:35:00Z",
    "progress": {
      "scannedItems": 3,
      "totalRequiredItems": 5,
      "isCompleted": false
    }
  },
  "errors": null,
  "timestamp": "2026-11-01T08:35:00Z"
}
```

**Lỗi (Error Responses)**

```json
HTTP 400 Bad Request
{
  "success": false,
  "statusCode": 400,
  "message": "Thiết bị 'TENT-4P-0099' không thuộc biến thể SKU cần bàn giao cho đơn này.",
  "data": null,
  "errors": {
    "code": ["ASSET_VARIANT_MISMATCH"]
  },
  "timestamp": "2026-11-01T08:35:00Z"
}
```

| Status | Khi nào | Code | Hành động của FE |
|---|---|---|---|
| `400` | Mã asset không khớp SKU cần giao | `ASSET_VARIANT_MISMATCH` | Phát âm thanh cảnh báo lỗi quét mã, toast báo sai món đồ |
| `400` | Thiết bị đang ở trạng thái hỏng/bảo trì | `ASSET_NOT_AVAILABLE` | Báo thiết bị hỏng, yêu cầu đổi mã asset khác |
| `404` | Mã asset không tồn tại trong hệ thống | `NOT_FOUND` | Báo mã vạch không hợp lệ |

---

### 15.6. Hoàn tất bàn giao thiết bị
`POST /admin/rental-orders/{orderCode}/handover/complete` · **Auth:** Staff / Admin

- **Mục đích:** Nút "Hoàn tất bàn giao" màn O24.
- **Ràng buộc:** Chặn hoàn tất nếu vẫn còn thiết bị chưa được quét bàn giao đủ số lượng. (Trường hợp khách không nhận đủ đồ phải có ghi nhận lý do đặc biệt).
- **Chuyển trạng thái:** Chuyển trạng thái đơn `ORDERS.status` từ `Confirmed` sang `InFulfillment`.

---

### 15.7. Danh sách thiết bị cần thu hồi (Return Checklist)
`GET /admin/rental-orders/{orderCode}/return-checklist` · **Auth:** Staff / Admin

- **Mục đích:** Màn O25 — hiển thị danh sách các thiết bị khách hàng đang giữ để đối chiếu khi khách mang đồ trả lại kho.

---

### 15.8. Quét barcode nhận lại & kiểm tra tình trạng thiết bị
`POST /admin/rental-orders/{orderCode}/return/scan` · **Auth:** Staff / Admin

- **Mục đích:** Màn O25 — quét mã thiết bị khách trả, ghi nhận `returned_at = now`, chuyển `ASSET_ASSIGNMENTS.status = Returned`.
- **Đánh giá tình trạng (`returnCondition`):**
  - `Normal`: Thiết bị bình thường, tự động đưa `EQUIPMENT_ASSETS.asset_status` về `Available`.
  - `Damaged` / `MissingAccessory`: Thiết bị bị rách/hỏng/thiếu phụ kiện, đưa thiết bị sang trạng thái `Maintenance` hoặc `Damaged`, đồng thời gợi ý mở popup lập biên bản phạt hư hại (O26).
  - Trả trễ (`now > rental_end_at`): Tự động tính số ngày trễ hạn và gợi ý số tiền phạt trễ hạn theo quy định.

**Request body**

```json
{
  "assetCode": "TENT-4P-0015",
  "returnCondition": "Damaged",
  "conditionNote": "Bị rách mặt lưới chống côn trùng cửa chính",
  "autoCreateDamageCharge": true,
  "suggestedDamageAmount": 150000
}
```

---

### 15.9. Báo mất thiết bị (Report Lost)
`POST /admin/rental-orders/{orderCode}/return/report-lost` · **Auth:** Staff / Admin

- **Mục đích:** Nút "Báo mất" trên màn O25 khi khách làm mất thiết bị trong chuyến đi.
- **Xử lý:** Cập nhật `ASSET_ASSIGNMENTS.status = LostOrException`, đưa `EQUIPMENT_ASSETS.asset_status = Lost` (tài sản bị loại khỏi danh mục sẵn sàng cho thuê), và tự động tạo một biên bản phạt mất đồ (`charge_type = Loss`) ở trạng thái `Draft`.

---

### 15.10. Hoàn tất thu hồi thiết bị
`POST /admin/rental-orders/{orderCode}/return/complete` · **Auth:** Staff / Admin

- **Mục đích:** Chốt việc bàn giao tài sản vật lý khi tất cả các thiết bị đã được quét nhận lại hoặc báo mất đầy đủ.

---

## 16. Admin: Phí phát sinh & Quyết toán Đơn thuê (Màn O26)

### 16.1. Danh sách phí phát sinh của đơn thuê
`GET /admin/rental-orders/{orderCode}/charges` · **Auth:** Staff / Admin

- **Mục đích:** Màn O26 — danh sách các khoản phạt phát sinh (Phí trả trễ, Phí làm hỏng thiết bị, Phí làm mất đồ, Phí vệ sinh bẩn nặng).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "chargeId": "cccc1111-2222-3333-4444-555566667777",
      "chargeType": "Damage",
      "equipmentAssetCode": "TENT-4P-0015",
      "productName": "Lều cắm trại 4 người Eureka",
      "amount": 150000,
      "reason": "Rách lưới chống muỗi cửa chính cần thay mới",
      "status": "Draft",
      "createdByName": "Lê Nhân Viên Kho",
      "createdAt": "2026-11-03T18:15:00Z"
    }
  ],
  "errors": null,
  "timestamp": "2026-11-03T18:30:00Z"
}
```

---

### 16.2. Lập biên bản phí phát sinh mới
`POST /admin/rental-orders/{orderCode}/charges` · **Auth:** Staff / Admin

- **Mục đích:** Tạo một khoản phí phát sinh mới ở trạng thái `Draft` (nháp) để nhân viên thương lượng với khách.

**Request body**

```json
{
  "chargeType": "LateReturn",
  "amount": 100000,
  "equipmentAssetId": null,
  "reason": "Trả trễ 1 ngày so với thời gian đăng ký trong hợp đồng"
}
```

---

### 16.3. Chốt phí phát sinh (Draft -> Assessed)
`POST /admin/charges/{chargeId}/assess` · **Auth:** Staff / Admin

- **Mục đích:** Chốt khoản phí từ `Draft` sang `Assessed` để chính thức yêu cầu khách hàng thanh toán bồi thường.

---

### 16.4. Admin hủy phí phát sinh (Void)
`POST /admin/charges/{chargeId}/void` · **Auth:** Admin

- **Mục đích:** Nút "Hủy phí" màn O26 — chỉ Quản trị viên (Admin) mới có thẩm quyền xóa/miễn giảm khoản phí phạt cho khách (ví dụ: xác định lỗi do thiết bị cũ tự rách). Bắt buộc nhập lý do hủy và lưu `AUDIT_LOGS`.

---

### 16.5. Tạo yêu cầu thu phí bổ sung (Payment Request)
`POST /admin/rental-orders/{orderCode}/charges/request-payment` · **Auth:** Staff / Admin

- **Mục đích:** Nút "Tạo yêu cầu thanh toán phí" màn O26 — gom toàn bộ các khoản phí đang ở trạng thái `Assessed` chưa thu, tạo một giao dịch `PAYMENTS` (loại `Collection`, mục đích `AdditionalCharge`), cấp mã VietQR SePay để khách thanh toán online qua màn C04P. Khi thanh toán thành công, các khoản phí tự động chuyển sang `Settled`.

---

### 16.6. Nghiệm thu đóng toàn bộ đơn thuê (Complete Order)
`POST /admin/rental-orders/{orderCode}/complete` · **Auth:** Staff / Admin

- **Mục đích:** Đóng đơn hàng thuê, chuyển `ORDERS.status` sang `Completed`.
- **Checklist điều kiện tiên quyết (Invariants):**
  1. Toàn bộ thiết bị đã trả (`Returned`) hoặc báo mất (`LostOrException`), không còn thiết bị nào đang `Issued`.
  2. Không còn khoản phí nào ở trạng thái `Draft`.
  3. Mọi khoản phí ở trạng thái `Assessed` đã được thanh toán (`Settled`) hoặc đã được Admin duyệt miễn (`Voided`).

---

## 17. Admin: Giao dịch, Hoàn tiền & Đối soát (Màn O27, O28)

### 17.1. Danh sách toàn bộ giao dịch tài chính
`GET /admin/payments` · **Auth:** Staff (phụ trách) / Admin

- **Mục đích:** Màn O27 — bảng kê khai toàn bộ các dòng tiền Thu (`Collection`) và dòng tiền Hoàn (`Refund`) phát sinh trên hệ thống.
- **Query params:** `pageNumber`, `pageSize`, `paymentType` (`Collection`, `Refund`), `purpose` (`TourFee`, `RentalFee`, `AdditionalCharge`), `status` (`PendingApproval`, `Pending`, `Succeeded`, `Failed`, `Cancelled`), `fromDate`, `toDate`, `search` (tìm mã đơn, mã giao dịch SePay `providerTransactionId`).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "paymentId": "dddd0000-1111-2222-3333-444455556666",
        "orderCode": "TRIP-2026-0421",
        "paymentType": "Refund",
        "purpose": "TourFee",
        "amount": -2560000,
        "receivedAmount": null,
        "paymentMethod": "BankTransfer",
        "providerTransactionId": "SP-REF-992182",
        "status": "PendingApproval",
        "failureReason": null,
        "policyRuleDescription": "Hủy trước 72 giờ · Hoàn 80%",
        "createdAt": "2026-11-01T09:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 320,
    "totalPages": 32,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 17.2. Hàng đợi yêu cầu hoàn tiền & đối soát (Màn O28)
`GET /admin/refunds` · **Auth:** Admin

- **Mục đích:** Màn O28 — danh sách các khoản hoàn tiền chia theo các Tab nghiệp vụ:
  - `PendingApproval`: Yêu cầu hoàn tiền mới sinh ra khi khách hoặc admin hủy đơn, đang chờ Admin duyệt.
  - `Pending`: Đang xử lý chuyển tiền qua cổng SePay.
  - `Failed`: Hoàn tiền thất bại (do lỗi kết nối ngân hàng hoặc tài khoản đích bị chặn).
  - `NeedsReconciliation`: Các đơn hàng chuyển khoản sai số tiền hoặc chuyển muộn cần can thiệp đối soát.

---

### 17.3. Duyệt hoàn tiền tự động qua SePay (Approve Refund)
`POST /admin/refunds/{paymentId}/approve` · **Auth:** Admin

- **Mục đích:** Nút "Duyệt & hoàn qua SePay" màn O28.
- **Quy tắc an toàn (Invariants):**
  - Hệ thống tự động tính toán lại số tiền hoàn tại đúng thời điểm bấm nút dựa trên mốc chính sách (`refund_policy_rules`) để đảm bảo không bị gian lận thời gian.
  - API không cho phép admin nhập sửa tay số tiền hoàn tùy tiện nhằm chống tiêu cực.
  - Gọi API v2 SePay thực hiện lệnh chuyển khoản hoàn tiền. Chuyển trạng thái sang `Pending` hoặc `Succeeded`.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Duyệt lệnh hoàn tiền thành công",
  "data": {
    "paymentId": "dddd0000-1111-2222-3333-444455556666",
    "orderCode": "TRIP-2026-0421",
    "amount": -2560000,
    "status": "Pending",
    "providerRefundId": "SP-REF-992182"
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

**Lỗi (Error Responses)**

- **Response `409 Conflict` — Không đủ điều kiện duyệt:**

```json
HTTP 409 Conflict
{
  "success": false,
  "statusCode": 409,
  "message": "Khoản hoàn tiền không ở trạng thái Chờ duyệt (PendingApproval) hoặc đã được duyệt bởi người khác.",
  "data": null,
  "errors": {
    "code": ["REFUND_NOT_APPROVABLE"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

- **Response `502 Bad Gateway` — Cổng SePay lỗi kết nối:**

```json
HTTP 502 Bad Gateway
{
  "success": false,
  "statusCode": 502,
  "message": "Không thể kết nối tới cổng thanh toán SePay. Vui lòng bấm Thử lại sau ít phút.",
  "data": null,
  "errors": {
    "code": ["PAYMENT_PROVIDER_ERROR"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

| Status | Khi nào | Code | Hành động của FE |
|---|---|---|---|
| `404` | Không tìm thấy dòng thanh toán hoàn | `NOT_FOUND` | Báo dòng hoàn không tồn tại |
| `409` | Dòng hoàn không ở PendingApproval | `REFUND_NOT_APPROVABLE` | Tải lại danh sách hoàn tiền O28 |
| `409` | Số tiền hoàn vượt tổng tiền đã thu | `REFUND_EXCEEDS_COLLECTED` | Chặn duyệt và cảnh báo |
| `429` | Quá 10 thao tác duyệt / 60 giây | `TOO_MANY_REQUESTS` | Đọc header `Retry-After` và hiển thị đồng hồ chờ |
| `502` | Cổng SePay phản hồi lỗi không hoàn được | `PAYMENT_PROVIDER_ERROR` | Cho phép bấm nút "Thử lại" hoặc "Hoàn thủ công" |

---

### 17.4. Thử lại giao dịch hoàn tiền bị lỗi (Retry Refund)
`POST /admin/refunds/{paymentId}/retry` · **Auth:** Admin

- **Mục đích:** Khi giao dịch hoàn tiền bị `Failed` (do ngân hàng bảo trì), Admin bấm "Thử lại".
- **Ràng buộc:** Tối đa thử lại 3 lần. Nếu vượt quá 3 lần, hệ thống khóa nút thử lại và yêu cầu chuyển sang hoàn thủ công (`mark-manual`).

---

### 17.5. Đánh dấu đã hoàn tiền thủ công ngoài hệ thống
`POST /admin/refunds/{paymentId}/mark-manual` · **Auth:** Admin

- **Mục đích:** Dành cho các khoản hoàn bị lỗi không thể hoàn qua SePay tự động, kế toán chuyển khoản trực tiếp qua Internet Banking doanh nghiệp. Bắt buộc nhập mã tham chiếu giao dịch ngân hàng (`manualReference`) và lưu audit log.

**Request body**

```json
{
  "manualReference": "VCB-REFUND-20261101-778899",
  "note": "Đã chuyển khoản trực tiếp từ tài khoản VCB công ty tới STK của khách hàng"
}
```

---

### 17.6. Chấp nhận khoản tiền chuyển đối soát (Reconcile Accept)
`POST /admin/orders/{orderId}/reconcile-accept` · **Auth:** Admin

- **Mục đích:** Nút "Chấp nhận khoản tiền" màn O28 Tab Cần đối soát.
- **Trường hợp áp dụng:** Khách chuyển tiền thừa hoặc chuyển thành 2 lần nhưng tổng vẫn đủ trước hạn chót (`reconciliation_deadline_at`). Hệ thống xác nhận đơn (`Confirmed`), gán `paymentStatus = Paid` và tự động sinh một lệnh hoàn phần tiền thừa cho khách.

---

### 17.7. Hoàn toàn bộ & Hủy đơn đối soát (Reconcile Refund Full)
`POST /admin/orders/{orderId}/reconcile-refund` · **Auth:** Admin

- **Mục đích:** Nút "Hoàn toàn bộ" màn O28 khi khách chuyển tiền quá muộn sau khi chỗ đã bị giải phóng hoặc chuyển không đủ và từ chối nộp thêm. Hệ thống hoàn lại 100% số tiền thực nhận cho khách và đóng đơn ở trạng thái `Expired`.

---

## 18. Admin: Chương trình Khuyến mãi (Màn O29, O30, O31)

### 18.1. Danh sách chương trình khuyến mãi
`GET /admin/promotions` · **Auth:** Staff / Admin

- **Mục đích:** Màn O29 — danh sách các chiến dịch khuyến mãi (voucher giảm giá, ưu đãi đặt tour sớm, thuê combo tặng phụ kiện).
- **Query params:** `pageNumber`, `pageSize`, `search`, `status` (`Draft`, `Active`, `Paused`, `Expired`), `appliesTo` (`Tour`, `Rental`, `All`).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "promotionId": "eeee0000-1111-2222-3333-444455556666",
        "name": "Ưu đãi Mùa Leo Núi Cuối Năm 2026",
        "promotionCode": "TREK2026",
        "startAt": "2026-11-01T00:00:00Z",
        "endAt": "2026-12-31T23:59:59Z",
        "appliesTo": "Tour",
        "applicationScope": "Order",
        "usedCount": 18,
        "maxUses": 100,
        "isStackable": false,
        "priority": 1,
        "status": "Active"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 12,
    "totalPages": 2,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 18.2. Tạo chương trình khuyến mãi mới
`POST /admin/promotions` · **Auth:** Admin

**Request body**

```json
{
  "name": "Thuê lều tặng gậy trekking",
  "promotionCode": "FREEPOLE",
  "description": "Thuê đơn trên 1.000.000đ tặng 1 gậy trekking",
  "startAt": "2026-11-15T00:00:00Z",
  "endAt": "2026-12-15T23:59:59Z",
  "appliesTo": "Rental",
  "applicationScope": "Order",
  "maxUses": 50,
  "maxUsesPerUser": 1,
  "isStackable": false,
  "priority": 2
}
```

---

### 18.3. Chi tiết khuyến mãi & các bậc điều kiện
`GET /admin/promotions/{promotionId}` · **Auth:** Staff / Admin

- **Mục đích:** Màn O30 — thông tin chương trình và danh sách các bậc chiết khấu/quà tặng (`PROMOTION_TIERS`).

---

### 18.4. Sửa thông tin khuyến mãi
`PUT /admin/promotions/{promotionId}` · **Auth:** Admin

---

### 18.5. Đổi trạng thái khuyến mãi (Active / Paused / Expired)
`PATCH /admin/promotions/{promotionId}/status` · **Auth:** Admin

---

### 18.6. Cập nhật các bậc giảm giá & quà tặng (Promotion Tiers)
`PUT /admin/promotions/{promotionId}/tiers` · **Auth:** Admin

- **Mục đích:** Thiết lập các mốc điều kiện để nhận ưu đãi (ví dụ: đơn ≥ 4 khách giảm 10%, đơn ≥ 8 khách giảm 15% + tặng 1 gậy trekking).
- **Thước đo (`qualificationMetric`):** `OrderAmount` (Giá trị đơn), `ParticipantCount` (Số khách tham gia), `RentalDays` (Số ngày thuê).
- **Loại ưu đãi (`discountType`):** `Percentage` (% giảm giá), `FixedAmount` (Số tiền giảm cố định), `GiftItem` (Tặng kèm thiết bị mượn miễn phí).

**Request body**

```json
{
  "tiers": [
    {
      "qualificationMetric": "ParticipantCount",
      "minThreshold": 4,
      "discountType": "Percentage",
      "discountValue": 10,
      "giftProductVariantId": null,
      "giftQuantity": null
    },
    {
      "qualificationMetric": "ParticipantCount",
      "minThreshold": 8,
      "discountType": "GiftItem",
      "discountValue": 15,
      "giftProductVariantId": "77777777-8888-9999-0000-333333333333",
      "giftQuantity": 1
    }
  ]
}
```

---

### 18.7. Lịch sử các đơn hàng đã áp dụng khuyến mãi
`GET /admin/promotions/{promotionId}/usage` · **Auth:** Staff / Admin

- **Mục đích:** Màn O31 — thống kê chi tiết từng đơn hàng đã dùng mã này, số tiền đã giảm, quà tặng kèm đã giữ trong kho (`ASSET_ASSIGNMENTS.applied_promotion_id`) và trạng thái (`Reserved`, `Applied`, `Reversed`, `Expired`).

---

## 19. Admin: Quản lý Bài viết & Nội dung Hướng dẫn (Màn O32)

### 19.1. Danh sách bài viết & cẩm nang
`GET /admin/posts` · **Auth:** Staff / Admin

- **Mục đích:** Màn O32 — danh sách các bài viết hướng dẫn trekking, kỹ năng sinh tồn, thông tin địa điểm.
- **Trường thống kê:** Tác giả, số tour đang gắn bài viết này (`COUNT(tour_posts)`), tổng số lượt khách tham gia tour đã bấm đọc bài viết này (`COUNT(participant_post_reads)`).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "postId": "ffff0000-1111-2222-3333-444455556666",
        "title": "Kỹ thuật thở và bước chân khi leo dốc cao",
        "slug": "ky-thuat-tho-va-buoc-chan-khi-leo-doc-cao",
        "postType": "Skill",
        "authorFullName": "Lê Văn Nam (Guide)",
        "status": "Published",
        "publishedAt": "2026-06-01T00:00:00Z",
        "linkedToursCount": 6,
        "readCount": 245
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 28,
    "totalPages": 3,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 19.2. Tạo bài viết mới (Draft)
`POST /admin/posts` · **Auth:** Staff / Admin

**Request body**

```json
{
  "title": "Hướng dẫn chuẩn bị thể lực 4 tuần trước khi đi Bidoup",
  "slug": "chuan-bi-the-luc-truoc-khi-di-bidoup",
  "postType": "Guide",
  "content": "<p>Nội dung rich text bài viết chi tiết...</p>",
  "tagIds": ["11110000-aaaa-bbbb-cccc-111122223333"],
  "softSkillIds": ["22220000-aaaa-bbbb-cccc-111122223333"]
}
```

---

### 19.3. Chi tiết bài viết & trình soạn thảo
`GET /admin/posts/{postId}` · **Auth:** Staff / Admin

- **Mục đích:** Trình soạn thảo rich-text màn O32.

---

### 19.4. Sửa bài viết
`PUT /admin/posts/{postId}` · **Auth:** Staff / Admin

---

### 19.5. Xóa bài viết
`DELETE /admin/posts/{postId}` · **Auth:** Admin

---

### 19.6. Xuất bản bài viết
`POST /admin/posts/{postId}/publish` · **Auth:** Staff / Admin

- **Mục đích:** Đổi trạng thái sang `Published`, cập nhật `published_at = now`.

---

### 19.7. Lưu trữ bài viết
`POST /admin/posts/{postId}/archive` · **Auth:** Staff / Admin

---

### 19.8. Báo cáo lượt đọc bài viết của khách hàng
`GET /admin/posts/{postId}/read-analytics` · **Auth:** Staff / Admin

- **Mục đích:** Thống kê tỷ lệ hành khách đã đọc bài viết chuẩn bị trước khi chuyến khởi hành (dựa trên bảng `PARTICIPANT_POST_READS`).

---

## 20. Admin: Chính sách Hoàn tiền (Màn O34)

### 20.1. Danh sách chính sách hoàn tiền
`GET /admin/refund-policies` · **Auth:** Staff / Admin

- **Mục đích:** Màn O34 — danh sách các bộ chính sách hoàn tiền áp dụng cho Tour hoặc Đơn thuê.
- **Thống kê:** Số chuyến đi và đơn hàng đang liên kết với chính sách này (`COUNT(TRIPS)` + `COUNT(ORDERS)`).

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "policyId": "99999999-0000-1111-2222-333333333333",
      "policyFamilyId": "99999999-0000-0000-0000-333333333333",
      "name": "Chính sách hoàn tiền Tour Trekking Tiêu chuẩn",
      "policyType": "Tour",
      "version": 1,
      "effectiveFrom": "2026-01-01",
      "effectiveUntil": null,
      "status": "Active",
      "activeTripsCount": 35
    }
  ],
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 20.2. Tạo chính sách hoàn tiền mới
`POST /admin/refund-policies` · **Auth:** Admin

**Request body**

```json
{
  "name": "Chính sách hoàn tiền Mùa Lễ Tết (Chặt chẽ)",
  "policyType": "Tour",
  "effectiveFrom": "2026-12-20"
}
```

---

### 20.3. Chi tiết chính sách & bảng quy tắc bậc thang
`GET /admin/refund-policies/{policyId}` · **Auth:** Staff / Admin

- **Mục đích:** Màn O34 — hiển thị bảng quy tắc hoàn tiền theo giờ và biểu đồ bậc thang trực quan ("Số giờ trước giờ khởi hành -> % tiền được hoàn").

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "policyId": "99999999-0000-1111-2222-333333333333",
    "name": "Chính sách hoàn tiền Tour Trekking Tiêu chuẩn",
    "isLocked": true,
    "rules": [
      {
        "ruleId": "1111aaaa-2222-3333-4444-555566667777",
        "minHoursBefore": 168,
        "refundPercentage": 100,
        "description": "Trước 7 ngày (≥ 168h): Hoàn 100%"
      },
      {
        "ruleId": "1111aaaa-2222-3333-4444-555566667778",
        "minHoursBefore": 72,
        "refundPercentage": 80,
        "description": "Từ 3 đến 7 ngày (72h - 168h): Hoàn 80%"
      },
      {
        "ruleId": "1111aaaa-2222-3333-4444-555566667779",
        "minHoursBefore": 24,
        "refundPercentage": 50,
        "description": "Từ 24h đến 72h: Hoàn 50%"
      },
      {
        "ruleId": "1111aaaa-2222-3333-4444-555566667780",
        "minHoursBefore": 0,
        "refundPercentage": 0,
        "description": "Dưới 24h: Không hoàn tiền (0%)"
      }
    ]
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 20.4. Sửa chính sách hoàn tiền
`PUT /admin/refund-policies/{policyId}` · **Auth:** Admin

- **Ràng buộc:** Nếu chính sách này đã được áp dụng vào bất kỳ chuyến đi (`TRIPS`) hoặc đơn hàng (`ORDERS`) nào, API từ chối sửa đổi trực tiếp (`POLICY_ALREADY_IN_USE`) để bảo vệ tính bất biến của hợp đồng pháp lý đã giao kết với khách hàng. Quản trị viên phải dùng API nhân bản phiên bản mới (`clone-version`).

---

### 20.5. Cập nhật bảng quy tắc hoàn tiền
`PUT /admin/refund-policies/{policyId}/rules` · **Auth:** Admin

---

### 20.6. Nhân bản chính sách sang phiên bản mới (Clone Policy Version)
`POST /admin/refund-policies/{policyId}/clone-version` · **Auth:** Admin

- **Mục đích:** Khi chính sách cũ đã có chuyến áp dụng nhưng cần điều chỉnh quy định mới: Đặt ngày `effectiveUntil = now` cho bản cũ và tạo một bản ghi mới với cùng `policyFamilyId`, `version = version_cũ + 1`.

---

## 21. Admin: Cấu hình Hệ thống & Nhật ký Audit (Màn O35, O36)

### 21.1. Danh sách cấu hình hệ thống
`GET /admin/settings` · **Auth:** Admin

- **Mục đích:** Màn O35 — quản trị danh sách các tham số toàn cục của hệ thống (`system_configurations`).
- **Ví dụ các khóa:**
  - `orders.holdExpiresMinutes`: Số phút giữ chỗ chờ thanh toán (mặc định 15 phút).
  - `reconciliation.deadlineHours`: Số giờ tối đa chờ xử lý đối soát nộp thiếu/thừa tiền (mặc định 24 giờ).
  - `rental.cleaningBufferHours`: Thời gian cách ly vệ sinh thiết bị giữa 2 đợt thuê (mặc định 12 giờ).
  - `charges.dailyLateFeeVnd`: Đơn giá phạt trễ hạn mặc định mỗi ngày (mặc định 100.000đ).

---

### 21.2. Cập nhật giá trị cấu hình hệ thống
`PUT /admin/settings/{configKey}` · **Auth:** Admin

- **Mục đích:** Thay đổi giá trị tham số cấu hình. Bắt buộc ghi nhận `AUDIT_LOGS` người sửa và giá trị cũ/mới.

**Request body**

```json
{
  "configValue": "30",
  "reason": "Gia hạn thời gian giữ chỗ vào dịp khuyến mãi lớn"
}
```

---

### 21.3. Tra cứu nhật ký kiểm toán hệ thống (Audit Logs)
`GET /admin/audit-logs` · **Auth:** Admin

- **Mục đích:** Màn O36 — bộ máy tra cứu nhật ký kiểm toán toàn diện dành cho an ninh và vận hành.
- **Query params:** `pageNumber`, `pageSize`, `actorUserId`, `entityType` (`Order`, `Trip`, `Account`, `AssetAssignment`, `RentalCharge`, `Payment`), `entityId`, `action` (`Create`, `Update`, `Lock`, `Cancel`, `Approve`, `Void`), `fromDate`, `toDate`.
- **Response `200 OK`:** Trả về danh sách log kèm trường `details` dạng JSON viewer thể hiện dữ liệu Before/After.

---

## 22. Admin: Báo cáo Vận hành & Phân tích (Màn O37)

### 22.1. Báo cáo doanh thu & dòng tiền ròng
`GET /admin/reports/revenue?from={date}&to={date}&groupBy={month|week}` · **Auth:** Admin

- **Mục đích:** Biểu đồ doanh thu màn O37 — tổng thu (`Collection Succeeded`), tổng hoàn (`Refund Succeeded`), doanh thu thực nhận ròng phân theo Tour và Cho thuê thiết bị.

---

### 22.2. Báo cáo tỷ lệ lấp chỗ chuyến đi
`GET /admin/reports/trip-occupancy?from={date}&to={date}&tourId={guid}` · **Auth:** Admin

- **Mục đích:** Đo lường hiệu quả bán chỗ của từng cung đường trekking (tỷ lệ % chỗ bán được trên tổng sức chứa thiết kế).

---

### 22.3. Báo cáo hiệu suất khai thác thiết bị kho
`GET /admin/reports/asset-utilization?from={date}&to={date}&categoryId={guid}` · **Auth:** Admin

- **Mục đích:** Đếm số ngày thiết bị thực sự được mang đi sử dụng (`Issued`) trên tổng số ngày trong kỳ để ban quản lý đánh giá món đồ nào được ưa chuộng, món nào tồn kho lãng phí nhằm lên kế hoạch tái đầu tư.

---

### 22.4. Báo cáo hoàn tiền và bồi thường thiệt hại
`GET /admin/reports/refunds-and-charges?from={date}&to={date}` · **Auth:** Admin

- **Mục đích:** Thống kê tổng số tiền đã hoàn trả cho khách theo từng mốc chính sách hủy tour và tổng số tiền phạt thu được do khách làm hỏng/mất/trả trễ đồ.

---

## 23. Admin: Kiểm duyệt Đánh giá - Review (Màn O39)

### 23.1. Danh sách đánh giá của khách hàng
`GET /admin/reviews` · **Auth:** Staff (chỉ xem) / Admin

- **Mục đích:** Màn O39 — quản lý và kiểm duyệt các đánh giá (1 đến 5 sao, lời bình luận) của khách hàng sau khi hoàn thành chuyến đi.
- **Query params:** `pageNumber`, `pageSize`, `rating` (1 đến 5), `tourId`, `guideUserId`, `status` (`Visible`, `Hidden`), `search`.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "reviewId": "7777aaaa-8888-9999-0000-111122223333",
        "rating": 5,
        "comment": "Chuyến đi tuyệt vời! Anh Nam guide hỗ trợ rất nhiệt tình, đồ ăn ngon và lều trại rất sạch sẽ.",
        "customerFullName": "Nguyễn Hoàng Nam",
        "tourName": "Chinh phục Tà Năng - Phan Dũng",
        "tripStartAt": "2026-11-20T06:00:00Z",
        "guideFullName": "Lê Văn Nam",
        "isHidden": false,
        "hiddenReason": null,
        "createdAt": "2026-11-23T10:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalItems": 68,
    "totalPages": 7,
    "hasPrevious": false,
    "hasNext": true
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 23.2. Ẩn đánh giá vi phạm tiêu chuẩn
`POST /admin/reviews/{reviewId}/hide` · **Auth:** Admin

- **Mục đích:** Nút "Ẩn đánh giá" màn O39 khi đánh giá chứa từ ngữ thô tục, bôi nhọ hoặc spam quảng cáo.
- **Ràng buộc:** Bắt buộc nhập lý do ẩn (`hiddenReason`) và lưu `AUDIT_LOGS`. Admin **không** được phép chỉnh sửa nội dung văn bản của đánh giá nhằm đảm bảo tính trung thực.

**Request body**

```json
{
  "reason": "Bình luận chứa từ ngữ thô tục vi phạm tiêu chuẩn cộng đồng"
}
```

---

### 23.3. Khôi phục hiển thị đánh giá
`POST /admin/reviews/{reviewId}/unhide` · **Auth:** Admin

- **Mục đích:** Bỏ cờ ẩn, cho phép đánh giá hiển thị lại công khai trên trang chi tiết tour.

---

## 24. Guide: Khu vực Hướng dẫn viên Thực địa (Màn G01 – G06)

> **Phạm vi bảo mật & nghiệp vụ Guide:**
> 1. Guide chỉ được xem dữ liệu của những nhóm (`TRIP_GROUPS`) mà mình được gán phụ trách dẫn tour (`guide_user_id = current_user_id`).
> 2. **Tuyệt đối không để lộ dữ liệu tài chính:** Các endpoint `/guide/*` bị lược bỏ hoàn toàn thông tin nhạy cảm về doanh thu, giá tour, chiết khấu, số tiền thanh toán của đơn hàng (`Screen_Spec.md`).
> 3. **Tối ưu hóa di động & sóng yếu trên núi:** Payload tinh gọn, hỗ trợ thao tác nhanh 1 chạm, và hỗ trợ cơ chế lưu ngoại tuyến (Offline queue / Idempotency key) cho màn hình điểm danh.

---

### 24.1. Danh sách chuyến của Guide (Hôm nay / Sắp tới / Đã xong)
`GET /guide/trips` · **Auth:** Guide

- **Mục đích:** Màn G01 — Hướng dẫn viên xem các chuyến đi mình được phân công phụ trách.
- **Tại sao cần API này & Phân rã nghiệp vụ:**
  - Không thể dùng chung `GET /admin/trips` vì API Admin trả về toàn bộ các chuyến của hệ thống kèm doanh thu, bộ lọc phức tạp và phân trang nặng.
  - API Guide trả về danh sách thẻ lớn tối ưu cho mobile, phân nhóm theo tab (`tab = today | upcoming | completed`), kèm thời gian, địa điểm tập trung (tọa độ, địa chỉ) để mở bản đồ dẫn đường, sĩ số nhóm và trạng thái chuyến.
- **Query params:**

| Param | Type | Required | Default | Mô tả |
|---|---|---|---|---|
| `tab` | `string` | ✘ | `today` | Lọc theo tab thời gian: `today`, `upcoming`, `completed` |

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "tripId": "33333333-4444-5555-6666-777777777777",
      "tourName": "Chinh phục Tà Năng - Phan Dũng",
      "groupId": "gggg1111-2222-3333-4444-555555555555",
      "groupName": "Nhóm Đại Bàng",
      "startAt": "2026-11-20T06:00:00Z",
      "endAt": "2026-11-22T18:00:00Z",
      "tripStatus": "InProgress",
      "participantCount": 18,
      "maxParticipants": 20,
      "meetingLocation": {
        "name": "Cây xăng Tà Hine, Đức Trọng, Lâm Đồng",
        "address": "QL20, Tà Hine, Đức Trọng, Lâm Đồng",
        "latitude": 11.6985,
        "longitude": 108.3842
      }
    }
  ],
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 24.2. Chi tiết nhóm & danh sách khách (Màn G02)
`GET /guide/trips/{tripId}/group` · **Auth:** Guide

- **Mục đích:** Màn G02 — Guide xem danh sách thành viên trong nhóm mình phụ trách, hỗ trợ gọi điện nhanh và xem trạng thái điểm danh hoạt động hiện tại.
- **Tại sao cần API này:** Tách rời với việc quản lý booking toàn đoàn của Admin O11/O12. Guide chỉ quản lý thành viên nhóm mình với các trường cần thiết: họ tên, tuổi (tính từ `date_of_birth`), SĐT có link `tel:`, và badge trạng thái điểm danh của hoạt động đang diễn ra.
- **Path params:**

| Param | Type | Mô tả |
|---|---|---|
| `tripId` | `guid` | Mã chuyến đi |

- **Query params:**

| Param | Type | Required | Default | Mô tả |
|---|---|---|---|---|
| `search` | `string` | ✘ | | Tìm nhanh tên khách trong nhóm |

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "gggg1111-2222-3333-4444-555555555555",
    "groupName": "Nhóm Đại Bàng",
    "tripId": "33333333-4444-5555-6666-777777777777",
    "tourName": "Chinh phục Tà Năng - Phan Dũng",
    "currentActivity": {
      "activityId": "55555555-6666-7777-8888-999999999999",
      "name": "Tập trung bìa rừng & khởi động",
      "dayNumber": 1,
      "startTime": "07:30:00"
    },
    "participants": [
      {
        "participantId": "aaaa1111-2222-3333-4444-555555555555",
        "fullName": "Nguyễn Hoàng Nam",
        "age": 28,
        "phone": "0987654321",
        "currentAttendanceStatus": "Present"
      },
      {
        "participantId": "aaaa2222-3333-4444-5555-666666666666",
        "fullName": "Trần Thị Mai",
        "age": 25,
        "phone": "0912334455",
        "currentAttendanceStatus": "Late"
      }
    ]
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 24.3. Chi tiết thông tin khách & cứu hộ khẩn cấp (Màn G03)
`GET /guide/participants/{participantId}` · **Auth:** Guide

- **Mục đích:** Màn G03 — Guide tra cứu hồ sơ an toàn của 1 khách hàng: **Người liên hệ khẩn cấp (Emergency Contact)** có nút gọi điện thoại tức thì, lịch sử điểm danh qua các chặng, và danh sách đồ cấp đã nhận (`ASSET_ASSIGNMENTS`).
- **Tại sao cần API này:** Cực kỳ quan trọng trong công tác an toàn cứu hộ thực địa khi đi trekking. Không được để lộ thông tin thanh toán đơn hàng nhưng phải hiển thị nổi bật số điện thoại cứu hộ và đồ bảo hộ được cấp.
- **Path params:**

| Param | Type | Mô tả |
|---|---|---|
| `participantId` | `guid` | Mã định danh khách tham gia |

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "participantId": "aaaa1111-2222-3333-4444-555555555555",
    "fullName": "Nguyễn Hoàng Nam",
    "dateOfBirth": "1998-05-12",
    "age": 28,
    "phone": "0987654321",
    "email": "nam.nguyen@gmail.com",
    "emergencyContact": {
      "name": "Nguyễn Văn Hùng (Bố)",
      "phone": "0903123456"
    },
    "assignedAssets": [
      {
        "assetId": "99990000-1111-2222-3333-444455556666",
        "assetCode": "WALK-0012",
        "productName": "Bộ đàm Motorola T82 Extreme",
        "issuedAt": "2026-11-20T06:30:00Z"
      },
      {
        "assetId": "99990000-1111-2222-3333-777788889999",
        "assetCode": "POLE-0045",
        "productName": "Gậy leo núi Decathlon Forclaz",
        "issuedAt": "2026-11-20T06:30:00Z"
      }
    ],
    "attendanceHistory": [
      {
        "activityId": "55555555-6666-7777-8888-999999999999",
        "activityName": "Tập trung bìa rừng & khởi động",
        "dayNumber": 1,
        "status": "Present",
        "checkedAt": "2026-11-20T07:35:00Z"
      }
    ]
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 24.4. Điểm danh thực địa nhanh trên di động (Màn G04)
`POST /guide/trips/{tripId}/attendances/batch` · **Auth:** Guide

- **Mục đích:** Màn G04 — Guide thao tác điểm danh nhanh với 3 nút lớn **Có mặt · Vắng · Muộn**, hỗ trợ nút "Tất cả có mặt", và hỗ trợ hàng đợi gửi offline khi sóng núi chập chờn.
- **Tại sao cần API này & Phân rã nghiệp vụ:**
  - Điểm danh thực địa cần xử lý hàng loạt (batch update) cho nhiều khách cùng một lúc hoặc toàn bộ nhóm ("Tất cả có mặt").
  - Hỗ trợ cơ chế **Idempotency** (truyền `clientBatchId` hoặc `idempotencyKey`) để khi điện thoại mất sóng và gửi lại (retry), hệ thống không tạo trùng bản ghi hoặc xung đột.
  - Tự động ghi nhận `checked_by_user_id = current_user_id` và `checked_at = now()`.
  - Nếu sửa bản ghi đã tồn tại, bắt buộc phải có `reason` giải trình.
- **Path params:**

| Param | Type | Mô tả |
|---|---|---|
| `tripId` | `guid` | Mã chuyến đi |

- **Request body**

```json
{
  "activityId": "55555555-6666-7777-8888-999999999999",
  "clientBatchId": "offline-sync-20261120-0740-001",
  "markAllPresent": false,
  "attendances": [
    {
      "participantId": "aaaa1111-2222-3333-4444-555555555555",
      "status": "Present",
      "reason": null
    },
    {
      "participantId": "aaaa2222-3333-4444-5555-666666666666",
      "status": "Late",
      "reason": "Khách đến muộn 15 phút do kẹt xe"
    }
  ]
}
```

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ghi nhận điểm danh thành công",
  "data": {
    "activityId": "55555555-6666-7777-8888-999999999999",
    "updatedCount": 2,
    "presentCount": 17,
    "totalCount": 18,
    "progressText": "17/18 có mặt"
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

**Lỗi (Error Responses)**

- **Response `400 Bad Request` — Thiếu lý do khi sửa điểm danh:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Bắt buộc nhập lý do khi thay đổi trạng thái điểm danh đã lưu",
  "data": null,
  "errors": {
    "code": ["REASON_REQUIRED_FOR_UPDATE"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

- **Response `403 Forbidden` — Guide không phụ trách nhóm:**

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Bạn không có quyền điểm danh cho nhóm hoặc chuyến đi này",
  "data": null,
  "errors": {
    "code": ["GUIDE_NOT_ASSIGNED_TO_GROUP"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 24.5. Lịch trình chuyến đi & Tiến độ hoạt động (Màn G05)
`GET /guide/trips/{tripId}/itinerary` · **Auth:** Guide

- **Mục đích:** Màn G05 — Timeline các hoạt động theo từng ngày (`day_number`), hiển thị giờ bắt đầu, thời lượng, mô tả chặng, đánh dấu hoạt động đang diễn ra và tỉ lệ điểm danh của từng hoạt động.
- **Tại sao cần API này:** Giúp Guide theo dõi tiến độ đoàn theo kịch bản tour ngay trên màn hình mobile, biết được chặng nào đã hoàn thành điểm danh, chặng nào sắp đến giờ.
- **Path params:**

| Param | Type | Mô tả |
|---|---|---|
| `tripId` | `guid` | Mã chuyến đi |

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "tripId": "33333333-4444-5555-6666-777777777777",
    "tourName": "Chinh phục Tà Năng - Phan Dũng",
    "days": [
      {
        "dayNumber": 1,
        "title": "Ngày 1: Rìa rừng Tà Hine - Đồi lính",
        "activities": [
          {
            "activityId": "55555555-6666-7777-8888-999999999999",
            "name": "Tập trung bìa rừng & khởi động",
            "startTime": "07:30:00",
            "durationMinutes": 45,
            "description": "Phổ biến nội quy an toàn và phát gậy trekking, bộ đàm.",
            "isCurrent": false,
            "attendanceRate": "18/18"
          },
          {
            "activityId": "55555555-6666-7777-8888-000000000000",
            "name": "Trekking dốc Đồi Lính",
            "startTime": "09:00:00",
            "durationMinutes": 180,
            "description": "Chặng leo dốc đứng liên tục 5km.",
            "isCurrent": true,
            "attendanceRate": "17/18"
          }
        ]
      }
    ]
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

### 24.6. Danh sách đồ cấp giao cho nhóm (Màn G06)
`GET /guide/trips/{tripId}/provided-items` · **Auth:** Guide

- **Mục đích:** Màn G06 — Guide kiểm tra danh sách đồ cấp/thiết bị của đoàn (`TRIP_PROVIDED_ITEMS`) và mã định danh tài sản (`asset_code`) đã được kho xuất giao cho đoàn.
- **Tại sao cần API này:** Phục vụ Guide kiểm tra bàn giao thực địa trước khi lên đường. API ở chế độ chỉ xem (Read-only); việc quét barcode thu hồi thiết bị sau chuyến do Staff kho thực hiện ở màn O13.
- **Path params:**

| Param | Type | Mô tả |
|---|---|---|
| `tripId` | `guid` | Mã chuyến đi |

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "tripId": "33333333-4444-5555-6666-777777777777",
    "items": [
      {
        "providedItemId": "pppp1111-2222-3333-4444-555555555555",
        "productName": "Bộ đàm Motorola T82 Extreme",
        "variantName": "Tiêu chuẩn",
        "requiredQuantity": 3,
        "allocatedQuantity": 3,
        "status": "Ready",
        "allocatedAssets": [
          { "assetCode": "WALK-0012", "status": "Issued" },
          { "assetCode": "WALK-0013", "status": "Issued" },
          { "assetCode": "WALK-0014", "status": "Issued" }
        ]
      },
      {
        "providedItemId": "pppp2222-3333-4444-5555-666666666666",
        "productName": "Túi y tế cứu hộ khẩn cấp",
        "variantName": "Cá nhân",
        "requiredQuantity": 2,
        "allocatedQuantity": 2,
        "status": "Ready",
        "allocatedAssets": [
          { "assetCode": "MED-0001", "status": "Issued" },
          { "assetCode": "MED-0002", "status": "Issued" }
        ]
      }
    ]
  },
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

---

## Phụ lục: Enum

Tất cả Enum được serialize sang **string** trong JSON payload:

| Enum | Giá trị hợp lệ | Mô tả |
|---|---|---|
| `UserRole` | `Admin`, `Staff`, `Guide`, `Customer` | Vai trò người dùng |
| `AccountStatus` | `Active`, `Locked`, `PendingConfirmation` | Trạng thái tài khoản |
| `CategoryType` | `Tour`, `Equipment`, `Bundle` | Loại danh mục |
| `TourStatus` | `Draft`, `Published`, `Archived` | Trạng thái tour |
| `QuantityBasis` | `PerPerson`, `PerGroup`, `PerTrip` | Cơ sở định mức cấp phát thiết bị |
| `TripStatus` | `Draft`, `Open`, `ClosedForBooking`, `InProgress`, `Completed`, `Cancelled` | Vòng đời chuyến đi |
| `TripGroupStatus` | `Open`, `Full`, `Disbanded` | Trạng thái nhóm của chuyến |
| `TripProvidedItemStatus`| `Missing`, `Ready`, `Recovered` | Tình trạng chuẩn bị đồ cấp |
| `AttendanceStatus` | `Present`, `Absent`, `Late`, `Excused` | Trạng thái điểm danh hoạt động |
| `OrderType` | `Tour`, `Rental` | Phân loại đơn hàng |
| `OrderStatus` | `PendingPayment`, `Confirmed`, `InFulfillment`, `Completed`, `Cancelled`, `Expired` | Vòng đời đơn hàng |
| `PaymentStatus` | `Unpaid`, `PartiallyPaid`, `Paid`, `NeedsReconciliation`, `Refunded` | Trạng thái tài chính của đơn |
| `ProductStatus` | `Draft`, `Active`, `Discontinued` | Trạng thái sản phẩm |
| `VariantStatus` | `Active`, `Inactive` | Trạng thái biến thể SKU |
| `AssetStatus` | `Available`, `Maintenance`, `Damaged`, `Lost`, `Retired` | Tình trạng vật lý thiết bị |
| `AssetAssignmentStatus`| `Reserved`, `Issued`, `Returned`, `LostOrException` | Trạng thái điều phối thiết bị |
| `ReturnCondition` | `Normal`, `Damaged`, `MissingAccessory`, `Lost` | Tình trạng khi trả thiết bị |
| `ChargeType` | `LateReturn`, `Damage`, `Loss`, `Other` | Loại phí phạt phát sinh |
| `ChargeStatus` | `Draft`, `Assessed`, `Settled`, `Voided` | Vòng đời khoản phí phát sinh |
| `PaymentType` | `Collection`, `Refund` | Loại giao dịch tiền (Thu / Hoàn) |
| `PaymentPurpose` | `TourFee`, `RentalFee`, `AdditionalCharge` | Mục đích khoản thanh toán |
| `PaymentRecordStatus` | `PendingApproval`, `Pending`, `Succeeded`, `Failed`, `Cancelled` | Trạng thái giao dịch SePay |
| `PromotionAppliesTo` | `Tour`, `Rental`, `All` | Phạm vi dịch vụ áp dụng khuyến mãi |
| `PromotionScope` | `Order`, `RentalOrderItem` | Cấp độ áp dụng khuyến mãi |
| `PromotionStatus` | `Draft`, `Active`, `Paused`, `Expired` | Trạng thái chương trình khuyến mãi |
| `QualificationMetric` | `OrderAmount`, `ParticipantCount`, `RentalDays` | Thước đo xét bậc ưu đãi |
| `DiscountType` | `Percentage`, `FixedAmount`, `GiftItem` | Hình thức ưu đãi |
| `PolicyType` | `Tour`, `Rental` | Loại chính sách hoàn tiền |

---

## Phụ lục: Mã lỗi nghiệp vụ

Mọi lỗi trả về từ hệ thống đều tuân thủ cấu trúc Error Response chuẩn với `success = false`, `data = null`. Trường `errors.code` chứa danh sách mã lỗi nghiệp vụ để Frontend bắt và xử lý logic tương ứng.

### 1. Bảng danh mục mã lỗi nghiệp vụ

| HTTP Status | Error Code (`errors.code`) | Ý nghĩa nghiệp vụ | Điều kiện phát sinh | Hành động xử lý của Frontend |
|---|---|---|---|---|
| `400` | `VALIDATION_ERROR` | Dữ liệu đầu vào không hợp lệ | Thiếu trường bắt buộc, sai định dạng chuỗi/số/ngày | Đánh dấu đỏ các trường lỗi theo tên field trong `errors` |
| `400` | `INVALID_INPUT` | Tham số gửi lên không đúng logic | Ngày kết thúc trước ngày bắt đầu, số lượng ≤ 0 | Toast thông báo lỗi cụ thể từ `message` |
| `400` | `LOCATION_IN_USE` | Địa điểm đang được tour sử dụng | Xóa địa điểm đang là `main_location_id` của tour | Toast cảnh báo và chặn thao tác xóa |
| `400` | `ITINERARY_LOCKED` | Lịch trình tour đã bị khóa | Sửa hoạt động/đồ cấp khi tour đã có người đặt mua | Hiện banner cảnh báo & nút "Tạo phiên bản mới (Clone)" |
| `400` | `TRIP_NOT_DEPARTABLE` | Chuyến chưa đủ điều kiện khởi hành | Chưa xếp hết nhóm, thiếu Guide, hoặc thiếu đồ cấp | Mở drawer Checklist sẵn sàng khởi hành (O10) |
| `400` | `TRIP_CAPACITY_EXCEEDED`| Sĩ số nhóm hoặc chuyến đã đạt tối đa | Kéo thả thêm khách vào nhóm/chuyến đã đủ người | Chặn thao tác kéo thả và báo nhóm đã đầy |
| `400` | `UNASSIGNED_PARTICIPANTS`| Còn hành khách chưa được xếp nhóm | Bấm chuyển trạng thái chuyến khi còn người chưa chia | Chuyển sang màn O12 để hoàn tất chia nhóm |
| `400` | `MISSING_GEAR_FOR_TRIP`| Đồ cấp đoàn chưa được gán đủ từ kho | Chuyến đi sắp khởi hành nhưng thiếu thiết bị vật lý | Chuyển sang màn O13 để gán bổ sung tài sản |
| `400` | `ASSET_NOT_AVAILABLE` | Thiết bị không sẵn sàng để phân bổ | Quét gán mã asset đang bị bảo trì, hỏng hoặc đã giữ | Báo lỗi và gợi ý quét mã thiết bị khác |
| `400` | `ASSET_VARIANT_MISMATCH`| Mã thiết bị không khớp với biến thể cần | Quét nhầm mã đồ của SKU khác khi giao nhận | Báo sai chủng loại thiết bị |
| `400` | `HANDOVER_INCOMPLETE` | Chưa bàn giao đủ toàn bộ thiết bị | Bấm hoàn tất giao đồ khi còn món chưa quét | Hiển thị danh sách các món còn thiếu |
| `400` | `ORDER_NOT_CLOSEABLE` | Đơn thuê chưa đủ điều kiện đóng | Còn đồ chưa trả hoặc còn phí phạt `Assessed` chưa thu | Hiển thị danh sách việc cần xử lý trước khi đóng đơn |
| `400` | `POLICY_ALREADY_IN_USE`| Chính sách hoàn tiền đã có chuyến áp dụng | Sửa trực tiếp chính sách hoàn tiền đang chạy | Yêu cầu nhân bản phiên bản mới (`clone-version`) |
| `401` | `UNAUTHORIZED` | Chưa đăng nhập hoặc Access Token hết hạn | Header Authorization thiếu Bearer token hoặc token hỏng | Tự động gọi API refresh-token, nếu thất bại điều hướng về `/login` |
| `403` | `FORBIDDEN` | Tài khoản không đủ thẩm quyền truy cập | Staff cố truy cập màn hình/API cấu hình riêng của Admin | Hiển thị trang lỗi 403 Forbidden |
| `404` | `NOT_FOUND` | Không tìm thấy tài nguyên | ID (User, Tour, Trip, Order, Asset) không tồn tại trong DB | Hiển thị trang lỗi 404 hoặc thông báo bản ghi đã bị xóa |
| `409` | `EMAIL_ALREADY_EXISTS` | Email đã được tài khoản khác sử dụng | Đăng ký hoặc tạo Staff bằng email đã có trong `accounts` | Báo lỗi đỏ tại ô nhập Email |
| `409` | `SKU_ALREADY_EXISTS` | Mã biến thể SKU đã tồn tại | Tạo biến thể sản phẩm có SKU trùng lặp | Yêu cầu đổi mã SKU khác |
| `409` | `ASSET_CODE_ALREADY_EXISTS`| Mã thiết bị barcode đã tồn tại | Thêm asset có mã bị trùng trong kho | Đổi mã tiền tố hoặc số thứ tự |
| `409` | `CONCURRENCY_CONFLICT` | Xung đột ghi đè dữ liệu đồng thời | 2 nhân viên cùng sửa 1 chuyến/đơn cùng một lúc (`row_version` lệch) | Tự động tải lại dữ liệu mới nhất và thông báo người dùng |
| `409` | `REFUND_NOT_APPROVABLE` | Dòng hoàn tiền không ở trạng thái chờ duyệt | Duyệt lại dòng hoàn tiền đã được xử lý trước đó | Tải lại danh sách hoàn tiền O28 |
| `409` | `REFUND_EXCEEDS_COLLECTED`| Tổng tiền hoàn vượt quá số tiền đã thu | Lỗi tính toán hoàn tiền vượt mức giao dịch gốc | Khóa nút duyệt và báo kế toán kiểm tra |
| `409` | `REFUND_RETRY_LIMIT_REACHED`| Đã vượt quá 3 lần thử lại hoàn tiền tự động | Giao dịch SePay hoàn thất bại liên tiếp 3 lần | Chuyển sang nút "Đã hoàn thủ công ngoài hệ thống" |
| `409` | `ORDER_NOT_RECONCILABLE`| Đơn hàng không đủ điều kiện đối soát | Đơn đã quá hạn đối soát hoặc VA chưa đóng | Báo chỉ được hoàn tiền toàn bộ |
| `429` | `TOO_MANY_REQUESTS` | Vượt tần suất cho phép (Rate Limiting) | Gửi quá 10 request duyệt hoàn tiền trong 60 giây | Đọc header `Retry-After` và đếm ngược thời gian chờ |
| `500` | `INTERNAL_SERVER_ERROR`| Lỗi hệ thống ngoài dự kiến | Exception chưa được bắt tại Backend | Toast thông báo "Lỗi hệ thống, vui lòng thử lại sau" |
| `502` | `PAYMENT_PROVIDER_ERROR`| Lỗi nhà cung cấp cổng thanh toán SePay | Cổng SePay timeout, lỗi mạng ngân hàng | Thông báo lỗi cổng thanh toán, cho phép bấm "Thử lại" |

---

## Template endpoint

Copy khối mẫu dưới đây khi bổ sung API mới trong tương lai:

````markdown
### X.Y. <Tên API>

`<METHOD> /api/v1/<resource>` · **Auth:** <Staff | Admin>

**Mô tả:** <Mô tả chức năng API>

**Tại sao cần API này & Phân rã nghiệp vụ:** <Giải thích lý do tách riêng>

**Path params**

| Param | Type | Mô tả |
|---|---|---|
| `id` | `guid` | Khóa chính |

**Query params**

| Param | Type | Required | Default | Mô tả |
|---|---|---|---|---|
| `search` | `string` | ✘ | | Tìm kiếm |

**Request body**

```json
{
}
```

**Response `200 OK` (Thành công)**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thao tác thành công",
  "data": {},
  "errors": null,
  "timestamp": "2026-11-01T08:30:00Z"
}
```

**Lỗi (Error Responses)**

- **Response `400 Bad Request` — Lỗi nghiệp vụ / Validation:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "<Mô tả lỗi tiếng Việt>",
  "data": null,
  "errors": {
    "code": ["<MÃ_LỖI_NGHIỆP_VỤ>"]
  },
  "timestamp": "2026-11-01T08:30:00Z"
}
```

| Status | Khi nào | Code | Hành động của FE |
|---|---|---|---|
| `400` | Dữ liệu không hợp lệ | `VALIDATION_ERROR` | Đánh dấu đỏ trường dữ liệu sai |
| `400` | Vi phạm quy tắc nghiệp vụ | `<MÃ_LỖI>` | Toast thông báo lỗi |
| `401` | Chưa xác thực | `UNAUTHORIZED` | Refresh token hoặc về login |
| `403` | Không đủ quyền | `FORBIDDEN` | Màn hình 403 |
| `404` | Không tìm thấy | `NOT_FOUND` | Màn hình 404 |
| `409` | Xung đột đồng thời / trùng khóa | `CONCURRENCY_CONFLICT` | Tải lại trang |
````

---

## Changelog

| Ngày | Người sửa | Endpoint | Thay đổi |
|---|---|---|---|
| 2026-10-06 | Team | 1.1 – 2.3 | Khởi tạo skeleton cơ bản ban đầu |
| 2026-11-01 | Antigravity Pair | 1.1 – 23.3 | Hoàn tất thiết kế toàn diện 176 API cho Phân hệ Quản trị (Admin & Vận hành) từ Màn O01 đến O39 theo RenTrekk Design System và DB Supabase Schema. Bổ sung mục tiêu, lý do phân rã chi tiết, bảng enum và mã lỗi nghiệp vụ. |
| 2026-11-01 | Antigravity Pair | 24.1 – 24.6 | Bổ sung phân hệ API Hướng dẫn viên Thực địa (Màn G01 – G06) gồm 6 API chuyên biệt `/api/v1/guide/*`, bảo mật dữ liệu tài chính và hỗ trợ offline sync trên mobile. Nâng tổng số API lên 182 endpoints. |

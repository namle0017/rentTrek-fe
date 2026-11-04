# RenTrekk — Đặc tả màn hình (Screen Spec) map với DB

> **Cập nhật 30/10/2026 — đồng bộ DB thật + SePay.** Nguồn DB: `BE/docs/database/supabase_schema.sql` (không dùng `rentrek_schema.sql` cũ); API: `BE/docs/03.1-API-CONTRACT-RENTAL-CUSTOMER.md`.
> - Đổi tên: `USERS` → `ACCOUNTS`; `TRANSACTIONS` → `PAYMENTS` (`payment_type` Collection/Refund, `original_payment_id`, purpose TourFee/RentalFee/AdditionalCharge, cột mới `provider_order_id`, `received_amount`, `failure_reason`, `retry_of_payment_id`, `manual_reference`); `ORDERS.reconciliation_deadline_at`.
> - Trạng thái: hoàn tiền mới tạo = `PendingApproval` (Admin duyệt); assignment mất = `LostOrException`; return_condition Normal/Damaged/MissingAccessory/Lost; charge_type LateReturn/Damage/Loss/Other; category_type Tour/Equipment/Bundle; product status Draft/Active/Discontinued.
> - Thanh toán chỉ chuyển khoản VietQR qua SePay VA; **chưa thu cọc** (deposit_amount = 0).
> - Màn mới: C04P, C19, O38, O39, E01–E12 (file `RenTrekk Batch 6 - Man hinh loi.dc.html`).

> Nguồn: `PRD_RenTrekk.md` (FR, §7 vòng đời, §9 danh sách màn hình) + trang **Logical ERD** trong `Conceptual.drawio`.
> Dùng kèm `Claude_Design_Prompt.md`: khi làm từng batch trong Claude Design, dán thêm các màn hình tương ứng ở file này.

## 0. Quy ước

- **Mã màn hình:** `A` = Tài khoản (mọi role) · `C` = Khách hàng · `O` = Vận hành (Staff/Admin) · `G` = Guide.
- **Nền tảng:** toàn bộ là web (một ứng dụng). Mỗi màn chỉ thiết kế một bản web khung 1440px, không làm bản mobile.
- **Cột DB:** ghi `TABLE.column`. `→` = đi theo khóa ngoại. `Σ`, `COUNT`, `AVG` = giá trị suy ra (không có cột riêng), luôn kèm công thức.
- **R** = chỉ đọc · **W** = người dùng nhập/sửa · **S** = hệ thống tự ghi (người dùng không nhập).
- `?` = cột nullable → UI có trạng thái rỗng "Chưa cập nhật".
- Mọi bảng có `is_deleted` → UI dùng "Ẩn / Lưu trữ", không xóa cứng. Danh sách mặc định lọc `is_deleted = 0`.
- Tiền: VND, `dec(18,0)`, hiển thị `1.250.000 ₫`. Ngày giờ kèm `(GMT+7)` ở bước xác nhận.
- Tên trạng thái lấy theo PRD §7 (Phụ lục B của `Claude_Design_Prompt.md`), hiển thị nhãn tiếng Việt.
- Hành động nhạy cảm → ghi `AUDIT_LOGS` (actor_user_id, action, entity_type, entity_id, details).

## Sitemap

```
Khách hàng (public)            Tài khoản của tôi            Vận hành (Staff/Admin)              Guide        
C01 Trang chủ                  A05 Hồ sơ                    O01 Dashboard                       G01 Chuyến hôm nay
C02 Danh sách tour             A06 Bảo mật & phiên          O02–O03 Người dùng                  G02 Chi tiết nhóm
C03 Chi tiết tour              A07 Thông báo                O04 Danh mục & Địa điểm             G03 Chi tiết participant
C04 Checkout tour              C10 Đơn của tôi              O05–O08 Tour, phiên bản, lịch lặp   G04 Điểm danh
C05 Kết quả thanh toán         C11 Chi tiết đơn tour        O09–O15 Chuyến & booking            G05 Lịch trình
C06 Danh mục thuê              C12 Yêu cầu hủy              O16–O21 Sản phẩm, combo, asset      G06 Đồ cấp của nhóm
C07 Chi tiết sản phẩm          C13 Chi tiết đơn thuê        O22–O26 Đơn thuê, giao nhận, phí    (dùng chung A05, A07)
C08 Chi tiết combo             C14 Chuyến của tôi           O27–O28 Giao dịch & hoàn tiền
C09 Giỏ & Checkout thuê        C15 Chi tiết chuyến của tôi  O29–O31 Khuyến mãi
C17 Blog                       C16 Viết review              O32–O33 Nội dung
C18 Chi tiết bài viết                                       O34 Chính sách hoàn tiền · O39 Đánh giá
A01–A04 Đăng nhập/Đăng ký                                   O35 Cấu hình · O36 Audit · O37 Báo cáo
E01–E12 Màn hình lỗi (mọi khu vực): 404 · 403 · 401 phiên hết hạn · 500 · 502 cổng thanh toán · 503 bảo trì · 429 · mất mạng · tài khoản bị khóa · xung đột 409 · link hết hạn · bộ mẫu lỗi + bảng tra errors.code
```

---

# A. Tài khoản (mọi vai trò)

### A01 · Đăng nhập
- **Route:** `/login` · **Role:** Guest · **FR:** A02, A07
- **Mục đích:** đăng nhập bằng email/mật khẩu hoặc Google.

| Khối | Field UI | DB | Ghi chú |
|---|---|---|---|
| Form | Email | `ACCOUNTS.email` W | Chuẩn hóa chữ thường |
| | Mật khẩu | so với `ACCOUNTS.password_hash` | Không lưu dạng rõ |
| Nút ngoài | "Tiếp tục với Google" | `USER_EXTERNAL_LOGINS.provider`, `provider_subject` | Không tự ghép tài khoản chỉ vì trùng email |
| Link | Quên mật khẩu → A03, Đăng ký → A02 | | |

- **Khi thành công (S):** tạo `REFRESH_TOKENS` (family_id, token_hash, expires_at) + `ACCESS_TOKENS` (jti, expires_at); cập nhật `ACCOUNTS.last_login_at`. Điều hướng theo `ROLES.role_name`: Customer → C01, Staff/Admin → O01, Guide → G01.
- **Trạng thái:** sai thông tin (thông báo chung, không lộ email có tồn tại hay không) · tài khoản bị khóa (`ACCOUNTS.status` = Locked) · chưa xác thực email (`ACCOUNTS.email_confirmed_at` rỗng, nếu bật Q-03) · đang tải.

### A02 · Đăng ký
- **Route:** `/register` · **Role:** Guest · **FR:** A01

| Field UI | DB | Validation |
|---|---|---|
| Họ và tên | `ACCOUNTS.full_name` W | Bắt buộc |
| Email | `ACCOUNTS.email` W | Bắt buộc, đúng định dạng, không trùng (UQ) |
| Số điện thoại | `ACCOUNTS.phone?` W | Tùy chọn |
| Mật khẩu / Nhập lại | → `ACCOUNTS.password_hash` | Độ mạnh tối thiểu |
| (ẩn) Vai trò | `ACCOUNTS.role_id` S = Customer | Khách không được chọn role |
| (ẩn) Mã người dùng | `PROFILES.user_code` S | Sinh tự động, UQ |

- **Ghi:** `ACCOUNTS` (status = Active, created_at) + `PROFILES` (user_id, user_code).
- **Trạng thái:** email đã tồn tại (lỗi gắn đúng trường) · thành công → A01 hoặc tự đăng nhập.

### A03 · Quên mật khẩu
- **Route:** `/forgot-password` · **FR:** A04
- Form: Email → tạo `PASSWORD_RESET_TOKENS` (user_id, token_hash, expires_at) S.
- Màn sau khi gửi: luôn hiện "Nếu email tồn tại, chúng tôi đã gửi link" (không lộ email có tồn tại).

### A04 · Đặt lại mật khẩu
- **Route:** `/reset-password?token=…` · **FR:** A04
- Form: Mật khẩu mới + nhập lại → cập nhật `ACCOUNTS.password_hash`; ghi `PASSWORD_RESET_TOKENS.used_at` S; thu hồi mọi `REFRESH_TOKENS` của user (`revoked_at`, `revoked_reason` = PasswordReset).
- **Trạng thái:** link hết hạn (`expires_at` < now) · link đã dùng (`used_at` có giá trị) → nút "Gửi lại link".

### A05 · Hồ sơ cá nhân
- **Route:** `/account/profile` · **Role:** mọi role đã đăng nhập · **FR:** A03

| Khối | Field UI | DB | Quyền |
|---|---|---|---|
| Ảnh | Avatar | `PROFILES.avatar_url?` | W |
| Cơ bản | Họ tên | `ACCOUNTS.full_name` | W |
| | Email | `ACCOUNTS.email` | R (đổi email là luồng riêng) |
| | Số điện thoại | `ACCOUNTS.phone?` | W |
| | Mã người dùng | `PROFILES.user_code` | R |
| | Vai trò | `ACCOUNTS.role_id → ROLES.role_name` | R |
| Cá nhân | Ngày sinh | `PROFILES.date_of_birth?` | W |
| | Địa chỉ | `PROFILES.address?` | W |
| | Giới thiệu | `PROFILES.bio?` | W |
| Guide | Bắt đầu hành nghề → "X năm kinh nghiệm" | `PROFILES.career_start_date?` | W (chỉ Guide/Staff) |
| Meta | Tham gia từ | `ACCOUNTS.created_at` | R |

- Không cho sửa `role_id`, `status` ở màn này.

### A06 · Bảo mật & phiên đăng nhập
- **Route:** `/account/security` · **FR:** A05, A07

| Khối | Field UI | DB |
|---|---|---|
| Đổi mật khẩu | Mật khẩu hiện tại / mới | `ACCOUNTS.password_hash` (nếu rỗng → hiện "Thiết lập mật khẩu") |
| Phiên đang hoạt động | Phiên, bắt đầu lúc, hết hạn lúc, "Phiên hiện tại" | `REFRESH_TOKENS.created_at`, `expires_at`, lọc `revoked_at` rỗng; nhóm theo `family_id` |
| | Nút "Đăng xuất phiên này" / "Đăng xuất tất cả" | ghi `REFRESH_TOKENS.revoked_at`, `revoked_reason` + `ACCESS_TOKENS.revoked_at` |
| Tài khoản liên kết | Provider, liên kết lúc, nút Gỡ | `USER_EXTERNAL_LOGINS.provider`, `created_at` |
| Lần đăng nhập gần nhất | | `ACCOUNTS.last_login_at?` |

- Không cho gỡ phương thức đăng nhập cuối cùng (khi `password_hash` rỗng và chỉ còn một liên kết ngoài).

### A07 · Trung tâm thông báo
- **Route:** `/notifications` + dropdown chuông ở header · **FR:** O01

| Field UI | DB |
|---|---|
| Icon theo loại | `NOTIFICATIONS.notification_type` |
| Tiêu đề / Nội dung | `title`, `content` |
| Thời gian | `created_at` (dạng "5 phút trước") |
| Chấm chưa đọc / in đậm | `read_at?` rỗng |
| Bấm vào → đi đến | `related_entity_type?` + `related_entity_id?` (Order → C11/C13, Trip → C15, RentalCharge → C13…) |

- **Hành động:** đánh dấu đã đọc (ghi `read_at`), "Đánh dấu tất cả đã đọc". Filter Tất cả / Chưa đọc. Badge chuông = `COUNT(read_at IS NULL)`.
- Chỉ thấy bản ghi có `recipient_user_id` = mình.

---

# C. Khu vực khách hàng

### C01 · Trang chủ / Khám phá
- **Route:** `/` · **Role:** Guest, Customer · **FR:** T06

| Khối | Dữ liệu | DB |
|---|---|---|
| Hero tìm kiếm | Địa điểm, khoảng ngày, số người | `LOCATIONS.name`; lọc `TRIPS.start_at`; số người ≤ chỗ còn |
| Tour nổi bật | Card tour (xem C02) | `TOURS` status = Published |
| Chuyến sắp khởi hành | Tour, ngày, giá/người, chỗ còn | `TRIPS` status = Open, sắp theo `start_at` |
| Thuê nhiều | Card sản phẩm/combo | `PRODUCTS`, `PRODUCT_BUNDLES` đang bán |
| Danh mục | Chip danh mục | `CATEGORIES.name` theo `category_type` |
| Bài hướng dẫn mới | Tiêu đề, loại, ngày đăng | `POSTS` status = Published, sắp `published_at` |

- **Trạng thái:** skeleton khi tải · lỗi kết nối kèm nút Thử lại · khối rỗng thì ẩn khối.

### C02 · Danh sách tour
- **Route:** `/tours` · **FR:** T06

**Card tour**

| Field UI | DB |
|---|---|
| Ảnh | `TOUR_IMAGES.image_url` với `is_primary = 1` |
| Tên tour | `TOURS.name` |
| Danh mục | `TOURS.category_id → CATEGORIES.name` |
| Địa điểm | `TOURS.main_location_id → LOCATIONS.name` |
| Thời lượng | `TOURS.duration_days` ngày `duration_nights` đêm |
| Giá | "Từ" `MIN(TRIPS.price_per_person)` của chuyến Open, nếu không có thì `TOURS.base_price` |
| Khởi hành gần nhất | `MIN(TRIPS.start_at)` với status = Open |
| Đánh giá | `AVG(REVIEWS.rating)` qua `REVIEWS.participant_id → BOOKING_PARTICIPANTS.trip_id → TRIPS.tour_id` (gộp theo `tour_family_id`), kèm số review |

- **Filter:** danh mục (`CATEGORIES`), địa điểm (`LOCATIONS`), số ngày (`duration_days`), khoảng giá, khoảng ngày khởi hành (`TRIPS.start_at`). **Sort:** giá, ngày gần nhất, đánh giá.
- Chỉ hiện `TOURS.status` = Published và bản `version` mới nhất trong `tour_family_id`.
- **Trạng thái:** không có kết quả kèm nút "Xóa bộ lọc" · phân trang/tải thêm.

### C03 · Chi tiết tour
- **Route:** `/tours/:tourId` · **FR:** T01–T06, D01

| Khối | Field UI | DB |
|---|---|---|
| Gallery | Ảnh theo thứ tự | `TOUR_IMAGES.image_url` sắp `display_order` |
| Header | Tên, danh mục, thời lượng, đánh giá | `TOURS.name`, `CATEGORIES.name`, `duration_days/nights`, AVG rating |
| Mô tả | | `TOURS.description?` |
| Địa điểm | Tên, địa chỉ, bản đồ | `LOCATIONS.name`, `address`, `latitude`, `longitude` |
| Lịch trình | Tab "Ngày 1, 2…": giờ · tên · thời lượng · mô tả | `TOUR_ACTIVITIES` nhóm theo `day_number`, sắp `display_order`; `start_time`, `name`, `duration_minutes`, `description?` |
| Cần tự mang | Checklist | `TOUR_PREPARATION_ITEMS.item_name`, `note?` |
| Được cấp sẵn | Tên đồ, số lượng, "mỗi người/mỗi nhóm" | `TOUR_PROVIDED_ITEMS.product_variant_id → PRODUCT_VARIANTS.variant_name`, `quantity`, `quantity_basis`, `note?` |
| Lịch khởi hành | Bảng: ngày đi–về, giá/người, chỗ còn, tối thiểu, trạng thái, nút "Chọn" | `TRIPS.start_at`, `end_at`, `price_per_person`, chỗ còn*, `min_participants`, `status` |
| Chính sách hoàn | "Hủy trước ≥ X giờ: hoàn Y%" | `TRIPS.refund_policy_id → REFUND_POLICY_RULES.min_hours_before`, `refund_percentage` |
| Bài cần đọc | Danh sách bài | `TOUR_POSTS` (sắp `display_order`) `→ POSTS.title`, `post_type` |
| Review | Sao, nội dung, tên viết tắt, ngày | `REVIEWS.rating`, `comment?`, `created_at`; tên từ `BOOKING_PARTICIPANTS.full_name` |

\* **Chỗ còn** = `TRIPS.total_slots − Σ TRIP_BOOKING_ORDERS.participant_count` của các `ORDERS` có status ∈ {PendingPayment (còn hạn `hold_expires_at`), Confirmed, InFulfillment}.

- **Trạng thái:** chuyến hết chỗ (nút disable, nhãn "Hết chỗ") · ClosedForBooking ("Đã đóng bán") · tour Archived nhưng khách có đơn cũ (banner "Tour đã ngừng mở bán", vẫn xem được) · chưa có chuyến ("Sắp có lịch").

### C04 · Checkout tour (4 bước)
- **Route:** `/checkout/tour/:tripId` · **Role:** Customer (Guest → bắt đăng nhập) · **FR:** B01–B04, M03–M05, F01

**Thanh tóm tắt (luôn hiện ở cột bên phải):** tên tour, `TRIPS.start_at–end_at` (GMT+7), số người, Price breakdown, đếm ngược giữ chỗ.

**Bước 1 — Số người & cách chia nhóm**

| Field UI | DB | Validation |
|---|---|---|
| Số người tham gia | `TRIP_BOOKING_ORDERS.participant_count` W | 1 ≤ n ≤ chỗ còn |
| Đơn giá/người | `TRIP_BOOKING_ORDERS.unit_price` S = `TRIPS.price_per_person` lúc chốt | R |
| Mong muốn chia nhóm | `TRIP_BOOKING_ORDERS.grouping_preference` W | "Đi cùng một nhóm" / "Cho phép chia nhóm" |

→ Bấm Tiếp: tạo `ORDERS` (order_type = Tour, status = PendingPayment, payment_status = Unpaid, `hold_expires_at`, `refund_policy_id` = của chuyến, `order_code` S) + `TRIP_BOOKING_ORDERS` (trip_id). Đây là lúc giữ chỗ.

**Bước 2 — Thông tin người tham gia** (lặp n form, có thể thu gọn)

| Field UI | DB | Validation |
|---|---|---|
| ☐ "Đây là tôi" | `BOOKING_PARTICIPANTS.linked_user_id?` = user hiện tại, tự điền tên/email/phone | Tối đa 1 người được tick |
| Họ tên | `full_name` W | Bắt buộc |
| Email | `email?` W | Đúng định dạng nếu nhập |
| Điện thoại | `phone?` W | |
| Ngày sinh | `date_of_birth?` W | Không ở tương lai |
| Người liên hệ khẩn cấp | `emergency_contact_name?` W | |
| SĐT khẩn cấp | `emergency_contact_phone?` W | |
| (ẩn) | `booking_order_id`, `trip_id`, `status` = Active S | |

- Số participant phải khớp `participant_count`.

**Bước 3 — Khuyến mãi**

| Field UI | DB |
|---|---|
| Ô nhập mã | `PROMOTIONS.promotion_code?` |
| Khuyến mãi tự áp dụng | `PROMOTIONS` status = Active, `applies_to` = Tour, trong khoảng `start_at–end_at`, sắp `priority` |
| Bậc đạt được / bậc kế tiếp ("Thêm 1 người để giảm 10%") | `PROMOTION_TIERS.min_threshold`, `qualification_metric`, `discount_type`, `discount_value` |
| Quà thiết bị | `PROMOTION_TIERS.gift_product_variant_id? → PRODUCT_VARIANTS.variant_name`, `gift_quantity?` |

→ Áp dụng: ghi `APPLIED_PROMOTIONS` (order_id, promotion_tier_id, discount_amount, gift…, status = Reserved, applied_at). Nếu có quà: tạo `ASSET_ASSIGNMENTS` (applied_promotion_id, reserved_from/until = thời gian chuyến, status = Reserved).
- **Lỗi:** mã không tồn tại · hết hạn (`end_at`) · hết lượt (`max_uses`) · vượt lượt/người (`max_uses_per_user`) · không cộng dồn (`is_stackable` = 0) · hết thiết bị quà.

**Bước 4 — Xác nhận & thanh toán**

| Khối | Field UI | DB |
|---|---|---|
| Breakdown | n người × đơn giá | `participant_count` × `unit_price` |
| | Tạm tính | `ORDERS.subtotal_amount` |
| | Giảm giá | `ORDERS.discount_amount` = Σ `APPLIED_PROMOTIONS.discount_amount` |
| | **Tổng thanh toán** | `ORDERS.total_amount` |
| Chính sách hoàn | Bảng mốc hoàn tiền | `ORDERS.refund_policy_id → REFUND_POLICY_RULES` |
| Ghi chú | | `ORDERS.note?` W |
| Đồng hồ | "Giữ chỗ còn 09:41" | `ORDERS.hold_expires_at` |
| Thanh toán | Chỉ "Chuyển khoản ngân hàng (VietQR)" | `PAYMENTS.payment_method` = BankTransfer |

→ "Thanh toán": `POST /orders/{orderId}/payments` (Idempotency-Key) tạo `PAYMENTS` (order_id, payment_type = Collection, purpose = TourFee, payment_method = BankTransfer, amount = total_amount, status = Pending, provider_order_id = VA order SePay) → chuyển **C04P**.
- **Lỗi thêm:** `PAYMENT_PROVIDER_ERROR` (502, thử lại cùng Idempotency-Key) · `REFUND_POLICY_CHANGED` (đồng ý lại) · `PROMOTION_INVALID` / `PROMOTION_EXHAUSTED` (xác nhận tổng mới).
- **Trạng thái:** giá chuyến đã đổi so với lúc chọn (yêu cầu xác nhận lại) · hết chỗ khi xác nhận · hết hạn giữ chỗ (`ORDERS.status` = Expired → nút "Đặt lại") · ☐ đồng ý chính sách bắt buộc.

### C05 · Kết quả thanh toán
- **Route:** `/checkout/result/:orderCode` · **FR:** F02, F09 · **API:** 6.2

| Field UI | DB |
|---|---|
| Mã đơn | `ORDERS.order_code` |
| Trạng thái đơn | `ORDERS.status` |
| Trạng thái thanh toán | `ORDERS.payment_status` — nhãn FE "Đang xác minh" khi `Unpaid` và có dòng thu `Pending` |
| Giao dịch | `PAYMENTS.status`, `amount`, `received_amount?` (số tiền đã nhận), `payment_method` = BankTransfer ("Chuyển khoản (VietQR)"), `provider_transaction_id?` (mã giao dịch SePay), `failure_reason?` |

- **5 biến thể:** Đang xác minh (poll 6.2 — KHÔNG coi redirect là đã trả) · Thành công (Succeeded → Order Confirmed, Paid) · Thất bại (hiện `failure_reason`, "Thanh toán lại" → C04P khi còn hạn) · Hết hạn (Expired → "Đặt lại" về C03) · Cần đối soát (NeedsReconciliation: đã nhận X ₫ khác số cần trả / đến muộn → nhân viên liên hệ trong 24 giờ, **không chuyển lại**).
- Chuyển thiếu: theo contract đơn hết hạn (`Expired`) và tiền đã nhận được hoàn sau khi Admin duyệt; chuyển thừa / đến muộn: đơn còn `PendingPayment` chờ Admin xử lý ở O28.
- CTA: Xem đơn (C11/C13), Về trang chủ.

### C04P · Thanh toán chuyển khoản (VietQR) — MỚI
- **Route:** `/checkout/pay/:orderCode` · **Role:** Customer · **FR:** F01–F03 · **API:** 6.1 (response), 6.2 (poll 5 giây) · Dùng chung cho đơn tour (TourFee), đơn thuê (RentalFee) và thu phí phát sinh (AdditionalCharge).

| Khối | Field UI | Nguồn |
|---|---|---|
| Tóm tắt đơn | Mã đơn, dịch vụ, tổng tiền | `ORDERS.order_code`, `total_amount` |
| QR | Ảnh VietQR | `bankTransfer.qrImageUrl` |
| Ngân hàng | | `bankTransfer.bankName` |
| Số tài khoản (VA) | + nút Sao chép | `bankTransfer.accountNumber` (VA do SePay cấp cho lần thanh toán này) |
| Chủ tài khoản | | `bankTransfer.accountName` |
| Số tiền | + nút Sao chép | `amount` (= `PAYMENTS.amount`) |
| Nội dung chuyển khoản | + nút Sao chép, nhấn mạnh phải ghi đúng | `bankTransfer.transferContent` = paymentId 32 ký tự hex viết hoa |
| Đồng hồ | Đếm ngược | `expiresAt` = `ORDERS.hold_expires_at` |

- **Trạng thái:** Đang chờ chuyển khoản · Sắp hết hạn (< 2 phút) · Đã nhận tiền → C05 thành công · Hết hạn (`HOLD_EXPIRED` → "Đặt lại") · Lỗi tạo VA (`PAYMENT_PROVIDER_ERROR`, thử lại an toàn) · Sai số tiền / đến muộn → "Đang xác minh, nhân viên liên hệ trong 24 giờ, không chuyển lại" (NeedsReconciliation).
- Hệ thống tự xác nhận qua webhook SePay + gọi lại SePay kiểm tra VA order; không cần khách chụp màn hình.

### C06 · Danh mục thuê thiết bị
- **Route:** `/rentals` · **FR:** P01, P06

| Khối | Field UI | DB |
|---|---|---|
| Tab | "Thiết bị lẻ" / "Combo" | `PRODUCTS` / `PRODUCT_BUNDLES` |
| Card | Ảnh | `PRODUCT_VARIANT_IMAGES.image_url` (`is_primary`) của variant đầu tiên; combo dùng ảnh của thành phần đầu |
| | Tên | `PRODUCTS.name` / `PRODUCT_BUNDLES.name` |
| | Danh mục | `CATEGORIES.name` |
| | Giá từ | `MIN(RENTAL_PRICE_TIERS.daily_price)` theo `product_variant_id` hoặc `bundle_id` + "/ngày" |
| | Số tùy chọn | `COUNT(PRODUCT_VARIANTS)` ("3 size · 2 màu") |
| Filter | Danh mục, khoảng ngày thuê, size, màu | `CATEGORIES`, khả dụng*, `PRODUCT_VARIANTS.size?`, `color?` |

\* **Khả dụng** của variant trong [start, end] = `COUNT(EQUIPMENT_ASSETS` có `asset_status` = Available và **không** có `ASSET_ASSIGNMENTS` status ∈ {Reserved, Issued} giao với khoảng `reserved_from–reserved_until`).

### C07 · Chi tiết sản phẩm thuê
- **Route:** `/rentals/products/:productId` · **FR:** P03, P05, P06, R01

| Khối | Field UI | DB |
|---|---|---|
| Gallery | Ảnh của variant đang chọn | `PRODUCT_VARIANT_IMAGES` theo `product_variant_id`, `display_order` |
| Thông tin | Tên, mô tả | `PRODUCTS.name`, `description?` |
| Chọn variant | Size, màu, tên biến thể | `PRODUCT_VARIANTS.size?`, `color?`, `variant_name`; hiện `sku` nhỏ |
| Bảng giá | "1–2 ngày: 80.000 ₫/ngày · 3–5 ngày: 65.000 ₫…" | `RENTAL_PRICE_TIERS.min_days`, `max_days?` (rỗng = "trở lên"), `daily_price` |
| Chọn ngày | Nhận – Trả | → `RENTAL_ORDERS.rental_start_at`, `rental_end_at` |
| Số lượng | Stepper | → `RENTAL_ORDER_ITEMS.quantity` (≤ khả dụng) |
| Khả dụng | "Còn 4 thiết bị trong khoảng này" | công thức ở C06 |
| Giá tạm | số ngày × đơn giá bậc × số lượng | `billable_days`, `daily_price`, `line_amount` (giá trị tạm) |
| CTA | "Thêm vào giỏ thuê" | |

- **Trạng thái:** chưa chọn ngày (ẩn khả dụng, nhắc chọn ngày) · hết hàng trong khoảng (gợi ý ngày khác) · variant chưa có bậc giá (nút disable, "Liên hệ") · variant ngừng bán (`status`).

### C08 · Chi tiết combo
- **Route:** `/rentals/bundles/:bundleId` · **FR:** P04, R02

| Khối | Field UI | DB |
|---|---|---|
| Header | Tên, mô tả, danh mục | `PRODUCT_BUNDLES.name`, `description?`, `CATEGORIES.name` |
| Thành phần | Ảnh, tên variant, size/màu, × số lượng | `PRODUCT_BUNDLE_ITEMS.product_variant_id → PRODUCT_VARIANTS`, `quantity` |
| Bảng giá | Theo bậc ngày | `RENTAL_PRICE_TIERS` với `bundle_id` |
| Khả dụng | Số combo còn = MIN theo thành phần (khả dụng variant ÷ quantity) | suy ra |
| Thiếu | "Thiếu: Lều 2 người" | thành phần có khả dụng < quantity |

### C09 · Giỏ & Checkout thuê
- **Route:** `/checkout/rental` · **Role:** Customer · **FR:** R01–R04, M03 · **API:** 4.6, 5.1, 5.2 → 6.1

| Khối | Field UI | DB |
|---|---|---|
| Thời gian thuê | Nhận – Trả (áp cho cả đơn) | `RENTAL_ORDERS.rental_start_at`, `rental_end_at` |
| Dòng thuê | Ảnh, tên (variant hoặc combo), số lượng | `RENTAL_ORDER_ITEMS.product_variant_id?` XOR `bundle_id?`, `quantity` |
| | Số ngày tính tiền | `RENTAL_ORDER_ITEMS.billable_days` S = max(1, ceil(giờ / 24)) |
| | Đơn giá/ngày | `RENTAL_ORDER_ITEMS.daily_price` S (theo bậc) |
| | Thành tiền | `RENTAL_ORDER_ITEMS.line_amount` = quantity × daily_price × billable_days |
| | Thành phần combo (thu gọn) | lúc chốt ghi `RENTAL_BUNDLE_ITEM_SNAPSHOTS` (product_variant_id, quantity_per_bundle) |
| Khuyến mãi | Như C04 bước 3; có thể áp cho từng dòng | `APPLIED_PROMOTIONS.rental_order_item_id?` |
| Tổng | Tạm tính / Giảm giá / Tiền thuê | `ORDERS.subtotal_amount`, `discount_amount`, `total_amount` |
| | Cần thanh toán hôm nay | = `total_amount` (**chưa thu cọc ở bản này**, `RENTAL_ORDERS.deposit_amount` = 0, D-1) |
| Chính sách | Hoàn tiền + điều kiện nhận/trả; phải tick đồng ý phiên bản đang hiển thị | `ORDERS.refund_policy_id → REFUND_POLICIES.description?` + `REFUND_POLICY_RULES` |
| Ghi chú | | `ORDERS.note?` |
| Thanh toán | Chỉ "Chuyển khoản ngân hàng (VietQR)" | `PAYMENTS.payment_method` = BankTransfer |

- **Ghi:** `POST /rental-orders` (Idempotency-Key) → `ORDERS` (order_type = Rental) + `RENTAL_ORDERS` + `RENTAL_ORDER_ITEMS` + `ASSET_ASSIGNMENTS` (rental_order_item_id, Reserved) → `POST /orders/{orderId}/payments` → `PAYMENTS` (Collection, purpose RentalFee, Pending) → chuyển **C04P**.
- Phí trả trễ / hỏng / mất về sau được thu bằng một lần thanh toán bổ sung (`PAYMENTS` purpose AdditionalCharge), không trừ cọc.
- **Trạng thái lỗi:** `RESOURCE_UNAVAILABLE` (đánh dấu đỏ dòng thiếu) · `PROMOTION_INVALID` / `PROMOTION_EXHAUSTED` (hiện tổng mới) · `REFUND_POLICY_CHANGED` (đồng ý lại) · `PRICE_TIER_NOT_FOUND` (không hiện 0 ₫) · `INVALID_RENTAL_PERIOD` (lỗi ở ô ngày) · `PAYMENT_PROVIDER_ERROR` (đơn đã tạo, thử thanh toán lại) · giỏ trống.

### C10 · Đơn của tôi
- **Route:** `/account/orders` · **FR:** B06, F09

| Field UI | DB |
|---|---|
| Mã đơn | `ORDERS.order_code` |
| Loại | `ORDERS.order_type` (icon Tour / Thuê) |
| Dịch vụ | Tour: `TRIP_BOOKING_ORDERS.trip_id → TOURS.name` + ngày; Thuê: số món + `rental_start_at–rental_end_at` |
| Ngày đặt | `ORDERS.created_at` |
| Tổng tiền | `ORDERS.total_amount` |
| Badge 1 — Đơn | `ORDERS.status` |
| Badge 2 — Thanh toán | `ORDERS.payment_status` |

- **Tabs:** Tất cả / Tour / Thuê. **Filter:** trạng thái, khoảng ngày. Tìm theo mã đơn.
- Chỉ hiện `ORDERS.customer_user_id` = mình.
- **Trạng thái đặc biệt:** "Đã hủy · Đang hoàn tiền" (status Cancelled + có Refund Pending) · "Chờ thanh toán" kèm đếm ngược và nút "Thanh toán ngay".

### C11 · Chi tiết đơn tour
- **Route:** `/account/orders/:orderCode` (order_type = Tour) · **FR:** B06, B07, F06, F09

| Khối | Field UI | DB |
|---|---|---|
| Header | Mã đơn, 2 badge, ngày đặt | `ORDERS.order_code`, `status`, `payment_status`, `created_at` |
| Timeline đơn | Draft → PendingPayment → Confirmed → InFulfillment → Completed | `ORDERS.status` (+ `cancelled_at?`) |
| Chuyến | Tour, ngày đi–về, điểm tập trung | `TRIPS.tour_id → TOURS.name`, `TRIPS.start_at`, `end_at`, `LOCATIONS.address` |
| Người tham gia | Họ tên, SĐT, nhóm, liên kết tài khoản | `BOOKING_PARTICIPANTS.full_name`, `phone?`, `trip_group_id? → TRIP_GROUPS.group_name` (rỗng = "Chưa xếp nhóm"), `linked_user_id?` |
| | Nút sửa thông tin (khi được phép) | W các field của participant |
| Thanh toán | Breakdown | `participant_count`, `unit_price`, `subtotal_amount`, `discount_amount`, `total_amount` |
| Khuyến mãi | Tên, giảm, quà | `APPLIED_PROMOTIONS → PROMOTION_TIERS → PROMOTIONS.name`, `discount_amount`, `gift_quantity?` |
| Giao dịch | Loại, số tiền, phương thức, trạng thái, thời gian | `PAYMENTS.payment_type`, `purpose`, `amount`, `payment_method`, `status`, `processed_at?` |
| Hủy | Lý do, thời điểm | `ORDERS.cancel_reason?`, `cancelled_at?` |
| CTA | Thanh toán · Yêu cầu hủy (→ C12) · Xem chuyến (→ C15) | |

### C12 · Yêu cầu hủy đơn (modal)
- **Mở từ:** C11 (biến thể Đơn tour, API 7.1 → 7.2), C13 (biến thể Đơn thuê, API 5.5 → 5.6, chỉ khi chưa có assignment Issued) · **FR:** B07, F05, F06

| Field UI | DB |
|---|---|
| Thời gian còn lại đến khởi hành/nhận đồ | `TRIPS.start_at` hoặc `RENTAL_ORDERS.rental_start_at` − now |
| Mốc chính sách đang áp dụng (highlight) | `REFUND_POLICY_RULES` có `min_hours_before` lớn nhất ≤ số giờ còn lại |
| Đã thanh toán | Σ `PAYMENTS.amount` (Collection, Succeeded) |
| Dự kiến hoàn | Đã thanh toán × `refund_percentage` (ghi chú "Admin duyệt trước khi hoàn; tiền về đúng tài khoản đã chuyển khoản") |
| Lý do hủy | `ORDERS.cancel_reason` W (bắt buộc, 5–500 ký tự) |

- **Xác nhận (S):** `ORDERS.status` = Cancelled, `cancelled_at`; tạo `PAYMENTS` Refund (original_payment_id, refund_policy_rule_id, status = **PendingApproval**); giải phóng `ASSET_ASSIGNMENTS` còn Reserved; `APPLIED_PROMOTIONS.status` = Reversed. Đơn chưa thu tiền → chỉ hủy, không tạo dòng hoàn.
- **Lỗi:** `ORDER_NOT_CANCELLABLE` (ẩn nút, nêu lý do) · `REFUND_AMOUNT_CHANGED` (tải lại preview, hiện số mới) · `REFUND_POLICY_CHANGED` (đồng ý lại).
- Nút xác nhận màu đỏ, hiện rõ "Bạn sẽ được hoàn X ₫ / mất Y ₫".

### C13 · Chi tiết đơn thuê
- **Route:** `/account/orders/:orderCode` (order_type = Rental) · **FR:** R06–R08, C02–C04, C06 · **API:** 5.4–5.7

| Khối | Field UI | DB |
|---|---|---|
| Header | Mã đơn, 2 badge | như C11 |
| Thời gian | Nhận – Trả, quá hạn bao lâu | `RENTAL_ORDERS.rental_start_at`, `rental_end_at` |
| Người phụ trách | | `RENTAL_ORDERS.handled_by_user_id? → ACCOUNTS.full_name` |
| Dòng thuê | Tên, số lượng, số ngày, đơn giá, thành tiền | `RENTAL_ORDER_ITEMS.*` |
| | Combo: thành phần đã chốt | `RENTAL_BUNDLE_ITEM_SNAPSHOTS.product_variant_id`, `quantity_per_bundle` |
| Thiết bị đã giao | Mã thiết bị, giao lúc, trả lúc, tình trạng khi trả | `ASSET_ASSIGNMENTS → EQUIPMENT_ASSETS.asset_code`, `assigned_at`, `returned_at?`, `return_condition?` (Normal Bình thường / Damaged Hư hỏng / MissingAccessory Thiếu phụ kiện / Lost Mất), `status` (LostOrException = "Mất / ngoại lệ") |
| | Tiến độ trả "3/5 đã trả" | COUNT theo status |
| Phí phát sinh | Loại, thiết bị, số tiền, lý do, trạng thái | `RENTAL_CHARGES.charge_type` (LateReturn / Damage / Loss / Other), `equipment_asset_id? → asset_code`, `amount`, `reason`, `status` (không hiện Draft cho khách; Voided gạch ngang) |
| Phí cần thanh toán | Σ phí Assessed chưa Settled → nút "Thanh toán phí" | → `PAYMENTS` Collection purpose AdditionalCharge → C04P |
| Giao dịch | như C11 | `PAYMENTS` (RentalFee, AdditionalCharge, Refund) |
| CTA | Yêu cầu hủy (khi chưa nhận đồ → C12) · Yêu cầu kiểm tra lại phí (API 5.7) | |

- **Chưa thu cọc ở bản này** — không có khối quyết toán cọc.
- **Trạng thái:** trả một phần · quá hạn trả (đỏ, ước tính phí trễ) · phí đang được xem xét lại · `CHARGE_NOT_REVIEWABLE` (ẩn nút) · đang xác minh thanh toán phí · đã hủy · chờ duyệt hoàn.
- ⚠ DB chưa có bảng `charge_review_requests` (D-4) — "Yêu cầu kiểm tra lại phí" là placeholder.

### C14 · Chuyến của tôi
- **Route:** `/account/trips` · **FR:** B05, N05

| Field UI | DB |
|---|---|
| Tour, ngày đi | `BOOKING_PARTICIPANTS.trip_id → TRIPS.start_at`, `TOURS.name` |
| Ảnh | `TOUR_IMAGES` primary |
| Trạng thái chuyến | `TRIPS.status` |
| Nhóm | `BOOKING_PARTICIPANTS.trip_group_id? → TRIP_GROUPS.group_name` |
| Người đặt | `BOOKING_PARTICIPANTS.booking_order_id → ORDERS.customer_user_id → ACCOUNTS.full_name` ("Đặt bởi Minh") |
| Tiến độ chuẩn bị | "Đã đọc 2/4 bài" |

- **Nguồn:** `BOOKING_PARTICIPANTS.linked_user_id` = mình (kể cả do người khác đặt hộ).
- **Tabs:** Sắp tới / Đã đi / Đã hủy.
- **Trạng thái:** có đơn đặt cho người khác nhưng chưa liên kết tài khoản → card "Mời người tham gia liên kết tài khoản".

### C15 · Chi tiết chuyến của tôi
- **Route:** `/account/trips/:participantId` · **FR:** N03–N05, V04

| Khối | Field UI | DB |
|---|---|---|
| Header | Tour, ngày, trạng thái | `TOURS.name`, `TRIPS.start_at/end_at`, `TRIPS.status` |
| Nhóm & Guide | Tên nhóm, guide, ảnh, kinh nghiệm | `TRIP_GROUPS.group_name`, `guide_user_id → ACCOUNTS.full_name`, `PROFILES.avatar_url?`, `career_start_date?` |
| Lịch trình | như C03 | `TOUR_ACTIVITIES` (theo tour version của chuyến) |
| Checklist tự mang | Tick cá nhân (chỉ lưu ở trình duyệt) | `TOUR_PREPARATION_ITEMS` |
| Được cấp | Tên đồ, số lượng | `TRIP_PROVIDED_ITEMS → PRODUCT_VARIANTS.variant_name`, `required_quantity` |
| Bài cần đọc | Tiêu đề, ✓ đã đọc | `TOUR_POSTS → POSTS`; đã đọc = có `PARTICIPANT_POST_READS` (participant_id, post_id) |
| Điểm danh của tôi | Hoạt động, có mặt/vắng | `ACTIVITY_ATTENDANCES.attendance_status` |
| Review | Nút "Viết đánh giá" → C16 | |

- Mở bài → C18, ghi `PARTICIPANT_POST_READS.read_at` (không tạo trùng).

### C16 · Viết / sửa đánh giá
- **Route:** `/account/trips/:participantId/review` · **FR:** V04–V06

| Field UI | DB | Validation |
|---|---|---|
| Số sao | `REVIEWS.rating` W | 1–5, bắt buộc |
| Nhận xét | `REVIEWS.comment?` W | |
| (ẩn) | `REVIEWS.participant_id` S (UQ) | 1 participant = 1 review |

- **Điều kiện hiện form:** `TRIPS.status` = Completed **và** `ORDERS.payment_status` = Paid **và** participant thuộc tài khoản.
- **Trạng thái:** chuyến chưa xong · đơn chưa thanh toán · không phải participant của bạn · đã review → hiện review + nút Sửa (`updated_at`).

### C17 · Blog / Hướng dẫn
- **Route:** `/guides` · **FR:** N01, N02

| Field UI | DB |
|---|---|
| Tiêu đề | `POSTS.title` |
| Loại bài | `POSTS.post_type` |
| Ngày đăng | `POSTS.published_at?` |
| Tác giả | `POSTS.created_by_user_id → ACCOUNTS.full_name` |
| Tag | `POST_TAGS → TAGS.name` |
| Kỹ năng | `POST_SOFT_SKILLS → SOFT_SKILLS.name` |

- **Filter:** loại bài, tag (`TAGS.slug`), kỹ năng. Chỉ status = Published.

### C18 · Chi tiết bài viết
- **Route:** `/guides/:slug` (`POSTS.slug`)
- Nội dung: `POSTS.content` (rich text đã làm sạch), tag, kỹ năng, tour liên quan (`TOUR_POSTS → TOURS`), bài cùng tag.
- Nếu người xem là participant của chuyến có gắn bài này → ghi `PARTICIPANT_POST_READS` và hiện "✓ Đã đọc".

### C19 · Nhận lời mời tham gia — MỚI
- **Route:** `/invite/:token` · **Role:** Guest → Customer · **FR:** B05 (Q-16, PRD §3.3)
- Chưa đăng nhập → A01/A02 rồi quay lại. Hiện chuyến (tour, ngày, người đặt, mã đơn) và participant đã được khai (họ tên, email/SĐT che một phần).
- "Đúng, đây là tôi" → `BOOKING_PARTICIPANTS.linked_user_id` = mình + `AUDIT_LOGS` → C15. "Không phải tôi" → thoát.
- **Trạng thái:** hợp lệ · chưa đăng nhập · link hết hạn · link đã dùng · participant đã liên kết tài khoản khác · tài khoản đã là participant khác của cùng chuyến (giả định, cần chốt) · email không khớp (cảnh báo, phải tick xác nhận; không tự ghép theo email) · chuyến đã hủy.
- C14 có danh sách participant chưa liên kết → "Gửi lời mời" / "Gửi lại" / "Sao chép link mời".
- ⚠ DB chưa có bảng lời mời — đề xuất `participant_invitations` (participant_id, token_hash, sent_to, expires_at, used_at, created_by_user_id).

---

# O. Khu vực vận hành (Staff / Admin)

> Layout chung: sidebar + topbar (tìm kiếm toàn cục: `ORDERS.order_code`, `EQUIPMENT_ASSETS.asset_code`, `PRODUCT_VARIANTS.sku`, `ACCOUNTS.email`). Bảng có sort, filter, phân trang, ẩn/hiện cột, xuất CSV (FR-O06). Bấm vào dòng → drawer chi tiết (có `created_at`, `updated_at`).
> Staff chỉ thấy dữ liệu được giao (`TRIPS.managed_by_user_id`, `RENTAL_ORDERS.handled_by_user_id`); Admin thấy toàn bộ.

### O01 · Dashboard
- **Route:** `/ops` · **FR:** O04

| Widget | Công thức (bấm vào → danh sách đã lọc) |
|---|---|
| Đơn chờ thanh toán sắp hết hạn | `ORDERS` status = PendingPayment, `hold_expires_at` < now + 15 phút |
| Chuyến khởi hành trong 7 ngày | `TRIPS.start_at` ∈ [now, now+7d], kèm cờ cảnh báo |
| — chưa xếp nhóm | `COUNT(BOOKING_PARTICIPANTS` có `trip_group_id` rỗng) |
| — thiếu đồ cấp | `TRIP_PROVIDED_ITEMS.status` = Missing |
| — chưa đủ người tối thiểu | đã bán < `TRIPS.min_participants` |
| Thiết bị quá hạn trả | `ASSET_ASSIGNMENTS.status` = Issued và `reserved_until` < now |
| Hoàn tiền chờ duyệt | `PAYMENTS` Refund, status = PendingApproval |
| Hoàn tiền thất bại | `PAYMENTS` Refund, status = Failed, chưa thử lại / chưa hoàn thủ công |
| Cần đối soát | `ORDERS.payment_status` = NeedsReconciliation, kèm đồng hồ tới `reconciliation_deadline_at` |
| Phí chờ chốt | `RENTAL_CHARGES.status` = Draft |
| KPI | Booking tuần (COUNT `ORDERS` Tour), tỉ lệ lấp chỗ, doanh thu (Σ PAYMENTS Collection Succeeded theo `received_amount` − Refund Succeeded), thiết bị đang cho thuê |

### O02 · Người dùng — danh sách
- **Route:** `/ops/users` · **Role:** Admin · **FR:** A06

| Cột | DB |
|---|---|
| Họ tên + avatar | `ACCOUNTS.full_name`, `PROFILES.avatar_url?` |
| Mã | `PROFILES.user_code` |
| Email / SĐT | `ACCOUNTS.email`, `phone?` |
| Vai trò | `ACCOUNTS.role_id → ROLES.role_name` |
| Trạng thái | `ACCOUNTS.status` |
| Đăng nhập gần nhất | `ACCOUNTS.last_login_at?` |
| Ngày tạo | `ACCOUNTS.created_at` |

- **Filter:** vai trò, trạng thái. **Nút:** "Tạo tài khoản Staff/Guide".

### O03 · Người dùng — chi tiết
- **Route:** `/ops/users/:userId` · **Role:** Admin
- **Tab Hồ sơ:** toàn bộ field A05 (Admin sửa được).
- **Tab Quyền:** đổi vai trò (`ACCOUNTS.role_id`, chọn từ `ROLES`), khóa/mở khóa (`ACCOUNTS.status`) → modal lý do, ghi `AUDIT_LOGS`; khi khóa thì thu hồi toàn bộ `REFRESH_TOKENS`.
- **Tab Phiên:** `REFRESH_TOKENS` (created_at, expires_at, revoked_at?, revoked_reason?, replaced_by_refresh_token_id? → chuỗi rotation), nút "Thu hồi".
- **Tab Liên kết ngoài:** `USER_EXTERNAL_LOGINS`.
- **Tab Hoạt động:** `AUDIT_LOGS` với `actor_user_id` = user này hoặc `entity_id` = user này.
- **Tab theo vai trò:** Customer → đơn (`ORDERS.customer_user_id`); Guide → nhóm đã dẫn (`TRIP_GROUPS.guide_user_id`); Staff → chuyến điều phối (`TRIPS.managed_by_user_id`).

### O04 · Danh mục & Địa điểm
- **Route:** `/ops/catalog` · **Role:** Admin
- **Tab Danh mục:** `CATEGORIES` — name, `category_type` (Tour / Equipment / Bundle), description?, status. Ẩn bằng `is_deleted`.
- **Tab Địa điểm:** `LOCATIONS` — name, address, map picker → `latitude`, `longitude`; cột "Số tour dùng" = COUNT `TOURS.main_location_id`.

### O05 · Tour — danh sách
- **Route:** `/ops/tours` · **Role:** Admin (Staff xem) · **FR:** T01, T06

| Cột | DB |
|---|---|
| Ảnh + Tên | `TOUR_IMAGES` primary, `TOURS.name` |
| Danh mục | `CATEGORIES.name` |
| Địa điểm | `LOCATIONS.name` |
| Thời lượng | `duration_days`N`duration_nights`Đ |
| Giá cơ sở | `TOURS.base_price` |
| Phiên bản | `TOURS.version` (+ 🔒 nếu `itinerary_locked_at` có giá trị) |
| Trạng thái | `TOURS.status` |
| Số chuyến sắp tới | COUNT `TRIPS` start_at > now |

- Mặc định chỉ hiện version mới nhất của mỗi `tour_family_id`.

### O06 · Tour — trình chỉnh sửa (tab)
- **Route:** `/ops/tours/:tourId` · **Role:** Admin · **FR:** T01–T05, N03

| Tab | Field | DB |
|---|---|---|
| Thông tin chung | Tên, danh mục, địa điểm chính, mô tả, số ngày, số đêm, tổng phút, giá cơ sở, trạng thái | `TOURS.name`, `category_id`, `main_location_id`, `description?`, `duration_days`, `duration_nights`, `duration_minutes`, `base_price`, `status` |
| Ảnh | Upload, kéo sắp xếp, đặt ảnh đại diện | `TOUR_IMAGES.image_url`, `display_order`, `is_primary` (tối đa 1) |
| Lịch trình | Builder theo cột "Ngày 1…N"; mỗi thẻ: tên, giờ bắt đầu, thời lượng, mô tả; kéo thả | `TOUR_ACTIVITIES.day_number` (≤ duration_days), `start_time`, `duration_minutes`, `name`, `description?`, `display_order` |
| Đồ tự mang | Danh sách sửa trực tiếp | `TOUR_PREPARATION_ITEMS.item_name`, `note?` |
| Đồ được cấp | Chọn variant (tìm theo sku/tên), số lượng, cơ sở tính (Mỗi người / Mỗi nhóm / Mỗi chuyến), ghi chú | `TOUR_PROVIDED_ITEMS.product_variant_id`, `quantity`, `quantity_basis`, `note?` |
| Bài viết | Chọn bài, sắp thứ tự | `TOUR_POSTS.post_id`, `display_order` |
| Lịch lặp | → O08 | |
| Chuyến | Danh sách `TRIPS` của tour | |

- **Khóa:** nếu `itinerary_locked_at` có giá trị → tab Lịch trình / Đồ được cấp ở chế độ chỉ đọc + banner "Lịch trình đã khóa do có chuyến đã bán. [Tạo phiên bản mới]".
- **Header:** `created_by_user_id → ACCOUNTS.full_name`, `created_at`, `updated_at`. Nút Xuất bản / Lưu trữ.

### O07 · Tour — lịch sử phiên bản
- **Mở từ:** O06 (drawer) · **FR:** T05
- Liệt kê `TOURS` cùng `tour_family_id`: `version`, `status`, `itinerary_locked_at?`, `created_at`, số chuyến dùng version đó.
- **"Tạo phiên bản mới":** sao chép TOURS + ACTIVITIES + PREPARATION + PROVIDED + IMAGES → `version` + 1, status = Draft. Có view so sánh 2 phiên bản (diff lịch trình).

### O08 · Lịch lặp chuyến
- **Route:** `/ops/tours/:tourId/recurrence` · **Role:** Admin/Staff · **FR:** D03

| Field | DB |
|---|---|
| Tần suất | `TOUR_RECURRENCE_RULES.frequency` (Hằng ngày / Hằng tuần / Hằng tháng) |
| Lặp mỗi | `interval_value` |
| Các thứ trong tuần | `days_of_week?` (chip T2…CN, khi Hằng tuần) |
| Giờ khởi hành | `start_time` |
| Hiệu lực | `start_date` – `end_date` |
| Số chỗ mặc định | `default_total_slots` |
| Giá mặc định/người | `default_price` |
| Bật | `is_active` |

- **Preview:** calendar các ngày sẽ sinh chuyến; ngày đã có `TRIPS.recurrence_rule_id` = rule này đánh dấu "Đã tạo" (không tạo trùng). Ghi chú: sửa rule không đổi chuyến đã tạo.

### O09 · Chuyến — danh sách / lịch
- **Route:** `/ops/trips` · **FR:** D01, D02, O05
- **View Calendar** (tháng/tuần): mỗi chuyến là một block màu theo `TRIPS.status`.
- **View Bảng:**

| Cột | DB |
|---|---|
| Tour (version) | `TRIPS.tour_id → TOURS.name`, `version` |
| Khởi hành – Kết thúc | `start_at`, `end_at` |
| Đã bán / Sức chứa | Σ participant_count / `total_slots` (thanh tiến độ) |
| Tối thiểu | `min_participants` (cảnh báo nếu chưa đủ) |
| Giá/người | `price_per_person` |
| Điều phối | `managed_by_user_id → ACCOUNTS.full_name` |
| Nguồn | "Lịch lặp" nếu có `recurrence_rule_id?`, ngược lại "Thủ công" |
| Trạng thái | `TRIPS.status` |

- **Nút "Tạo chuyến thủ công":** form tour (version Published), start_at, end_at, total_slots, price_per_person, min_participants, refund_policy_id (chính sách Active), managed_by_user_id. Validate: end > start, min ≤ total.

### O10 · Chuyến — Tổng quan & trạng thái
- **Route:** `/ops/trips/:tripId` (tab 1) · **FR:** D04, D07, D08
- **Header:** tên tour, ngày, badge trạng thái, nút chuyển trạng thái hợp lệ theo §7.2:
  - Draft → **Mở bán** · Open → **Đóng bán** · ClosedForBooking → **Bắt đầu chuyến** · InProgress → **Hoàn thành** · Open/Closed → **Hủy chuyến** (modal: lý do, số booking bị ảnh hưởng, tổng tiền cần hoàn, thiết bị cần giải phóng).
- **Thông tin (sửa được khi chưa bán):** các field TRIPS như O09; `total_slots` không được < số chỗ đã cam kết; `row_version` dùng để chống ghi đè (báo "Dữ liệu đã bị người khác thay đổi").
- **Checklist sẵn sàng khởi hành (FR-D07):**
  - ✓/✗ Số người ≥ `min_participants`
  - ✓/✗ Mọi participant đã xếp nhóm (`trip_group_id` không rỗng)
  - ✓/✗ Mỗi nhóm có guide (`TRIP_GROUPS.guide_user_id`)
  - ✓/✗ Đồ cấp đã đủ (`TRIP_PROVIDED_ITEMS.status` = Ready hết)
  - ✓/✗ Đơn đã thanh toán (`ORDERS.payment_status` = Paid)
- **Tabs con:** Booking (O11) · Chia nhóm (O12) · Đồ cấp (O13) · Điểm danh (O14) · Lịch trình (chỉ đọc theo version) · Lịch sử (`AUDIT_LOGS` entity = Trip).

### O11 · Chuyến — Booking & Participant
- **Route:** `/ops/trips/:tripId/bookings` · **FR:** B06, O05, O06
- **Bảng booking:**

| Cột | DB |
|---|---|
| Mã đơn | `ORDERS.order_code` |
| Người đặt | `ORDERS.customer_user_id → ACCOUNTS.full_name`, `email` |
| Số người | `TRIP_BOOKING_ORDERS.participant_count` |
| Đơn giá | `unit_price` |
| Mong muốn nhóm | `grouping_preference` |
| Đã tách nhóm | `is_split` (+ tooltip `split_reason?`, `split_at`, người duyệt `split_approved_by_user_id`) |
| Trạng thái / Thanh toán | `ORDERS.status`, `payment_status` |

- **Mở rộng dòng → participants:** `full_name`, `phone?`, `email?`, `date_of_birth?` (tuổi), `emergency_contact_name?/phone?`, nhóm, `linked_user_id?` (có/không tài khoản), `status`.
- **Xuất manifest** (FR-O06): danh sách participant theo nhóm.

### O12 · Chuyến — Chia nhóm (Kanban)
- **Route:** `/ops/trips/:tripId/groups` · **FR:** D05, D06
- **Cột "Chưa xếp nhóm":** `BOOKING_PARTICIPANTS` có `trip_group_id` rỗng; thẻ participant gom theo booking (viền màu theo `order_code`).
- **Mỗi cột nhóm:**

| Field | DB |
|---|---|
| Tên nhóm | `TRIP_GROUPS.group_name` (không trùng trong chuyến) |
| Guide | `guide_user_id → ACCOUNTS.full_name` (chọn từ user role Guide; cảnh báo nếu guide đang dẫn chuyến khác trùng thời gian) |
| Sĩ số | COUNT participant / `max_participants` |
| Trạng thái | `TRIP_GROUPS.status` |

- **Kéo thả:** cập nhật `BOOKING_PARTICIPANTS.trip_group_id`, ghi AUDIT. Chặn khi nhóm đầy.
- **Tách booking** có `grouping_preference` = đi chung → modal bắt buộc lý do → ghi `TRIP_BOOKING_ORDERS.is_split` = 1, `split_reason`, `split_approved_by_user_id`, `split_at`.
- Nút "Tự động chia nhóm" (giữ booking chung nhóm).

### O13 · Chuyến — Chuẩn bị đồ cấp
- **Route:** `/ops/trips/:tripId/provided-items` · **FR:** I01–I07

| Cột | DB |
|---|---|
| Thiết bị (variant) | `TRIP_PROVIDED_ITEMS.product_variant_id → PRODUCT_VARIANTS.variant_name`, `sku` |
| Nguồn cấu hình | `tour_provided_item_id → TOUR_PROVIDED_ITEMS.quantity`, `quantity_basis` |
| Cần | `required_quantity` (tính lại khi số người/nhóm đổi → cảnh báo "Cần cập nhật") |
| Đã gán | COUNT `ASSET_ASSIGNMENTS` với `trip_provided_item_id` |
| Thiếu | cần − đã gán (đỏ) |
| Người chuẩn bị | `prepared_by_user_id? → ACCOUNTS.full_name` (S = người đang thao tác) |
| Trạng thái | `TRIP_PROVIDED_ITEMS.status` (Missing / Ready / Recovered) |

- **Drawer gán asset:** danh sách `EQUIPMENT_ASSETS` khả dụng của variant trong [`TRIPS.start_at`, `end_at`] → tạo `ASSET_ASSIGNMENTS` (trip_provided_item_id, reserved_from, reserved_until, status = Reserved); quét mã khi giao (Issued, `assigned_at`); thu hồi (Returned, `returned_at`, `return_condition`).
- **Cảnh báo thiếu kho:** "Thiếu 3 Đèn đội đầu từ 14/11 đến 16/11 — đang bị giữ bởi đơn R-2031, R-2040".

### O14 · Chuyến — Điểm danh (ma trận)
- **Route:** `/ops/trips/:tripId/attendance` · **FR:** V01–V03
- **Hàng** = participant (lọc theo nhóm) · **Cột** = `TOUR_ACTIVITIES` (Ngày X · giờ · tên).
- **Ô:** `ACTIVITY_ATTENDANCES.attendance_status` (Có mặt / Vắng / Muộn / chưa điểm danh); hover hiện `checked_at`, `checked_by_user_id → ACCOUNTS.full_name`.
- Sửa ô đã có giá trị → bắt buộc lý do, ghi AUDIT. Mỗi cặp (participant, activity) chỉ một bản ghi.
- Tổng kết từng hoạt động: "18/20 có mặt".

### O15 · Đơn tour — chi tiết (vận hành)
- **Route:** `/ops/orders/:orderCode` · **FR:** B06, B07, F04, F06
- Gồm toàn bộ dữ liệu C11 + thêm:
  - Khách: `ORDERS.customer_user_id → ACCOUNTS`, `PROFILES.user_code`.
  - Sửa participant thay khách (có audit).
  - Khuyến mãi đã áp + trạng thái `APPLIED_PROMOTIONS.status`.
  - Giao dịch đầy đủ (`provider_transaction_id?`, `original_payment_id?`).
  - Nút: **Ghi nhận thanh toán thủ công** (FR-F04: số tiền, phương thức, mã tham chiếu, lý do → `PAYMENTS`, audit) · **Hủy đơn thay khách** (như C12) · **Gửi thông báo** (`NOTIFICATIONS`).
  - Tab Lịch sử: `AUDIT_LOGS` entity = Order.

### O38 · Đơn hàng — danh sách chung — MỚI
- **Route:** `/ops/orders` · **Role:** Staff, Admin · **FR:** O05
- Cột: mã đơn, loại (Tour / Thuê), khách (`ACCOUNTS.full_name`, `email`), dịch vụ (tour + ngày / số món + khoảng thuê), ngày đặt, `total_amount`, 2 badge `status` + `payment_status` (kèm "Đang xác minh", "Cần đối soát"), hạn giữ chỗ (`hold_expires_at`) / hạn đối soát (`reconciliation_deadline_at`), cờ "Hoàn chờ duyệt".
- Tabs: Tất cả · Chờ thanh toán · Cần đối soát · Chờ duyệt hoàn · Đã hủy. Lọc loại / trạng thái / khoảng ngày; tìm theo `order_code` / email; phân trang; xuất CSV.
- Bấm dòng → O15 (tour) / O23 (thuê). Staff chỉ thấy đơn tour của chuyến mình điều phối (`TRIPS.managed_by_user_id`) và đơn thuê mình xử lý hoặc chưa ai nhận.
- ⚠ Contract chưa có API danh sách đơn cho vận hành.

### O16 · Sản phẩm — danh sách
- **Route:** `/ops/products` · **Role:** Admin · **FR:** P01, P07

| Cột | DB |
|---|---|
| Ảnh + Tên | `PRODUCT_VARIANT_IMAGES` primary, `PRODUCTS.name` |
| Danh mục | `PRODUCTS.category_id → CATEGORIES.name` |
| Số variant | COUNT `PRODUCT_VARIANTS` |
| Tổng asset / sẵn sàng | COUNT `EQUIPMENT_ASSETS` / có `asset_status` = Available |
| Trạng thái | `PRODUCTS.status` |
| Người tạo | `created_by_user_id → ACCOUNTS.full_name` |

- Mở rộng dòng → bảng variant (sku, variant_name, size?, color?, status, giá từ, số asset).

### O17 · Sản phẩm & Variant — trình chỉnh sửa
- **Route:** `/ops/products/:productId` · **FR:** P01–P03, P05
- **Khối sản phẩm:** `PRODUCTS.name`, `category_id`, `description?`, `status`.
- **Danh sách variant (master–detail):** chọn một variant để sửa:

| Tab | Field | DB |
|---|---|---|
| Thông tin | SKU (UQ), tên biến thể, size, màu, trạng thái | `PRODUCT_VARIANTS.sku`, `variant_name`, `size?`, `color?`, `status` |
| Ảnh | Upload, sắp xếp, ảnh chính | `PRODUCT_VARIANT_IMAGES.image_url`, `display_order`, `is_primary` |
| Bảng giá | Bảng sửa trực tiếp: từ ngày, đến ngày, giá/ngày | `RENTAL_PRICE_TIERS.min_days`, `max_days?`, `daily_price` (với `product_variant_id`) |
| Thiết bị | Danh sách asset của variant | → O20 lọc sẵn |

- **Validate bảng giá:** khoảng ngày không chồng lấn; hiển thị trục 1→30 ngày tô màu từng bậc để thấy chỗ trống/chồng.

### O18 · Bảng giá thuê (tổng hợp)
- **Route:** `/ops/pricing` · **Role:** Admin · **FR:** P05
- Một bảng cho mọi `RENTAL_PRICE_TIERS`: cột Đối tượng (variant `sku` hoặc combo `PRODUCT_BUNDLES.name`), min_days, max_days?, daily_price, updated_at. Filter theo danh mục.
- Banner: "Đổi giá không ảnh hưởng đơn đã chốt (giá lưu ở `RENTAL_ORDER_ITEMS.daily_price`)".

### O19 · Combo — danh sách & trình chỉnh sửa
- **Route:** `/ops/bundles`, `/ops/bundles/:bundleId` · **Role:** Admin · **FR:** P04

| Khối | Field | DB |
|---|---|---|
| Thông tin | Tên, danh mục, mô tả, trạng thái | `PRODUCT_BUNDLES.name`, `category_id`, `description?`, `status` |
| Thành phần | Variant, số lượng (> 0, không trùng variant) | `PRODUCT_BUNDLE_ITEMS.product_variant_id`, `quantity` |
| Bảng giá | như O17 | `RENTAL_PRICE_TIERS` với `bundle_id` |
| Khả dụng | Số combo lắp được hôm nay | MIN theo thành phần |

- Không cho Mở bán khi chưa có thành phần hoặc chưa có bậc giá.

### O20 · Thiết bị (Asset) — danh sách
- **Route:** `/ops/assets` · **FR:** P02

| Cột | DB |
|---|---|
| Mã thiết bị | `EQUIPMENT_ASSETS.asset_code` (UQ, có in QR/barcode) |
| Variant | `product_variant_id → PRODUCT_VARIANTS.variant_name`, `sku` |
| Tình trạng | `asset_status` (Sẵn sàng / Bảo trì / Hỏng / Mất / Ngừng dùng) |
| Ghi chú tình trạng | `condition_note?` |
| Đang được dùng bởi | `ASSET_ASSIGNMENTS` hiện tại (status Reserved/Issued) → nguồn: đơn thuê / chuyến / quà khuyến mãi |

- **Drawer:** sửa `asset_status`, `condition_note` (có audit) + lịch sử toàn bộ `ASSET_ASSIGNMENTS` của asset (nguồn, khoảng, giao/trả, `return_condition`) + `RENTAL_CHARGES` liên quan.
- **Thêm hàng loạt:** chọn variant, số lượng, tiền tố mã → sinh `asset_code`.

### O21 · Lịch phân bổ thiết bị (Gantt)
- **Route:** `/ops/assets/schedule` · **FR:** I02, I03, I07, P06
- **Trục Y:** asset (nhóm theo variant). **Trục X:** ngày.
- **Thanh:** mỗi `ASSET_ASSIGNMENTS` từ `reserved_from` đến `reserved_until`; màu theo nguồn:
  - Đơn thuê (`rental_order_item_id` → `order_code`)
  - Đồ cấp chuyến (`trip_provided_item_id` → tour + ngày)
  - Quà khuyến mãi (`applied_promotion_id` → tên KM)
  - Kiểu nét theo `status`: Reserved (nét đứt), Issued (đặc), Returned (mờ), LostOrException (gạch chéo).
- Asset có `asset_status` ≠ Available → cả hàng tô xám.
- **Hàng tổng theo variant:** "Khả dụng / Tổng" mỗi ngày, ô đỏ khi nhu cầu > cung.
- Kéo thanh sang asset khác = đổi asset trước khi giao (FR-I05, có lý do).

### O22 · Đơn thuê — danh sách
- **Route:** `/ops/rentals` · **FR:** R05, O05

| Cột | DB |
|---|---|
| Mã đơn | `ORDERS.order_code` |
| Khách | `customer_user_id → ACCOUNTS.full_name`, `phone?` |
| Nhận – Trả | `RENTAL_ORDERS.rental_start_at`, `rental_end_at` |
| Số món | Σ `RENTAL_ORDER_ITEMS.quantity` |
| Tiền thuê | `ORDERS.total_amount` (chưa thu cọc ở bản này) |
| Phụ trách | `handled_by_user_id? → ACCOUNTS.full_name` (rỗng = "Chưa nhận") |
| Trạng thái / Thanh toán | `ORDERS.status`, `payment_status` |
| Tiến độ giao/trả | Issued/Returned trên tổng |

- **Tabs nhanh:** Cần giao hôm nay · Cần nhận lại hôm nay · Quá hạn · Đang thuê · Tất cả.
- Nút "Nhận xử lý" → ghi `handled_by_user_id` = mình (audit).

### O23 · Đơn thuê — chi tiết (vận hành)
- **Route:** `/ops/rentals/:orderCode`
- Toàn bộ dữ liệu C13 + phân công (`handled_by_user_id`) + danh sách asset đã giữ cho từng dòng (với combo: nhóm theo `RENTAL_BUNDLE_ITEM_SNAPSHOTS`) + nút **Giao đồ** (O24), **Nhận lại** (O25), **Phí & quyết toán** (O26), lịch sử audit.

### O24 · Giao thiết bị (Handover)
- **Route:** `/ops/rentals/:orderCode/handover` · **FR:** R06, I04, I05
- **Ô quét/nhập `asset_code`** (focus sẵn, hỗ trợ máy quét).
- **Danh sách cần giao:** từng dòng thuê / thành phần combo → số cần, số đã quét.
- Quét đúng → `ASSET_ASSIGNMENTS.status` = Issued, `assigned_at` = now (S).
- **Lỗi:** mã không tồn tại · asset không thuộc variant cần · asset không được giữ cho đơn này (gợi ý đổi asset) · asset tình trạng xấu.
- Không cho "Hoàn tất bàn giao" khi còn thiếu → nếu buộc giao thiếu thì cần lý do. Hoàn tất → `ORDERS.status` = InFulfillment.

### O25 · Nhận lại thiết bị (Return)
- **Route:** `/ops/rentals/:orderCode/return` · **FR:** R07, I06, C02
- Quét `asset_code` → form mỗi asset:

| Field | DB |
|---|---|
| Thời gian trả | `ASSET_ASSIGNMENTS.returned_at` S |
| Tình trạng khi trả | `return_condition` (Normal Bình thường / Damaged Hư hỏng / MissingAccessory Thiếu phụ kiện / Lost Mất) |
| Cập nhật tình trạng thiết bị | `EQUIPMENT_ASSETS.asset_status`, `condition_note?` |
| Tạo phí? | → tạo `RENTAL_CHARGES` (equipment_asset_id, charge_type = Damage) |

- Nút "Báo mất" cho asset chưa trả → modal xác nhận (tác động: asset ra khỏi kho, phí mất) → assignment status = LostOrException, `asset_status` = Lost, tạo phí Loss.
- Trả trễ (now > `rental_end_at`) → gợi ý phí trễ hạn tính sẵn.
- Tiến độ "4/5 đã nhận"; trả đủ → cho đóng phần thiết bị.

### O26 · Phí phát sinh & thu phí
- **Route:** `/ops/rentals/:orderCode/settlement` · **FR:** C02–C06, R08

| Khối | Field | DB |
|---|---|---|
| Danh sách phí | Loại, thiết bị, số tiền, lý do, trạng thái, người tạo, thời điểm | `RENTAL_CHARGES.charge_type` (LateReturn / Damage / Loss / Other), `equipment_asset_id?`, `amount` (> 0), `reason`, `status`, `created_by_user_id`, `created_at`, `voided_at?` |
| Hành động phí | Chốt (Draft → Assessed) · Hủy phí (Admin, bắt buộc lý do → Voided) | |
| Thu phí phát sinh | Σ phí Assessed chưa Settled → "Tạo yêu cầu thanh toán phí" | `PAYMENTS` (Collection, purpose AdditionalCharge, BankTransfer qua VA/VietQR, khách trả ở C04P); Succeeded → phí → Settled |
| Yêu cầu kiểm tra lại phí | Phí, lời nhắn khách, thời điểm, trạng thái (Mới / Đang xem / Đã trả lời) → Giữ nguyên (kèm phản hồi) / Điều chỉnh (Void phí cũ + tạo phí mới, lý do) / Hủy phí (Admin) → NOTIFICATIONS | ⚠ chưa có bảng `charge_review_requests` (D-4) |
| Đóng đơn | Checklist: hết assignment Issued ✓, hết phí Draft ✓, mọi phí Assessed đã Settled hoặc Voided ✓ | → `ORDERS.status` = Completed |

- **Cọc: hoãn ở bản này** (D-1, D-5) — không có quyết toán cọc.
- ⚠ `PAYMENTS` không có cột liên kết tới từng `RENTAL_CHARGES` → chưa xác định được khoản thu nào tất toán phí nào.

### O27 · Giao dịch (PAYMENTS)
- **Route:** `/ops/transactions` · **Role:** Staff (được giao), Admin · **FR:** F01–F03, F07

| Cột | DB |
|---|---|
| Thời gian | `PAYMENTS.created_at`, `processed_at?` |
| Mã đơn | `order_id → ORDERS.order_code` |
| Loại | `payment_type` (Collection "Thu" / Refund "Hoàn") |
| Mục đích | `purpose` (TourFee Tiền tour / RentalFee Tiền thuê / AdditionalCharge Phí phát sinh) |
| Số tiền | `amount` (Refund hiển thị số âm, màu khác) |
| Thực nhận | `received_amount?` — tô cảnh báo "Thừa / Thiếu" khi khác `amount` |
| Phương thức | `payment_method` = BankTransfer "Chuyển khoản (VietQR)" |
| VA order | `provider_order_id?` (chỉ Collection) |
| Mã giao dịch SePay | `provider_transaction_id?` |
| Trạng thái | `status` (PendingApproval Chờ duyệt / Pending / Succeeded / Failed / Cancelled); `failure_reason?` ở tooltip |
| Liên kết | `original_payment_id?` (giao dịch gốc), `retry_of_payment_id?` (lần thử trước), `manual_reference?` (hoàn thủ công) |
| Mốc chính sách | `refund_policy_rule_id? → REFUND_POLICY_RULES` ("≥ 72h · 80%") |

- **Filter:** loại, mục đích, trạng thái, khoảng ngày. Thẻ tổng: thu thành công · hoàn thành công · ròng · đang chờ. Xuất báo cáo thu/hoàn.
- ⚠ Contract chưa có endpoint liệt kê toàn bộ PAYMENTS (8.1 chỉ liệt kê Refund).

### O28 · Hoàn tiền & đối soát
- **Route:** `/ops/refunds` · **Role:** Admin · **FR:** F06–F08 · **API:** 8.1–8.6 (rate limit 10 request / 60 giây → `TOO_MANY_REQUESTS` + `Retry-After`)
- **Tab "Chờ duyệt"** (Refund `PendingApproval`, 8.1): order_code, khách, đã thu, đề xuất hoàn, mốc chính sách, lý do hủy (`ORDERS.cancel_reason?`). Drawer: tính lại tại thời điểm duyệt (hiện công thức) → "Duyệt & hoàn qua SePay" (8.2) → Pending / Succeeded / Failed. API **không có** từ chối và không nhận số tiền sửa tay.
- **Tab "Đang hoàn"** (Refund `Pending` tại SePay — job đồng bộ trạng thái; không duyệt lại).
- **Tab "Thất bại"** (Refund `Failed`): `failure_reason`, số lần đã thử (chuỗi `retry_of_payment_id`, tối đa 3). "Thử lại" (8.3; ẩn khi dòng đã được thử lại — `REFUND_NOT_RETRYABLE`; đủ 3 lần — `REFUND_RETRY_LIMIT_REACHED` → nhãn "Cần xử lý thủ công") · "Đã hoàn thủ công" (8.6: bắt buộc `manual_reference`; chỉ dòng Failed chưa thử lại — `REFUND_NOT_MANUAL_ELIGIBLE`).
- **Tab "Cần đối soát"** (`ORDERS.payment_status` = NeedsReconciliation): cần trả (`total_amount`) vs thực nhận (Σ `received_amount` Collection Succeeded − đã hoàn − đang hoàn), số lần chuyển, đồng hồ tới `ORDERS.reconciliation_deadline_at`. Nút "Chấp nhận khoản tiền" (8.5 — đơn còn PendingPayment, trong hạn, có một lần chuyển đủ total; tự hoàn phần thừa; khóa khi `ORDER_NOT_RECONCILABLE` / `RECONCILIATION_AMOUNT_INSUFFICIENT`) · "Hoàn toàn bộ" (8.4 — hoàn hết, đơn PendingPayment → Expired, trả chỗ/thiết bị).
- **Tab "Đã xử lý":** lịch sử (hoàn qua SePay, hoàn thủ công, đối soát xong).
- Lỗi chung: `PAYMENT_PROVIDER_ERROR` (502 → tải lại, dùng Thử lại / hoàn thủ công) · `REFUND_EXCEEDS_COLLECTED` · `REFUND_NOT_APPROVABLE` (tải lại). Mọi hành động ghi `AUDIT_LOGS`.

### O29 · Khuyến mãi — danh sách
- **Route:** `/ops/promotions` · **Role:** Admin · **FR:** M01

| Cột | DB |
|---|---|
| Tên | `PROMOTIONS.name` |
| Mã | `promotion_code?` (rỗng = "Tự động áp dụng") |
| Hiệu lực | `start_at` – `end_at` |
| Áp cho | `applies_to` (Tour / Rental / Tất cả) |
| Phạm vi | `application_scope` (Đơn / Dòng thuê) |
| Đã dùng / Giới hạn | COUNT `APPLIED_PROMOTIONS` (Applied) / `max_uses?` |
| Cộng dồn · Ưu tiên | `is_stackable`, `priority` |
| Trạng thái | `status` |

### O30 · Khuyến mãi — trình chỉnh sửa
- **Route:** `/ops/promotions/:promotionId` · **FR:** M01, M02, M06
- **Thông tin:** tên, mô tả?, mã? (UQ), start_at/end_at (end > start), applies_to, application_scope, max_uses?, max_uses_per_user?, is_stackable, priority, status.
- **Bậc (bảng sửa trực tiếp):**

| Field | DB |
|---|---|
| Thước đo | `PROMOTION_TIERS.qualification_metric` (Giá trị đơn / Số người / Số ngày thuê) |
| Ngưỡng | `min_threshold` |
| Loại quyền lợi | `discount_type` (Phần trăm / Số tiền / Tặng thiết bị) |
| Giá trị | `discount_value` (% trong 0–100) |
| Thiết bị tặng | `gift_product_variant_id?` + `gift_quantity?` (bắt buộc khi loại = Tặng thiết bị) |

- Preview: "Đơn ≥ 4 người → giảm 10% · Đơn ≥ 8 người → giảm 15% + tặng 1 gậy trekking".

### O31 · Lịch sử áp dụng khuyến mãi
- **Route:** `/ops/promotions/:promotionId/usage` (tab của O30) · **FR:** M04, M07

| Cột | DB |
|---|---|
| Thời điểm | `APPLIED_PROMOTIONS.applied_at` |
| Đơn | `order_id → ORDERS.order_code`, khách |
| Dòng thuê | `rental_order_item_id?` |
| Bậc | `promotion_tier_id → PROMOTION_TIERS` |
| Giảm | `discount_amount` |
| Quà | `gift_product_variant_id? → variant_name`, `gift_quantity?` + asset được giữ (`ASSET_ASSIGNMENTS.applied_promotion_id`) |
| Trạng thái | `status` (Reserved / Applied / Reversed / Expired) |

### O32 · Bài viết — danh sách & trình soạn
- **Route:** `/ops/posts`, `/ops/posts/:postId` · **Role:** Staff, Admin · **FR:** N01–N03
- **Danh sách:** title, post_type, tác giả (`created_by_user_id`), status, published_at?, số tour gắn (COUNT `TOUR_POSTS`), số lượt đọc (COUNT `PARTICIPANT_POST_READS`).
- **Trình soạn:**

| Field | DB |
|---|---|
| Tiêu đề | `POSTS.title` |
| Slug (tự sinh, sửa được, UQ) | `POSTS.slug` |
| Loại bài | `post_type` (Hướng dẫn / Kỹ năng / Tin tức) |
| Nội dung (rich text) | `content` |
| Tag (multi-select, tạo nhanh) | `POST_TAGS` → `TAGS` |
| Kỹ năng | `POST_SOFT_SKILLS` → `SOFT_SKILLS` |
| Gắn vào tour | `TOUR_POSTS` (tour_id, display_order) |
| Trạng thái / Ngày đăng | `status`, `published_at?` |

### O33 · Tag & Kỹ năng mềm
- **Route:** `/ops/taxonomy` · **Role:** Admin
- **Tab Tag:** `TAGS.name` (UQ), `slug` (UQ), số bài dùng.
- **Tab Kỹ năng:** `SOFT_SKILLS.name` (UQ), `description?`, `status`, số bài dùng.

### O34 · Chính sách hoàn tiền
- **Route:** `/ops/refund-policies` · **Role:** Admin · **FR:** F05

| Cột / Field | DB |
|---|---|
| Tên | `REFUND_POLICIES.name` |
| Loại | `policy_type` (Tour / Rental) |
| Phiên bản | `version` (nhóm theo `policy_family_id`) |
| Hiệu lực | `effective_from` – `effective_until?` |
| Trạng thái | `status` |
| Người tạo | `created_by_user_id` |
| Đang dùng bởi | COUNT `TRIPS.refund_policy_id` + `ORDERS.refund_policy_id` |

- **Editor quy tắc:** bảng `REFUND_POLICY_RULES` (min_hours_before, refund_percentage 0–100) + biểu đồ bậc thang "giờ trước khởi hành → % hoàn".
- **Policy đã được dùng → chỉ đọc**; nút "Tạo phiên bản mới" (cùng `policy_family_id`, `version` + 1, đặt `effective_until` cho bản cũ).

### O35 · Cấu hình hệ thống
- **Route:** `/ops/settings` · **Role:** Admin · **FR:** O03

| Cột | DB |
|---|---|
| Khóa | `SYSTEM_CONFIGURATIONS.config_key` (UQ, chỉ đọc) |
| Giá trị | `config_value` — input theo `value_type` (number / boolean switch / text / duration) |
| Mô tả | `description?` |
| Cập nhật bởi / lúc | `updated_by_user_id → ACCOUNTS.full_name`, `updated_at` |

- Ví dụ khóa: thời gian giữ chỗ, khoảng chờ đối soát, rental.cleaningBufferHours, phí trễ/ngày (cọc: hoãn). Lưu → modal xác nhận + audit.

### O36 · Nhật ký hệ thống (Audit log)
- **Route:** `/ops/audit` · **Role:** Admin · **FR:** O02

| Cột | DB |
|---|---|
| Thời gian | `AUDIT_LOGS.created_at` |
| Người thực hiện | `actor_user_id? → ACCOUNTS.full_name` (rỗng = "Hệ thống") |
| Hành động | `action` |
| Đối tượng | `entity_type` + `entity_id` (link đến màn tương ứng) |
| Chi tiết | `details` (JSON viewer, hiện trước/sau) |

- **Filter:** người, loại đối tượng, hành động, khoảng ngày. Chỉ đọc.

### O37 · Báo cáo
- **Route:** `/ops/reports` · **Role:** Admin · **FR:** O04, O06 (PRD §12.2)

| Báo cáo | Nguồn |
|---|---|
| Doanh thu theo loại đơn / tháng | `PAYMENTS` Succeeded theo `ORDERS.order_type`, `purpose` |
| Tỉ lệ lấp chỗ theo tour/chuyến | Σ participant_count / `TRIPS.total_slots` |
| Hiệu suất thiết bị | số ngày có `ASSET_ASSIGNMENTS` Issued / số ngày trong kỳ, theo variant |
| Hoàn tiền theo chính sách | `PAYMENTS` Refund theo `refund_policy_rule_id` |
| Phí phát sinh | `RENTAL_CHARGES` theo `charge_type`, `status` |
| Hiệu quả khuyến mãi | `APPLIED_PROMOTIONS` theo `PROMOTIONS` |
| Đánh giá | `AVG(REVIEWS.rating)` theo tour / guide (qua `TRIP_GROUPS.guide_user_id`) |

### O39 · Đánh giá — kiểm duyệt — MỚI
- **Route:** `/ops/reviews` · **Role:** Admin (Staff chỉ xem) · **FR:** V05, V06
- Cột: `REVIEWS.rating`, `comment`, participant (`BOOKING_PARTICIPANTS.full_name`), tour + ngày chuyến (participant → TRIPS → TOURS), guide (`TRIP_GROUPS.guide_user_id`), `created_at`, `updated_at`, trạng thái hiển thị. Thẻ AVG rating theo tour (không tính bài đã ẩn).
- Hành động: Ẩn (bắt buộc lý do, `AUDIT_LOGS`) / Hiện lại. Admin **không** sửa nội dung đánh giá.
- ⚠ `REVIEWS` chưa có cột `status` / `hidden_reason` / `hidden_by_user_id` (FR-V06) — hiện chỉ dùng `is_deleted`.

---

# G. Khu vực Guide (web)

> Sidebar: **Hôm nay · Nhóm · Điểm danh · Thông báo · Tôi**. Chỉ thấy `TRIP_GROUPS` có `guide_user_id` = mình. Không hiển thị bất kỳ dữ liệu thanh toán nào.

### G01 · Chuyến hôm nay / sắp tới
| Field | DB |
|---|---|
| Tour | `TRIPS.tour_id → TOURS.name` |
| Thời gian | `TRIPS.start_at` – `end_at` |
| Nhóm của tôi | `TRIP_GROUPS.group_name` |
| Sĩ số | COUNT participant / `max_participants` |
| Trạng thái chuyến | `TRIPS.status` |
| Điểm tập trung | `LOCATIONS.name`, `address` (nút mở bản đồ) |

- Thẻ lớn, hiển thị rõ ngày + tên nhóm để tránh nhầm khi nhiều chuyến cùng tên. Tabs: Hôm nay / Sắp tới / Đã xong.

### G02 · Chi tiết nhóm
- Danh sách `BOOKING_PARTICIPANTS` của nhóm: `full_name`, tuổi (từ `date_of_birth?`), nút 📞 `phone?`, badge điểm danh hoạt động hiện tại.
- Thanh tìm kiếm tên. Nút lớn "Điểm danh" → G04.

### G03 · Chi tiết participant
| Field | DB |
|---|---|
| Họ tên, tuổi | `full_name`, `date_of_birth?` |
| Liên hệ | `phone?` (gọi), `email?` |
| **Liên hệ khẩn cấp** (khối nổi bật) | `emergency_contact_name?`, `emergency_contact_phone?` (gọi) |
| Lịch sử điểm danh | `ACTIVITY_ATTENDANCES` của participant |
| Đồ được cấp | asset_code đã giao (`ASSET_ASSIGNMENTS` theo `TRIP_PROVIDED_ITEMS` của chuyến) |

### G04 · Điểm danh
- **Bước 1:** chọn hoạt động — mặc định là hoạt động gần giờ hiện tại nhất (`TOUR_ACTIVITIES.day_number`, `start_time`, `name`).
- **Bước 2:** danh sách participant, mỗi dòng có 3 nút lớn: **Có mặt · Vắng · Muộn** → ghi `ACTIVITY_ATTENDANCES` (tour_activity_id, participant_id, attendance_status, `checked_at` = now S, `checked_by_user_id` = mình S).
- Nút "Tất cả có mặt" kèm xác nhận. Thanh tiến độ "18/20".
- Sửa bản đã lưu → bắt buộc lý do.
- **Mất mạng:** lưu vào hàng đợi, banner "3 thay đổi chưa gửi" + nút gửi lại (không tạo trùng bản ghi).

### G05 · Lịch trình chuyến
- Timeline `TOUR_ACTIVITIES` theo `day_number` → `start_time`, `name`, `duration_minutes`, `description?`; đánh dấu hoạt động đang diễn ra và tỉ lệ điểm danh từng hoạt động.

### G06 · Đồ cấp của nhóm
- `TRIP_PROVIDED_ITEMS` của chuyến: variant, `required_quantity`, trạng thái; danh sách `EQUIPMENT_ASSETS.asset_code` đã giao (chỉ xem; thu hồi do Staff làm ở O13).

---

## Phụ lục — Ma trận phủ bảng ERD → màn hình

| Bảng | Màn hình |
|---|---|
| ROLES | A05, O02, O03 |
| ACCOUNTS | A01–A06, O02, O03 (+ tham chiếu người tạo/người xử lý ở nhiều màn O) |
| PROFILES | A02, A05, C15, O02, O03 |
| USER_EXTERNAL_LOGINS | A01, A06, O03 |
| REFRESH_TOKENS | A01, A04, A06, O03 |
| ACCESS_TOKENS | A01, A06 (thu hồi cùng phiên) |
| PASSWORD_RESET_TOKENS | A03, A04 |
| CATEGORIES | C01, C02, C06, O04, O05, O16, O19 |
| LOCATIONS | C01, C03, O04, O06, G01 |
| TOURS | C02, C03, O05, O06, O07 |
| TOUR_IMAGES | C02, C03, O06 |
| TOUR_ACTIVITIES | C03, C15, O06, O14, G04, G05 |
| TOUR_PREPARATION_ITEMS | C03, C15, O06 |
| TOUR_PROVIDED_ITEMS | C03, O06, O13 |
| TOUR_RECURRENCE_RULES | O08, O09 |
| TOUR_POSTS | C03, C15, C18, O06, O32 |
| TRIPS | C03, C04, C14, O09, O10, G01 |
| TRIP_GROUPS | C11, C15, O12, G01 |
| TRIP_PROVIDED_ITEMS | C15, O10, O13, G06 |
| BOOKING_PARTICIPANTS | C04, C11, C14, O11, O12, G02, G03 |
| ACTIVITY_ATTENDANCES | C15, O14, G03, G04 |
| ORDERS | C04, C05, C09–C13, O15, O22, O28 |
| TRIP_BOOKING_ORDERS | C04, C11, O11, O12 |
| RENTAL_ORDERS | C09, C13, O22–O26 |
| RENTAL_ORDER_ITEMS | C07, C09, C13, O23 |
| RENTAL_BUNDLE_ITEM_SNAPSHOTS | C09, C13, O23, O24 |
| RENTAL_CHARGES | C13, O25, O26 |
| PAYMENTS | C04, C05, C11–C13, O15, O26–O28 |
| REFUND_POLICIES | C03, C12, O34 |
| REFUND_POLICY_RULES | C03, C04, C12, O27, O28, O34 |
| PRODUCTS | C06, C07, O16, O17 |
| PRODUCT_VARIANTS | C07, O06, O13, O17, O20 |
| PRODUCT_VARIANT_IMAGES | C06, C07, O17 |
| PRODUCT_BUNDLES | C06, C08, O19 |
| PRODUCT_BUNDLE_ITEMS | C08, O19 |
| RENTAL_PRICE_TIERS | C06–C08, O17–O19 |
| EQUIPMENT_ASSETS | C13, O20, O21, O24, O25, G06 |
| ASSET_ASSIGNMENTS | C04, C09, C13, O13, O20, O21, O24, O25, G03 |
| PROMOTIONS | C04, C09, O29, O30 |
| PROMOTION_TIERS | C04, O30 |
| APPLIED_PROMOTIONS | C04, C09, C11, O15, O31 |
| POSTS | C01, C17, C18, O32 |
| TAGS / POST_TAGS | C17, C18, O32, O33 |
| SOFT_SKILLS / POST_SOFT_SKILLS | C17, C18, O32, O33 |
| PARTICIPANT_POST_READS | C14, C15, C18, O32 |
| REVIEWS | C02, C03, C16, O37 |
| NOTIFICATIONS | A07, O15 |
| AUDIT_LOGS | O03, O10, O15, O36 |
| SYSTEM_CONFIGURATIONS | O35 |

## Điểm ERD chưa hỗ trợ — UI chỉ để placeholder (theo PRD §13.1, §16)

- Xác thực email: chưa có bảng token xác minh (Q-03) → A01 chỉ hiện banner, chưa có màn "xác minh email".
- Kiểm duyệt review (ẩn kèm lý do): `REVIEWS` chưa có cột trạng thái (FR-V06).
- Ảnh biên bản hỏng/mất thiết bị: chưa có cột lưu (FR-C06) → O25 không có upload ảnh.
- Phí mất/hỏng cho đồ cấp chuyến/quà khuyến mãi: `RENTAL_CHARGES` chỉ thuộc đơn thuê (Q-17) → O13 chỉ ghi ngoại lệ, không tạo phí.
- Gia hạn đơn thuê (FR-R09, P1): chưa có bảng lịch sử điều chỉnh → chưa thiết kế màn.
- Cọc (D-1, D-5): hoãn ở bản này — C09, C13, O22, O26 không có luồng thu/hoàn/quyết toán cọc.
- Yêu cầu kiểm tra lại phí (C13, O26): chưa có bảng `charge_review_requests` (D-4).
- Lời mời liên kết participant (C14, C19): chưa có bảng lời mời (Q-16).
- Contract chưa có: API danh sách PAYMENTS (O27), danh sách đơn cho vận hành (O38), hủy chuyến phía vận hành (O10), Staff/Admin hủy đơn thay khách (O15, O23), từ chối hoàn tiền (O28), ghi nhận thanh toán thủ công (FR-F04).
- Cấu hình (O35): BE chưa đọc `SYSTEM_CONFIGURATIONS`; số lần thử lại hoàn là hằng số (3), khoảng chờ đối soát ở appsettings `PaymentJobs:ReconciliationHoldHours`.

## Màn hình lỗi (Batch 6) — tóm tắt
| Mã | Màn | errors.code / HTTP |
|---|---|---|
| E01 | 404 Không tìm thấy (trang / đơn) | NOT_FOUND, ORDER_NOT_FOUND, PAYMENT_NOT_FOUND, CHARGE_NOT_FOUND — không lộ đơn có tồn tại |
| E02 | 403 Không có quyền | FORBIDDEN |
| E03 | 401 Phiên hết hạn (modal giữ form + toàn trang) | UNAUTHORIZED (refresh thất bại) |
| E04 | 500 Lỗi hệ thống + correlation ID | 500 |
| E05 | 502 Cổng thanh toán gặp sự cố | PAYMENT_PROVIDER_ERROR |
| E06 | 503 Bảo trì | 503 |
| E07 | 429 Quá nhiều yêu cầu (đếm ngược Retry-After) | TOO_MANY_REQUESTS |
| E08 | Mất kết nối (gửi lại an toàn, hàng đợi điểm danh Guide) | — |
| E09 | Tài khoản bị khóa trong phiên (UAT-03) | ⚠ đề xuất ACCOUNT_LOCKED |
| E10 | Xung đột dữ liệu (row_version) | 409 ⚠ đề xuất CONCURRENCY_CONFLICT |
| E11 | Link không hợp lệ / hết hạn | HOLD_EXPIRED, ORDER_NOT_PAYABLE, token reset/lời mời |
| E12 | Bộ mẫu lỗi trong trang + bảng tra toàn bộ Phụ lục B | mọi mã |

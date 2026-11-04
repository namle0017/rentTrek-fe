# Đối chiếu màn hình Penpot với schema SQL — renTrek

> Ngày kiểm tra: 22/10/2026
> Schema: `BE/docs/database/supabase_schema.sql` (51 bảng, PostgreSQL/Supabase).
> Thiết kế: file Penpot **PRN232 - Figma**, `Page 1`, 30 board (21 board đã review ngày 06/10 + 9 board mới).
> Cách làm: đọc toàn bộ text của 9 board mới trực tiếp từ Penpot, kết hợp kết quả review 06/10 cho các board cũ, rồi đối chiếu từng bảng SQL. Chỉ kiểm tra **dữ liệu và chức năng**; chưa review lại chất lượng thị giác của 9 board mới.
> Thay thế mục 10 của [UIUX-REVIEW-2026-10-06.md](UIUX-REVIEW-2026-10-06.md) (mục đó dựa trên ERD v2 cũ).
> **Đã đối chiếu thêm với PRD** tại [PRD-CHECK-2026-10-22.md](PRD-CHECK-2026-10-22.md): số màn thiếu là 36 (không phải 35), số màn sai nghiệp vụ là 29 (không phải 27), và một số đề xuất ở mục 4 (thêm CCCD, cọc tour, tài khoản nhận hoàn, ghi chú sức khỏe) không còn phù hợp.

## 1. Kết luận

**Chưa phủ 100%.**

| Mức | Số bảng | Tỷ lệ (trên 48 bảng cần UI) |
|---|---|---|
| ✔ Đủ cho luồng chính | 4 | 8% |
| ◐ Có màn nhưng thiếu chức năng / cột | 34 | 71% |
| ✘ Chưa có màn nào | 10 | 21% |
| — Không cần UI (backend) | 3 | — |

- **38/48 bảng (79%) đã xuất hiện ở ít nhất một màn.**
- **Phía khách hàng và vận hành chuyến đi đã khá đầy đủ** nhờ 9 board mới: chi tiết tour chuẩn, checkout nhiều người tham gia + voucher, chính sách hủy, cẩm nang an toàn, điều phối chuyến, soạn đồ, nghiệm thu, duyệt hoàn tiền, quyết toán + đánh giá.
- **Lý do chính khiến 34 bảng chỉ đạt ◐: chưa có màn quản trị (Admin CRUD) nào.** Mọi dữ liệu gốc — sản phẩm, biến thể, combo, bảng giá, kho tài sản, tour, lịch khởi hành, chính sách hoàn tiền, khuyến mãi, bài viết, người dùng — mới chỉ được *hiển thị*, chưa có màn *tạo / sửa*.
- Ngược lại, thiết kế đang dùng **một số dữ liệu SQL chưa có cột lưu** (CCCD, tài khoản nhận hoàn, ảnh minh chứng, cọc thiết bị của tour…), xem [mục 4](#4-dữ-liệu-trên-ui-nhưng-sql-chưa-có).

## 2. Board mới từ sau 06/10

| Board | Vai trò | Bảng SQL được thể hiện |
|---|---|---|
| `01b_Tour_Detail_Fansipan` | Khách | `tours`, `tour_images`, `tour_activities`, `tour_preparation_items`, `tour_provided_items`, `trips`, `reviews`, `locations` |
| `02b_Tour_Checkout_With_Voucher` | Khách | `orders`, `trip_booking_orders`, `booking_participants`, `promotions`, `promotion_tiers`, `applied_promotions` |
| `03b_Safety_Handbook_And_Skill_Check` | Khách | `posts`, `tags`, `soft_skills`, `post_soft_skills`, `tour_posts`, `participant_post_reads` |
| `04b_Escrow_Settlement_With_Charges` | Khách | `rental_charges`, `payments`, `equipment_assets`, `reviews` |
| `05_Refund_Policy_And_Cancel_Tour` | Khách | `refund_policies`, `refund_policy_rules`, `orders.cancel_reason`, `payments` |
| `Staff_Trip_Detail_And_Manifest` | Staff | `trips`, `trip_groups`, `booking_participants`, `participant_post_reads`, `locations` |
| `Staff_Trip_Equipment_Preparation` | Staff | `trip_provided_items`, `tour_provided_items`, `equipment_assets`, `asset_assignments` |
| `Staff_Post_Trip_Inspection` | Staff | `asset_assignments`, `rental_charges`, `payments` |
| `Staff_Order_Management_And_Refund_Approval` | Staff | `orders`, `trip_booking_orders`, `refund_policies`, `refund_policy_rules`, `payments` |

Các lỗ hổng lớn ở review 06/10 đã được giải quyết bởi các board này: chi tiết tour bản chuẩn, form nhiều người tham gia, mã khuyến mãi, chính sách hủy theo mốc giờ, xác nhận đã đọc cẩm nang, chia nhóm + phân công Lead Guide, checklist đồ cấp cho chuyến, gán mã asset, form khấu trừ hư hại, nút "Gửi đánh giá".

## 3. Đối chiếu từng bảng

Ký hiệu: ✔ đủ cho luồng chính · ◐ có màn nhưng thiếu · ✘ chưa có màn · — không cần UI

### 3.1. Định danh & xác thực

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `roles` | ✘ | Chỉ hiển thị nhãn vai trò ở header | Admin xem/gán vai trò (có thể seed cố định, nhưng phải chọn được role khi tạo tài khoản Staff/Guide) |
| `accounts` | ◐ | Đăng nhập, Đăng ký, OTP (`email_confirmed_at`) | Đăng ký thiếu `full_name`, `phone` riêng; Admin danh sách người dùng, khóa/mở (`status`) |
| `profiles` | ◐ | Chi tiết hướng dẫn viên | "Hồ sơ của tôi" cho mọi vai trò; upload `avatar_url`; hiển thị `user_code` |
| `user_external_logins` | ✘ | — | Nút "Tiếp tục với Google" + liên kết/hủy liên kết tài khoản |
| `password_reset_tokens` | ✘ | Chỉ có link "Quên mật khẩu?" | Màn nhập email, màn đặt lại mật khẩu, trạng thái link hết hạn |
| `refresh_tokens` | — | "Ghi nhớ đăng nhập" | — |
| `access_tokens` | — | — | — |

### 3.2. Nội dung

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `posts` | ◐ | 03b (khách đọc) | Admin CMS: tạo/sửa/xuất bản (`post_type`, `status`, `slug`, `published_at`) |
| `tags` | ◐ | 03b (#LeaveNoTrace, #SocDoCao…) | Admin quản lý tag |
| `post_tags` | ◐ | 03b | Gắn tag trong form bài viết |
| `soft_skills` | ◐ | 03b ("3 kỹ năng thiết yếu"), điểm danh | Admin quản lý kỹ năng |
| `post_soft_skills` | ◐ | 03b | Gắn kỹ năng trong form bài viết |

### 3.3. Danh mục, địa điểm, chính sách hoàn tiền

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `categories` | ◐ | Bộ lọc home, breadcrumb tour | Admin CRUD, phân biệt `category_type` (đồ thuê / tour) |
| `locations` | ◐ | 01b (tọa độ), điểm tập trung ở Staff_Trip_Detail | Admin CRUD địa điểm (có chọn tọa độ) |
| `refund_policies` | ◐ | 05 (khách xem "v2.1"), Staff duyệt hoàn "Fansipan v2.1" | Admin tạo/sửa, quản lý phiên bản (`version`, `effective_from/until`, `policy_family_id`) |
| `refund_policy_rules` | ◐ | 05 (3 mốc giờ), Staff đối chiếu "Bậc 1" | Admin sửa mốc. **Lệch**: UI có 2 tỷ lệ (tour % và cọc %), SQL chỉ có 1 `refund_percentage` |

### 3.4. Sản phẩm & thiết bị

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `products` | ◐ | Home, chi tiết sản phẩm | Admin CRUD |
| `product_variants` | ◐ | Tên biến thể xuất hiện ở màn soạn đồ ("Lều Eureka 2P", "Túi ngủ -5°C") | Khách chọn `size` / `color` / SKU ở PDP; Admin CRUD |
| `product_variant_images` | ◐ | Gallery PDP | Admin upload, sắp xếp, chọn ảnh chính |
| `equipment_assets` | ◐ | Mã AST-* ở soạn đồ, nghiệm thu, quyết toán | Màn kho tài sản: danh sách, `asset_status`, `condition_note`, lịch sử |
| `product_bundles` | ✘ | Chỉ có link footer "Combo Đi Phượt Trọn Gói" | Khách xem/thuê combo; Admin CRUD |
| `product_bundle_items` | ✘ | — | Thành phần combo trong PDP combo và form Admin |
| `rental_price_tiers` | ✘ | PDP chỉ có giá phẳng `80.000đ × 3 ngày` | Bảng giá theo bậc ngày ở PDP; Admin cấu hình bậc |

### 3.5. Tour

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `tours` | ◐ | Danh sách tour, 01b | Admin CRUD, phiên bản (`tour_family_id`, `version`), khóa lịch trình (`itinerary_locked_at`); card danh sách chưa có giá |
| `tour_images` | ◐ | Ảnh hero 01b | Admin upload |
| `tour_activities` | ◐ | Lịch trình theo ngày/giờ ở 01b | Admin soạn lịch trình; **điểm danh chưa chọn theo hoạt động** |
| `tour_preparation_items` | ◐ | 01b "Bạn cần chuẩn bị" | Admin CRUD |
| `tour_provided_items` | ◐ | 01b "TrekRent chuẩn bị", định mức ở soạn đồ (`quantity_basis`) | Admin CRUD |
| `tour_posts` | ◐ | 03b liên kết từ tour | Admin gắn bài viết vào tour |
| `tour_recurrence_rules` | ✘ | — | Admin tạo lịch lặp (`frequency`, `days_of_week`, `default_total_slots`, `default_price`) |

### 3.6. Chuyến đi

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `trips` | ◐ | Khách chọn đợt ở 01b; Staff_Trip_Detail (sĩ số 18/20, tối thiểu 10, "Chốt khởi hành") | **Danh sách chuyến** và **form tạo chuyến** (`price_per_person`, `total_slots`, `min_participants`, `refund_policy_id`, `managed_by`) |
| `trip_groups` | ✔ | Staff_Trip_Detail: 2 nhóm, Lead Guide, nút "Đổi" nhóm | (Nhỏ) form tạo nhóm với `max_participants` |
| `trip_provided_items` | ✔ | Staff_Trip_Equipment_Preparation: cần/soạn/kho/trạng thái, người giao | — |

### 3.7. Đơn hàng

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `orders` | ◐ | Staff: đơn thuê + đơn tour, duyệt hủy; Khách: hủy tour (05) | **"Đơn của tôi"** cho khách; đếm ngược giữ chỗ (`hold_expires_at`); `payment_status` riêng với `status` |
| `trip_booking_orders` | ◐ | 02b: số khách, đơn giá | `grouping_preference` (muốn đi chung nhóm); luồng **tách đoàn** (`is_split`, `split_reason`, `split_approved_by_user_id`) cho Staff |
| `rental_orders` | ◐ | PDP, checkout thuê, chi tiết đơn Staff, `deposit_amount` | `handled_by_user_id` (nhân viên phụ trách); khách hủy đơn thuê |

### 3.8. Người tham gia, điểm danh, đánh giá

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `booking_participants` | ◐ | 02b form từng khách, manifest Staff | Form thiếu `date_of_birth`, `emergency_contact_name` (chỉ có SĐT khẩn cấp). UI có **CCCD** nhưng SQL không có cột |
| `participant_post_reads` | ✔ | 03b xác nhận + mở khóa vé QR; manifest "Đã đọc / Chưa đọc" | — |
| `activity_attendances` | ◐ | `diem-danh-thanh-vien` (một mốc "Đón 06:30") | Chọn `tour_activity`, hiển thị `checked_at`, `checked_by_user_id` |
| `reviews` | ✔ | 04b "Gửi đánh giá", 01b "4.9/5 (128 đánh giá)" | **Lệch nhỏ**: UI ghi "Đánh giá tour guide", SQL đánh giá theo `participant_id` (tức chuyến đi), không có cột hướng dẫn viên |

### 3.9. Khuyến mãi

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `promotions` | ◐ | 02b nhập mã "TREKGROUP10" | Admin CRUD (`applies_to`, `application_scope`, `max_uses`, `max_uses_per_user`, `is_stackable`, `priority`); áp mã ở checkout thuê đồ |
| `promotion_tiers` | ◐ | 02b "Giảm 10% khi đặt từ 2 vé" | Admin cấu hình bậc, quà tặng (`gift_product_variant_id`) |

### 3.10. Dòng thuê, khuyến mãi áp dụng, gán tài sản, phụ phí

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `rental_order_items` | ◐ | PDP/checkout tính 1 dòng (`daily_price × billable_days`) | Nhiều dòng trong một đơn, dòng combo (`bundle_id`) |
| `rental_bundle_item_snapshots` | — | — | (Tùy chọn) hiển thị thành phần combo trong chi tiết đơn |
| `applied_promotions` | ◐ | Dòng "Giảm giá voucher -490.000đ" ở 02b | Hiển thị quà tặng; khuyến mãi theo dòng thuê |
| `asset_assignments` | ◐ | Gán mã asset khi soạn đồ (tour), nghiệm thu `return_condition` | Gán asset cho **đơn thuê đồ** (màn Kiểm tra đồ cũ chưa có mã); lịch giữ đồ `reserved_from/until` |
| `rental_charges` | ◐ | Nghiệm thu + quyết toán "Khấu trừ AST-POLE-12 -50.000đ" | **Lệch schema**: `rental_order_id` bắt buộc, nhưng UI tính phụ phí cho đồ của **tour** (không có đơn thuê) |

### 3.11. Thanh toán

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `payments` | ◐ | QR VietQR, duyệt hoàn Napas247, kết quả hoàn cọc | Chọn `payment_method`; màn **đối soát / lịch sử giao dịch** cho Staff (menu "Đối soát dòng tiền" chưa có màn); thanh toán thất bại |

### 3.12. Hệ thống

| Bảng | Mức | Màn hiện có | Còn thiếu |
|---|---|---|---|
| `notifications` | ✘ | Chỉ có icon chuông | Danh sách thông báo, đánh dấu đã đọc, liên kết `related_entity` |
| `audit_logs` | ✘ | — | Admin xem nhật ký |
| `system_configurations` | ✘ | — | Admin cấu hình (`config_key`, `value_type`) |

## 4. Dữ liệu trên UI nhưng SQL chưa có

Đây là phần **ngược lại**: thiết kế đang hiển thị hoặc thu thập dữ liệu mà backend không lưu được. Cần chọn: thêm cột/bảng, hoặc bỏ khỏi thiết kế.

| Dữ liệu trên UI | Màn | Tình trạng SQL | Đề xuất |
|---|---|---|---|
| **CCCD** người tham gia ("CCCD *", "17/18 khách nộp CCCD") | 02b, Staff_Trip_Detail | Không có cột | Thêm `booking_participants.id_number` (nếu cần cho bảo hiểm) |
| **Tài khoản nhận hoàn tiền** ("VietinBank • STK 1028...99") | Staff duyệt hoàn, Staff nghiệm thu | Không có bảng | Thêm bảng tài khoản ngân hàng của khách, hoặc cột trên `payments` |
| **Ảnh minh chứng** (ảnh bàn giao 3 góc, "Minh chứng hiện trường") | transaction-tracker, Kiểm tra đồ, Staff nghiệm thu | Không có bảng media | Thêm bảng ảnh gắn với `asset_assignments` / `rental_charges` |
| **Khách dùng asset nào** ("AST-POLE-12 ✓ (Gia Huy)", cột "Khách dùng") | Soạn đồ, nghiệm thu | `asset_assignments` không có `participant_id` | Thêm `participant_id` |
| **Cọc thiết bị của tour** ("Cọc thiết bị 500.000đ / 1.000.000đ") | 01b, 02b, 05, 04b | `trip_booking_orders` không có cột cọc; `deposit_amount` chỉ ở `rental_orders` | Thêm `deposit_amount` cho đơn tour, hoặc tách cọc thành đơn thuê kèm theo |
| **Phụ phí hư hại đồ tour** | Staff nghiệm thu, 04b | `rental_charges.rental_order_id` NOT NULL | Cho phép `order_id` chung, hoặc gắn với `asset_assignments` |
| **Tỷ lệ hoàn riêng cho tour và cọc** ("Hoàn 50% tour + 100% cọc") | 05 | Một `refund_percentage` / mốc | Thêm cột tỷ lệ cho cọc, hoặc 2 policy riêng |
| **Ký quỹ / Escrow, "Giải ngân Ban tổ chức"** | 01b, 02b, 04b, escrow-checkout | Không có trạng thái giữ / giải ngân | Đổi copy thành "thanh toán / hoàn cọc", hoặc bổ sung `payments.purpose` tương ứng |
| **Chủ đồ, hoa hồng sàn, "Đăng đồ cho thuê"** | owner-dashboard, footer nhiều board (kể cả 01b) | Không có | Bỏ khỏi thiết kế (SQL là công ty cho thuê) |
| **Tranh chấp** ("Mở tranh chấp", trạng thái "TRANH CHẤP") | Vận hành thuê đồ, footer | Không có bảng | Bỏ, hoặc dùng `rental_charges.status` |
| **Người duyệt hoàn tiền** | Staff duyệt hoàn | `payments` không có `approved_by` | Thêm cột hoặc ghi qua `audit_logs` |
| **Ghi chú sức khỏe từng khách** (dị ứng, say xe) | Công việc HDV, điểm danh | `booking_participants` không có cột | Thêm `health_note` |
| **Khu vực phụ trách, ngôn ngữ, chứng chỉ, lịch nghỉ của HDV** | Quản lý / Chi tiết HDV | Không có | Thêm bảng hoặc bỏ khỏi thiết kế |
| **Điểm thưởng "+245 pts"** | 04-Trip-Concluded | Không có | Bỏ |
| Thời tiết "Nắng 14-22°C" | Staff_Trip_Detail | Không cần lưu | Lấy từ API ngoài — OK |

## 5. Lỗi mới phát hiện ở 9 board mới

1. **Tên bảng database lộ ra giao diện người dùng.** Ví dụ: "RENTAL_ASSET_ASSIGNMENTS", "BOOKING_PARTICIPANTS", "Áp dụng mã khuyến mãi (PROMOTIONS)", "Tự động khấu trừ chiết khấu (#ORDERS.discount_amount)", "(#TRANSACTIONS type='Refund')", "QUY ĐỊNH HOÀN TIỀN · REFUND_POLICY_RULES", "ORDERS.cancel_reason", "Lưu vết bảo chứng (#PARTICIPANT_POST_READS)". Nên chuyển sang annotation/comment của Penpot, không để trong text.
2. **Các annotation đó dùng tên bảng cũ (ERD v2)**: `RENTAL_ASSET_ASSIGNMENTS` → nay là `asset_assignments`; `TRANSACTIONS` → nay là `payments`.
3. `01b_Tour_Detail_Fansipan` vẫn dùng footer cũ: "© 2024", "Nền tảng cho thuê thiết bị dã ngoại P2P", "Dành Cho Chủ Đồ", "Giải Quyết Tranh Chấp".
4. Mã vé `#TRK-2026-FANSIPAN` vẫn khác mã đơn `#TRK847392` (SQL chỉ có `orders.order_code`).
5. Tên thương hiệu vẫn là "TrekRent".

## 6. Cần làm thêm để phủ 100%

### Admin / back-office (lý do chính của 34 bảng ◐)

1. **Người dùng & vai trò** — `accounts`, `roles`, `profiles`.
2. **Danh mục & địa điểm** — `categories` (`category_type`), `locations`.
3. **Sản phẩm** — CRUD `products` + `product_variants` (size, màu, SKU) + `product_variant_images` + `rental_price_tiers`.
4. **Combo** — `product_bundles` + `product_bundle_items` + bảng giá combo.
5. **Kho tài sản** — `equipment_assets` (trạng thái, tình trạng, lịch giữ đồ từ `asset_assignments`).
6. **Tour** — CRUD `tours` (phiên bản, khóa lịch trình) + `tour_images` + `tour_activities` + `tour_preparation_items` + `tour_provided_items` + `tour_posts`.
7. **Lịch khởi hành** — danh sách + tạo `trips`, `tour_recurrence_rules`.
8. **Chính sách hoàn tiền** — `refund_policies` (phiên bản, hiệu lực) + `refund_policy_rules`.
9. **Khuyến mãi** — `promotions` + `promotion_tiers`.
10. **Bài viết** — `posts`, `tags`, `soft_skills`.
11. **Đối soát thanh toán** — danh sách `payments`.
12. **Thông báo, nhật ký, cấu hình** — `notifications`, `audit_logs`, `system_configurations`.

### Khách hàng

13. Quên / đặt lại mật khẩu (`password_reset_tokens`), đăng nhập Google (`user_external_logins`), hồ sơ cá nhân.
14. "Đơn của tôi" (thuê + tour), hủy đơn thuê.
15. PDP: chọn biến thể, bảng giá theo bậc ngày, combo; giỏ nhiều món.
16. Checkout tour: đếm ngược giữ chỗ (`hold_expires_at`), `grouping_preference`, ngày sinh + tên người liên hệ khẩn cấp.

### Staff / Hướng dẫn viên

17. Duyệt tách đoàn (`is_split`, `split_approved_by_user_id`).
18. Điểm danh theo `tour_activities`, ghi `checked_by_user_id`.
19. Gán mã asset cho đơn thuê đồ (màn Kiểm tra đồ / Giao nhận cũ).

## 6b. Đếm số màn còn thiếu

Quy ước: 1 màn = 1 board. Màn quản trị dữ liệu lớn tính riêng **danh sách** và **form tạo/sửa**; dữ liệu đơn giản (danh mục, địa điểm, tag) tính 1 màn (form dạng modal).

**Tổng: 35 màn mới + 10 màn hiện có cần sửa.**

### Admin / back-office — 24 màn

| # | Màn | Bảng |
|---|---|---|
| 1 | Người dùng — danh sách | `accounts`, `roles` |
| 2 | Người dùng — tạo/sửa (gán vai trò, khóa) | `accounts`, `roles`, `profiles` |
| 3 | Danh mục (danh sách + modal) | `categories` |
| 4 | Địa điểm (danh sách + modal chọn tọa độ) | `locations` |
| 5 | Sản phẩm — danh sách | `products` |
| 6 | Sản phẩm — tạo/sửa (biến thể, ảnh, bảng giá) | `product_variants`, `product_variant_images`, `rental_price_tiers` |
| 7 | Combo — danh sách | `product_bundles` |
| 8 | Combo — tạo/sửa (thành phần, bảng giá) | `product_bundle_items`, `rental_price_tiers` |
| 9 | Kho tài sản — danh sách | `equipment_assets` |
| 10 | Kho tài sản — chi tiết (lịch sử, lịch giữ đồ) | `equipment_assets`, `asset_assignments` |
| 11 | Tour — danh sách | `tours` |
| 12 | Tour — tạo/sửa (ảnh, lịch trình, đồ, bài viết, phiên bản) | `tour_images`, `tour_activities`, `tour_preparation_items`, `tour_provided_items`, `tour_posts` |
| 13 | Lịch khởi hành — danh sách chuyến | `trips` |
| 14 | Tạo chuyến / lịch lặp | `trips`, `tour_recurrence_rules` |
| 15 | Chính sách hoàn tiền — danh sách + phiên bản | `refund_policies` |
| 16 | Chính sách hoàn tiền — tạo/sửa mốc | `refund_policy_rules` |
| 17 | Khuyến mãi — danh sách | `promotions` |
| 18 | Khuyến mãi — tạo/sửa (bậc, quà tặng) | `promotion_tiers` |
| 19 | Bài viết — danh sách | `posts` |
| 20 | Bài viết — soạn thảo | `posts`, `post_tags`, `post_soft_skills` |
| 21 | Tag & kỹ năng mềm | `tags`, `soft_skills` |
| 22 | Đối soát thanh toán | `payments` |
| 23 | Nhật ký hệ thống | `audit_logs` |
| 24 | Cấu hình hệ thống | `system_configurations` |

### Khách hàng — 8 màn

| # | Màn | Bảng |
|---|---|---|
| 25 | Quên mật khẩu (nhập email) | `password_reset_tokens` |
| 26 | Đặt lại mật khẩu | `password_reset_tokens` |
| 27 | Hồ sơ cá nhân + đổi mật khẩu | `profiles`, `accounts` |
| 28 | Đơn của tôi (thuê + tour) | `orders` |
| 29 | Chi tiết combo | `product_bundles`, `product_bundle_items` |
| 30 | Giỏ / điền thông tin đơn thuê nhiều món | `rental_order_items`, `rental_orders` |
| 31 | Kết quả thanh toán (thành công / thất bại) | `payments` |
| 32 | Thông báo (dùng chung mọi vai trò) | `notifications` |

### Hệ thống & mobile — 3 màn

| # | Màn |
|---|---|
| 33 | Trang 403 |
| 34 | Trang 404 |
| 35 | Điểm danh bản mobile cho hướng dẫn viên |

### Màn hiện có cần sửa — 10 màn

| # | Màn | Cần sửa |
|---|---|---|
| 1 | Trang đăng ký | Thêm họ tên, SĐT riêng |
| 2 | Trang đăng nhập | Nút đăng nhập Google (`user_external_logins`), state lỗi |
| 3 | `product-detail-rental` | Chọn biến thể (size/màu), bảng giá theo bậc ngày |
| 4 | `escrow-checkout` | Bước điền thông tin, chọn phương thức thanh toán, mã khuyến mãi |
| 5 | `02b_Tour_Checkout_With_Voucher` | Ngày sinh, tên người liên hệ khẩn cấp, `grouping_preference`, đếm ngược giữ chỗ |
| 6 | `Staff_Trip_Detail_And_Manifest` | Modal duyệt tách đoàn (`is_split`) |
| 7 | `diem-danh-thanh-vien` | Chọn hoạt động (`tour_activities`), ghi người điểm danh |
| 8 | `Giao nhận & Kiểm tra đồ` / `Kiểm tra đồ` | Gán mã asset cho đơn thuê, nhân viên phụ trách |
| 9 | 9 board mới | Gỡ tên bảng database khỏi text, sửa footer P2P / © 2024 |
| 10 | `owner-dashboard` | Bỏ hoặc gộp vào `Tổng quan vận hành` |

## 6c. Màn đang sai nghiệp vụ

Chuẩn so sánh: schema SQL (công ty sở hữu đồ, Staff xử lý đơn, không có chủ đồ / hoa hồng / ký quỹ / tranh chấp). Chỉ tính lỗi nghiệp vụ; lỗi trình bày (footer cũ, tên thương hiệu) không tính ở đây.

### 🔴 Sai mô hình — cần làm lại (6)

| Màn | Sai ở đâu |
|---|---|
| `owner-dashboard` | Cả màn là cổng của **chủ đồ cá nhân** (doanh thu, thiết bị đang cho thuê); dữ liệu đơn TRK847392, TRK711209 mâu thuẫn với các màn Staff. Nên bỏ |
| `escrow-checkout` | Luồng dựa trên **ký quỹ**: "tài khoản trung gian", "Chủ đồ chỉ được giải ngân 240.000đ…". SQL chỉ có `payments` thanh toán / hoàn |
| `Chi tiết đơn TRK847392` | "Chủ đồ", "Hoa hồng Sàn (10%)", "Trả Chủ đồ 216.000đ", "Sàn đang giữ 740.000đ", "Chủ đồ sẽ bàn giao trực tiếp"; không có nhân viên phụ trách (`handled_by_user_id`) |
| `Giao nhận & Kiểm tra đồ` | Bàn giao do **chủ đồ** thực hiện ("Chờ Chủ đồ xác nhận", "Chủ đồ chụp toàn cảnh"); cột "Trạng thái" là mức khẩn, không phải trạng thái đơn |
| `Kiểm tra đồ • TRK847392` | "Hoàn đủ cọc cho Khách và giải ngân…" cho chủ đồ; "Mở tranh chấp" (SQL không có); khuyến nghị **hoàn đủ cọc khi còn hạng mục "Cần xem xét"** |
| `transaction-tracker` | Bàn giao "chụp ảnh cùng chủ lều", "chủ lều không phản hồi"; bước 1 "Đặt cọc" trong khi khách đã trả toàn bộ 740.000đ |

### 🟠 Sai một phần — sửa luồng / dữ liệu (14)

| Màn | Sai ở đâu |
|---|---|
| `home-gear-discovery` | Nội dung chính mô tả P2P: "chủ lều giàu kinh nghiệm", "Chủ đồ KHÔNG nhận được tiền cho đến khi…", nút "Đăng đồ cho thuê" |
| `product-detail-rental` | Hoàn cọc "sau khi chủ đồ xác nhận nhận lại lều"; quy tắc hoàn cọc khác với checkout và tracker |
| `Tổng quan vận hành` | KPI "đơn được Sàn bảo chứng", "Doanh thu & hoa hồng", việc loại "Tranh chấp" |
| `Quản lý đơn thuê` | Cột chủ đồ, "Tổng ký quỹ", trạng thái "TRANH CHẤP" |
| Trang đăng ký | Cho đăng ký bằng **"Email hoặc Số điện thoại"**, nhưng `accounts.email` NOT NULL; thiếu `full_name` (NOT NULL) |
| Trang đăng nhập | Cho đăng nhập bằng SĐT, nhưng `accounts.phone` không UNIQUE nên không định danh được |
| `diem-danh-thanh-vien` | Điểm danh một lần chung, nhưng `activity_attendances.tour_activity_id` NOT NULL — **không lưu được nếu không chọn hoạt động**; thiếu người điểm danh |
| `01b_Tour_Detail_Fansipan` | "100% tiền giữ tại Escrow đến khi xong tour"; **cọc thiết bị 500.000đ cho tour** (SQL không có cột) |
| `02b_Tour_Checkout_With_Voucher` | "Tổng ký quỹ", "tiền giữ tại Escrow"; cọc thiết bị 1.000.000đ (không có cột); thu **CCCD** (không có cột) |
| `Tour Checkout - Step 2` | Bước "Ký quỹ an toàn", cam kết giữ tiền đến khi bàn giao |
| `04b_Escrow_Settlement_With_Charges` | "Quyết toán ký quỹ", "Giải ngân Ban tổ chức"; **khấu trừ hư hại đồ tour** nhưng `rental_charges.rental_order_id` NOT NULL; "Đánh giá tour guide" trong khi `reviews` đánh giá theo chuyến (`participant_id`) |
| `05_Refund_Policy_And_Cancel_Tour` | Mỗi mốc có **2 tỷ lệ** (tour + cọc), SQL chỉ có 1 `refund_percentage`; ghi "**Hoàn tiền tự động** trong 24h" nhưng màn Staff lại phải **thẩm định và duyệt** |
| `Staff_Order_Management_And_Refund_Approval` | Trạng thái "Đã ký quỹ"; khoản hoàn "Cọc đồ chưa xuất" của đơn tour (không có cột); lưu tài khoản nhận hoàn (không có bảng); không ghi người duyệt |
| `Staff_Post_Trip_Inspection` | Cột "Khách dùng" theo từng asset (`asset_assignments` không có `participant_id`); khấu trừ đồ tour (cùng lỗi `rental_charges`); tài khoản nhận hoàn |

### 🟡 Sai nhẹ — thêm cột hoặc đổi nhãn (7)

| Màn | Sai ở đâu |
|---|---|
| `Staff_Trip_Detail_And_Manifest` | Cột CCCD (không có cột) |
| `Staff_Trip_Equipment_Preparation` | Gán asset cho từng khách "(Gia Huy)" — thiếu `participant_id`; người nhận bàn giao (Lead Guide) không có cột |
| `03-E-Ticket` | Mã vé `#TRK-2026-FANSIPAN` khác `orders.order_code` (`#TRK847392`); 03b và màn Staff nghiệm thu cũng dùng mã vé này |
| `Quản lý hướng dẫn viên` | Lọc theo "Khu vực phụ trách", cột "Ngôn ngữ" — không có trong SQL |
| `Chi tiết hướng dẫn viên` | Chứng chỉ, lịch nghỉ bù — không có bảng |
| `Quản lý công việc hướng dẫn viên` | Ghi chú sức khỏe từng khách (dị ứng, say xe) — `booking_participants` không có cột |
| `Combo trekking 2N1Đ` | Gọi tour là "Combo", dễ nhầm với `product_bundles` (combo đồ thuê) |

### Màn trùng / lỗi thời — nên bỏ (3)

| Màn | Thay bằng |
|---|---|
| `Tour Checkout - Step 1` | `02b_Tour_Checkout_With_Voucher` (đủ nhiều người tham gia + voucher) |
| `04-Trip-Concluded` | `04b_Escrow_Settlement_With_Charges` (có quyết toán + gửi đánh giá) |
| `tour_booking_prototype.html.html by html.to.design…` | `01b_Tour_Detail_Fansipan` |

### Màn không sai nghiệp vụ

`03b_Safety_Handbook_And_Skill_Check`, Trang xác thực OTP (`email_confirmed_at`), `design-system-ui-kit`, `Mở đầu (font, color)`.

### Quyết định cần chốt để sửa hàng loạt

1. Bỏ hẳn mô hình chủ đồ / hoa hồng / ký quỹ / tranh chấp (theo SQL) — sửa 6 màn 🔴 và phần lớn 🟠.
2. Đơn tour có thu **cọc thiết bị** không? Nếu có: thêm cột cọc cho `trip_booking_orders`, cho `rental_charges` gắn với đơn tour, và thêm tỷ lệ hoàn cọc trong `refund_policy_rules`.
3. Hoàn tiền khi hủy tour là **tự động** hay **Staff duyệt**?
4. Có thu CCCD, tài khoản nhận hoàn, ghi chú sức khỏe, ảnh minh chứng không? Nếu có → bổ sung cột/bảng (xem [mục 4](#4-dữ-liệu-trên-ui-nhưng-sql-chưa-có)).
5. Đăng ký/đăng nhập bằng SĐT có được phép không? Nếu có → `phone` phải UNIQUE và `email` cho phép NULL.

## 7. Ghi chú

- Phần dữ liệu của 9 board mới được đọc trực tiếp từ Penpot ngày 22/10/2026. Các board cũ dùng kết quả review 06/10; nếu board cũ đã được sửa sau ngày đó, cần đọc lại.
- Chưa export ảnh để review chất lượng thị giác (layout, contrast, cỡ chữ) của 9 board mới.
- Mức ✔ / ◐ / ✘ đánh giá theo việc có màn cho luồng chính của vai trò sử dụng bảng đó, kể cả màn tạo/sửa của Admin cho dữ liệu gốc.

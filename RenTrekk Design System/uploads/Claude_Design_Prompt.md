# Prompt cho Claude Design — UI/UX toàn bộ RenTrekk

> Cách dùng: dán **Phần 0 (Master Prompt)** + **Phụ lục A, B** vào Claude Design trước để dựng design system + khung app. Sau đó dán lần lượt **Batch 1 → Batch 5** (mỗi batch một lượt). Nếu Claude Design mất ngữ cảnh, dán lại Phụ lục A.

---

## Phần 0 — Master Prompt

```
Bạn là Senior Product Designer. Hãy thiết kế UI/UX hoàn chỉnh (hi-fi, có thể click prototype) cho RenTrekk — nền tảng web (chỉ thiết kế giao diện web trên máy tính, không làm bản mobile) cho:
(1) khám phá & đặt chuyến trekking cho nhiều người, (2) thuê thiết bị ngoài trời (món lẻ hoặc combo, giá theo số ngày),
(3) vận hành chuyến (chia nhóm, guide, điểm danh, đồ cấp), (4) giao nhận thiết bị theo mã asset, (5) thanh toán, cọc, phí phát sinh, hoàn tiền, khuyến mãi, (6) nội dung hướng dẫn & review.

NGÔN NGỮ & ĐỊNH DẠNG
- Giao diện tiếng Việt. Tiền VND, số nguyên, định dạng "1.250.000 ₫" (dữ liệu là dec(18,0), không có xu).
- Ngày giờ: "Th 7, 14/11/2026 · 05:30 (GMT+7)". Luôn hiển thị múi giờ ở bước xác nhận.
- Không bao giờ hiển thị tên bảng, khóa ngoại, GUID, enum nội bộ cho khách hàng. Mã hiển thị cho người dùng: order_code, asset_code, sku, user_code.

VAI TRÒ (mỗi tài khoản đúng 1 role — USERS.role_id)
- Guest: xem tour, chuyến công khai, thiết bị, bài viết.
- Customer: đặt tour/thuê đồ, theo dõi đơn, yêu cầu hủy, khai báo participant, review.
- Staff: điều phối chuyến được giao, chia nhóm, xử lý đơn thuê, cấp/thu asset, lập phí, chuẩn bị đồ cấp, viết bài.
- Guide: chỉ xem nhóm mình phụ trách, danh sách participant + liên hệ khẩn cấp, điểm danh theo hoạt động. Không thấy thông tin thanh toán.
- Admin: toàn quyền danh mục, tour, chính sách hoàn tiền, khuyến mãi, user/role, cấu hình, audit, duyệt hoàn/hủy phí.

KHU VỰC ỨNG DỤNG
- Customer site (public + "Tài khoản của tôi"): top nav, footer.
- Back-office (Staff/Admin): sidebar trái thu gọn được, topbar có tìm kiếm toàn cục theo order_code / asset_code / sku / email, chuông thông báo, avatar. Menu ẩn/hiện theo role.
- Khu vực Guide (cùng ứng dụng web): sidebar trái gồm Chuyến hôm nay · Nhóm · Điểm danh · Thông báo · Tôi; nút và ô điểm danh to, rõ để thao tác nhanh.
- Toàn bộ dự án là WEB. Chỉ thiết kế một bản web cho mỗi màn hình, khung 1440px (nội dung tối đa ~1280px, căn giữa). KHÔNG thiết kế bản mobile/tablet.

DESIGN SYSTEM (dựng trước, đặt tên token)
- Phong cách: "Biển mây Fansipan" — trầm, cao cấp, cảm hứng bầu trời đêm trên đỉnh Fansipan, biển mây xám bạc và nắng bình minh. Bố cục màu 60% nền ngà-mây / 30% xanh đêm / 10% đỏ bình minh. Có light và dark mode. Dùng ĐÚNG bảng màu dưới đây, không tự thêm màu.

BẢNG MÀU (token → hex)
- Primary "Night" — xanh đêm (header, nút chính, tab active, focus ring, link):
  night-50 #EEF1F7 · 100 #D6DDEA · 200 #ADBBD3 · 300 #8193B5 · 400 #536A93 · 500 #31476F (link, chữ nhấn: 9.3:1 trên trắng) · 600 #213456 · 700 #14213D (MAIN: nền header, nút primary chữ trắng 16:1) · 800 #0E182D · 900 #080E1C
- Accent "Dawn" — đỏ bình minh (CHỈ cho CTA chuyển đổi: "Đặt ngay", "Thanh toán", "Thêm vào giỏ thuê"; tối đa 1 nút accent mỗi màn):
  dawn-50 #FBEFE9 · 100 #F5D6C7 · 300 #E29A78 · 500 #C46A42 (chỉ trang trí, không đặt chữ trắng lên) · 600 #A4532F (MAIN: nền nút, chữ trắng 5.4:1) · 700 #84411F · 900 #4A2210
- Neutral "Mist" — mây (nền, viền, chữ):
  mist-50 #F5F4F1 (nền trang) · 100 #ECEAE5 (nền phụ, hàng hover) · 200 #DDDAD3 (border) · 300 #C5C3BD (border đậm) · 400 #9AA1AC (chỉ icon/viền trang trí, KHÔNG làm chữ) · 500 #5E6B80 (placeholder, caption) · 600 #4A5870 (chữ phụ) · 700 #343F52 · 800 #232B38 · 900 #151A24 (chữ chính)
  Surface (card, bảng, modal) = #FFFFFF. Đường kẻ trang trí mảnh có thể dùng dawn-300 #E29A78 (gợi tia nắng).
- Semantic (bg nhạt / chữ-viền đậm) — tách biệt với primary và accent:
  success  #E7F6EC / #166534
  info     #E0F2F6 / #0E7490 (xanh ngọc, để không lẫn với xanh đêm primary)
  warning  #FEF3C7 / #B45309
  danger   #FFE4E8 / #BE123C (đỏ hồng, để không lẫn với đỏ bình minh của nút CTA)
  progress #EDE9FE / #6D28D9 (đang diễn ra)
  neutral  #ECEAE5 / #4A5870 (nháp, chưa bắt đầu, đã lưu trữ)
- Dark mode: nền #0B1120 · surface #121A2E · surface nổi #1A2440 · border #2A3554 · chữ chính #EEF1F7 · chữ phụ #AEB9C8 · primary/link #8FA8D8 (chữ trên nút primary #0B1120) · accent #D9875F (chữ trên nút #2A1206) · badge semantic: nền = màu đậm 20% opacity, chữ = bản sáng (success #4ADE80, info #67D3E8, warning #FBBF24, danger #FB7190, progress #C4B5FD).
- Màu dữ liệu (Gantt phân bổ thiết bị, chart): Đơn thuê = info #0E7490 · Đồ cấp chuyến = night-500 #31476F · Quà khuyến mãi = dawn-600 #A4532F. Chart nhiều series theo thứ tự: #14213D, #A4532F, #0E7490, #6D28D9, #B45309, #9AA1AC.
- Quy tắc: chữ trên nền màu luôn dùng tông đậm nhất của cùng họ màu; nút secondary = nền trắng, viền mist-300, chữ night-700; nút ghost = chữ night-500; nút destructive = danger #BE123C chữ trắng (6.3:1); hero dùng ảnh phong cảnh phủ lớp night-700 opacity 55% để chữ trắng luôn đọc được; mọi cặp chữ/nền đạt WCAG AA (≥ 4.5:1, chữ lớn ≥ 3:1).
- Typography: Be Vietnam Pro (hỗ trợ dấu tiếng Việt). Grid 12 cột, spacing 4/8.
- Components: Button (primary/secondary/ghost/destructive), Input/Select/DatePicker/DateRangePicker/TimePicker, Stepper, Tabs, Table (sort, filter, pagination, bulk action, ẩn/hiện cột), Card tour, Card sản phẩm, Price breakdown, Status badge, Timeline trạng thái, Empty/Loading skeleton/Error, Toast, Modal xác nhận có "xem trước tác động + ô lý do", Drawer chi tiết, Image gallery, Rating stars, Kanban board, Calendar (tháng/tuần), Gantt timeline, Scanner input (quét/nhập asset_code).
- Status badge LUÔN có chữ + icon, không chỉ dùng màu (WCAG 2.2 AA). Một bộ màu cố định cho mọi enum (xem Phụ lục B).
- Mọi form: lỗi gắn đúng trường, điều hướng bàn phím, nút submit có loading và chống bấm 2 lần; khi mất mạng lúc gửi thì hiển thị "Kiểm tra lại kết quả" thay vì tạo bản ghi mới.
- Không hiển thị giá 0 khi giá chưa tải được — dùng skeleton.

QUY TẮC MAP DỮ LIỆU (BẮT BUỘC)
- Mỗi field trên UI phải tương ứng 1 cột trong Phụ lục A. Ghi "TABLE.column" trong annotation/dev-note của frame, KHÔNG hiển thị cho người dùng.
- Field có "?" là nullable → UI phải có trạng thái rỗng ("Chưa cập nhật").
- Cột is_deleted → UI dùng "Ẩn / Lưu trữ", không có "Xóa vĩnh viễn".
- created_at/updated_at → hiển thị trong drawer chi tiết dạng "Tạo lúc · Cập nhật lúc".
- Không tự bịa field ngoài Phụ lục A. Thông tin suy ra (ví dụ "số chỗ còn lại") phải ghi công thức trong dev-note, ví dụ: TRIPS.total_slots − Σ TRIP_BOOKING_ORDERS.participant_count của các đơn còn hiệu lực.
- Mỗi Order đúng 1 loại (Tour HOẶC Rental) — không thiết kế giỏ hàng trộn tour và đồ thuê.

Lượt này: tạo trang Design System (tokens, components, status badge theo Phụ lục B) + sitemap 3 khu vực + layout shell từng khu vực. Chưa cần chi tiết màn hình.
```

---

## Batch 1 — Xác thực & Hồ sơ (mọi vai trò)

```
Dùng design system đã tạo. Thiết kế bản web:

1. Đăng nhập: email + mật khẩu; nút "Đăng nhập với Google" (USER_EXTERNAL_LOGINS.provider). Trạng thái: sai mật khẩu, tài khoản bị khóa (USERS.status), chưa xác thực email (USERS.email_confirmed_at rỗng).
2. Đăng ký: full_name, email, phone?, mật khẩu (USERS). Mặc định role Customer.
3. Quên mật khẩu → nhập email → màn "đã gửi" → đặt lại mật khẩu (PASSWORD_RESET_TOKENS: link hết hạn theo expires_at, đã dùng theo used_at).
4. Hồ sơ cá nhân: USERS (full_name, email, phone?) + PROFILES (avatar_url?, address?, date_of_birth?, bio?, user_code chỉ đọc). Với Guide thêm career_start_date? → hiển thị "X năm kinh nghiệm".
5. Bảo mật & phiên: danh sách phiên từ REFRESH_TOKENS (created_at, expires_at, revoked_at?) với "Đăng xuất phiên này" / "Đăng xuất tất cả thiết bị"; tài khoản liên kết (USER_EXTERNAL_LOGINS: provider, created_at); USERS.last_login_at.
6. Trung tâm thông báo: NOTIFICATIONS (notification_type → icon, title, content, created_at, read_at? rỗng = chưa đọc, in đậm). Bấm vào điều hướng theo related_entity_type + related_entity_id (đơn, chuyến, phí…). Filter Tất cả / Chưa đọc, "Đánh dấu tất cả đã đọc".
```

---

## Batch 2 — Customer: Khám phá, Tour, Đặt chuyến

```
1. Trang chủ / Khám phá: hero tìm kiếm (LOCATIONS.name, khoảng ngày, số người), tour nổi bật, chuyến sắp khởi hành, combo thuê nổi bật, bài viết hướng dẫn mới. Trạng thái: không có kết quả, đang tải, lỗi kết nối.

2. Danh sách tour: card = ảnh primary (TOUR_IMAGES.is_primary), TOURS.name, CATEGORIES.name, LOCATIONS.name, "duration_days ngày duration_nights đêm", "Từ base_price ₫", ngày khởi hành gần nhất (TRIPS.start_at), rating TB (AVG REVIEWS.rating qua participant → trip → tour). Filter: danh mục, địa điểm, số ngày, khoảng giá, khoảng ngày. Sort: giá, ngày gần nhất, đánh giá.

3. Chi tiết tour:
   - Gallery TOUR_IMAGES (display_order), tên, mô tả, địa điểm chính + bản đồ (LOCATIONS.address, latitude, longitude).
   - Lịch trình theo ngày: nhóm TOUR_ACTIVITIES theo day_number; mỗi dòng start_time · name · duration_minutes · description?.
   - "Bạn cần tự mang": TOUR_PREPARATION_ITEMS (item_name, note?).
   - "Được cấp sẵn": TOUR_PROVIDED_ITEMS → PRODUCT_VARIANTS.variant_name + quantity + quantity_basis ("mỗi người"/"mỗi nhóm"), note?.
   - Bài hướng dẫn liên quan: TOUR_POSTS → POSTS (display_order).
   - Bảng lịch khởi hành (TRIPS): start_at–end_at, price_per_person, số chỗ còn, min_participants ("Khởi hành khi đủ X người"), status (Mở bán / Đóng bán / Hết chỗ / Đã hủy), nút "Chọn chuyến".
   - Chính sách hoàn tiền của chuyến (TRIPS.refund_policy_id → REFUND_POLICY_RULES: "Hủy trước ≥ min_hours_before giờ → hoàn refund_percentage%").
   - Review: rating, comment?, created_at, tên participant (viết tắt).
   - Trạng thái: tour đã lưu trữ nhưng khách vẫn có đơn lịch sử (banner thông báo).

4. Checkout tour (Stepper 4 bước) — tạo ORDERS (order_type = Tour) + TRIP_BOOKING_ORDERS + BOOKING_PARTICIPANTS:
   B1 Số người (participant_count ≤ chỗ còn) + grouping_preference ("Đi chung một nhóm" / "Cho phép chia nhóm").
   B2 Thông tin từng participant: full_name, email?, phone?, date_of_birth?, emergency_contact_name?, emergency_contact_phone?. Checkbox "Tôi cũng là người tham gia" (linked_user_id = tài khoản hiện tại). Lỗi gắn đúng trường.
   B3 Khuyến mãi: nhập promotion_code hoặc chọn khuyến mãi tự động; hiện bậc đạt được (PROMOTION_TIERS.min_threshold, discount_type, discount_value) hoặc quà thiết bị (gift_product_variant_id, gift_quantity). Lỗi: hết lượt (max_uses), vượt lượt/người (max_uses_per_user), hết hạn (end_at), không cộng dồn (is_stackable).
   B4 Xác nhận & thanh toán: Price breakdown = participant_count × unit_price = subtotal_amount − discount_amount = total_amount; tóm tắt policy hoàn tiền; đếm ngược hold_expires_at; chọn payment_method. Trạng thái: giá đã thay đổi, hết chỗ khi xác nhận, hết hạn giữ chỗ, "Đang chờ xác nhận thanh toán" (KHÔNG coi redirect thành công là đã thanh toán).
   Màn kết quả: order_code, badge status đơn + badge payment_status tách riêng.
```

---

## Batch 3 — Customer: Thuê thiết bị, Đơn, Chuyến của tôi, Review, Blog

```
1. Danh mục thuê: tab "Thiết bị lẻ" (PRODUCTS) và "Combo" (PRODUCT_BUNDLES), lọc theo CATEGORIES (category_type dành cho thuê). Card: ảnh primary (PRODUCT_VARIANT_IMAGES), tên, "Từ X ₫/ngày" (min RENTAL_PRICE_TIERS.daily_price). Filter: danh mục, khoảng ngày thuê (lọc khả dụng), size, color.

2. Chi tiết sản phẩm: gallery theo variant; chọn variant (variant_name, size?, color?, hiện sku); bảng giá bậc theo số ngày (RENTAL_PRICE_TIERS: min_days–max_days? → daily_price); DateRangePicker rental_start_at → rental_end_at; số lượng; badge khả dụng "Còn N thiết bị trong khoảng này" (dev-note: đếm EQUIPMENT_ASSETS sẵn sàng không trùng ASSET_ASSIGNMENTS reserved_from–reserved_until). Trạng thái: chưa có bậc giá, hết hàng trong khoảng.

3. Chi tiết combo: thành phần PRODUCT_BUNDLE_ITEMS (variant + quantity), bậc giá của bundle, khả dụng theo thành phần thiếu nhất ("Thiếu: Lều 2 người").

4. Giỏ & Checkout thuê — ORDERS (order_type = Rental) + RENTAL_ORDERS + RENTAL_ORDER_ITEMS: mỗi dòng là variant HOẶC bundle, quantity × daily_price × billable_days = line_amount; subtotal_amount, giảm giá (APPLIED_PROMOTIONS có thể gắn theo dòng qua rental_order_item_id), deposit_amount tách riêng ("Tiền cọc — hoàn lại sau khi trả đồ"), total_amount; note?; điều kiện nhận/trả. Trạng thái: hết asset lúc xác nhận.

5. Đơn của tôi: tabs Tất cả / Tour / Thuê; mỗi dòng order_code, loại, created_at, total_amount, 2 badge riêng: status + payment_status. Trạng thái đặc biệt: "Đã hủy · Đang hoàn tiền".

6. Chi tiết đơn tour: chuyến, danh sách participant (+ nhóm nếu đã chia), breakdown giá, khuyến mãi đã áp, timeline giao dịch (TRANSACTIONS: transaction_type, purpose, amount, payment_method, status, processed_at?). Nút "Yêu cầu hủy" → modal xem trước số tiền hoàn theo REFUND_POLICY_RULES + ô cancel_reason.

7. Chi tiết đơn thuê: khoảng thuê, các dòng thuê; với combo hiện snapshot thành phần (RENTAL_BUNDLE_ITEM_SNAPSHOTS.quantity_per_bundle); asset đã giao (ASSET_ASSIGNMENTS → EQUIPMENT_ASSETS.asset_code, assigned_at, returned_at?, return_condition?); hạn trả; phí phát sinh (RENTAL_CHARGES: charge_type Trễ hạn/Hỏng/Mất, amount, reason, status); quyết toán cọc. Trạng thái: trả một phần, phí đang tranh chấp.

8. Chuyến của tôi: các BOOKING_PARTICIPANTS có linked_user_id = tài khoản hiện tại (kể cả do người khác đặt hộ). Thẻ chuyến: tour, ngày, nhóm (TRIP_GROUPS.group_name) + guide, checklist tự mang (TOUR_PREPARATION_ITEMS), đồ được cấp, bài cần đọc (TOUR_POSTS) với tiến độ "Đã đọc 2/4" (PARTICIPANT_POST_READS.read_at). Trạng thái: được đặt hộ nhưng chưa liên kết tài khoản.

9. Viết review (REVIEWS: rating 1–5, comment?) — mỗi participant tối đa 1 review. Trạng thái không đủ điều kiện: chuyến chưa hoàn thành, đơn chưa thanh toán, không phải participant, đã review (cho phép sửa).

10. Blog / Hướng dẫn: danh sách POSTS (post_type, title, published_at?), filter theo TAGS và SOFT_SKILLS; chi tiết bài (content rich text, tag, kỹ năng), bài liên quan.
```

---

## Batch 4 — Back-office (Staff/Admin)

```
Desktop-first, bảng dày dữ liệu, drawer chi tiết bên phải; mọi hành động nhạy cảm có modal "xem trước tác động + lý do" (được ghi AUDIT_LOGS).

1. Dashboard: việc cần xử lý (đơn PendingPayment sắp hết hold_expires_at, chuyến sắp khởi hành thiếu đồ cấp, asset quá hạn trả, giao dịch NeedsReconciliation, phí Draft chờ chốt); KPI: booking tuần, tỉ lệ lấp chỗ, doanh thu, asset đang cho thuê; chart.

2. Người dùng & vai trò (Admin): bảng USERS (full_name, email, ROLES.role_name, status, last_login_at?); drawer: PROFILES, phiên REFRESH_TOKENS (thu hồi), khóa/mở tài khoản, đổi role.

3. Tour: bảng (name, CATEGORIES.name, LOCATIONS.name, duration, base_price, status, version). Editor nhiều tab: Thông tin chung | Ảnh (kéo thả, đặt is_primary, sắp display_order) | Lịch trình (builder theo day_number, kéo thả TOUR_ACTIVITIES) | Đồ tự mang | Đồ được cấp (chọn variant + quantity + quantity_basis) | Bài viết liên kết (TOUR_POSTS). Khi itinerary_locked_at có giá trị: khóa sửa lịch trình, nút "Tạo phiên bản mới" (cùng tour_family_id, version + 1); hiển thị lịch sử version.

4. Lịch lặp (TOUR_RECURRENCE_RULES): frequency, interval_value, days_of_week?, start_time, start_date–end_date, default_total_slots, default_price, is_active; preview các chuyến sẽ sinh trên calendar.

5. Chuyến (TRIPS): view Calendar + Table. Chi tiết chuyến theo tab:
   - Tổng quan: start_at, end_at, total_slots, chỗ đã bán, price_per_person, min_participants, refund policy, người điều phối (managed_by_user_id), status + nút chuyển trạng thái theo vòng đời (Draft → Open → ClosedForBooking → InProgress → Completed / Cancelled).
   - Booking: TRIP_BOOKING_ORDERS (order_code, người đặt, participant_count, grouping_preference, payment_status).
   - Chia nhóm: Kanban — cột "Chưa xếp nhóm" + mỗi TRIP_GROUPS (group_name, guide, max_participants, số hiện tại). Kéo thả participant; cảnh báo vượt max, hoặc tách booking muốn đi chung → bắt buộc split_reason (lưu is_split, split_approved_by_user_id, split_at).
   - Đồ cấp chuyến: TRIP_PROVIDED_ITEMS (variant, required_quantity, status Thiếu/Đủ/Đã thu hồi, prepared_by_user_id?) + gán asset.
   - Điểm danh: ma trận participant × TOUR_ACTIVITIES (attendance_status, checked_at, checked_by_user_id).

6. Sản phẩm thuê: bảng PRODUCTS mở rộng thành PRODUCT_VARIANTS (sku, variant_name, size?, color?, status, số asset). Editor variant: ảnh, bậc giá RENTAL_PRICE_TIERS (min_days / max_days? / daily_price, cảnh báo khoảng chồng lấn). Combo: PRODUCT_BUNDLES + PRODUCT_BUNDLE_ITEMS + bậc giá.

7. Asset & lịch phân bổ: bảng EQUIPMENT_ASSETS (asset_code, variant, asset_status, condition_note?). View Gantt: mỗi hàng 1 asset, thanh ASSET_ASSIGNMENTS (reserved_from–reserved_until) màu theo nguồn: Đơn thuê (rental_order_item_id) / Đồ cấp chuyến (trip_provided_item_id) / Quà khuyến mãi (applied_promotion_id); badge status.

8. Đơn thuê & giao nhận: danh sách RENTAL_ORDERS (order_code, khách, rental_start_at–rental_end_at, handled_by_user_id?, status). Màn giao: Scanner input asset_code → gán vào dòng thuê (Issued, assigned_at). Màn nhận lại: quét asset → return_condition, returned_at, tạo phí nếu hỏng/trễ/mất.

9. Phí & quyết toán cọc: RENTAL_CHARGES (charge_type, equipment_asset_id?, amount, reason, status, created_by_user_id, voided_at?). Panel quyết toán: deposit_amount − Σ phí Assessed = hoàn cọc / thu thêm. "Hủy phí" chỉ Admin, bắt buộc lý do.

10. Giao dịch & hoàn tiền: bảng TRANSACTIONS (order_code, transaction_type, purpose, amount, payment_method, provider_transaction_id?, status, created_at, processed_at?). Giao dịch hoàn liên kết original_transaction_id và refund_policy_rule_id. Hàng đợi "Cần đối soát". Admin duyệt hoàn tiền.

11. Khuyến mãi: bảng PROMOTIONS (name, promotion_code?, start_at–end_at, applies_to, application_scope, is_stackable, priority, max_uses?, max_uses_per_user?, status). Editor bậc PROMOTION_TIERS (qualification_metric, min_threshold, discount_type, discount_value, gift variant + gift_quantity?). Tab "Lịch sử áp dụng" APPLIED_PROMOTIONS (order, discount_amount, gift, status, applied_at).

12. Nội dung: editor POSTS (title, slug, post_type, content rich text, status, published_at?), gán TAGS + SOFT_SKILLS; quản lý TAGS, SOFT_SKILLS, CATEGORIES (category_type), LOCATIONS (map picker latitude/longitude).

13. Chính sách hoàn tiền: REFUND_POLICIES (name, policy_type, status, version, effective_from–effective_until?) + editor rules (min_hours_before → refund_percentage) có preview timeline. Sửa policy đang dùng = tạo version mới (cùng policy_family_id), không sửa đè.

14. Cấu hình hệ thống (Admin): SYSTEM_CONFIGURATIONS (config_key, config_value với input theo value_type, description?, updated_by_user_id, updated_at).

15. Audit log: AUDIT_LOGS (created_at, actor hoặc "Hệ thống" khi actor_user_id rỗng, action, entity_type, entity_id → link, details dạng JSON viewer). Filter theo actor / entity / khoảng ngày.

16. Báo cáo: doanh thu theo loại đơn, tỉ lệ lấp chỗ theo chuyến, hiệu suất asset, hoàn tiền theo policy.
```

---

## Batch 5 — Khu vực Guide (web)

```
1. Chuyến hôm nay: các nhóm được phân công (TRIP_GROUPS.guide_user_id = tài khoản hiện tại). Mỗi thẻ hiện rõ TOURS.name + TRIPS.start_at + group_name + số participant — tránh nhầm khi nhiều chuyến cùng tên.
2. Chi tiết nhóm: BOOKING_PARTICIPANTS (full_name, phone? + nút gọi, emergency_contact_name?/emergency_contact_phone? + nút gọi khẩn cấp, date_of_birth? → tuổi). KHÔNG hiển thị thông tin thanh toán.
3. Điểm danh: chọn hoạt động (TOUR_ACTIVITIES theo day_number, start_time) → danh sách participant, toggle lớn Có mặt / Vắng / Đến muộn (attendance_status), lưu checked_at. Thanh tiến độ "18/20 đã điểm danh". Sửa bản đã lưu cần lý do. Mất mạng: hàng đợi chờ gửi + nút thử lại an toàn.
4. Lịch trình chuyến: timeline hoạt động theo ngày.
5. Đồ cấp của nhóm: TRIP_PROVIDED_ITEMS + asset_code đã giao.
6. Thông báo + Hồ sơ (tái dùng Batch 1).
```

---

## Phụ lục A — Data Dictionary (trích từ trang "Logical ERD" trong `Conceptual.drawio`)

`?` = nullable · UQ = duy nhất · mọi bảng chính có `created_at`, `updated_at`, `is_deleted`.

**Tài khoản**
- ROLES: role_id, role_name UQ, description?
- USERS: user_id, role_id→ROLES, email UQ, password_hash?, full_name, phone?, status, email_confirmed_at?, last_login_at?
- PROFILES: profile_id, user_id UQ, avatar_url?, address?, date_of_birth?, bio?, career_start_date?, user_code UQ
- USER_EXTERNAL_LOGINS: user_id, provider, provider_subject
- REFRESH_TOKENS: user_id, family_id, token_hash, expires_at, revoked_at?, revoked_reason?, replaced_by_refresh_token_id?
- ACCESS_TOKENS: user_id, refresh_token_id, jti, expires_at, revoked_at?, revoked_reason?
- PASSWORD_RESET_TOKENS: user_id, token_hash, expires_at, used_at?

**Danh mục & Tour**
- CATEGORIES: name, description?, status, category_type
- LOCATIONS: name, address, latitude, longitude
- TOURS: category_id, main_location_id, created_by_user_id, name, description?, duration_days, duration_nights, duration_minutes, base_price, status, tour_family_id, version, itinerary_locked_at?
- TOUR_IMAGES: tour_id, image_url, display_order, is_primary
- TOUR_ACTIVITIES: tour_id, name, description?, day_number, start_time, duration_minutes, display_order
- TOUR_PREPARATION_ITEMS: tour_id, item_name, note?
- TOUR_PROVIDED_ITEMS: tour_id, product_variant_id, note?, quantity_basis, quantity
- TOUR_RECURRENCE_RULES: tour_id, frequency, interval_value, start_date, end_date, is_active, start_time, days_of_week?, default_total_slots, default_price
- TOUR_POSTS: tour_id, post_id, display_order

**Chuyến & Vận hành**
- TRIPS: tour_id, recurrence_rule_id?, refund_policy_id, managed_by_user_id, start_at, end_at, total_slots, status, price_per_person, min_participants, row_version
- TRIP_GROUPS: trip_id, guide_user_id, group_name, max_participants, status
- TRIP_PROVIDED_ITEMS: trip_id, tour_provided_item_id, product_variant_id, prepared_by_user_id?, required_quantity, status
- BOOKING_PARTICIPANTS: booking_order_id, trip_id, linked_user_id?, trip_group_id?, full_name, email?, phone?, status, date_of_birth?, emergency_contact_name?, emergency_contact_phone?
- ACTIVITY_ATTENDANCES: tour_activity_id, participant_id, attendance_status, checked_at, checked_by_user_id

**Đơn hàng & Tài chính**
- ORDERS: order_code UQ, customer_user_id, order_type (Tour | Rental), subtotal_amount, discount_amount, total_amount, status, payment_status, hold_expires_at?, cancelled_at?, cancel_reason?, refund_policy_id, note?
- TRIP_BOOKING_ORDERS (1-1 với ORDERS): trip_id, participant_count, unit_price, grouping_preference, is_split, split_reason?, split_approved_by_user_id, split_at
- RENTAL_ORDERS (1-1 với ORDERS): handled_by_user_id?, rental_start_at, rental_end_at, deposit_amount
- RENTAL_ORDER_ITEMS: rental_order_id, product_variant_id? | bundle_id?, quantity, daily_price, billable_days, line_amount
- RENTAL_BUNDLE_ITEM_SNAPSHOTS: rental_order_item_id, product_variant_id, quantity_per_bundle
- RENTAL_CHARGES: rental_order_id, equipment_asset_id?, charge_type, amount, reason, status, created_by_user_id, voided_at?
- TRANSACTIONS: order_id, original_transaction_id?, refund_policy_rule_id?, transaction_type, purpose, amount, payment_method, provider_transaction_id?, status, processed_at?
- REFUND_POLICIES: created_by_user_id, policy_type, name, description?, status, policy_family_id, version, effective_from, effective_until?
- REFUND_POLICY_RULES: refund_policy_id, min_hours_before, refund_percentage

**Sản phẩm & Kho**
- PRODUCTS: category_id, name, description?, status, created_by_user_id
- PRODUCT_VARIANTS: product_id, sku UQ, variant_name, status, size?, color?
- PRODUCT_VARIANT_IMAGES: product_variant_id, image_url, display_order, is_primary
- PRODUCT_BUNDLES: category_id, name, description?, status
- PRODUCT_BUNDLE_ITEMS: bundle_id, product_variant_id, quantity
- RENTAL_PRICE_TIERS: product_variant_id? | bundle_id?, min_days, max_days?, daily_price
- EQUIPMENT_ASSETS: product_variant_id, asset_code UQ, asset_status, condition_note?
- ASSET_ASSIGNMENTS: equipment_asset_id, nguồn = rental_order_item_id? | trip_provided_item_id? | applied_promotion_id?, reserved_from, reserved_until, assigned_at, returned_at?, return_condition?, status

**Khuyến mãi**
- PROMOTIONS: name, description?, start_at, end_at, status, applies_to, application_scope, promotion_code? UQ, max_uses?, max_uses_per_user?, is_stackable, priority
- PROMOTION_TIERS: promotion_id, gift_product_variant_id?, min_threshold, discount_type, discount_value, gift_quantity?, qualification_metric
- APPLIED_PROMOTIONS: order_id, promotion_tier_id, rental_order_item_id?, gift_product_variant_id?, discount_amount, gift_quantity?, applied_at, status

**Nội dung, Review, Hệ thống**
- POSTS: created_by_user_id, title, slug UQ, post_type, content, status, published_at?
- TAGS: name UQ, slug UQ · POST_TAGS: post_id, tag_id
- SOFT_SKILLS: name UQ, description?, status · POST_SOFT_SKILLS: post_id, soft_skill_id
- PARTICIPANT_POST_READS: participant_id, post_id, read_at
- REVIEWS: participant_id UQ, rating, comment?
- NOTIFICATIONS: recipient_user_id, notification_type, title, content, read_at?, related_entity_type?, related_entity_id?
- AUDIT_LOGS: actor_user_id?, action, entity_type, entity_id, details
- SYSTEM_CONFIGURATIONS: config_key UQ, config_value, value_type, description?, updated_by_user_id

---

## Phụ lục B — Bộ trạng thái (đề xuất theo PRD §7, dùng cho Status badge)

| Đối tượng | Giá trị |
|---|---|
| Tour / Post / Category | Draft · Published · Archived |
| Trip | Draft · Open · ClosedForBooking · InProgress · Completed · Cancelled |
| Order.status | Draft · PendingPayment · Confirmed · InFulfillment · Completed · Expired · Cancelled |
| Order.payment_status | Unpaid · PartiallyPaid · Paid · PartiallyRefunded · Refunded · NeedsReconciliation |
| Transaction | Pending · Succeeded · Failed · Cancelled |
| AssetAssignment | Reserved · Issued · Returned · Cancelled · Lost |
| EquipmentAsset.asset_status | Available · Maintenance · Damaged · Lost · Retired |
| RentalCharge | Draft · Assessed · Settled · Voided |
| AppliedPromotion | Reserved · Applied · Reversed · Expired |
| TripProvidedItem | Missing · Ready · Recovered |
| Attendance | Present · Absent · Late |

Nhãn hiển thị bằng tiếng Việt (ví dụ PendingPayment → "Chờ thanh toán"); giá trị enum chỉ ghi trong dev-note.

**Màu badge theo nhóm ý nghĩa** (mỗi badge = nền nhạt + chữ đậm + icon):

| Nhóm màu | Icon gợi ý | Trạng thái |
|---|---|---|
| neutral (xám mây) | ○ | Draft, Archived, Unpaid, Expired, Voided, chưa điểm danh, AssetAssignment.Cancelled, Retired |
| info (xanh ngọc) | ⏳ | Open, Pending, Reserved (assignment/khuyến mãi), PartiallyRefunded, Refunded |
| warning (hổ phách) | ! | PendingPayment, ClosedForBooking, PartiallyPaid, Assessed, Maintenance, Late, Missing (thiếu đồ) |
| progress (tím) | ▶ | InProgress, InFulfillment, Issued |
| success (xanh lá) | ✓ | Published, Confirmed, Completed, Paid, Succeeded, Returned, Applied, Settled, Available, Ready, Recovered, Present |
| danger (đỏ hồng) | ✕ | Cancelled (trip/order/transaction), Failed, NeedsReconciliation, Lost, Damaged, Absent, Reversed |

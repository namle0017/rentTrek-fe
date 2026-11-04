# Đánh giá UI/UX — Penpot "PRN232 - Figma" (renTrek)

> Ngày review: 06/10/2026
> Phạm vi: toàn bộ 21 board trên `Page 1` của file Penpot **PRN232 - Figma**, đối chiếu với `BE/docs/database/Logical_ERD_v2.md`, `ERD_REVIEW.md`, `03-API-CONTRACT.md`, `FE/src/constants/*`.
> **Cập nhật 22/10/2026**: đối chiếu với schema SQL mới (51 bảng) và 9 board mới nằm ở [SQL-COVERAGE-2026-10-22.md](SQL-COVERAGE-2026-10-22.md); file đó thay thế mục 10 bên dưới.
> Cách làm: 1 reviewer chính chia việc cho 6 sub-agent (design system, khách thuê đồ, khách đặt tour + auth, vận hành thuê đồ, hướng dẫn viên, độ phủ ERD), sau đó tổng hợp và kiểm chứng lại các phát hiện Critical trực tiếp trên file. Chỉ đọc, không sửa file thiết kế.

## Mục lục

1. [Kết luận](#1-kết-luận)
2. [Bảng điểm](#2-bảng-điểm)
3. [Năm vấn đề hệ thống](#3-năm-vấn-đề-hệ-thống)
4. [Design system](#4-design-system)
5. [Khách hàng — thuê đồ](#5-khách-hàng--thuê-đồ)
6. [Khách hàng — đặt tour](#6-khách-hàng--đặt-tour)
7. [Xác thực](#7-xác-thực)
8. [Vận hành thuê đồ (Staff)](#8-vận-hành-thuê-đồ-staff)
9. [Hướng dẫn viên & vận hành chuyến](#9-hướng-dẫn-viên--vận-hành-chuyến)
10. [Độ phủ chức năng so với ERD](#10-độ-phủ-chức-năng-so-với-erd)
11. [Màn hình còn thiếu (ưu tiên)](#11-màn-hình-còn-thiếu-ưu-tiên)
12. [Lộ trình đề xuất](#12-lộ-trình-đề-xuất)
13. [Câu hỏi cần chốt với team](#13-câu-hỏi-cần-chốt-với-team)
14. [Ghi chú về độ tin cậy](#14-ghi-chú-về-độ-tin-cậy)

---

## 1. Kết luận

**Chưa sẵn sàng để chuyển sang code — khoảng 5,5/10.**

Giao diện có bản sắc rõ (xanh rừng `#1B4332` + vàng `#E9C46A` + cam `#E76F51`, font Be Vietnam Pro) và từng màn khá đẹp. Nhưng có ba vấn đề gốc:

1. Thiết kế mô tả **một sản phẩm khác** với backend: chợ P2P có ký quỹ, trong khi ERD là công ty cho thuê do nhân viên xử lý.
2. **Design system mới là trang minh họa**: 0 component, token rác, màu và chữ lệch hệ, không đạt WCAG AA.
3. **Thiếu gần hết phần quản trị** và nhiều bước quan trọng trong luồng khách hàng.

Các phát hiện Critical đã được kiểm chứng lại trực tiếp trên file:

| Kiểm chứng | Kết quả |
|---|---|
| Có text P2P/escrow | "Nền tảng cho thuê thiết bị dã ngoại P2P…", "Trả Chủ đồ (sau 10%)", "Hoa hồng Sàn (10%)", "Chờ Chủ đồ xác nhận" |
| Text mất dấu | "Tong ket don hang", "Chuyen sang buoc ky quy →", "Tim kiem tour", "DIEM DEN" |
| Tên thương hiệu | "TrekRent" xuất hiện 75 lần, "renTrek" 0 lần |
| Chữ dưới 12px | 535 / 1722 text (31%) |
| Chữ trắng trên `#E76F51` | 3,08:1 (cần ≥ 4,5:1) |

## 2. Bảng điểm

| Phân hệ | Điểm | Điểm từng màn | Nhận xét ngắn |
|---|---|---|---|
| Design system | 5 | — | 0 component; 2,4% màu gắn thư viện |
| Khách — thuê đồ | 5,5 | Home 7 · Chi tiết SP 5 · Checkout 5 · Tracker 5 | Đẹp nhưng luồng bị đứt |
| Khách — đặt tour | 5,5 | Danh sách 6,5 · Chi tiết (import) 7 · Step 1 4,5 · Step 2 7 · E-Ticket 5,5 · Concluded 5 | Thiếu nhiều người tham gia, chọn lịch |
| Xác thực | 5 | Đăng nhập 6 · Đăng ký 5,5 · OTP 6 | Đăng ký thiếu họ tên/SĐT, không có state lỗi |
| Vận hành thuê đồ | 5,5 | owner-dashboard 4 · Tổng quan 6 · Quản lý đơn 6 · Chi tiết đơn 6 · Giao nhận 5,5 · Kiểm tra đồ 6,5 | Mâu thuẫn dữ liệu giữa các màn |
| Hướng dẫn viên | 6,2 | Danh sách 7 · Chi tiết 7 · Công việc 6 · Điểm danh 5 | Tốt nhất file, điểm danh chưa có mobile |
| Độ phủ chức năng | ~50–60% | Customer ~70% · Staff/Guide ~55% · Admin ~0% | Thiếu toàn bộ CRUD quản trị |

## 3. Năm vấn đề hệ thống

Các vấn đề này lặp lại ở nhiều phân hệ, nên sửa trước khi đi vào từng màn.

### 3.1. Lệch mô hình nghiệp vụ (Critical)

- Thiết kế: marketplace P2P + escrow — "Chủ đồ", "Sàn đang giữ", "Hoa hồng Sàn (10%)", "Trả Chủ đồ", "Đăng đồ cho thuê", "Dành Cho Chủ Đồ", "P2P OUTDOOR ESCROW", board `escrow-checkout`, `owner-dashboard`.
- ERD: đồ thuộc công ty (`PRODUCTS` không có owner), `RENTAL_ORDERS.handled_by_user_id` là Staff, `TRANSACTIONS` chỉ có thanh toán/hoàn tiền, không có giữ tiền cho bên thứ ba.
- Ảnh hưởng: khoảng 10 màn (toàn bộ luồng thuê đồ, vận hành, checkout tour, auth panel).
- **Hành động**: chốt một mô hình. Nếu theo ERD: bỏ chủ đồ/hoa hồng/đối soát, đổi "ký quỹ" thành "tiền cọc / hoàn cọc", thêm "Nhân viên phụ trách". Nếu giữ P2P: phải sửa ERD.

### 3.2. Dữ liệu mẫu và trạng thái mâu thuẫn (Critical)

- Đơn **TRK847392**: "ĐANG BÀN GIAO, 20/10–23/10" (owner-dashboard) vs "CHỜ BÀN GIAO, 20/09–23/09" (danh sách/chi tiết) vs "Nhận lại lúc 09:18, 20/09/2026" (Kiểm tra đồ).
- Đơn **TRK711209**: "ĐANG TRẢI NGHIỆM 15/10–18/10" vs "ĐANG THUÊ 18/09–22/09"; chủ đồ "Trần Quốc Việt" vs "Lê Hoàng Sơn".
- Mã vé `#TRK-2026-FANSIPAN` khác mã đơn `TRK847392`.
- Email mẫu: OTP "an.nguyen@email.com" vs Checkout "giahuy.nguyen@gmail.com".
- Quy tắc hoàn cọc viết 3 kiểu: PDP "sau khi chủ đồ xác nhận nhận lại lều nguyên vẹn" / Checkout "sau khi lều được bàn giao trả lại sạch sẽ" / Tracker "khi kết thúc 24h kiểm tra sau khi trả đồ".
- Stepper: checkout thuê đồ 3 bước, tracker 5 bước; checkout tour "Coi lại đơn hàng & Điền thông tin / Ký quỹ an toàn / Vé điện tử / Quyết toán" vs "Tour Booking / Đặt & Ký Quỹ / Vé Điện Tử / Quyết Toán".
- Cột "Trạng thái" trộn 3 khái niệm: vòng đời đơn, mức khẩn (KHẨN / SẮP ĐẾN GIỜ / ĐÚNG HẠN), tình trạng đồ (BÌNH THƯỜNG / CẦN XEM XÉT).
- **Hành động**: một state machine duy nhất cho đơn thuê và đơn tour (xem [8.3](#83-trạng-thái-đơn-quan-sát-được)); mức khẩn và tình trạng đồ là thuộc tính riêng; một bộ dữ liệu mẫu dùng chung.

### 3.3. Accessibility không đạt WCAG AA (Critical)

| Cặp màu | Tỷ lệ | Dùng ở |
|---|---|---|
| Trắng / `#E76F51` | 3,08 | Nút CTA chính: "Tìm kiếm thiết bị", "Xác nhận & Chuyển…", "Xác nhận bàn giao" |
| `#E76F51` / `#FBFBFA` | 2,99 | Eyebrow "VẬN HÀNH TOUR", "CHƯA ĐIỂM DANH", "Chờ chuẩn bị" |
| `#F4A261` / tint | 1,88 | Badge "Sắp đến giờ", "Chờ xác nhận", "Đang thuê" |
| `#E63946` / tint | 3,48–3,55 | Badge "Khẩn", "Tranh chấp" |
| `#3B82F6` / tint | 3,2 | Badge "Chờ bàn giao" |
| `#E9C46A` / trắng | 1,67 | Giá/cọc ở owner-dashboard, Quản lý đơn thuê |
| `#B08520` / ảnh | 2,9–3,2 | Badge "Bán chạy", "Mới 95%" |
| `#E5E7EB` / `#FBFBFA` | 1,2 | Viền input (cần ≥ 3:1) |

- 154 text rớt 4,5:1 (ước lượng, chưa tính text đè ảnh).
- 535/1722 text (31%) dưới 12px; có cỡ 9px, 10px.
- Nút thao tác cao 32–34px (khuyến nghị ≥ 44px trên mobile).
- **Hành động**: thêm token chữ đậm cho từng màu trạng thái (ví dụ `#9A4A00`, `#B42318`, `#1D4ED8`, `#8A6514` ≈ 5,3:1); nền nút accent tối hơn (khoảng `#C2410C`); tối thiểu 12px; viền input ≥ `#9CA3AF`.

### 3.4. Không có component, không có state (Major)

- 0 component trong thư viện; UI kit chỉ là shape tĩnh.
- Header 5 biến thể (cao 72/73/80/81/82, padding 64 vs 80, active state vàng / xanh nhạt / trắng / khung cam).
- Footer 5 biến thể (cao 366/342/290/151/58), năm "© 2024" (10 board) lẫn "© 2026".
- Badge 4 họ tên layer (`badge`, `trạng thái`, `state`, `spec-chip`), radius 6 vs pill 100/9999; "Chờ bàn giao" có 2 kiểu khác nhau.
- Nút: `button` (cao 41, 14px) vs `nút thao tác` (9 kích thước/kiểu).
- Không có hover / pressed / focus / disabled / loading / error / empty / skeleton ở bất kỳ màn nào.

### 3.5. Lỗi nội dung (Critical/Major)

- **Mất dấu tiếng Việt trong nội dung** (không phải lỗi font):
  - Tour Checkout Step 1: "Tong ket don hang", "Gia tron goi / khach", "Tien coc thiet bi (hoan 100%)", "Vat pham goi y thue phu hop cho chuyen di", "+ Them vao don", "Tong ky quy", "Chuyen sang buoc ky quy →".
  - Danh sách tour: "DIEM DEN", "NGAY KHOI HANH", "THOI LUONG", "HINH THUC", "Chon ngay", "Tim kiem tour".
- Thương hiệu "TrekRent" (75 lần) thay vì "renTrek".
- UI demo lọt vào thiết kế: "Mô phỏng: Kết thúc tour →", "QR minh họa • Trạng thái mô phỏng…".
- Copy: "Ký quỹ ký thác an toàn" (lặp nghĩa), "không rỉ sét" → "không gỉ sét", "BTC" (dễ nhầm Bitcoin), lẫn Anh–Việt ("Tour Booking", "Availability Calendar", "Safety guidelines", "Survival tactics", "Teamwork"), Title Case không nhất quán.
- Back-office dùng footer public ("Khám Phá", "Đăng Ký Đăng Đồ").

---

## 4. Design system

**Điểm: 5/10**

### Điểm tốt

- Một font chính: Be Vietnam Pro chiếm 1709/1722 text, hỗ trợ tiếng Việt tốt.
- Bảng màu lõi nhất quán: `#1B4332` (header/nút chính), `#E9C46A`, `#E76F51`, nền `#FBFBFA`, chữ `#1F2937`.
- 10/14 board nghiệp vụ dùng cùng `site-footer`; header cùng nền `#1B4332`.
- Badge dùng khá đều (cao 22, radius 6, nền tint 13%, chữ 11px/600); nút chính cao 41, radius 8.
- Dùng flex auto-layout nhiều.
- Contrast chữ chính tốt: `#1F2937`/`#FBFBFA` = 14,2; trắng/`#1B4332` = 11,1; `#D8F3DC`/`#081C15` = 15,0; `#E9C46A`/`#1B4332` = 6,6; `#6B7280`/trắng = 4,83.

### Vấn đề

| Mức | Vị trí | Mô tả | Đề xuất |
|---|---|---|---|
| Critical | Nút CTA accent, chữ cam, badge | Xem [3.3](#33-accessibility-không-đạt-wcag-aa-critical) | Token chữ đậm cho mỗi trạng thái |
| Major | Header / Footer | 5 biến thể mỗi loại | Component Header (biến thể theo role, cao ~72) + Footer (đầy đủ / rút gọn) |
| Major | Màu thư viện | Chỉ 67/2767 fill+stroke (2,4%) gắn màu thư viện; 372 giá trị (13%) ngoài thư viện: `#F3F4F1` ×106, `#081C15` ×37, `#2D6A4F` ×35, `#F4A261` ×28, `#E63946` ×27, `#000000` ×17, `#3B82F6` ×9… Chỉ 180/3842 shape (4,7%) gắn token | Bổ sung màu ngữ nghĩa vào thư viện, thay giá trị thô bằng liên kết |
| Major | Thư viện màu rác | 21 màu: "Color 1" (`#FFF`) trùng "White", "Color 2" (`#FBFBFA`) trùng "Desert Storm"; "White 0.2%", "White 10%/20%", "Rob Roy 18%/20%", "Black Bean 40%", "Everglade 30%"; tên theo plugin (Rob Roy, Tara, Celtic, Pale Sky) không nói vai trò | Xóa trùng; đặt tên theo vai trò `brand/primary`, `text/muted`, `status/danger`… |
| Major | Typography | 50 style nhưng chỉ ~25 tổ hợp khác nhau; "Bold" ×10, "Regular" ×7, "SemiBold" ×6, "Button" ×6; 12px/700 có 5 tên. Thực tế dùng 23 cỡ (có 9, 10, 19, 22, 25, 46, 64px) | Rút còn 8–10 style ngữ nghĩa |
| Major | Token `html.to.design/Mode 1` | 105 token tự sinh; 36 spacing đa số số lẻ (`itemspacing.270_88`, `211_23`, `700_86`, `-0_1`); chỉ 3 token đặt tên đúng (`xxs`=4, `xs`=8, `s`=24); màu `color.orange.6612`, `springgreen.785`; theme inactive | Xóa, xây lại: spacing 4/8/12/16/24/32/48/64, `color.brand.*`, `color.status.*` |
| Major | UI kit không khớp thực tế | Kit ghi 4 màu, "H1 36 / H2 28 / Body 15" nhưng thực tế 32/24/14; kit badge 5 loại, thực tế nhiều hơn | Kit phải là nguồn chân lý |
| Major | Spacing | 38% gap (334/880) và 29% padding (638/2224) không chia hết cho 4 | Làm tròn về lưới 4/8 khi dựng lại bằng component |
| Minor | Border-radius | 4, 6, 8, 10, 12, 16, 24, 100, 9999 | Thang 4/8/12/16/full |
| Minor | Font ngoài hệ | `Inter` (10 text, "PRN LOGIN", "WELCOME TO…"), `sourcesanspro` (ô OTP); emoji 🏔️🚶‍♂️🛡️ làm icon | Be Vietnam Pro + icon vector |
| Minor | Nền Login | 3 board nền `#F2CF24` ngoài palette | Dùng màu trong hệ |
| Minor | Đặt tên layer | 457/3481 (13%) tên mặc định (Vector, svg-path, Frame…); lẫn tiếng Việt có dấu / kebab-case / Title Case; cùng loại khác tên (sticky-header / Thanh điều hướng / Checkout header) | Một quy ước tên |
| Minor | Cấu trúc file | Tất cả trên "Page 1"; board import `tour_booking_prototype.html.html by html.to.design ❤️ FREE version…` (1640×2514); `screens-canvas` (4512×1120) bọc 3 màn; `Login User` (4480×1024) | Tách trang: Foundations / Components / Customer / Staff / Guide / Admin / Archive |
| Minor | Responsive | Mọi màn 1440px, không có tablet/mobile, không có layout grid | Thêm 375/768 cho màn khách và màn HDV |

### Còn thiếu

- **Component**: header, footer, button (S/M/L), badge, input, select, date picker, card, KPI card, table row, tabs, pagination, stepper, avatar, modal, toast.
- **State**: hover, pressed, focus, disabled, loading, error, success; empty state, skeleton, validation message.
- **Token ngữ nghĩa**: `text/primary|muted|inverse`, `surface/*`, `border/*`, `status/success|warning|danger|info` (mỗi cái có cặp nền + chữ đạt AA), spacing, radius, shadow.
- **Icon set** chuẩn 16/20/24 (hiện là 200 `svg-path` rời + emoji).
- **Grid / breakpoint** và tài liệu hướng dẫn dùng màu, quy ước tên, bảng map trạng thái ↔ màu badge.

---

## 5. Khách hàng — thuê đồ

**Điểm: 5,5/10** — Home 7 · Chi tiết sản phẩm 5 · Escrow checkout 5 · Transaction tracker 5

Board: `home-gear-discovery`, `product-detail-rental`, `escrow-checkout`, `transaction-tracker`.

### Điểm tốt

- Header, footer, màu nhất quán; CTA chính nổi bật.
- Format tiền (`80.000đ/ngày`, `740.000đ`) và ngày (`20/10/2024`) đúng chuẩn Việt Nam.
- PDP tách rõ "Tiền thuê (80.000đ × 3 ngày) = 240.000đ" và "Tiền cọc 500.000đ"; số liệu khớp từ PDP sang checkout và tracker.
- Checkout có stepper, QR VietQR, nội dung chuyển khoản, trạng thái chờ giao dịch.
- Tracker có stepper 5 bước, chụp ảnh bàn giao 3 góc, hotline hỗ trợ.

### Vấn đề

| Mức | Màn | Mô tả | Đề xuất |
|---|---|---|---|
| Critical | Toàn luồng | Không có giỏ hàng, đăng nhập/đăng ký hay bước điền thông tin. Stepper checkout ghi "1. Điền thông tin" nhưng màn mở ở bước 2 | Thêm bước 1 (người nhận, SĐT, địa điểm nhận/trả, ghi chú), xác nhận đơn, bắt đăng nhập trước thanh toán |
| Critical | Checkout | Chỉ có QR, không chọn phương thức (`payment_method`); không có thất bại / hết hạn QR / thành công | Chọn phương thức, countdown QR, màn kết quả |
| Critical | Chi tiết SP | Không chọn biến thể (size/màu/SKU), số lượng, tồn kho, combo; ngày nhận/trả là text tĩnh | Variant selector, stepper số lượng, "Còn N" / "Hết hàng", date picker |
| Major | Chi tiết SP | Giá cố định `80.000đ × 3 ngày`, không có bảng giá theo bậc ngày, mã giảm giá, chính sách hủy | Bảng bậc giá, ô mã giảm giá, block chính sách |
| Major | Toàn luồng | Quy tắc hoàn cọc mâu thuẫn ở 3 màn | Một quy tắc, một component |
| Major | Tracker | Bước 1 "Đặt cọc" nhưng khách đã trả toàn bộ 740.000đ; chỉ vẽ bước 2; upload ảnh không có state | Đổi tên bước, vẽ đủ bước 3–5 và state upload |
| Major | Home | Bộ lọc là ô chữ tĩnh; không có empty / loading / phân trang; card cao thấp không đều | Thêm state, cố định chiều cao card |
| Minor | Cỡ chữ | Nhãn 10–11px ("Đã kiểm định", "Giá thuê / ngày", "Ngày nhận đồ") | Tối thiểu 12px, giá/cọc 13–14px |
| Minor | Chi tiết SP | Tab "Thông số kỹ thuật" bị cắt; card tính phí lệch lề (~x=1311 thay vì 1376); 2 tab chưa có nội dung | Sửa padding, căn lưới |
| Minor | Nav | "Dụng cụ thuê" luôn active kể cả ở checkout/tracker; không có "Đơn của tôi" | Active theo trang, menu tài khoản |

### Thiếu

Danh sách / kết quả tìm kiếm sản phẩm; bước 1 checkout; giỏ hàng; khuyến mãi; kết quả thanh toán; "Đơn của tôi" + chi tiết đơn; tracker bước 3–5; hủy / hoàn tiền / gia hạn / khiếu nại; đánh giá; thông báo; tồn kho, biến thể, combo.

---

## 6. Khách hàng — đặt tour

**Điểm: 5,5/10** — Danh sách 6,5 · Chi tiết (board import) 7 · Step 1 4,5 · Step 2 7 · E-Ticket 5,5 · Trip Concluded 5

Board: `Combo trekking 2N1Đ`, `tour_booking_prototype.html.html by html.to.design…`, `Tour Checkout - Step 1`, `Tour Checkout - Step 2`, `03-E-Ticket`, `04-Trip-Concluded`.

### Điểm tốt

- Card tour có độ khó, thời lượng, ngày khởi hành, "Còn 2 chỗ"; tour đã qua bị làm xám và disable; tab "Đang mở · 4 / Hết hạn · 2".
- Trang chi tiết (bản import) có breadcrumb, lịch trình theo ngày/giờ, "Thông tin hữu ích", panel đặt chỗ sticky có chọn đợt, "Còn 4 chỗ", stepper số khách.
- Step 2 có "BƯỚC 2 / 4", QR VietQR đầy đủ thông tin, hotline, "Tiếp theo: Nhận vé điện tử".

### Vấn đề

| Mức | Màn | Mô tả | Đề xuất |
|---|---|---|---|
| Critical | Step 1, Danh sách | Mất dấu tiếng Việt (xem [3.5](#35-lỗi-nội-dung-criticalmajor)) | Gõ lại có dấu |
| Critical | Toàn luồng | Không có form nhiều người tham gia: chỉ 1 form "Họ và tên / SĐT / Email nhận vé" dù panel cho tăng số khách | Khối "Thông tin người tham gia" lặp theo số khách |
| Critical | Toàn luồng | Không có state lỗi: validate, hết chỗ, thanh toán thất bại / hết hạn | Vẽ các state |
| Major | Toàn luồng | Stepper không nhất quán (2 bộ nhãn, Title Case lẫn) | Một bộ nhãn |
| Major | Step 1 | Tóm tắt đơn lặp 2 lần; không đổi được số khách/ngày; "Tổng ký quỹ" xuống dòng; không có ô khuyến mãi; form không đánh dấu bắt buộc | Một sidebar tổng kết, ô promo, validate |
| Major | Chi tiết tour | Board import 1640px, tên rác; không tách "đồ được cấp" / "đồ tự chuẩn bị"; không có chính sách hủy theo mốc giờ; nhãn "Đã kiểm định" đè chữ trên ảnh | Dựng lại khung 1440, thêm 2 tab đồ và bảng hoàn hủy |
| Major | Danh sách | Card không có giá; filter tĩnh; không empty state; không badge sắp hết chỗ; tour hết hạn vẫn "Xem chi tiết" | Giá "từ … /người", badge, empty state |
| Major | E-Ticket | Mã vé khác mã đơn; chỉ 1 người; nhiều khoảng trắng; nút "Mô phỏng: Kết thúc tour" | Thống nhất mã, thêm lịch trình, đồ cần mang, bài cần đọc, nút hủy |
| Major | Trip Concluded | Gọi là "Quyết toán" nhưng là trang đánh giá; sao đã chấm sẵn 5; không có nút "Gửi đánh giá" | Rating mặc định rỗng, nút gửi riêng |
| Minor | Step 2 | Text tràn khung ("bị." lẻ dòng); nút "Quay lại" quá mờ; không có countdown giữ chỗ, nút copy số tài khoản, "Tôi đã chuyển khoản" | Căn lại, thêm tiện ích |
| Minor | Concluded | "+245 pts", "#ESCROW-TX-99824" không giải thích; "BTC" | "Ban tổ chức", giải thích điểm |

### Thiếu

Chi tiết tour bản chuẩn; chọn lịch khởi hành (nhiều trip); form nhiều người tham gia; mã khuyến mãi; kết quả thanh toán; hết chỗ / waitlist; empty / loading danh sách; chính sách và màn hủy booking; bài hướng dẫn trước chuyến (xác nhận đã đọc); "Chuyến của tôi".

---

## 7. Xác thực

**Điểm: 5/10** — Đăng nhập 6 · Đăng ký 5,5 · OTP 6

Board: group `Login User` (`Trang đăng nhập`, `Trang đăng ký`, `Trang xác thực OTP`).

### Điểm tốt

Layout 2 cột đồng bộ; login có show/hide mật khẩu, "Ghi nhớ đăng nhập", "Quên mật khẩu?"; OTP 6 ô, ô focus viền cam, đếm ngược 00:42, "Gửi lại mã".

### Vấn đề

| Mức | Màn | Mô tả | Đề xuất |
|---|---|---|---|
| Major | Đăng ký | Chỉ có "Email hoặc Số điện thoại", thiếu họ tên và SĐT riêng (`USERS` có `full_name`, `email`, `phone`); không có quy tắc mật khẩu; "Điều khoản" chỉ là text | Thêm trường, password rules, link điều khoản |
| Major | Đăng nhập | Không có state lỗi (sai mật khẩu, tài khoản không tồn tại); không có đăng nhập Google | State lỗi, "Tiếp tục với Google" (nếu team chốt) |
| Major | OTP | Không có state nhập sai / hết hạn / quá số lần; "GỬI LẠI MÃ" trông như disabled; nút "Xác nhận mã" luôn sáng dù mới nhập 3/6 | State lỗi, disable nút khi chưa đủ |
| Minor | Cả 3 | Chữ phụ 10–12px xám nhạt; link "Đăng ký ngay" không nổi bật; panel trái chiếm nửa màn chỉ để trang trí ("22.3033° N", "P2P OUTDOOR ESCROW") | Tăng cỡ chữ, màu link, rút gọn panel |

### Thiếu

Quên / đặt lại mật khẩu; state lỗi cho cả 3 màn; OTP hết hạn. Lưu ý: ERD và API contract chưa có bảng/endpoint OTP.

---

## 8. Vận hành thuê đồ (Staff)

**Điểm: 5,5/10** — owner-dashboard 4 · Tổng quan vận hành 6 · Quản lý đơn thuê 6 · Chi tiết đơn 6 · Giao nhận & Kiểm tra 5,5 · Kiểm tra đồ 6,5

### Điểm tốt

- Kiểm tra đồ có ý tưởng đúng: ảnh bàn giao, so sánh trước/sau, checklist từng hạng mục, tóm tắt quyết định, đồng hồ 24h.
- Chi tiết đơn đủ thông tin: khách, bảng tiền tách thuê/cọc, ghi chú nội bộ, stepper 5 bước.
- Số tiền khớp giữa các màn (240k thuê + 500k cọc).
- Bảng đơn có search, 3 filter, tổng ở chân bảng, phân trang.
- Tổng quan có khối "Công việc Admin cần xử lý ngay" với SLA đếm ngược.

### Vấn đề

| Mức | Màn | Mô tả | Đề xuất |
|---|---|---|---|
| Critical | Toàn bộ | Mô hình P2P (xem [3.1](#31-lệch-mô-hình-nghiệp-vụ-critical)); không có `asset_code`, `handled_by`, vai trò Staff | Chốt mô hình |
| Critical | owner-dashboard | Trùng và mâu thuẫn với Tổng quan/List (xem [3.2](#32-dữ-liệu-mẫu-và-trạng-thái-mâu-thuẫn-critical)); dùng header khách hàng, không có sidebar admin, không có hành động | Bỏ khỏi luồng vận hành hoặc tách thành portal riêng |
| Critical | Kiểm tra đồ | Chỉ có nút nổi bật "Hoàn đủ 500.000đ tiền cọc"; không có form khấu trừ theo hạng mục, upload chứng cứ, chọn `return_condition`, modal xác nhận. "Khung nhôm 7001" đang "CẦN XEM XÉT" mà vẫn khuyến nghị hoàn đủ | Form khấu trừ, ảnh bắt buộc, khóa nút hoàn khi còn hạng mục cần xem xét |
| Major | Chi tiết / Kiểm tra | Không gán asset vật lý; thumbnail lều là túi duffel | Cột "Mã tài sản", chọn asset còn sẵn |
| Major | Chi tiết đơn | "Xác nhận bàn giao", "Tạm khóa đơn" không có bước xác nhận/lý do; thiếu hủy, hoàn tiền, lịch sử, người phụ trách | Modal xác nhận, tab Lịch sử |
| Major | Quản lý đơn | 5 dòng nhưng ghi "Hiển thị 1-20 / 128"; KPI tính theo 5 đơn đang hiển thị; không có bulk action, sort, empty/error | KPI theo filter, thêm bulk/sort/state |
| Major | Tổng quan | "132 đơn đang được Sàn bảo chứng" vs 128; "Cần giao / trả 11" vs Giao nhận "8 / 3 / 5"; bar chart không trục; ô doanh thu là gradient trống | Chuẩn hóa định nghĩa KPI, vẽ chart đầy đủ |
| Major | Giao nhận | Cột "Trạng thái" là mức khẩn; tab "Nhận lại đồ • 5" chưa có nội dung; filter "Khu vực" tràn khung; KPI 8 đơn nhưng 3 dòng | Thêm cột trạng thái đơn, vẽ tab |
| Major | Navigation | Mỗi màn một bộ menu (thiếu/thừa Tranh chấp, Người dùng, Dòng tiền); vừa top nav vừa sidebar | Một app shell: sidebar + top bar |
| Minor | Chi tiết đơn | Logo dính "Tổng quan"; ô search đè chuông | Sửa auto-layout header |
| Minor | Kiểm tra đồ | "6 ảnh • 1 video" nhưng hiện 4 ảnh, không lightbox | Hiển thị đủ media |

### 8.3. Trạng thái đơn quan sát được

| Nơi | Giá trị |
|---|---|
| Bảng đơn | CHỜ BÀN GIAO, ĐANG THUÊ, CHỜ KIỂM TRA, TRANH CHẤP, ĐÃ HOÀN TẤT |
| Stepper chi tiết | Đã thanh toán → Chờ bàn giao → Đang thuê → Trả & kiểm tra → Quyết toán |
| owner-dashboard | ĐANG BÀN GIAO, ĐANG TRẢI NGHIỆM, CHỜ CHECK-OUT 24H |
| Giao nhận (mức khẩn) | KHẨN, SẮP ĐẾN GIỜ, ĐÚNG HẠN, CHỜ XÁC NHẬN, ĐỦ ẢNH |
| Hạng mục kiểm tra | BÌNH THƯỜNG, CẦN XEM XÉT, HAO MÒN TỰ NHIÊN |
| **Thiếu** | Chờ thanh toán, Đã hủy, Quá hạn trả, Mất đồ, Chờ hoàn cọc, Đã hoàn tiền, Đã khấu trừ |

### Thiếu

Quản lý sản phẩm / biến thể / tồn kho; kho asset (mã, trạng thái, bảo trì); danh mục; combo; khuyến mãi; chính sách hoàn tiền; khách hàng; giao dịch / hoàn tiền; báo cáo; thông báo; audit; danh sách tranh chấp; đơn quá hạn / đồ mất; phiếu giao nhận; empty/loading/error cho mọi bảng.

---

## 9. Hướng dẫn viên & vận hành chuyến

**Điểm: 6,2/10** — Danh sách HDV 7 · Chi tiết HDV 7 · Công việc 6 · Điểm danh 5

- `Quản lý hướng dẫn viên`, `Chi tiết hướng dẫn viên`: cho Admin ("Quản trị viên – Minh Hoàng").
- `Quản lý công việc hướng dẫn viên` (tiêu đề trên màn là "Công việc của tôi"), `diem-danh-thanh-vien`: cho chính HDV. Tên board gây hiểu nhầm.

### Điểm tốt

- Ngôn ngữ thị giác nhất quán, tiếng Việt tự nhiên.
- Danh sách HDV có KPI (24 / 16 sẵn sàng / 5 đang dẫn / 3 tạm nghỉ), tìm kiếm, lọc trạng thái + khu vực, sắp xếp, phân trang, rating, số tour.
- Chi tiết HDV có hồ sơ, chứng chỉ, trạng thái, lịch tuần với "Nghỉ bù".
- Điểm danh có 3 trạng thái, đếm "6/8", ghi chú theo khách (dị ứng, say xe).
- Công việc có "Đoàn khách hôm nay" với nút gọi từng khách.

### Vấn đề

| Mức | Màn | Mô tả | Đề xuất |
|---|---|---|---|
| Critical | Điểm danh | Chỉ desktop 1440px; nút ~32px, badge 10px — HDV dùng ngoài trời trên điện thoại | Bản mobile 375px: thẻ dọc, nút ≥ 44px, bộ đếm cố định |
| Critical | Điểm danh | Chỉ một đợt "Đón: 06:30"; không theo `TRIP_ACTIVITIES` / `ACTIVITY_ATTENDANCES`, không có `checked_at` | Bộ chọn hoạt động, giờ check-in mỗi dòng |
| Critical | Điểm danh | Thiếu "Trễ" / "Có phép"; "VẮNG MẶT" vẫn có nút "Điểm danh" giống "CHƯA ĐIỂM DANH" | Hành động rõ Có mặt / Vắng / Trễ, lý do vắng |
| Major | Điểm danh | Không xử lý offline; "Điểm danh tất cả" không xác nhận/undo; không có liên lạc khẩn cấp / SOS; SĐT không bấm gọi được | Banner offline, "Chờ đồng bộ", dialog/undo, khối khẩn cấp |
| Major | Điểm danh | Cột "Kỹ năng mềm" chỉ tổng hợp "3/5 (60%)", không theo từng thành viên (`PARTICIPANT_POST_READS`); tiêu đề tiếng Anh | Tách màn xác nhận kỹ năng theo thành viên |
| Major | Công việc | **Lỗi layout**: nút "Chi tiết"/"Chuẩn bị" che badge trạng thái ở hàng "Trekking Hoàng Su Phì" và "Cao Bằng – Thác Bản Giốc"; panel phải tràn lề (~x=1395 > 1376); ghi chú bẻ dòng xấu | Cột badge riêng, giãn cột |
| Major | Công việc | "Việc cần chuẩn bị 05" nhưng không có checklist đồ cấp (`TRIP_PROVIDED_ITEMS`); không có link sang Điểm danh | Màn chuẩn bị đồ, nút "Điểm danh" trong thẻ hôm nay |
| Major | Danh sách HDV | Icon mắt gạch chéo dễ hiểu là "ẩn"; không có "Phân công"; KPI "Đang dẫn tour" không có badge tương ứng; thiếu cột lịch bận | Nút có nhãn, menu ⋯, một bộ trạng thái, cột "Chuyến kế tiếp" |
| Major | Chi tiết HDV | Thiếu lịch sử chuyến, đánh giá khách, phân công hiện tại; chứng chỉ thiếu ngày hết hạn | Tab Lịch sử / Đánh giá, nút "Phân công chuyến" |
| Minor | Chi tiết HDV | Nhãn địa chỉ lẫn; "Tạm khóa" vs "Tạm nghỉ" không phân biệt; không có bio | Tách rõ |
| Minor | Cả 4 | Chữ 10–11px; không thấy focus state; logo header HDV khác Admin | Tối thiểu 12px, thống nhất |

### Thiếu

Quản lý tour; lịch khởi hành + recurrence; chi tiết chuyến; chia nhóm + phân công HDV; danh sách booking / người tham gia; lịch trình hoạt động; chuẩn bị đồ cho chuyến; bài viết kỹ năng + theo dõi đã đọc; đánh giá chuyến; form thêm/sửa HDV; báo cáo sự cố hiện trường; bản mobile cho HDV.

### Lệch ERD

- Điểm danh không theo hoạt động; `attendance_status` thiếu giá trị "trễ".
- `TRIP_GROUPS` (tên nhóm, `max_participants`) không xuất hiện.
- Cột "Khu vực phụ trách", "Ngôn ngữ" không có trong ERD — cần xác nhận backend.
- Màn admin ghi "Quản trị viên" trong khi ERD giao `TRIPS.managed_by` cho Staff; chưa có giao diện Staff riêng.

---

## 10. Độ phủ chức năng so với ERD

### Vai trò

| Vai trò | Nguồn | Phạm vi |
|---|---|---|
| Guest | Suy luận | Xem sản phẩm, tour; đăng ký, đăng nhập |
| Customer | `ROLES` | Thuê đồ, đặt tour, lịch sử đơn, đánh giá, hồ sơ |
| Staff | `handled_by_user_id`, `managed_by_user_id` | Xử lý đơn thuê, giao nhận, quản lý trip |
| Guide | `TRIP_GROUPS.guide_user_id` | Nhóm, công việc, điểm danh |
| Admin | `created_by_user_id (ADMIN)` | Master data, khuyến mãi, chính sách, người dùng, cấu hình, audit |

`FE/src/constants/enums.js` mới có `Admin` và `Customer` — cần thêm `Staff`, `Guide`.

### Ma trận

Ký hiệu: ✔ có · ~ một phần / nghi lệch · ✘ thiếu

| Module | Vai trò | Bảng ERD | Màn hiện có | Ưu tiên |
|---|---|---|---|---|
| Đăng nhập | All | `USERS`, tokens | ✔ | P0 |
| Đăng ký | Guest | `USERS`, `PROFILES` | ✔ | P0 |
| OTP | Guest | (không có bảng) | ~ | P1 |
| Quên / đặt lại mật khẩu | All | `USERS` | ✘ | P1 |
| Hồ sơ cá nhân | All | `PROFILES` | ✘ | P0 |
| Xem sản phẩm | Guest/Customer | `PRODUCTS`, `VARIANTS`, `IMAGES` | ✔ | P0 |
| CRUD sản phẩm / biến thể / ảnh | Admin | như trên | ✘ | P0 |
| Bảng giá theo ngày | Admin | `RENTAL_PRICE_TIERS` | ✘ | P0 |
| Combo đồ | Customer/Admin | `PRODUCT_BUNDLES` | ✘ | P1 |
| Kho asset | Staff/Admin | `EQUIPMENT_ASSETS` | ✘ | P0 |
| Đặt thuê + thanh toán | Customer | `ORDERS`, `RENTAL_ORDERS`, `TRANSACTIONS` | ~ (escrow) | P0 |
| Lịch sử đơn của khách | Customer | `ORDERS` | ~ (chỉ 1 đơn) | P0 |
| Xử lý đơn, giao nhận, kiểm tra | Staff | `RENTAL_ORDERS`, `ASSET_ASSIGNMENTS` | ✔ | P0 |
| Dashboard vận hành | Staff/Admin | tổng hợp | ✔ (owner-dashboard trùng) | P1 |
| Giao dịch / hoàn tiền | Staff | `TRANSACTIONS` | ✘ | P1 |
| Chính sách hoàn tiền | Admin | `REFUND_POLICIES(+RULES)` | ✘ | P1 |
| Khuyến mãi | Admin | `PROMOTIONS(+TIERS)` | ✘ | P1 |
| Danh sách tour | Customer | `TOURS` | ✔ | P0 |
| Chi tiết tour | Customer | `TOURS` + bảng con | ~ (bản import) | P0 |
| CRUD tour | Admin | `TOURS` + bảng con | ✘ | P0 |
| Lịch khởi hành / recurrence | Admin/Staff | `TRIPS`, `TOUR_RECURRENCE_RULES` | ✘ | P0 / P2 |
| Booking + người tham gia | Customer | `TRIP_BOOKING_ORDERS`, `BOOKING_PARTICIPANTS` | ~ (1 người) | P0 |
| Vé điện tử | Customer | `booking_code` | ✔ | P0 |
| Đánh giá | Customer | `REVIEWS` | ~ (không có nút gửi) | P1 |
| Trip: booking, participants | Staff | `TRIPS`, `PARTICIPANTS` | ✘ | P0 |
| Chia nhóm + phân công HDV | Staff | `TRIP_GROUPS` | ~ | P0 |
| Đồ cấp cho chuyến | Staff | `TRIP_PROVIDED_ITEMS` | ✘ | P1 |
| Công việc HDV | Guide | `TRIP_GROUPS`, `TRIPS` | ✔ | P0 |
| Lịch trình + điểm danh | Guide | `TRIP_ACTIVITIES`, `ATTENDANCES` | ~ (không theo hoạt động) | P0 |
| Bài viết, kỹ năng, đã đọc | Admin/Customer | `POSTS`, `SOFT_SKILLS`, `POST_READS` | ✘ | P1 |
| Thông báo | All | `NOTIFICATIONS` | ✘ | P1 |
| Quản lý người dùng + vai trò | Admin | `USERS`, `ROLES` | ✘ | P0 |
| Audit log | Admin | `AUDIT_LOGS` | ✘ | P2 |
| Cấu hình hệ thống | Admin | `SYSTEM_CONFIGURATIONS` | ✘ | P2 |
| Trang 403 / 404 | All | — | ✘ | P0 |

**Tỷ lệ phủ P0**: khoảng 60% danh nghĩa; khoảng 50% nếu trừ các màn lệch nghiệp vụ. Customer ~70%, Staff/Guide ~55%, **Admin ~0%**.

### Lệch nghiệp vụ khác

- "Combo trekking 2N1Đ" là tour nhưng "Combo" dễ trùng với `PRODUCT_BUNDLES` (combo đồ thuê).
- ERD chưa có giá tour (`ERD_REVIEW` §6.2) nhưng checkout tour đã hiển thị giá.
- Mã `TRK…` chưa khớp `order_code` / `booking_code` (ERD chưa có `ORDERS.order_code`).
- ERD không có bảng giỏ hàng.
- "Vật phẩm gợi ý thuê" ở checkout tour giống đồ cho thuê hơn là `TOUR_PREPARATION_ITEMS`.

---

## 11. Màn hình còn thiếu (ưu tiên)

### P0 — bắt buộc cho MVP

1. **Admin: CRUD sản phẩm** (biến thể, ảnh, bảng giá theo ngày) — không có thì luồng thuê không có dữ liệu.
2. **Admin: CRUD tour** (đồ cấp, đồ tự chuẩn bị, bài viết liên kết).
3. **Chi tiết tour** bản chuẩn 1440px, có chọn lịch khởi hành và số chỗ.
4. **Staff: danh sách + tạo trip.**
5. **Staff: chi tiết trip** (booking, participants, chia nhóm, phân công HDV).
6. **Staff: kho asset** (mã, tình trạng, lịch sử giao nhận).
7. **Customer: "Đơn của tôi" / "Chuyến của tôi"** (danh sách + chi tiết).
8. **Hồ sơ cá nhân** + đổi mật khẩu.
9. **Admin: quản lý người dùng + vai trò** (để tạo tài khoản Staff, Guide).
10. **Form nhiều người tham gia, bước 1 checkout thuê đồ, màn kết quả thanh toán, trang 403/404.**

### P1

Quên mật khẩu · khuyến mãi · chính sách hoàn tiền + luồng hủy đơn · giao dịch/hoàn tiền (Staff) · thông báo · bài viết kỹ năng + xác nhận đã đọc · checklist đồ cấp cho chuyến · đánh giá · combo đồ · bản mobile cho điểm danh và màn khách hàng.

### P2

Audit log · cấu hình hệ thống · recurrence lịch khởi hành · gia hạn thuê · tranh chấp · báo cáo.

---

## 12. Lộ trình đề xuất

| Bước | Việc | Kết quả |
|---|---|---|
| 1 | **Chốt nghiệp vụ** với team (xem [mục 13](#13-câu-hỏi-cần-chốt-với-team)) | Mô hình, trạng thái đơn, quy tắc cọc thống nhất |
| 2 | **Dựng lại nền tảng**: dọn màu/token theo vai trò, sửa màu accent đạt 4,5:1, rút typography còn 8–10 style; tạo component Header (theo role), Footer (đầy đủ/rút gọn), Button (S/M/L + state), Badge, Input, Table, Tabs, Pagination, Stepper, Modal, Toast | Design system dùng được |
| 3 | **Áp component vào màn hiện có**: sửa dấu tiếng Việt, tên thương hiệu, dữ liệu mẫu, state machine; xóa board import và UI demo; sửa lỗi layout màn Công việc HDV | Màn hiện có sạch và nhất quán |
| 4 | **Vẽ 10 màn P0 còn thiếu** + bản mobile cho điểm danh và màn khách | Đủ MVP |
| 5 | **Tổ chức lại file**: trang Foundations / Components / Customer / Staff / Guide / Admin / Archive; quy ước tên layer | File dễ handoff |

---

## 13. Câu hỏi cần chốt với team

1. **Mô hình kinh doanh**: P2P (có chủ đồ, hoa hồng sàn) hay công ty cho thuê do Staff xử lý (theo ERD)?
2. **Cọc và thanh toán**: có giữ cọc không, hoàn cọc khi nào, có "ký quỹ" không? (`ERD_REVIEW` D5, D7)
3. **Giá tour** lưu ở đâu? (`ERD_REVIEW` B1)
4. **Xác thực**: có OTP / xác thực email không, có quên mật khẩu, có đăng nhập Google không? (A5)
5. **Vai trò**: một user có thể giữ nhiều role không? Có giao diện riêng cho Staff tách khỏi Admin không? (A9)
6. **Tên thương hiệu**: "renTrek" hay "TrekRent"?
7. **Mã định danh đơn**: định dạng `order_code` / `booking_code` thống nhất là gì?

---

## 14. Ghi chú về độ tin cậy

- Các phát hiện Critical ở [mục 1](#1-kết-luận) đã được kiểm chứng lại trực tiếp trên file Penpot.
- Một sub-agent nói ERD không có ngày sinh và địa chỉ — **sai**: `PROFILES` có `date_of_birth` và `address`.
- Một số tỷ lệ contrast trên chữ đè ảnh là ước lượng từ ảnh export.
- Ma trận độ phủ suy ra từ ERD vì `03-API-CONTRACT.md` hiện mới là khung (10 endpoint TODO).
- Review chỉ đọc; không có thay đổi nào trong file Penpot.

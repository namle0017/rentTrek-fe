# TrekRent — Design Documentation

> Bản tổng hợp từ thiết kế Figma ngày 21/10/2026.
> Tài liệu mô tả hiện trạng thiết kế, không xác nhận các tương tác hoặc tích hợp backend đã hoạt động.

## 1. Tổng quan

- Sản phẩm: TrekRent.
- Lĩnh vực: thuê thiết bị dã ngoại P2P, đặt tour trekking và quản lý vận hành.
- Nguồn: https://www.figma.com/design/kGLWdKoNX3ctGWVIQGUHzb
- Trang thiết kế: Page 1.
- Phạm vi: 30 màn hình nghiệp vụ, bao gồm các màn hình nằm trong nhóm và section.
- Nền tảng: desktop web.
- Chiều rộng màn hình nghiệp vụ: 1440 px.
- Ngôn ngữ chủ đạo: tiếng Việt.

### Quy ước

- Hiện trạng: thông tin quan sát được từ thiết kế.
- Diễn giải: ý nghĩa suy ra từ cách sử dụng.
- Đề xuất: hướng hoàn thiện, chưa được áp dụng trong Figma.
- Các luồng được mô tả theo trình tự nghiệp vụ, không xác nhận prototype đã được nối.

### Giới hạn

- Chưa thấy bộ màn hình mobile/tablet riêng.
- Không tìm thấy component hoặc component set cục bộ trên trang đã đọc.
- `design-system-ui-kit` và `Mở đầu (font, color)` đang bị ẩn.
- Có các biến thể màn hình cùng tồn tại, chưa xác định bản chính thức.
- Số tiền, tên người, lịch khởi hành và chỉ số là nội dung trong thiết kế, không phải dữ liệu vận hành đã xác thực.

## 2. Định vị sản phẩm

TrekRent kết hợp ba lớp trải nghiệm:

1. Khám phá và thuê thiết bị.
2. Đặt tour và chuẩn bị chuyến đi.
3. Quản lý giao nhận, an toàn, ký quỹ và vận hành.

### Nguyên tắc trải nghiệm

- Minh bạch tiền thuê, tiền tour, tiền cọc và khoản hoàn.
- Xây dựng niềm tin bằng kiểm định và bằng chứng bàn giao.
- Ưu tiên an toàn trước chuyến đi.
- Hiển thị hỗ trợ rõ ràng qua hotline 1900 6868.
- Phân biệt trải nghiệm theo vai trò.

### Vai trò người dùng

- Khách thuê thiết bị.
- Khách đặt tour.
- Chủ đồ.
- Quản trị vận hành.
- Hướng dẫn viên.
- Nhân sự điều phối và kho.

## 3. Hệ thống thị giác

### 3.1. Phong cách

Phong cách outdoor gần thiên nhiên, kết hợp:

- Xanh rừng làm màu nền tảng.
- Xanh nhạt cho trạng thái tích cực và vùng thông tin hỗ trợ.
- Cam đất cho hành động nổi bật.
- Hình ảnh núi rừng, hành trình trekking và thiết bị thực tế.
- Bề mặt sáng, viền mảnh, bo góc vừa phải.
- Mật độ thông tin cao hơn ở giao diện vận hành.

Trang khám phá dùng hero ảnh lớn với lớp phủ tối.
Màn hình vận hành dùng KPI, bảng dữ liệu và checklist.
Footer xanh rất đậm xuất hiện xuyên suốt nhiều màn hình.

### 3.2. Màu sắc

Các vai trò dưới đây được diễn giải theo cách dùng, không phải tên token chính thức.

| Màu | Vai trò |
|---|---|
| #1B4332 | Xanh thương hiệu, header, tiêu đề, hành động chính |
| #081C15 | Nền tối, footer |
| #2D6A4F | Xanh bổ trợ |
| #D8F3DC | Nền xanh nhạt, badge tích cực |
| #E76F51 | Cam đất, CTA nổi bật |
| #E9C46A | Vàng nhấn mạnh |
| #F4A261 | Cam sáng bổ trợ |
| #E63946 | Đỏ cảnh báo hoặc chưa hoàn thành |
| #1F2937 | Chữ nội dung đậm |
| #6B7280 | Chữ phụ và metadata |
| #E5E7EB | Viền và đường phân cách |
| #F3F4F1 | Nền trung tính sáng |
| #FBFBFA | Nền trắng ngà |
| #FFFFFF | Bề mặt trắng, chữ trên nền tối |

#### Điểm cần chuẩn hóa

- Có cả #E76F51 và #E86F51.
- Có nhiều xanh đậm gần nhau: #173B2C, #173F31, #203B30.
- Có nhiều xám xanh phụ chưa được gom thành hệ semantic thống nhất.

### 3.3. Typography

Font chủ đạo: Be Vietnam Pro.

Các weight xuất hiện:

- Regular.
- Medium.
- SemiBold.
- Bold.
- ExtraBold.

Một số ít lớp sử dụng Inter Regular.

Cỡ chữ quan sát được từ 9 đến 46 px.
Nhóm 11–14 px xuất hiện nhiều ở bảng, label, điều hướng và nội dung ngắn.

#### Một số text style hiện có

| Style | Font | Size / Line-height |
|---|---|---|
| Semantic/Heading 1 | Be Vietnam Pro Bold | 36/45 hoặc 26/35.75 px |
| Semantic/Heading 2 | Be Vietnam Pro SemiBold | 28/36.4 px |
| Semantic/Heading 3 | Be Vietnam Pro Bold | 15/22.5 px |
| Semantic/Button | Nhiều weight | 11–16 px |
| Semantic/Label upper | Be Vietnam Pro Bold | 11/16.5 px |
| Be Vietnam Pro/Regular | Regular | Ví dụ 14/20, 15/24 px |
| Be Vietnam Pro/SemiBold | SemiBold | Ví dụ 13/19.5, 18/25.2 px |

Có nhiều style trùng tên nhưng khác thông số.
Cần chuẩn hóa trước khi ánh xạ sang hệ typography triển khai.

### 3.4. Layout

| Thuộc tính | Hiện trạng tiêu biểu |
|---|---|
| Chiều rộng màn hình | 1440 px |
| Header checkout/Staff Portal | 72 px |
| Header trang khám phá | 74 px |
| Lề ngang trang khám phá | 64 px |
| Lề ngang checkout/Staff Portal | 80 px |
| Lề header Staff Portal | 40 px |
| Container tương ứng | 1312 hoặc 1280 px |
| Hero trang khám phá | Cao 480 px |
| Lưới sản phẩm desktop | 4 cột |

### 3.5. Spacing và radius

Giá trị spacing phổ biến:

- 4 px.
- 8 px.
- 12 px.
- 16 px.
- 20 px.
- 24 px.
- 32 px.

Padding phổ biến trong nội dung:

- 8 px.
- 12 px.
- 16 px.
- 20 px.
- 24 px.

Radius phổ biến:

- 4 px.
- 6 px.
- 8 px.
- 10 px.
- 12 px.
- 16 px.

Badge và avatar có radius lớn như 100 hoặc 9999.

Đây là giá trị quan sát được, không phải spacing scale đã chuẩn hóa.
Một số nội dung nhập từ HTML còn có thông số thập phân.

### 3.6. Một số biến cục bộ hiện có

| Tên biến | Giá trị |
|---|---|
| color/spring green/18 | #1B4332 |
| color/green/90 | #D8F3DC |
| color/red/61 | #E76F51 |
| color/orange/66 | #E9C46A |
| color/azure/17 | #1F2937 |
| color/grey/46 | #6B7280 |
| color/white/solid | #FFFFFF |
| font family/Font 1 | Be Vietnam Pro |
| width/1440 | 1440 |
| width/1280 | 1280 |
| item spacing/xxs | 4 |
| item spacing/xs | 8 |
| item spacing/s+ | 24 |
| corner radius/8 | 8 |
| corner radius/12 | 12 |
| corner radius/16 | 16 |

Việc tồn tại biến không đồng nghĩa toàn bộ thiết kế đã được bind biến nhất quán.

## 4. Pattern giao diện

### Header khách hàng

- Logo TrekRent.
- Điều hướng thiết bị và tour.
- Tìm kiếm hoặc hotline.
- Tài khoản.
- CTA đăng đồ cho thuê ở một số màn hình.

### Header vận hành

- Điều hướng theo vai trò.
- Avatar.
- Tên người dùng và chức danh.
- Các tác vụ liên quan đến vận hành.

### Product card

- Ảnh sản phẩm.
- Badge kiểm định hoặc tình trạng.
- Tên.
- Thông số ngắn.
- Giá thuê theo ngày.
- Tiền cọc.
- Xem chi tiết.
- Thuê ngay.

### Tour card

- Ảnh và điểm đến.
- Thời lượng.
- Độ khó.
- Ngày khởi hành.
- Trạng thái.
- Số chỗ còn lại.
- Xem chi tiết.

### KPI card

- Tên chỉ số.
- Giá trị lớn.
- Chú thích.
- Badge trạng thái hoặc tăng trưởng.

### Bảng dữ liệu

- Tiêu đề cột.
- Hàng nội dung.
- Thao tác theo hàng.
- Tìm kiếm.
- Bộ lọc.
- Phân trang.

### Tóm tắt thanh toán

Tách riêng:

- Tiền thuê hoặc tiền tour.
- Tiền cọc.
- Thuê phụ.
- Giảm giá.
- Khấu trừ.
- Tổng ký quỹ.
- Thực hoàn hoặc thực nhận.

### Stepper và timeline

- Xem đơn.
- Ký quỹ.
- Bàn giao hoặc nhận vé.
- Trải nghiệm.
- Kết thúc.
- Quyết toán.

### Bằng chứng bàn giao

- Toàn cảnh thiết bị.
- Khóa kéo và khung.
- Phụ kiện.
- So sánh trước và sau khi thuê.

### Form và checklist

- Label.
- Trường bắt buộc.
- Hướng dẫn.
- Checkbox xác nhận.
- Trạng thái hoàn thành.

Các trạng thái hover, focus, pressed, validation error và loading chưa được đặc tả đầy đủ cho mọi pattern.

## 5. Danh mục màn hình

### 5.1. Xác thực — 3 màn hình

| Màn hình | Node ID | Nội dung |
|---|---|---|
| Trang đăng nhập | 32:13 | Email/SĐT, mật khẩu, ghi nhớ, quên mật khẩu |
| Trang đăng ký | 32:69 | Thông tin tài khoản, xác nhận mật khẩu, điều khoản |
| Trang xác thực OTP | 33:8 | OTP 6 số, hiệu lực 5 phút, gửi lại mã |

Ba màn hình nằm trong nhóm Login User, ID 92:219.

### 5.2. Thuê thiết bị và chủ đồ — 5 màn hình

| Màn hình | Node ID | Nội dung |
|---|---|---|
| home-gear-discovery | 20:107 | Hero, giá trị bảo vệ, bộ lọc, danh sách thiết bị |
| product-detail-rental | 20:462 | Thông số, chọn ngày, dự toán phí |
| escrow-checkout | 20:612 | Tóm tắt đơn, ký quỹ, VietQR/Napas247 |
| transaction-tracker | 20:743 | Tiến trình, ảnh bàn giao, báo sự cố |
| owner-dashboard | 20:893 | Doanh thu, cọc, thiết bị, đơn và lịch khả dụng |

### 5.3. Tour — 11 màn hình

| Màn hình | Node ID | Nội dung |
|---|---|---|
| Combo trekking 2N1Đ | 92:2 | Danh mục và bộ lọc tour |
| Chi tiết Fansipan — bản nhập HTML | 83:632 | Lịch trình, kiểm định, đặt chỗ |
| 01b_Tour_Detail_Fansipan | 269:874 | Lịch trình, trang bị, đánh giá, chọn đợt |
| Tour Checkout - Step 1 | 87:7 | Xem đơn, liên hệ, thuê phụ |
| 02b_Tour_Checkout_With_Voucher | 321:806 | Voucher, người tham gia, ký quỹ |
| Tour Checkout - Step 2 | 211:274 | Chuyển khoản và chờ giao dịch |
| 03b_Safety_Handbook_And_Skill_Check | 285:747 | Cẩm nang, cam kết, khóa/mở vé |
| 03-E-Ticket | 87:82 | Vé, check-in, tập kết, hướng dẫn viên |
| 04-Trip-Concluded | 87:145 | Hoàn tất, giải ngân, hoàn cọc, đánh giá |
| 04b_Escrow_Settlement_With_Charges | 315:805 | Biên bản, khấu trừ, thực hoàn |
| 05_Refund_Policy_And_Cancel_Tour | 290:374 | Chính sách và yêu cầu hủy |

Các bản chi tiết/checkout là biến thể đang cùng tồn tại.
Chưa có căn cứ xác định bản nào thay thế bản nào.

### 5.4. Quản trị đơn thuê — 5 màn hình

| Màn hình | Node ID | Nội dung |
|---|---|---|
| Tổng quan vận hành | 99:3040 | KPI, việc cần xử lý, biểu đồ |
| Quản lý đơn thuê | 99:3180 | Tìm/lọc đơn, bảng, phân trang |
| Chi tiết đơn TRK847392 | 99:3319 | Khách/chủ đồ, giao nhận, tiền, ghi chú |
| Giao nhận & Kiểm tra đồ | 99:3500 | Lịch giao nhận, ưu tiên, bằng chứng |
| Kiểm tra đồ • TRK847392 | 99:3654 | Kiểm tra 24h, ảnh/video, quyết định hoàn/khấu trừ |

### 5.5. Hướng dẫn viên và điều phối — 6 màn hình

| Màn hình | Node ID | Nội dung |
|---|---|---|
| Quản lý hướng dẫn viên | 151:898 | KPI, tìm/lọc, hồ sơ, trạng thái |
| Chi tiết hướng dẫn viên | 151:1050 | Hồ sơ, chứng chỉ, trạng thái, lịch |
| Quản lý công việc hướng dẫn viên | 151:1913 | Công việc tuần, lịch tour, đoàn hôm nay |
| diem-danh-thanh-vien | 191:4 | Điểm danh, ghi chú, softskill |
| Staff_Trip_Detail_And_Manifest | 345:1446 | Sĩ số, nhóm, manifest, checklist |
| Staff_Trip_Equipment_Preparation | 353:1190 | Định mức, tồn kho, asset, bàn giao |

## 6. Luồng nghiệp vụ

### 6.1. Thuê thiết bị

Khám phá
→ Chi tiết thiết bị
→ Chọn ngày
→ Xem tiền thuê và cọc
→ Ký quỹ
→ Bàn giao và chụp bằng chứng
→ Đang thuê
→ Trả đồ
→ Kiểm tra
→ Quyết toán.

Nhánh ngoại lệ:

- Báo sự cố.
- Yêu cầu khấu trừ.
- Tranh chấp.

Bằng chứng nhận đồ gồm:

1. Toàn cảnh.
2. Khóa kéo và khung.
3. Phụ kiện.

Tracker và màn hình kiểm tra mô tả cửa sổ 24 giờ sau khi trả đồ.
Cần thống nhất với những nơi mô tả hoàn cọc ngay.

### 6.2. Đặt tour

Danh mục tour
→ Chi tiết và lịch trình
→ Chọn đợt, số người
→ Xem đơn, thuê phụ, voucher
→ Thông tin người tham gia
→ Ký quỹ
→ Cẩm nang và cam kết
→ Mở khóa QR
→ Check-in và trải nghiệm
→ Kết thúc
→ Giải ngân và hoàn cọc
→ Đánh giá.

Nhánh hủy:

Đơn đã đặt
→ Chính sách theo thời gian
→ Ước tính khoản hoàn
→ Lý do hủy
→ Xác nhận hủy.

Thứ tự tích hợp giữa cẩm nang, thanh toán và vé cần được xác nhận khi chốt luồng.

### 6.3. Vận hành chuyến đi

Xem chuyến và manifest
→ Phân nhóm, gán Lead Guide
→ Kiểm tra an toàn và CCCD
→ Soạn đồ theo định mức
→ Gán mã asset
→ Kiểm tra checklist
→ Ký bàn giao
→ Điểm danh
→ Chốt khởi hành.

Đây là trình tự tổng hợp từ màn hình.
Chưa xác nhận mọi điều kiện đã chặn thao tác thực tế.

## 7. Quy tắc tiền và ví dụ

### 7.1. Thuê lều Naturehike 4P

| Khoản | Giá trị |
|---|---:|
| Giá/ngày | 80.000đ |
| Số ngày | 3 |
| Tiền thuê | 240.000đ |
| Cọc | 500.000đ |
| Tổng ký quỹ | 740.000đ |
| Hoa hồng sàn trong quản trị | 24.000đ, tương đương 10% |
| Thực trả chủ đồ trong quản trị | 216.000đ |

Công thức ở quản trị:

- Ký quỹ = tiền thuê + tiền cọc.
- Thực trả chủ = tiền thuê − hoa hồng.

Điểm cần xác nhận:
checkout thuê nói chủ đồ nhận 240.000đ, trong khi quản trị ghi 216.000đ sau hoa hồng.

### 7.2. Tour Fansipan một người

- Tiền tour: 2.450.000đ.
- Cọc thiết bị: 500.000đ.
- Tổng ký quỹ: 2.950.000đ.

Bản không có hư hại:

- Giải ngân BTC: 2.450.000đ.
- Hoàn cọc: 500.000đ.
- Điểm thưởng: 245 điểm.

Bản có khấu trừ:

- Cọc ban đầu: 500.000đ.
- Hư hại gậy: 50.000đ.
- Thực hoàn: 450.000đ.

### 7.3. Voucher nhóm

Mã minh họa: TREKGROUP10.

Điều kiện trên màn hình:
giảm 10% tiền tour khi đặt từ 2 vé.

| Khoản | Giá trị |
|---|---:|
| 2 vé × 2.450.000đ | 4.900.000đ |
| Cọc thiết bị | 1.000.000đ |
| Giảm giá | −490.000đ |
| Tổng ký quỹ | 5.410.000đ |

Chưa có đặc tả đầy đủ cho:

- Hạn dùng.
- Trần giảm.
- Mã hết lượt.
- Mã không hợp lệ.
- Điều kiện kết hợp ưu đãi.

### 7.4. Hủy tour

Chính sách minh họa: Fansipan 2N1Đ v2.1.

| Thời gian trước khởi hành | Hoàn tiền tour | Cọc thiết bị |
|---|---:|---|
| Trên 168 giờ | 100% | Hoàn 100% |
| 72–168 giờ | 50% | Hoàn 100% |
| Dưới 72 giờ | 0% | Hoàn 100% cọc đồ chưa giao |

Ví dụ còn 192 giờ:

- Hoàn tour: 2.450.000đ.
- Hoàn cọc: 500.000đ.
- Tổng hoàn: 2.950.000đ.

Màn hình mô tả hoàn qua Napas247 trong 24 giờ.
Đây không phải xác nhận SLA thực tế.

Cần xác định:

- Quy ước đúng mốc 72 giờ và 168 giờ.
- Múi giờ.
- Phiên bản chính sách gắn với đơn.
- Điều kiện thiết bị đã bàn giao.

### 7.5. Soạn thiết bị đoàn

Chuyến TRIP-2026-FSP01, 18 khách.

| Thiết bị | Định mức | Số lượng |
|---|---|---:|
| Lều Eureka 2P | 2 người/lều | 9 |
| Túi ngủ -5°C | 1 cái/khách | 18 |
| Gậy Black Diamond | 2 gậy/khách | 36 |
| Túi sơ cứu | 1 túi/nhóm | 2 |
| Tổng | | 65 |

Màn hình hiển thị:

- Đã soạn 65/65.
- Gán mã asset.
- Checklist 3/3.
- Bàn giao từ Staff sang Lead Guide.

Đơn vị gậy ở đây là từng chiếc.
Không mặc nhiên tương đương sản phẩm “cặp gậy” trong danh mục.

## 8. Trạng thái

### Đơn thuê

- Chờ bàn giao.
- Đang thuê.
- Đang trải nghiệm.
- Chờ kiểm tra.
- Chờ check-out 24h.
- Tranh chấp.
- Đã hoàn tất.

### Dòng tiền

- Chờ giao dịch.
- Đang giữ ký quỹ.
- Đang đóng băng.
- Đã hoàn cọc.
- Đã quyết toán.

### Tour

- Đang mở.
- Hết hạn.
- Đã khởi hành.
- Đang trải nghiệm.
- Hoàn tất.

### Hướng dẫn viên

- Sẵn sàng.
- Đang dẫn tour.
- Tạm nghỉ.
- Không hoạt động.

### An toàn và điểm danh

- Đã đọc.
- Chưa đọc.
- Vé QR đang khóa.
- Đã điểm danh.
- Chưa điểm danh.
- Vắng mặt.

### Thiết bị

- Bình thường.
- Cần xem xét.
- Hao mòn tự nhiên.
- Đã soạn đủ.
- Mã asset đã xác thực.

Các tên tương đương cần thống nhất trước khi định nghĩa state machine.
Danh sách trên không được coi là toàn bộ trạng thái backend.

## 9. Thuật ngữ dữ liệu xuất hiện trong UI

| Thuật ngữ | Ngữ cảnh |
|---|---|
| PROMOTIONS | Mã ưu đãi |
| BOOKING_PARTICIPANTS | Người tham gia và manifest |
| EQUIPMENT_ASSETS | Tài sản và biên bản |
| RENTAL_CHARGES | Phụ phí, khấu trừ hư hại |
| REFUND_POLICIES | Chính sách hoàn tiền |
| REFUND_POLICY_RULES | Quy tắc theo mốc |
| PARTICIPANT_POST_READS | Lưu vết đọc cẩm nang |
| ORDERS.discount_amount | Khoản giảm giá |
| ORDERS.cancel_reason | Lý do hủy |
| TRANSACTIONS type='Refund' | Hoàn tiền |

Đây là nhãn trong thiết kế, chưa phải schema backend đã xác thực.
Cần cân nhắc loại bỏ thuật ngữ nội bộ khỏi giao diện khách hàng.

## 10. Các điểm cần xác nhận

### 10.1. Dữ liệu và thời gian

- Có màn hình dùng năm 2024, màn hình khác dùng 2026.
- Các bản tour có lịch trình và giờ khởi hành khác nhau.
- Vé ghi 07:30 trong khi lịch cùng đợt có hoạt động khởi hành 07:15.
- Cần phân biệt giờ tập kết và giờ xuất phát.
- Danh mục có tour “đang mở” nhưng ngày đã qua so với thời điểm xuất.
- Màn hình kiểm tra có ngày nhận lại và ngày ảnh sau trả không đồng nhất.

### 10.2. Tiền và chính sách

- Có nơi ghi hoàn cọc 100%, nơi khác có khấu trừ hư hại.
- Có nơi nói hoàn ngay, nơi khác mô tả 24 giờ kiểm tra.
- Checkout nói trả chủ đồ 240.000đ; quản trị ghi thực nhận 216.000đ.
- Tổng tiền cọc danh sách bị gọi là tổng ký quỹ ở một số chỗ.
- Cần thống nhất gross/net và điều kiện hoàn đủ.

### 10.3. Sĩ số và an toàn

- Điểm danh ghi 6/8 nhưng các hàng thể hiện 5 đã điểm danh.
- Tour ghi 12 khách nhưng danh sách minh họa có 8.
- Staff ghi sẵn sàng khởi hành dù có khách chưa đọc an toàn.
- CCCD mới đạt 17/18.
- Checklist ghi “Đủ 18/10 khách”, khác sĩ số 18/20.
- Cần làm rõ 10 là ngưỡng tối thiểu hay tổng chỉ tiêu.

### 10.4. Nội dung và hệ thống thiết kế

- Fansipan có bản ghi “Trung bình”, bản ghi “Thử thách”.
- Quy mô quảng bá 8–12 hoặc 10–12 người, staff có 18/20 khách.
- Có thể là quy mô nhóm so với toàn chuyến nhưng chưa giải thích rõ.
- Text style trùng tên nhưng khác thông số.
- Nhiều màu và khoảng cách gần nhau.
- Nhãn tiếng Việt, tiếng Anh và không dấu chưa đồng nhất.
- Danh sách đơn ghi 1–20/128 nhưng chỉ hiển thị 5 dòng minh họa.
- QR thanh toán có ghi là minh họa và trạng thái mô phỏng.

## 11. Đề xuất triển khai

### 11.1. Chuẩn hóa design system

- Chốt token brand, surface, text, border, success, warning, danger.
- Chuẩn hóa typography theo vai trò.
- Gom các màu gần nhau nếu không có mục đích riêng.
- Chuẩn hóa spacing và radius.
- Tạo component tái sử dụng.
- Tách biến thể theo vai trò.
- Thống nhất đơn vị chiếc, cặp và bộ.

### 11.2. Responsive

Chưa thấy bộ mobile/tablet riêng.

Cần bổ sung:

- Lưới sản phẩm giảm cột.
- Tóm tắt thanh toán chuyển vị trí phù hợp.
- Bảng chuyển thành dạng thẻ hoặc cuộn ngang.
- Điều hướng và bộ lọc thu gọn.
- Hotline vẫn dễ tiếp cận.
- Kiểm tra khả năng đọc trên màn hình hẹp.

Tên layer “sticky-header” không xác nhận hành vi sticky đã hoạt động.

### 11.3. Trạng thái còn thiếu

- Empty.
- Loading.
- Error.
- Success.
- Disabled.
- Xác nhận thao tác không thể đảo ngược.
- Thanh toán hết hạn.
- Chuyển khoản sai tiền hoặc nội dung.
- Voucher không hợp lệ.
- OTP sai hoặc hết hạn.
- Upload thất bại.
- Thiếu bằng chứng bàn giao.

### 11.4. Accessibility

- Kiểm tra contrast chữ/nền.
- Rà soát chữ nhỏ 9–12 px.
- Bổ sung keyboard focus.
- Bảo đảm input có label.
- Mô tả lỗi rõ ràng.
- Không dùng màu làm dấu hiệu duy nhất.
- Kiểm tra vùng bấm trên thiết bị cảm ứng.

Chưa thực hiện kiểm định WCAG đầy đủ trong bản tổng hợp này.

### 11.5. Bảo mật

- Giới hạn quyền xem CCCD, SĐT, email và liên hệ khẩn cấp.
- Che dữ liệu nhạy cảm trong demo công khai.
- Bảo vệ bản xuất manifest.
- Phân quyền đổi nhóm, giao nhận, khấu trừ, hoàn tiền và chốt khởi hành.
- Không dùng tài khoản hoặc QR minh họa để thanh toán thực tế.

## 12. Checklist bàn giao

- [ ] Chọn bản chi tiết tour và checkout chính thức.
- [ ] Chốt hoa hồng, khấu trừ và hoàn cọc.
- [ ] Xác định mốc thời gian hủy và múi giờ.
- [ ] Đồng bộ ngày, giờ, sĩ số và dữ liệu demo.
- [ ] Thống nhất tên trạng thái.
- [ ] Chốt điều kiện khóa/mở QR.
- [ ] Chốt điều kiện khởi hành.
- [ ] Chuẩn hóa token và text style.
- [ ] Tạo component tái sử dụng.
- [ ] Thiết kế responsive.
- [ ] Bổ sung trạng thái lỗi và ngoại lệ.
- [ ] Kiểm tra accessibility.
- [ ] Kiểm tra phân quyền dữ liệu cá nhân.
- [ ] Xác thực tích hợp thanh toán, OTP, upload, PDF và check-in độc lập với thiết kế tĩnh.

## Kết luận

TrekRent đã có bộ màn hình desktop bao phủ khám phá, giao dịch ký quỹ,
an toàn chuyến đi và vận hành.

Trọng tâm trước khi triển khai:

1. Hợp nhất các biến thể.
2. Thống nhất quy tắc dòng tiền và trạng thái.
3. Chuẩn hóa hệ thống thị giác.
4. Bổ sung responsive.
5. Hoàn thiện trạng thái lỗi, ngoại lệ và phân quyền.

Không thay đổi thiết kế gốc trong quá trình tổng hợp tài liệu.
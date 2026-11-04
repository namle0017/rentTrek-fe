# PRD — RenTrekk

**Product Requirements Document — phiên bản 0.1, ngày 13/10/2026**  
**Trạng thái:** dự thảo để thống nhất phạm vi và lập kế hoạch; chưa phải biên bản phê duyệt nghiệp vụ.  
**Đối tượng đọc:** chủ sản phẩm, BA, thiết kế giao diện, lập trình viên, kiểm thử viên và người vận hành.

**Hướng dẫn đọc:** mục 1–4 giải thích phạm vi và mô hình nghiệp vụ; mục 5–8 dùng để phân tích và triển khai; mục 9–12 dành cho trải nghiệm, tích hợp và vận hành; mục 13–14 truy vết dữ liệu và nghiệm thu; mục 15–17 quản lý phát hành, quyết định mở và nguồn tài liệu. Nên chốt các câu hỏi về tiền, quyền và vòng đời ở mục 16 trước khi ước lượng phần phụ thuộc.

## 1. Thông tin tài liệu và cơ sở yêu cầu

### 1.1. Nguồn sử dụng

Nguồn chính là [Conceptual.drawio](./Conceptual.drawio), gồm trang **Logical ERD: 51 bảng, 88 relationship** và trang **Conceptual: 59 relationship** tại thời điểm trích xuất. Tài liệu cũng kế thừa các quyết định người dùng đã xác nhận trong cuộc trao đổi về ERD. Không sử dụng số lượng bảng như số lượng màn hình hoặc API phải xây dựng.

PRD mô tả hành vi sản phẩm phải có, điều kiện thành công, ngoại lệ và quyền thao tác. ERD mô tả khả năng lưu dữ liệu; riêng sự xuất hiện của một bảng không chứng minh tính năng đã được xây dựng, quyền đã được chốt hoặc luồng đã hoạt động.

### 1.2. Cách đọc mức độ chắc chắn

| Nhãn | Ý nghĩa | Cách sử dụng |
|---|---|---|
| **[C] Đã chốt** | Người dùng đã xác nhận trong trao đổi | Giữ làm nền tảng nghiệp vụ; thay đổi cần được ghi nhận |
| **[E] Có trong ERD** | Bảng, trường, khóa hoặc quan hệ thể hiện trực tiếp | Xác nhận được cấu trúc, chưa mặc nhiên xác nhận toàn bộ trải nghiệm |
| **[D] Đề xuất** | Hành vi, chính sách hoặc chỉ tiêu được đề xuất để hệ thống vận hành đầy đủ | Dùng làm phương án dự thảo; chưa xem là quyết định của người dùng |
| **[Q] Cần chốt** | Có nhiều lựa chọn làm thay đổi phạm vi, dữ liệu hoặc chi phí | Theo dõi tại mục 16; chốt trước khi triển khai phần phụ thuộc |

Các bảng trạng thái, ma trận quyền, giá trị cấu hình, mục tiêu hiệu năng và thứ tự phát hành trong tài liệu đều là **[D]**, trừ khi có ghi chú khác. Cột “Cơ sở” trong yêu cầu chức năng phân biệt bằng chứng cấu trúc với phần hành vi đề xuất. Điều kiện nghiệm thu là yêu cầu dự thảo cho phiên bản tương lai, không phải kết quả kiểm thử hiện tại.

### 1.3. Quyết định nền tảng đã thống nhất

1. **[C] Hoạt động thuộc tour.** Chuyến triển khai hoạt động từ tour/phiên bản tour; không thiết kế một lịch trình độc lập cho từng chuyến bằng cách sao chép hoạt động.
2. **[C] Lịch trình đã có chuyến thực hiện cần ổn định hoặc quản lý phiên bản.** Sửa tour về sau không làm thay đổi lịch sử chuyến cũ.
3. **[C] Phân nhóm theo người tham gia.** Người tham gia có thể chưa được chia nhóm hoặc chưa liên kết tài khoản; mỗi nhóm có một hướng dẫn viên theo mô hình hiện tại.
4. **[C] Khuyến mãi tour áp ở cấp đơn.** `APPLIED_PROMOTIONS` thuộc `ORDERS`; dòng thuê là phạm vi tùy chọn khi khuyến mãi áp cho một dòng thuê.
5. **[C] Dùng chung kho thiết bị qua phân bổ.** Nguồn phân bổ có thể là dòng thuê, đồ cấp chuyến hoặc quyền lợi thiết bị của khuyến mãi.
6. **[C] Review gắn với người tham gia.** Mỗi người tham gia tối đa một review cho lần tham gia đó, sau chuyến hoàn thành và đơn đã thanh toán.
7. **[C] Cardinality cho phép chưa phát sinh dữ liệu.** `0..N` không có nghĩa một đơn đã xác nhận được phép thiếu người tham gia/dòng thuê; điều kiện tối thiểu phụ thuộc trạng thái.

### 1.4. Phạm vi tài liệu

Tài liệu này không sửa ERD, không sinh mã nguồn và không xác nhận kiến trúc đã triển khai. Những điểm ERD chưa hỗ trợ đủ cho yêu cầu được ghi thành khoảng trống thiết kế, không tự thêm bảng hay coi một đường nối suy ra là khóa ngoại thật.

## 2. Tổng quan sản phẩm, mục tiêu và phạm vi

### 2.1. Tóm tắt sản phẩm

**RenTrekk** là hệ thống phục vụ khám phá và đặt chuyến trekking, thuê thiết bị ngoài trời, chuẩn bị và điều phối chuyến, giao nhận thiết bị, thanh toán và hậu mãi. Khách hàng có thể đặt cho bản thân hoặc nhiều người; nhân viên điều phối kiểm soát người tham gia, nhóm, thiết bị và đơn hàng; hướng dẫn viên theo dõi nhóm phụ trách; quản trị viên quản lý dữ liệu danh mục, chính sách và quyền vận hành.

**[D] Hình thức sản phẩm:** ứng dụng web responsive, có khu vực khách hàng và khu vực vận hành, tối ưu màn hình di động cho hướng dẫn viên. ERD không quyết định phải có ứng dụng native. Không ràng buộc framework, phiên bản .NET hoặc nhà cung cấp hạ tầng trong PRD này.

### 2.2. Vấn đề sản phẩm cần giải quyết

Các vấn đề sau là giả thuyết được suy ra từ phạm vi ERD, chưa phải kết quả khảo sát người dùng:

- **Đặt tour thiếu liên kết với vận hành:** một đơn nhiều người nhưng mỗi người có thể ở nhóm khác nhau; người đặt không nhất thiết là người tham gia.
- **Tồn kho bị tách theo mục đích:** thiết bị cho thuê, đồ cấp chuyến và thiết bị khuyến mãi dễ bị đặt trùng nếu kiểm tra riêng.
- **Lịch sử thay đổi khi sửa cấu hình:** sửa tour, giá combo hoặc chính sách hoàn tiền có thể làm đơn/chuyến cũ thay đổi ý nghĩa.
- **Không rõ tiền phải thu và phải hoàn:** tiền thuê, cọc, phí phát sinh, giảm giá và hoàn tiền có vòng đời khác nhau.
- **Thông tin chuẩn bị phân tán:** khách cần biết lịch trình, đồ tự mang, đồ được cấp và nội dung hướng dẫn trước chuyến.

### 2.3. Mục tiêu

| Mã | Mục tiêu | Dấu hiệu đạt |
|---|---|---|
| G-01 | Khách tự tìm, chọn và đặt chuyến phù hợp | Hoàn tất đặt chỗ với tổng tiền, người tham gia và trạng thái rõ ràng |
| G-02 | Khách thuê được món lẻ hoặc combo theo thời gian | Giá nhất quán; tài nguyên sẵn sàng cho khoảng thuê |
| G-03 | Vận hành quản lý được chuyến và nhóm | Mỗi participant, guide, đồ cấp và điểm danh truy vết được |
| G-04 | Không cấp trùng thiết bị hoặc bán vượt sức chứa | Kiểm tra đồng thời không tạo hai cam kết xung đột |
| G-05 | Bảo toàn lịch sử thương mại | Thay đổi danh mục không làm sai giá đã chốt, thành phần combo hoặc lịch trình cũ |
| G-06 | Minh bạch thanh toán, cọc, phí và hoàn tiền | Truy vết từ số tiền đến đơn, giao dịch gốc, phí hoặc chính sách liên quan |

### 2.4. Phạm vi chức năng

| Nhóm | Bao gồm trong PRD | Mức ưu tiên đề xuất |
|---|---|---|
| Tài khoản | Đăng ký, đăng nhập, vai trò, hồ sơ, reset mật khẩu, phiên đăng nhập | P0 |
| Danh mục tour | Địa điểm chính, giá cơ sở, ảnh, hoạt động, đồ chuẩn bị, đồ được cấp | P0 |
| Chuyến | Lịch khởi hành, sức chứa, giá chuyến, điều phối, nhóm và guide | P0 |
| Đặt tour | Đơn nhiều người, giữ chỗ, xác nhận, hủy, trạng thái thanh toán | P0 |
| Thuê đồ | Sản phẩm, variant, asset, combo, giá theo số ngày, cọc | P0 |
| Kho dùng chung | Giữ/cấp/thu hồi asset cho thuê, chuyến và khuyến mãi | P0 |
| Tài chính đơn hàng | Ghi nhận thu tiền, hoàn tiền, phí trả trễ/hỏng/mất | P0 |
| Khuyến mãi | Điều kiện, bậc, phạm vi đơn/dòng, giảm tiền hoặc thiết bị kèm | P1 |
| Nội dung và đánh giá | Bài viết, tag, kỹ năng, nội dung tour, lượt đọc, review | P1 |
| Tự động hóa | Lịch lặp, sinh chuyến, thông báo, tác vụ hết hạn | P0 cho hết hạn; P1 cho lịch lặp |
| Mở rộng đăng nhập | Nhà cung cấp ngoài thông qua `USER_EXTERNAL_LOGINS` | P2 |

**P0:** điều kiện để chạy nghiệp vụ cốt lõi an toàn. **P1:** hoàn thiện mô hình sản phẩm đã thiết kế. **P2:** tùy chọn sau khi lõi vận hành ổn định. Đây là thứ tự giao hàng, không phải quyết định xóa các thực thể P1/P2 khỏi ERD.

### 2.5. Ngoài phạm vi phiên bản đầu [D]

- Marketplace nhiều nhà cung cấp, chia doanh thu hoặc thanh toán cho đối tác.
- Bán đứt thiết bị, quản lý mua hàng nhà cung cấp, kế toán tổng hợp hoặc hóa đơn điện tử.
- Nhiều kho vật lý, chuyển kho, định tuyến giao nhận, theo dõi GPS trực tiếp.
- Vé máy bay, khách sạn, bảo hiểm, hồ sơ y tế hoặc tư vấn y khoa.
- Chương trình điểm thưởng, ví điện tử nội bộ, chat thời gian thực, đánh giá sản phẩm thuê.
- Một giỏ checkout chứa đồng thời đơn tour và đơn thuê; mô hình hiện tại chia mỗi `Order` thành đúng một loại.
- Hoạt động tùy biến riêng từng chuyến, nhiều hướng dẫn viên trên một nhóm, điểm danh offline có đồng bộ.
- Hoàn tiền riêng từng participant trong cùng booking trước khi có quy tắc phân bổ tiền rõ ràng.

### 2.6. Những kết quả không được chấp nhận

Không xác nhận đơn chỉ vì trình duyệt báo thanh toán thành công; không tính sẵn có từ một số lượng kho tổng duy nhất; không thay đổi đơn đã chốt khi sửa bảng giá; không cho người đặt xem dữ liệu nhạy cảm của khách không thuộc đơn; không làm mất lịch sử giao dịch khi ẩn/xóa danh mục.

## 3. Người dùng và phân quyền

### 3.1. Nhóm người dùng

| Vai trò | Nhu cầu chính | Giới hạn dữ liệu đề xuất |
|---|---|---|
| Khách vãng lai | Xem tour, chuyến công khai, thiết bị, giá, bài viết | Chỉ dữ liệu công khai |
| Customer | Đặt tour/thuê đồ, theo dõi đơn, yêu cầu hủy, xem quyền lợi | Đơn sở hữu và participant được liên kết hợp lệ |
| Staff | Điều phối chuyến, xử lý đơn thuê, cấp/thu đồ, lập phí | Phạm vi được giao; quyền điều phối rộng hơn cần cấu hình rõ |
| Guide | Xem nhóm phụ trách, danh sách tham gia, điểm danh | Chuyến/nhóm được phân công; không mặc định xem thanh toán |
| Admin | Quản trị danh mục, người dùng, chính sách và kiểm soát vận hành | Toàn hệ thống nhưng mọi thao tác nhạy cảm phải được audit |

`USERS.role_id` thể hiện một vai trò trên mỗi tài khoản **[E]**. Các thực thể Admin/Staff/Customer/Guide ở Conceptual biểu diễn vai trò nghiệp vụ của tài khoản, không phải bốn danh tính khác nhau. Nếu cần một người đồng thời là Staff và Guide, phải chốt lại chính sách tài khoản/quyền **[Q-01]**.

### 3.2. Ma trận quyền dự thảo [D]

Ký hiệu: **C** = dữ liệu của chính mình; **G** = dữ liệu được giao; **T** = toàn hệ thống; **—** = không được phép. Quyền thực tế phải kiểm tra ở máy chủ, không chỉ ẩn nút trên giao diện.

| Thao tác | Guest | Customer | Staff | Guide | Admin |
|---|---|---|---|---|---|
| Xem nội dung đang công khai | Có | Có | Có | Có | Có |
| Sửa hồ sơ cá nhân | — | C | C | C | C |
| Tạo đơn tour/thuê | — | C | — | — | — |
| Xem đơn và giao dịch | — | C | G | — | T |
| Yêu cầu hủy đơn | — | C | G | — | T |
| Quản lý sản phẩm, variant, combo | — | — | — | — | T |
| Quản lý tour, lịch trình, chính sách | — | — | — | — | T |
| Tạo/quản lý chuyến và chia nhóm | — | — | G | — | T |
| Xem participant và liên hệ khẩn cấp | — | C theo phạm vi đơn | G | G | T |
| Ghi/sửa điểm danh | — | — | G | G | T có lý do |
| Cấp/nhận lại asset | — | — | G | — | T |
| Tạo phí thuê phát sinh | — | — | G | — | T |
| Hủy phí/duyệt hoàn tiền | — | — | — | — | T |
| Viết/sửa bài hướng dẫn | — | — | G | — | T |
| Đăng review | — | C nếu đủ điều kiện | — | — | — |
| Khóa tài khoản, sửa quyền/cấu hình | — | — | — | — | T |

Quyền Admin tạo bài và duyệt hoàn tiền là đề xuất, không suy ra riêng từ FK người tạo. Không mặc định Admin được viết review thay khách. Hỗ trợ Staff tạo đơn hộ khách là mở rộng **[Q-02]**; nếu cần phải phân biệt người đặt, người thao tác và người thanh toán trong audit.

### 3.3. Quyền theo đối tượng

- Người sở hữu đơn có thể khai báo nhiều participant; quyền quản lý đơn không tự biến họ thành tác giả review của mọi participant.
- Participant có tài khoản chỉ được thao tác bản ghi đã liên kết sau xác minh; không tự liên kết bằng cách nhập email của người khác.
- Guide không được đọc danh sách khách của chuyến không được phân công, kể cả khi đoán được mã định danh.
- Staff được ghi nhận người chuẩn bị đồ/người điểm danh theo tài khoản đang thao tác; không tin `user_id` tùy ý do client gửi.
- Tác vụ hệ thống được phép có audit không gắn người dùng; phải ghi rõ loại tác nhân và hành động trong nội dung audit.

## 4. Thuật ngữ và mô hình nghiệp vụ

| Thuật ngữ | Ý nghĩa trong RenTrekk | Không nhầm với |
|---|---|---|
| Tour | Sản phẩm trekking có lịch trình và cấu hình chuẩn; có phiên bản | Chuyến khởi hành vào một ngày cụ thể |
| Trip / Chuyến | Một lần triển khai tour với thời gian, giá và sức chứa cụ thể | Bản sao hoạt động riêng của tour |
| Tour activity | Một hoạt động thuộc lịch trình phiên bản tour | Bản ghi điểm danh |
| Trip group / Nhóm | Nhóm vận hành trong một chuyến, do một guide dẫn | Một đơn đặt chỗ |
| Order / Đơn hàng | Cam kết thương mại chung, có khách sở hữu, tiền và chính sách | Giao dịch thanh toán |
| Trip booking order | Phần nghiệp vụ đặt chuyến của một Order | Một participant |
| Booking participant | Một người tham gia trong một booking của một chuyến | Tài khoản đăng nhập hoặc người đặt đơn |
| Rental order | Phần nghiệp vụ thuê đồ của một Order, có thời gian thuê và cọc | Một dòng thuê |
| Rental order item | Dòng thuê một variant hoặc một combo, có số lượng và giá chốt | Thiết bị vật lý được giao |
| Product | Dòng sản phẩm kinh doanh, ví dụ lều trekking | Một chiếc lều cụ thể |
| Product variant | Biến thể cho thuê có SKU, ví dụ lều 2 người màu xanh | Asset |
| Equipment asset | Một thiết bị vật lý có mã tài sản duy nhất | Số lượng của một variant |
| Product bundle / Combo | Tập hợp variant và số lượng thành phần | Một asset đơn |
| Asset assignment | Bản phân bổ một asset cho một nguồn trong một khoảng thời gian | Mua/bán hoặc chuyển quyền sở hữu |
| Tour provided item | Cấu hình đồ đơn vị cấp theo tour | Đồ khách tự chuẩn bị |
| Trip provided item | Nhu cầu đồ cấp thực tế cho một chuyến | Asset đã giao thực tế |
| Applied promotion | Một lần áp quyền lợi khuyến mãi vào đơn/dòng thuê | Cấu hình chương trình khuyến mãi |
| Rental charge | Phí phát sinh của đơn thuê, có thể gắn một asset | Tiền cọc hoặc giao dịch thu tiền |
| Transaction | Một lần thu/hoàn tiền có trạng thái và mục đích | Trạng thái hoàn thành đơn |
| Refund policy | Phiên bản chính sách được chọn cho đơn | Tất cả các nguyên nhân phát sinh hoàn tiền |

### 4.1. Quan hệ cốt lõi cần giữ nhất quán

- Một Tour có thể có nhiều Trip; mỗi Trip thuộc một phiên bản Tour. Một Tour có nhiều TourActivity; một Attendance nối một Participant với một TourActivity phù hợp.
- Một Order có đúng một phần mở rộng: TripBookingOrder **hoặc** RentalOrder. `order_type` phải thống nhất với phần mở rộng tồn tại.
- Một TripBookingOrder có nhiều Participant. Mỗi Participant thuộc một Trip, một booking và tối đa một Group của cùng Trip.
- Một dòng thuê chọn đúng một Variant **hoặc** một Bundle. Với Bundle, lưu thành phần tại thời điểm chốt để bảo toàn lịch sử.
- Một AssetAssignment bắt buộc có một EquipmentAsset và đúng một nguồn trong ba loại. Các nguồn còn lại để trống.
- Một AppliedPromotion bắt buộc có Order và PromotionTier. Nếu có RentalOrderItem thì dòng đó phải thuộc chính Order này.
- Một RentalCharge bắt buộc có RentalOrder và người tạo; EquipmentAsset là tùy chọn. Nếu có asset, phải chứng minh nó liên quan đến đơn chịu phí.
- Một Refund Transaction trỏ giao dịch gốc khi là hoàn của khoản đã thu; giao dịch thu thông thường không cần giao dịch gốc.

### 4.2. Quan hệ suy ra

Các đường `RentalOrders → AssetAssignments`, `Trips → Reviews`, `RefundPolicies → RentalOrders` và `TripBookingOrders → AppliedPromotions` có thể xuất hiện để giải thích nghiệp vụ. Chúng được suy ra qua dòng thuê, participant hoặc Order; không yêu cầu thêm FK độc lập nếu dữ kiện đã được xác định bằng đường liên kết chuẩn. Việc giữ hai nguồn dữ kiện độc lập cho cùng ý nghĩa có thể tạo mâu thuẫn.

## 5. Hành trình người dùng và luồng nghiệp vụ

### 5.1. Đặt chuyến cho nhiều người

1. Khách xem Tour, lịch trình, độ dài, đồ tự mang, đồ được cấp và các Trip còn mở bán.
2. Khách chọn Trip, số người; hệ thống hiển thị giá hiện hành và số chỗ có thể đặt.
3. Khách đăng nhập, nhập thông tin từng participant. Tài khoản của participant không bắt buộc.
4. Hệ thống tính lại giá và khuyến mãi ở máy chủ; hiển thị chính sách hủy/hoàn của phiên bản áp dụng.
5. Khách xác nhận; hệ thống tạo Order, TripBookingOrder và Participant nhất quán, đồng thời giữ chỗ có thời hạn **[D]**.
6. Khách thanh toán. Chỉ thông báo thanh toán đã xác minh hoặc ghi nhận thủ công có quyền mới chuyển trạng thái thu tiền.
7. Khi thu tiền hợp lệ, đơn được xác nhận; thông báo chỉ gửi một lần cho cùng sự kiện nghiệp vụ.
8. Staff phân nhóm, gán guide và chuẩn bị đồ cấp; participant nhận thông tin chuẩn bị trong phạm vi tài khoản liên kết.
9. Guide/Staff điểm danh các hoạt động; chuyến được kết thúc bởi người có quyền.
10. Participant đủ điều kiện gửi một review. Người chưa có tài khoản cần cơ chế xác minh riêng, chưa tự mở quyền đánh giá.

**Ngoại lệ bắt buộc:** hết chỗ khi xác nhận; giá thay đổi trước lúc giữ chỗ; thanh toán thất bại; callback thanh toán đến sau hết hạn; một người hủy nhưng đơn có nhiều người; chuyến bị hủy bởi đơn vị tổ chức. Cách xử lý tiền đến muộn và hủy một phần phải được chốt tại Q-04/Q-07.

### 5.2. Thuê món lẻ hoặc combo

1. Khách chọn thời gian nhận/trả, variant hoặc combo, số lượng; hệ thống kiểm tra theo khoảng thời gian.
2. Hệ thống chọn bậc giá phù hợp, tính số ngày thuê và cọc, trình bày tổng phải trả và điều kiện phát sinh phí.
3. Khi chốt, lưu giá/ngày, số ngày tính tiền và thành phần combo; không tính lại từ cấu hình mới sau này.
4. Đơn được xác nhận theo chính sách thu tiền đã chọn; asset cụ thể được giữ/phân bổ để thực hiện cam kết.
5. Staff kiểm tra asset, giao đồ, ghi thời điểm giao và tình trạng ban đầu theo khả năng dữ liệu.
6. Khi khách trả, Staff ghi nhận từng asset; thiết bị tốt được trả về khả dụng, thiết bị hỏng/mất không được cho thuê tiếp.
7. Nếu có phí, Staff lập RentalCharge có lý do; người có quyền xác nhận/hủy phí theo quy trình.
8. Hệ thống đối soát tiền dịch vụ, cọc, phí, thu bổ sung và hoàn cọc; chỉ đóng đơn khi đạt điều kiện đóng.

**Ngoại lệ bắt buộc:** thiếu một thành phần combo; asset bị hỏng trước ngày giao; khách trả một phần; xin gia hạn; đơn đã trả đồ nhưng còn phí chưa thanh toán. Gia hạn không tự được chấp nhận nếu ảnh hưởng một booking khác.

### 5.3. Chuẩn bị chuyến

1. Staff tạo Trip thủ công hoặc từ lịch lặp, chọn phiên bản Tour và chính sách hoàn tiền mặc định.
2. Kiểm tra thời gian, giá, số chỗ, người điều phối và điều kiện mở bán.
3. Tạo Group và gán Guide. Participant chưa phân nhóm vẫn được tồn tại trong booking.
4. Từ cấu hình TourProvidedItem, xác định nhu cầu đồ cấp cho Trip theo số người/nhóm/chuyến đã chốt.
5. Chọn AssetAssignment cho đồ cấp, kiểm tra xung đột với đơn thuê và quà thiết bị.
6. Trước khởi hành, kiểm tra nhóm, guide, danh sách khách, liên hệ khẩn cấp và mức độ chuẩn bị đồ.
7. Trong chuyến, cập nhật điểm danh; sau chuyến, thu hồi asset và đóng vận hành.

### 5.4. Hủy và hoàn tiền

1. Khách/người vận hành yêu cầu hủy, nhận bản xem trước số tiền dự kiến được hoàn và lý do tính.
2. Hệ thống lấy đúng phiên bản chính sách của Order, mốc thời gian và giao dịch đã thu.
3. Người có quyền duyệt theo loại hủy. Hủy chuyến bởi đơn vị tổ chức có thể áp chính sách riêng **[Q-07]**.
4. Hệ thống giải phóng chỗ hoặc giữ thiết bị chưa bàn giao phù hợp; không biến thiết bị đang ở khách thành khả dụng.
5. Tạo giao dịch hoàn liên kết khoản thu gốc. Nếu nhà cung cấp lỗi, giữ yêu cầu ở trạng thái có thể theo dõi và thử lại an toàn.
6. Chỉ cập nhật tổng đã hoàn khi có bằng chứng giao dịch thành công; giữ đầy đủ lịch sử thất bại.

### 5.5. Áp khuyến mãi có thiết bị kèm

Chương trình xác định phạm vi và điều kiện → chọn bậc phù hợp → kiểm tra hạn mức và quyền lợi → kiểm tra tài nguyên nếu có thiết bị → lưu AppliedPromotion trên Order/dòng → tạo AssetAssignment cho quyền lợi thiết bị. “Quà thiết bị” trong bản PRD là quyền sử dụng thiết bị kèm **có thu hồi** theo mô hình kho dùng chung **[D, Q-08]**; quà tặng sở hữu vĩnh viễn không được ngầm coi là cùng một luồng.

## 6. Yêu cầu chức năng chi tiết

Mỗi mục dưới đây có mã FR dùng để truy vết và viết test case. Các quy tắc và tiêu chí cụ thể là dự thảo hành vi cần xây dựng; cột cơ sở cho biết phần nào đã có bằng chứng. Tất cả thao tác ghi dữ liệu phải kiểm tra quyền, dữ liệu đầu vào và trạng thái hiện hành trên máy chủ.

### 6.1. Tài khoản, hồ sơ và phiên đăng nhập

**Dữ liệu:** `ROLES`, `USERS`, `PROFILES`, `ACCESS_TOKENS`, `REFRESH_TOKENS`, `PASSWORD_RESET_TOKENS`, `USER_EXTERNAL_LOGINS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-A01 | Đăng ký tài khoản khách | Email chuẩn hóa không trùng; mật khẩu không lưu dạng rõ; tài khoản khách không tự chọn quyền Staff/Admin | E + D / P0 |
| FR-A02 | Đăng nhập và đăng xuất | Đăng nhập chỉ cho tài khoản hoạt động; logout thu hồi phiên được chọn; lỗi không tiết lộ mật khẩu hoặc trạng thái nội bộ | E + D / P0 |
| FR-A03 | Cập nhật hồ sơ | Chủ tài khoản sửa thông tin cá nhân được phép; không sửa role/status qua API hồ sơ; mã người dùng không trùng | E + D / P0 |
| FR-A04 | Reset mật khẩu | Token có thời hạn, dùng một lần, lưu dạng băm; token đã dùng/hết hạn bị từ chối; phản hồi gửi yêu cầu không làm lộ email có tồn tại | E + D / P0 |
| FR-A05 | Quản lý phiên và refresh | Rotation tạo token kế nhiệm, vô hiệu token cũ; phát hiện tái sử dụng có xử lý theo family; không chấp nhận token đã thu hồi | E + D / P0 |
| FR-A06 | Quản trị tài khoản và quyền | Admin khóa/mở khóa, gán vai trò và tra cứu lịch sử thay đổi; khóa tài khoản chặn phiên đang có theo chính sách thu hồi | E + D / P0 |
| FR-A07 | Liên kết đăng nhập ngoài | Một danh tính provider/subject không thuộc hai tài khoản; liên kết cần phiên xác thực hợp lệ; tránh tự ghép chỉ vì email giống nhau | E + D / P2 |

**Trường hợp biên:** tài khoản chỉ dùng đăng nhập ngoài có thể không có `password_hash`; không ép reset mật khẩu cục bộ nếu chưa có quy trình thiết lập. ERD có `email_confirmed_at` nhưng chưa có thực thể token xác minh email riêng: nếu yêu cầu xác minh email, cần bổ sung thiết kế token/mã hoặc dịch vụ phù hợp tại Q-03.

### 6.2. Danh mục và phiên bản tour

**Dữ liệu:** `CATEGORIES`, `LOCATIONS`, `TOURS`, `TOUR_IMAGES`, `TOUR_ACTIVITIES`, `TOUR_PREPARATION_ITEMS`, `TOUR_PROVIDED_ITEMS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-T01 | Quản lý thông tin tour | Tour có danh mục phù hợp, địa điểm chính, tên, mô tả, thời lượng và giá cơ sở; giá/số ngày không âm; dữ liệu bắt buộc đủ trước công khai | E + D / P0 |
| FR-T02 | Quản lý ảnh tour | Sắp xếp ảnh, chọn ảnh đại diện; URL không hợp lệ bị báo lỗi; tối đa một ảnh đại diện đang dùng cho một tour | E + D / P1 |
| FR-T03 | Quản lý lịch trình hoạt động | Hoạt động có ngày thứ mấy, giờ bắt đầu, thời lượng, thứ tự hiển thị; ngày hoạt động nằm trong thời lượng tour | C + E / P0 |
| FR-T04 | Phân biệt đồ tự mang và đồ được cấp | Hiển thị hai danh sách riêng; đồ cấp tham chiếu variant và có cơ sở tính số lượng; không coi đồ tự mang là nhu cầu kho | E + D / P0 |
| FR-T05 | Quản lý phiên bản lịch trình | Trip cũ giữ tour version đã dùng; không sửa nội dung lịch trình đã khóa tại chỗ; chỉnh lịch trình cho tương lai tạo version mới trong cùng family | C + E / P0 |
| FR-T06 | Tra cứu và xem chi tiết | Khách lọc/xem tour công khai và các chuyến liên quan; tour nháp/ẩn không xuất hiện cho Guest; tour cũ vẫn truy vết được trong đơn | E + D / P0 |

**Điểm cần chốt:** thời điểm khóa version là khi có booking đã xác nhận, khi bắt đầu chuyến hay khi kết thúc chuyến. Đề xuất khóa sớm khi có booking xác nhận để thông tin đã bán không đổi; thay đổi do an toàn/thời tiết cần quy trình ngoại lệ riêng, không âm thầm sửa lịch sử.

### 6.3. Chuyến, lịch lặp, nhóm và guide

**Dữ liệu:** `TOUR_RECURRENCE_RULES`, `TRIPS`, `TRIP_GROUPS`, `USERS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-D01 | Tạo và cập nhật chuyến | Có tour version, bắt đầu/kết thúc, giá/người, sức chứa, số khách tối thiểu, điều phối viên và policy; kết thúc sau bắt đầu; tối thiểu không vượt sức chứa | E + D / P0 |
| FR-D02 | Tạo chuyến thủ công | Cho phép `recurrence_rule_id` trống theo ERD hiện tại; chức năng có thể tắt nếu Q-05 chốt chỉ sinh tự động | E + D / P0 |
| FR-D03 | Quản lý lịch lặp | Cấu hình tần suất, khoảng lặp, ngày hiệu lực, giờ và mặc định giá/sức chứa; sinh lại cùng kỳ không tạo trùng chuyến | E + D / P1 |
| FR-D04 | Mở/đóng nhận đặt chỗ | Chỉ Trip đủ điều kiện mới mở; đóng bán không tự hủy booking đã xác nhận; không giảm sức chứa dưới số chỗ đang cam kết | E + D / P0 |
| FR-D05 | Tạo nhóm và phân guide | Mỗi Group thuộc một Trip và một guide; tên nhóm phân biệt trong chuyến; số người trong nhóm không vượt giới hạn | C + E / P0 |
| FR-D06 | Phân/chuyển nhóm participant | Có thể chưa phân nhóm; chuyển nhóm chỉ trong cùng Trip; thao tác ghi audit; chặn chuyển sang nhóm đầy hoặc chuyến khác | C + E / P0 |
| FR-D07 | Kiểm tra sẵn sàng khởi hành | Liệt kê booking hợp lệ, số người chưa phân nhóm, đồ chưa cấp và vấn đề lịch guide; trạng thái “sẵn sàng” chỉ khi checklist bắt buộc đạt | E + D / P0 |
| FR-D08 | Kết thúc/hủy chuyến | Người có quyền chuyển trạng thái, ghi lý do; hủy phải xác định xử lý booking và thiết bị; kết thúc không tự đánh dấu mọi participant là đã tham gia | E + D / P0 |

**Ngoại lệ:** sửa lịch lặp không cập nhật hồi tố Trip đã tạo. Mỗi Trip đã có khách cần được thay đổi theo quy trình điều phối riêng. Một guide dẫn nhiều nhóm cùng lúc và chống xung đột lịch guide là Q-06.

### 6.4. Đặt tour và quản lý participant

**Dữ liệu:** `ORDERS`, `TRIP_BOOKING_ORDERS`, `BOOKING_PARTICIPANTS`, `TRIPS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-B01 | Tạo booking nhiều người | Một booking cho một Trip; nhập danh sách người; khi xác nhận số người phải lớn hơn 0 và khớp số participant còn hiệu lực | E + D / P0 |
| FR-B02 | Khai báo thông tin participant | Họ tên bắt buộc; email/điện thoại/tài khoản có thể trống theo ERD; dữ liệu liên hệ khẩn cấp có quyền truy cập hạn chế | C + E / P0 |
| FR-B03 | Giữ chỗ có thời hạn | Chỉ giữ khi còn đủ chỗ; ghi `hold_expires_at`; retry cùng yêu cầu không tạo nhiều giữ chỗ; hết hạn giải phóng đúng một lần | E + D / P0 |
| FR-B04 | Chốt giá booking | Lấy giá chuyến tại lúc chốt, lưu `unit_price`; sửa giá Trip sau đó không đổi booking đã chốt; giảm giá được giải thích ở màn xác nhận | E + D / P0 |
| FR-B05 | Liên kết participant với tài khoản | Liên kết được xác minh; một tài khoản có thể có nhiều lần tham gia; không bắt buộc participant phải đăng ký để được đặt hộ | C + E / P0 |
| FR-B06 | Tra cứu và theo dõi đơn | Khách xem mã đơn, chuyến, danh sách, giá, thanh toán và điều kiện hủy; không đọc đơn người khác bằng cách đổi ID | E + D / P0 |
| FR-B07 | Chỉnh thông tin/hủy booking | Trước hạn cho phép, chỉnh trường không làm sai sức chứa/giá; yêu cầu hủy có bản xem trước; hủy một phần chưa thuộc P0 | E + D / P0 |

**Đồng thời:** nếu chỉ còn một chỗ và hai khách cùng xác nhận, tối đa một yêu cầu được giữ chỗ. Yêu cầu còn lại nhận thông báo hết chỗ; không tạo booking được xác nhận nhưng thiếu capacity.

### 6.5. Sản phẩm, variant, asset và combo

**Dữ liệu:** `PRODUCTS`, `PRODUCT_VARIANTS`, `PRODUCT_VARIANT_IMAGES`, `EQUIPMENT_ASSETS`, `PRODUCT_BUNDLES`, `PRODUCT_BUNDLE_ITEMS`, `RENTAL_PRICE_TIERS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-P01 | Quản lý sản phẩm và variant | Sản phẩm có danh mục; variant có SKU duy nhất và thuộc đúng sản phẩm; không dùng tên variant làm định danh duy nhất | E + D / P0 |
| FR-P02 | Quản lý thiết bị vật lý | Asset có mã duy nhất và một variant; cập nhật tình trạng/khả dụng có lịch sử; không cho asset hỏng/mất tham gia cấp mới | E + D / P0 |
| FR-P03 | Ảnh và trình bày variant | Có thứ tự ảnh và ảnh chính; khách thấy đúng biến thể đang chọn, không nhầm màu/kích cỡ | E + D / P1 |
| FR-P04 | Quản lý combo | Combo có ít nhất một thành phần khi mở bán; mỗi thành phần có số lượng dương; cộng dồn hoặc chặn trùng variant trong một combo | E + D / P0 |
| FR-P05 | Giá theo bậc ngày | Bậc giá thuộc đúng một variant hoặc bundle; min/max hợp lệ; không có hai bậc cùng áp cho một số ngày trong cùng cấu hình | E + D / P0 |
| FR-P06 | Kiểm tra khả dụng theo thời gian | Tính asset đủ điều kiện sau khi trừ mọi phân bổ xung đột; combo chỉ khả dụng nếu tất cả thành phần đáp ứng | C + E / P0 |
| FR-P07 | Ẩn/ngừng kinh doanh | Không nhận đơn mới với sản phẩm đã ngừng; đơn và phân bổ lịch sử vẫn đọc được; xóa danh mục không làm mất nguồn gốc giao dịch | E + D / P0 |

Không hiển thị “còn hàng” chỉ từ tổng số asset đang mang trạng thái tốt; một asset tốt vẫn có thể đã được giữ cho thời gian khách chọn.

### 6.6. Đơn thuê và giao nhận

**Dữ liệu:** `ORDERS`, `RENTAL_ORDERS`, `RENTAL_ORDER_ITEMS`, `RENTAL_BUNDLE_ITEM_SNAPSHOTS`, `ASSET_ASSIGNMENTS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-R01 | Tạo đơn thuê | Có thời gian nhận/trả hợp lệ; khi xác nhận có ít nhất một dòng số lượng dương; toàn bộ dòng thuộc cùng RentalOrder | E + D / P0 |
| FR-R02 | Thuê variant hoặc bundle | Mỗi dòng chọn đúng một loại; không cho cả hai cùng trống/cùng có giá trị; giao diện giải thích thành phần combo | C + E / P0 |
| FR-R03 | Chốt giá và số ngày | Lưu số ngày tính tiền, giá/ngày, thành tiền; client sửa tổng tiền không được chấp nhận; đổi bảng giá không sửa đơn đã chốt | E + D / P0 |
| FR-R04 | Chụp thành phần combo | Mỗi dòng combo lưu variant và số lượng trên mỗi combo tại thời điểm chốt; cấp đồ căn cứ snapshot của đơn | E + D / P0 |
| FR-R05 | Phân công xử lý | Đơn mới có thể chưa có Staff; khi bắt đầu xử lý/giao cần người chịu trách nhiệm; đổi người được audit | C + E / P0 |
| FR-R06 | Bàn giao thiết bị | Chỉ giao asset đã được phân bổ đúng đơn; quét/nhập mã; ghi thời điểm; giao thiếu không được đánh dấu hoàn tất bàn giao | E + D / P0 |
| FR-R07 | Nhận trả từng thiết bị | Ghi returned_at và tình trạng theo asset; trả từng phần có thể tiếp tục theo dõi phần còn thiếu; retry không ghi nhận trả hai lần | E + D / P0 |
| FR-R08 | Đóng đơn thuê | Không còn asset chưa xử lý, phí chưa quyết định hoặc nghĩa vụ tiền chưa giải quyết; trả đồ xong và đóng tài chính là hai điều kiện riêng | E + D / P0 |
| FR-R09 | Gia hạn | P1: kiểm tra xung đột khoảng mới, giá tăng thêm và đồng ý của khách; từ chối nếu asset đã cam kết cho nguồn khác | D / P1 |

**Giới hạn hiện tại:** `RENTAL_ORDER_ITEMS` không lưu riêng lịch sử mọi lần sửa giá/gia hạn. Nếu triển khai FR-R09, cần thiết kế phiên bản điều chỉnh hoặc nhật ký đủ khả năng đối soát trước khi code.

### 6.7. Đồ cấp chuyến và phân bổ kho dùng chung

**Dữ liệu:** `TOUR_PROVIDED_ITEMS`, `TRIP_PROVIDED_ITEMS`, `ASSET_ASSIGNMENTS`, `EQUIPMENT_ASSETS`, `APPLIED_PROMOTIONS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-I01 | Xác định nhu cầu đồ cấp | Tính theo quantity_basis và số lượng cấu hình; ghi required_quantity của chuyến; participant/group thay đổi phải cảnh báo nhu cầu cần cập nhật | E + D / P0 |
| FR-I02 | Một cơ chế phân bổ chung | Mỗi assignment có một asset và đúng một nguồn; nguồn không liên quan để trống; lỗi vi phạm XOR bị từ chối | C + E / P0 |
| FR-I03 | Chặn xung đột | Asset không được có hai phân bổ đang hiệu lực giao nhau về thời gian; kiểm tra tại thời điểm ghi, không chỉ lúc khách xem | C + E / P0 |
| FR-I04 | Kiểm tra đúng loại asset | Asset phải thuộc variant cần cho dòng thuê, thành phần combo, đồ cấp hoặc quyền lợi quà; thiết bị thay thế cần quy tắc riêng | E + D / P0 |
| FR-I05 | Đổi asset trước bàn giao | Thay thế trong một thao tác nhất quán; chỉ giải phóng asset cũ khi asset mới giữ thành công; ghi người đổi/lý do | E + D / P0 |
| FR-I06 | Thu hồi và kiểm tra | Trả asset của chuyến/quà cũng ghi tình trạng; “đã đến hạn trả” không đồng nghĩa “đã trả thực tế” | E + D / P0 |
| FR-I07 | Cảnh báo thiếu thiết bị | Hiển thị variant, khoảng thời gian, số lượng thiếu và các đơn/chuyến bị ảnh hưởng trong phạm vi quyền | E + D / P1 |

Nguồn `TripProvidedItem` phải thuộc cùng tour version của Trip; `product_variant_id` lưu trên dòng cấp chuyến phải khớp cấu hình nguồn đã chốt. Không tạo một loại stock riêng cho khuyến mãi làm bỏ qua khả dụng chung.

**Mất/hỏng đồ cấp chuyến hoặc quà trên đơn tour:** vẫn phải ghi nhận tình trạng asset, assignment và sự kiện vận hành. `RENTAL_CHARGES` hiện chỉ thuộc đơn thuê; không tự tạo RentalCharge cho TripBookingOrder hoặc tạo một đơn thuê giả để thu phí. Phương án MVP là ghi nhận ngoại lệ và chuyển xử lý vận hành, chưa tự động tính/thu phí các nguồn này cho đến khi chốt người chịu trách nhiệm và mô hình tài chính ở Q-17.

### 6.8. Khuyến mãi

**Dữ liệu:** `PROMOTIONS`, `PROMOTION_TIERS`, `APPLIED_PROMOTIONS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-M01 | Cấu hình chương trình | Có hiệu lực, loại đơn áp dụng, phạm vi đơn/dòng, trạng thái, hạn mức; thời gian kết thúc sau bắt đầu | E + D / P1 |
| FR-M02 | Cấu hình bậc quyền lợi | Mỗi bậc có ngưỡng, thước đo, loại quyền lợi; giảm phần trăm nằm trong miền hợp lệ; quà thiết bị phải có variant/số lượng | E + D / P1 |
| FR-M03 | Đánh giá điều kiện ở máy chủ | Chỉ áp chương trình còn hiệu lực, đúng loại đơn và ngưỡng; thay mã hoặc sửa discount ở client không qua kiểm tra | E + D / P1 |
| FR-M04 | Lưu lần áp dụng | Bắt buộc Order + Tier; RentalOrderItem tùy chọn nhưng cùng Order; giữ giá trị giảm/quà đã chốt cho lịch sử | C + E / P1 |
| FR-M05 | Kiểm soát kết hợp và hạn mức | Đánh giá is_stackable, priority và lượt dùng trong cùng lần chốt; hai khách tranh lượt cuối chỉ tối đa một người thành công | E + D / P1 |
| FR-M06 | Quyền lợi thiết bị | Kiểm tra kho trước cam kết; allocation trỏ AppliedPromotion; không âm thầm thay quyền lợi khi hết asset | C + E + D / P1 |
| FR-M07 | Hủy quyền lợi khi đơn hủy | Khôi phục hạn mức theo quy tắc Q-09; giải phóng giữ kho chưa giao; quà đã giao phải được thu hồi/giải quyết trước khi đóng | E + D / P1 |

Thước đo ngưỡng (giá trị đơn trước hay sau giảm, số participant, số ngày thuê) và thứ tự cộng dồn là Q-09. Không suy ra rằng mọi chương trình có `gift_product_variant_id`; giảm tiền thuần túy không cần variant quà.

### 6.9. Thanh toán, hủy và hoàn tiền

**Dữ liệu:** `ORDERS`, `TRANSACTIONS`, `REFUND_POLICIES`, `REFUND_POLICY_RULES`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-F01 | Khởi tạo lần thanh toán | Gắn Order, số tiền, mục đích và phương thức; cùng idempotency key không tạo nghĩa vụ thu mới | E + D / P0 |
| FR-F02 | Xác minh kết quả thanh toán | Kiểm tra nguồn, mã giao dịch, đơn, số tiền và tiền tệ; callback lặp không tăng số đã thu; redirect phía khách không phải bằng chứng thu tiền | E + D / P0 |
| FR-F03 | Theo dõi nhiều lần thử | Giữ giao dịch thất bại/chờ/thành công riêng; tính số đã thu từ giao dịch thành công; không cộng giao dịch đang chờ | E + D / P0 |
| FR-F04 | Ghi nhận thanh toán thủ công | Nếu bật: chỉ người có quyền ghi nhận, có bằng chứng tham chiếu/lý do, audit; không cho khách tự đánh dấu đã thanh toán | D / P0 hoặc tắt |
| FR-F05 | Chốt chính sách hoàn tiền | Mỗi Order tham chiếu policy version áp dụng tại lúc chốt; sửa policy tương lai không đổi quyền lợi của Order cũ | E + D / P0 |
| FR-F06 | Ước tính và yêu cầu hoàn | Hiển thị căn cứ tính, số đã thu, số có thể hoàn và lý do; mọi yêu cầu phải tính lại tại lúc duyệt | E + D / P0 |
| FR-F07 | Thực hiện hoàn tiền | Refund trỏ khoản thu gốc cùng Order; không tự tham chiếu/vòng; tổng hoàn thành công cộng phần đang giữ để hoàn không vượt khoản có thể hoàn | E + D / P0 |
| FR-F08 | Đối soát lỗi/tiền đến muộn | Có trạng thái cần đối soát; không tự xác nhận booking đã hết chỗ; retry hoàn không hoàn hai lần | E + D / P0 |
| FR-F09 | Phân biệt trạng thái đơn và tiền | Order có thể đã hủy nhưng hoàn đang chờ; RentalOrder có thể đã trả đồ nhưng còn phí; giao diện không gộp thành một trạng thái mơ hồ | E + D / P0 |

ERD chưa chỉ định cổng thanh toán, định dạng webhook, mã idempotency, hàng đợi hoàn tiền hoặc bảng đối soát. Các cơ chế này là yêu cầu triển khai cần thiết nếu kết nối cổng thật, được theo dõi ở mục 11 và Q-04/Q-12.

### 6.10. Cọc và phí phát sinh của đơn thuê

**Dữ liệu:** `RENTAL_ORDERS`, `RENTAL_CHARGES`, `EQUIPMENT_ASSETS`, `TRANSACTIONS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-C01 | Ghi nhận mức cọc | Hiển thị riêng tiền dịch vụ và cọc; deposit_amount không âm; cọc không mặc định là doanh thu thuê | E + D / P0 |
| FR-C02 | Lập phí phát sinh | Mỗi khoản có loại, số tiền dương, lý do, người tạo, đơn thuê; có asset thì kiểm tra thuộc lịch sử giao của đơn | E + D / P0 |
| FR-C03 | Phí toàn đơn hoặc theo asset | Phí trả trễ toàn đơn có thể không có asset; phí mất/hỏng thiết bị phải truy vết thiết bị chịu phí theo chính sách | E + D / P0 |
| FR-C04 | Duyệt/hủy khoản phí | Khoản chưa duyệt không tự thành số phải thu; hủy có lý do và thời điểm; không xóa mất dấu khoản đã xử lý | E + D / P0 |
| FR-C05 | Quyết toán cọc | Xác định cọc đã thu, cọc đã hoàn, phần bù phí hợp lệ và số cần thu thêm; không thu phí lại nếu đã trừ cọc cho cùng nghĩa vụ | E + D / P0 |
| FR-C06 | Minh bạch cho khách | Khách xem từng loại phí, lý do, tình trạng và kết quả quyết toán; có kênh yêu cầu kiểm tra lại theo chính sách vận hành | E + D / P0 |

Quyền duyệt phí, thời hạn phản hồi và biểu phí cụ thể chưa có trong ERD. Ảnh biên bản hỏng/mất cũng chưa có trường lưu riêng; nếu cần bằng chứng ảnh phải bổ sung thiết kế thay vì mặc định đã được hỗ trợ.

### 6.11. Điểm danh và review

**Dữ liệu:** `ACTIVITY_ATTENDANCES`, `BOOKING_PARTICIPANTS`, `TOUR_ACTIVITIES`, `REVIEWS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-V01 | Danh sách điểm danh | Guide/Staff xem participant thuộc phạm vi được giao và hoạt động từ tour version của Trip | C + E + D / P0 |
| FR-V02 | Ghi nhận điểm danh | Tối đa một bản ghi cho cặp participant/activity; cập nhật cùng cặp không tạo trùng; lưu người và thời điểm ghi nhận | E + D / P0 |
| FR-V03 | Chỉnh sai điểm danh | Người có quyền sửa với audit; không dùng checked_by_user_id của participant để giả rằng họ tự điểm danh | E + D / P0 |
| FR-V04 | Gửi review | Chuyến hoàn thành, đơn đã thanh toán, participant hợp lệ; tối đa một review; ngăn gửi cho participant người khác | C + E + D / P1 |
| FR-V05 | Hiển thị review | Rating theo thang được chốt, đề xuất 1–5; tổng hợp qua participant/chuyến/tour đúng nguồn; không trộn các nhóm tour không liên quan | E + D / P1 |
| FR-V06 | Sửa/kiểm duyệt review | Đề xuất cho tác giả sửa nội dung trong cửa sổ cấu hình; Admin có thể ẩn có lý do, không sửa thành lời khen thay khách | D / P1 |

Điều kiện “đã thực sự tham gia”, cách xử lý no-show và participant không có tài khoản khi review là Q-10. `REVIEWS` chưa có trạng thái/lý do kiểm duyệt riêng; FR-V06 cần thiết kế bổ sung nếu được đưa vào phát hành.

### 6.12. Nội dung, kỹ năng và lượt đọc

**Dữ liệu:** `POSTS`, `TAGS`, `SOFT_SKILLS`, `POST_TAGS`, `POST_SOFT_SKILLS`, `TOUR_POSTS`, `PARTICIPANT_POST_READS`.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-N01 | Soạn và xuất bản bài | Lưu tác giả, loại bài, trạng thái, slug duy nhất; nội dung nháp không công khai; nội dung rich text được xử lý an toàn | E + D / P1 |
| FR-N02 | Gắn tag và kỹ năng | Một bài có nhiều tag/kỹ năng và ngược lại; không tạo trùng cặp liên kết | E + D / P1 |
| FR-N03 | Nội dung chuẩn bị theo tour | Gắn bài vào tour theo thứ tự; khách xem bài liên quan tour đã đặt, không cần tạo lại bài cho mỗi Trip | E + D / P1 |
| FR-N04 | Ghi nhận lượt đọc | Tối đa một bản ghi cho cặp participant/post theo mô hình hiện tại; retry không tăng số người đã đọc; không gọi lượt đọc là cam kết pháp lý hay xác nhận bắt buộc | E + D / P1 |
| FR-N05 | Theo dõi chuẩn bị | Hiển thị danh sách nội dung và trạng thái đã đọc khi có tài khoản liên kết; không ngăn khởi hành chỉ vì thiếu bản ghi đọc nếu chưa chốt yêu cầu bắt buộc | D / P1 |

### 6.13. Thông báo, audit, cấu hình và báo cáo

**Dữ liệu:** `NOTIFICATIONS`, `AUDIT_LOGS`, `SYSTEM_CONFIGURATIONS` và dữ liệu vận hành liên quan.

| Mã | Yêu cầu | Quy tắc và tiêu chí nghiệm thu | Cơ sở / Ưu tiên |
|---|---|---|---|
| FR-O01 | Thông báo trong ứng dụng | Gửi khi đặt/xác nhận/hủy đơn, thay đổi chuyến quan trọng và hoàn tiền; đánh dấu đã đọc; chỉ người nhận xem được | E + D / P1 |
| FR-O02 | Ghi audit | Ghi các thay đổi quyền, chính sách, đơn, giao dịch, phân bổ, phí và điểm danh; không lưu mật khẩu/token đầy đủ | E + D / P0 |
| FR-O03 | Quản trị cấu hình | Có key duy nhất, kiểu dữ liệu, giá trị, người cập nhật; từ chối giá trị sai miền; thay đổi nhạy cảm có audit | E + D / P0 |
| FR-O04 | Dashboard vận hành | Theo dõi đơn chờ, chuyến sắp đi, asset chưa trả, hoàn chờ và phí chưa giải quyết; từng số liệu truy xuống danh sách được | D / P1 |
| FR-O05 | Tìm kiếm và lọc | Đơn theo mã/trạng thái/ngày, asset theo mã/variant, participant theo chuyến/nhóm; danh sách lớn có phân trang | D / P0 |
| FR-O06 | Xuất danh sách vận hành | Xuất manifest chuyến, bàn giao/nhận trả và báo cáo thu/hoàn theo quyền; dữ liệu xuất không mở rộng quyền xem | D / P1 |

## 7. Vòng đời và chuyển trạng thái

**Toàn bộ tên trạng thái dưới đây là [D].** ERD có nhiều trường `status` nhưng không định nghĩa tập giá trị hoặc bảng chuyển trạng thái. Nhóm triển khai phải chốt tên/mapping trước khi sinh enum; không coi những tên này là giá trị đã tồn tại trong hệ thống.

### 7.1. Tour và chương trình/danh mục công khai

`Draft → Published → Archived`. Có thể trả Published về Draft chỉ nếu thao tác không thay đổi thông tin đã cam kết với đơn/chuyến; các thay đổi lịch trình đã khóa phải tạo version mới. Archived ngăn sử dụng cho nghiệp vụ mới, giữ tra cứu lịch sử. Có thể dùng cờ/trạng thái khác nếu vẫn bảo đảm các hành vi này.

### 7.2. Trip

| Chuyển trạng thái | Người thực hiện | Điều kiện | Hệ quả |
|---|---|---|---|
| Draft → Open | Staff/Admin | Dữ liệu hợp lệ, có tour version, giá, capacity và policy | Cho phép nhận booking |
| Open → ClosedForBooking | Staff/Admin hoặc tác vụ theo lịch | Đến hạn chốt hoặc người điều phối đóng bán | Dừng booking mới, giữ booking đã cam kết |
| Open/ClosedForBooking → Cancelled | Người có quyền | Có lý do và phương án xử lý booking/asset | Dừng khởi hành, tạo quy trình hủy/hoàn |
| ClosedForBooking → InProgress | Staff/Admin | Đạt checklist vận hành hoặc có ngoại lệ được phê duyệt | Bắt đầu chuyến; không cho thay lịch trình tùy ý |
| InProgress → Completed | Staff/Admin | Hoạt động vận hành được kết thúc, ngoại lệ ghi nhận | Mở xét điều kiện review; đồ chưa trả vẫn được theo dõi |

Trip hoàn thành không tự hoàn tất việc thu hồi toàn bộ tài sản; cảnh báo kho phải tồn tại đến khi tài sản được trả hoặc xử lý mất/hỏng. Chuyến bị gián đoạn khi đang diễn ra cần quy tắc riêng tại Q-07, không ép vào “chưa khởi hành”.

### 7.3. Order và trạng thái thanh toán

| Vòng đời Order | Điều kiện chính |
|---|---|
| Draft | Chưa cam kết tài nguyên, được phép sửa hoặc bỏ |
| PendingPayment | Có dữ liệu hợp lệ và giữ chỗ/giữ tài nguyên nếu cấu hình yêu cầu |
| Confirmed | Đạt điều kiện tài chính đã chốt, tài nguyên còn hiệu lực |
| InFulfillment | Chuyến đang thực hiện hoặc đồ đang bàn giao/sử dụng |
| Completed | Dịch vụ kết thúc và các nghĩa vụ thuộc phạm vi đóng đơn được giải quyết |
| Expired | Giữ chỗ/giữ tài nguyên hết hạn khi chưa đủ điều kiện xác nhận |
| Cancelled | Đã được hủy nghiệp vụ; hoàn tiền vẫn có thể đang xử lý |

Trạng thái thanh toán theo dõi riêng: `Unpaid`, `PartiallyPaid`, `Paid`, `PartiallyRefunded`, `Refunded`, `NeedsReconciliation` là tập đề xuất. Chưa dùng thu từng phần thì `PartiallyPaid` không tự mở thành chức năng trả góp. Với đơn thuê, trạng thái Paid phải chỉ rõ đang nói đến tiền dịch vụ, cọc hay toàn bộ nghĩa vụ đến hạn.

Hủy đơn chưa giao có thể giải phóng phân bổ giữ chỗ. Hủy đơn đã giao/đang diễn ra cần quy trình kết thúc sớm, không giải phóng asset đang ở khách hoặc đánh dấu “Completed” chỉ vì đã gửi yêu cầu hoàn tiền.

### 7.4. Giao dịch

`Pending → Succeeded | Failed | Cancelled`; kết quả đã xác nhận thành công không bị callback cũ chuyển về Pending/Failed. Refund là giao dịch riêng và có vòng đời tương tự. Mọi cập nhật từ bên ngoài phải kiểm tra thứ tự, tính hợp lệ và chống lặp.

Khi không chắc chắn nhà cung cấp đã hoàn tiền hay chưa, giữ tình trạng cần đối soát; không tạo một lần hoàn khác để “thử lại” mà không dùng cùng định danh idempotency hoặc truy vấn kết quả cũ.

### 7.5. Asset assignment và tình trạng thiết bị

| Assignment | Ý nghĩa | Có làm asset bị giữ không? |
|---|---|---|
| Reserved | Cam kết asset cho nguồn và khoảng thời gian | Có, trong khoảng hiệu lực |
| Issued | Asset đã được giao thực tế | Có; kể cả quá thời gian dự kiến nếu chưa trả |
| Returned | Đã trả và ghi nhận tình trạng | Hết phân bổ; khả dụng còn phụ thuộc kiểm tra/tình trạng asset |
| Cancelled | Hủy giữ trước khi giao | Không |
| Lost/ClosedWithException | Đã giải quyết ngoại lệ mất/không thu hồi theo quyền | Asset không trở lại kho cho thuê |

`EquipmentAssets.asset_status` mô tả tình trạng thiết bị như sẵn sàng, bảo trì, hỏng, mất, ngừng dùng; không thay thế lịch phân bổ theo thời gian. Cần phân biệt Returned với ReadyForNextUse nếu có thời gian kiểm tra/vệ sinh **[Q-11]**.

### 7.6. Phí và khuyến mãi đã áp dụng

- RentalCharge đề xuất: `Draft → Assessed → Settled` hoặc `Voided`. Draft chưa tính vào công nợ; Assessed là nghĩa vụ đã xác định; Settled phải có căn cứ thu/bù cọc. Voided không xóa lịch sử.
- AppliedPromotion đề xuất: `Reserved → Applied → Reversed/Expired`. Giữ hạn mức và xác nhận sử dụng phải đồng bộ với vòng đời đơn, tránh đếm một đơn nhiều lần.
- ERD chưa có FK từ RentalCharge đến giao dịch thu riêng hoặc bảng phân bổ cọc cho từng phí. Việc đánh dấu Settled theo từng khoản cần thiết kế bổ sung hoặc quy tắc quyết toán toàn đơn có kiểm chứng; không suy ra được từ `status` đơn thuần.

## 8. Quy tắc giá, sức chứa, tồn kho và tính nhất quán

### 8.1. Quy tắc chung

| Mã | Quy tắc bắt buộc trong thiết kế dự thảo |
|---|---|
| BR-01 | Một Order có đúng một subtype phù hợp `order_type`; không có cả tour và rental trên cùng Order |
| BR-02 | Mọi số tiền tính ở máy chủ; yêu cầu từ client không có quyền quyết định giá cuối |
| BR-03 | Tiền chốt và cấu hình lịch sử không bị thay đổi hồi tố bởi danh mục hiện hành |
| BR-04 | Dữ liệu con nháp có thể rỗng; khi xác nhận phải đủ dữ liệu tối thiểu cho nghiệp vụ |
| BR-05 | Soft delete/ẩn dữ liệu không được làm mất tham chiếu lịch sử, audit và giao dịch |
| BR-06 | Các trường lặp lại phục vụ tra cứu phải được kiểm tra cùng nguồn; không cho mỗi trường nói một sự thật khác nhau |

### 8.2. Đặt tour và sức chứa

Đề xuất định nghĩa:

```text
SoChoDaCamKet = tổng participant còn hiệu lực của booking đã xác nhận
SoChoDangGiu = tổng participant trong booking giữ chỗ chưa hết hạn
SoChoConLai = total_slots - SoChoDaCamKet - SoChoDangGiu
```

Không tính một booking vừa ở nhóm giữ chỗ vừa ở nhóm xác nhận. Participant no-show trong một chuyến đã khởi hành không tự giải phóng chỗ để bán lại. Khi hủy toàn đơn, chỉ giải phóng số chỗ thực sự còn cam kết của đơn đó.

| Mã | Ràng buộc |
|---|---|
| BR-07 | Giữ/xác nhận chỗ phải nguyên tử với kiểm tra capacity; `SoChoConLai` không âm sau hai yêu cầu đồng thời |
| BR-08 | Khi xác nhận, `participant_count` khớp số participant có hiệu lực; không tin số lượng client tách rời danh sách |
| BR-09 | `participant.trip_id` phải bằng Trip của booking; group nếu có cũng thuộc Trip đó |
| BR-10 | Số participant trong một Group không vượt `max_participants`; việc chuyển nhóm đồng thời không phá giới hạn |
| BR-11 | Attendance chỉ nhận activity thuộc Tour version của Trip của participant; mỗi cặp chỉ có một bản ghi |
| BR-12 | Review chỉ có một cho mỗi participant, theo khóa duy nhất và điều kiện nghiệp vụ đã chốt |

Giá tour:

```text
SubtotalTour = participant_count × unit_price đã chốt
DiscountTour = tổng giảm hợp lệ cấp Order
ServiceAmountTour = max(0, SubtotalTour - DiscountTour)
```

**Ví dụ đề xuất:** 3 người × 1.200.000 = 3.600.000; giảm hợp lệ 300.000 → tiền dịch vụ 3.300.000. Nếu sửa giá chuyến lên 1.300.000 sau khi đơn đã chốt, đơn cũ vẫn giữ 3.300.000, trừ khi có quy trình điều chỉnh được khách chấp nhận.

### 8.3. Giá thuê, combo và làm tròn [D]

Phương án dự thảo là tính theo mỗi 24 giờ bắt đầu, tối thiểu một ngày:

```text
billable_days = max(1, ceil((rental_end_at - rental_start_at) / 24 giờ))
LineSubtotal = quantity × billable_days × daily_price đã chốt
SubtotalRental = tổng LineSubtotal
ServiceAmountRental = max(0, SubtotalRental - LineDiscounts - OrderDiscounts)
```

**Q-04 phải xác nhận** tính theo 24 giờ, ngày lịch hay khung nhận/trả. Không áp công thức trên vào triển khai như quyết định đã duyệt. Giá theo bậc trong phương án này là một đơn giá áp cho toàn số ngày của dòng; giá lũy tiến từng khoảng là phương án khác cần chốt.

Đề xuất tiền tệ MVP là VND, làm tròn đến đơn vị đồng; ERD có kiểu tiền không có phần thập phân nhưng chưa có trường currency. Nếu dùng nhiều tiền tệ phải bổ sung mô hình, không gộp tổng các loại tiền. Làm tròn khoản giảm một lần ở phạm vi đã chốt, với phần chênh phân bổ xác định; tổng các dòng phải khớp tổng đơn.

**Ví dụ:** thuê 2 món, 3 ngày tính tiền, 80.000/món/ngày → 480.000. Giảm dòng 40.000, giảm đơn 20.000 → tiền dịch vụ 420.000. Cọc 300.000 là nghĩa vụ tách riêng, không cộng thành doanh thu thuê 720.000.

| Mã | Ràng buộc |
|---|---|
| BR-13 | Mỗi dòng thuê có đúng một trong `product_variant_id` hoặc `bundle_id` |
| BR-14 | Mỗi bậc giá cũng có đúng một đối tượng variant hoặc bundle; khoảng ngày không chồng lấn trên cùng đối tượng |
| BR-15 | Thiếu bậc giá phù hợp thì không cho chốt với giá 0; phải báo chưa có giá |
| BR-16 | Với q combo, nhu cầu mỗi variant = q × quantity_per_bundle trong snapshot |
| BR-17 | Thay cấu hình combo chỉ ảnh hưởng đơn mới; các đơn cũ tiếp tục dùng snapshot riêng |

### 8.4. Kho và khoảng phân bổ

Đề xuất biểu diễn khoảng `[reserved_from, reserved_until)`: bao gồm đầu, không bao gồm cuối. Hai khoảng giao nhau khi `startA < endB` và `startB < endA`. Khoảng liền kề chỉ được tái sử dụng nếu không cần thời gian vệ sinh/kiểm tra; nếu có, phải cộng buffer vào khoảng bị chiếm.

```text
KhaDung(variant, khoảng) = số asset đúng variant, đủ tình trạng,
                         không có phân bổ đang hiệu lực xung đột
ComboKhaDung = min(floor(KhaDung(variant_i) / soLuongThanhPhan_i))
```

Với nhiều dòng cùng lấy một variant, phải cộng toàn bộ nhu cầu trước khi kiểm tra. Không kiểm tra từng dòng độc lập rồi cấp cùng một asset cho nhiều dòng.

| Mã | Ràng buộc |
|---|---|
| BR-18 | Mỗi assignment có một asset và đúng một nguồn rental line/trip item/applied promotion |
| BR-19 | Chặn phân bổ chồng khoảng ở cùng asset trong mọi nguồn, kể cả khi hai yêu cầu ghi cùng lúc |
| BR-20 | Asset chưa trả thực tế tiếp tục bị chiếm; trả quá hạn phải cảnh báo các cam kết tương lai bị ảnh hưởng |
| BR-21 | Variant của asset khớp nhu cầu; combo giao đúng số lượng từng thành phần, không chỉ đúng tổng số món |
| BR-22 | Asset hỏng/mất/bảo trì không được phân bổ mới; xử lý mất không có nghĩa thiết bị đã trở về kho |
| BR-23 | Đổi asset/gia hạn là kiểm tra và cập nhật nguyên tử; thất bại giữ nguyên cam kết hợp lệ trước đó |

**Ví dụ:** kho có 8 lều đủ điều kiện, 3 lều giữ cho đơn thuê và 2 lều cấp chuyến trong cùng thời gian → chỉ còn 3, kể cả khi một nguồn chưa được giao thực tế. Nếu quà khuyến mãi cần 4 lều, chương trình không được cam kết 4 quyền lợi thiết bị.

### 8.5. Đồ cấp theo tour [D]

Đề xuất `quantity_basis` có `PER_PARTICIPANT`, `PER_GROUP`, `PER_TRIP`:

```text
PER_PARTICIPANT: required_quantity = số participant cần phục vụ × quantity
PER_GROUP:       required_quantity = số nhóm thực hiện × quantity
PER_TRIP:        required_quantity = quantity
```

ERD chưa định nghĩa các giá trị này. Thiết bị dùng chung theo tỷ lệ, ví dụ một lều cho hai người, cần quy ước riêng như `ceil(số người / sức chứa)`; không tự dùng số thập phân cho quantity khi schema đang lưu số nguyên. Khi số người thay đổi, không tự hủy asset đã bàn giao; tạo cảnh báo và điều phối thay đổi có kiểm soát.

### 8.6. Khuyến mãi [D]

Phương án để thảo luận: xét điều kiện trên giá trước giảm; chọn một bậc cao nhất đủ điều kiện trong mỗi chương trình; áp giảm dòng trước giảm đơn; sắp chương trình theo priority; từ chối cộng dồn khi is_stackable không cho phép. Cách xử lý hai chương trình loại trừ nhau là Q-09, không mặc định tự chọn chương trình có lợi nhất hoặc áp cả hai.

| Mã | Ràng buộc |
|---|---|
| BR-24 | AppliedPromotion luôn thuộc một Order; dòng thuê tùy chọn phải thuộc cùng Order |
| BR-25 | Quyền lợi đã áp lưu discount/gift thực tế; không tính lại lịch sử từ tier đang bị sửa |
| BR-26 | Tổng giảm không vượt phần tiền đủ điều kiện; cọc/phí phát sinh không được giảm nếu chương trình không cho phép |
| BR-27 | Hạn mức toàn chương trình và trên khách phải chống tranh chấp đồng thời; giải phóng lượt dùng có trạng thái và audit |
| BR-28 | Quà vật lý cần quyền lợi hợp lệ và còn tài nguyên; không tạo assignment quà từ promotion giảm tiền thuần túy |

### 8.7. Thanh toán, cọc và phí

Các khái niệm phải được hiển thị riêng:

- **Tiền dịch vụ:** giá tour/thuê sau giảm đã chốt.
- **Cọc phải giữ:** nghĩa vụ đảm bảo cho đơn thuê, không mặc định là tiền dịch vụ.
- **Phí được xác định:** RentalCharge đã được duyệt/assessed và chưa bị void.
- **Tiền đã thu / đã hoàn:** tổng giao dịch thành công theo đúng mục đích.
- **Tiền còn phải thu / còn phải hoàn:** kết quả đối soát theo từng loại nghĩa vụ, không chỉ `Order.total_amount - tổng giao dịch`.

**Đề xuất định nghĩa `ORDERS.total_amount`:** tiền dịch vụ sau giảm tại lúc chốt; cọc nằm tại RentalOrder và phí ở RentalCharge. Nếu nhóm muốn total_amount là toàn nghĩa vụ đến hạn, phải sửa quy ước và công thức đồng nhất ở mọi màn hình/API. Đây là Q-12.

Quyết toán cọc đề xuất:

```text
CocConGiu = CocDaThuThanhCong - CocDaHoanThanhCong - CocDaBuPhi
BuPhiLanNay = min(CocConGiu, PhiHopLeChuaThanhToan)
CocCanHoan = CocConGiu - BuPhiLanNay
PhiCanThuThem = PhiHopLeChuaThanhToan - BuPhiLanNay
```

Không biểu diễn bù cọc như một khoản thu bên ngoài mới. Ví dụ đang giữ cọc 300.000, phí hợp lệ chưa trả 120.000 → bù 120.000 và hoàn 180.000, không vừa trừ 120.000 từ cọc vừa yêu cầu khách trả thêm 120.000.

**Khoảng trống thiết kế:** ERD hiện chưa thể hiện rõ `CocDaBuPhi` hoặc việc phân bổ một khoản thanh toán cho nhiều phí. Cần chọn cơ chế ghi nhận quyết toán có thể kiểm toán trước khi hoàn thiện FR-C05. Có thể dùng mô hình giao dịch nội bộ có purpose được định nghĩa chặt hoặc một bản quyết toán riêng; PRD không tự chọn schema thay người thiết kế.

### 8.8. Hoàn tiền theo phiên bản policy [D]

Đề xuất mốc tính là khoảng thời gian từ yêu cầu hủy hợp lệ đến lúc bắt đầu dịch vụ. Trong các rule của policy, chọn rule có `min_hours_before` lớn nhất không vượt số giờ còn lại. Phần không khớp rule phải có quy tắc mặc định được chốt; không mặc định hoàn toàn bộ.

Ví dụ minh họa, **không phải chính sách RenTrekk đã duyệt**: các ngưỡng 72 giờ → 100%, 24 giờ → 50%, 0 giờ → 0%; hủy trước 48 giờ áp 50%, đúng 24 giờ áp 50%, đúng 72 giờ áp 100%.

```text
TienDuocHoanTheoPolicy = CoSoHoanTien × tyLeHoan
TienHoanMoi ≤ min(TienDuocHoanConLai,
                  TienThuGocThanhCong - DaHoan - DangGiuDeHoan)
```

Cơ sở hoàn là tiền dịch vụ đã trả sau giảm, hay tiền hợp đồng, phí xử lý có trừ hay không, hủy vì đơn vị tổ chức, hoàn cọc và hủy sau khởi hành đều phải chốt ở Q-07/Q-12. Hoàn cọc không tự áp tỷ lệ phạt hủy tour.

| Mã | Ràng buộc |
|---|---|
| BR-29 | Refund gắn giao dịch thu hợp lệ cùng Order; không hoàn dựa trên giao dịch Pending/Failed |
| BR-30 | Tổng hoàn không vượt tiền thực thu có thể hoàn; hai lần hoàn đồng thời không vượt trần |
| BR-31 | Policy version đã sử dụng phải ổn định; sửa rule tương lai không đổi quyết định hoàn lịch sử |
| BR-32 | Cùng sự kiện provider/idempotency key chỉ được ghi nhận tác động tiền một lần |
| BR-33 | Order cancelled và refund pending là hai sự thật có thể đồng thời tồn tại |
| BR-34 | Giao dịch, khoản phí đã quyết định và phân bổ đã thực hiện không bị xóa để che sai sót; sửa bằng trạng thái/điều chỉnh có audit |

## 9. Yêu cầu trải nghiệm và danh sách màn hình

### 9.1. Khu vực khách hàng [D]

| Màn hình | Nội dung/chức năng chính | Trạng thái đặc biệt phải có |
|---|---|---|
| Trang khám phá | Tour, lịch khởi hành, thiết bị và nội dung nổi bật | Không có kết quả, đang tải, lỗi kết nối |
| Danh sách/chi tiết tour | Lịch trình, ngày đêm, địa điểm, ảnh, chuẩn bị, đồ cấp, bài viết | Tour đã ngừng nhưng còn đơn lịch sử |
| Chọn chuyến | Ngày giờ, giá/người, số chỗ còn, điều kiện đặt | Hết chỗ, đóng bán, giá đã thay đổi |
| Checkout tour | Người tham gia, tổng tiền, giảm giá, policy, hạn giữ chỗ | Danh sách sai, phiên giữ hết hạn, thanh toán chưa xác minh |
| Danh mục/chi tiết thuê | Variant/combo, thành phần, khoảng thuê, giá và khả dụng | Một thành phần combo thiếu, chưa có bậc giá |
| Checkout thuê | Dòng thuê, số ngày, cọc, điều kiện nhận/trả | Hết asset trong lúc xác nhận |
| Đơn của tôi | Mã đơn, dịch vụ, trạng thái vận hành và thanh toán tách riêng | Đơn hủy nhưng hoàn đang chờ |
| Chi tiết đơn thuê | Asset đã giao, hạn trả, phí, cọc và quyết toán | Trả một phần, đang tranh soát phí |
| Chuyến của tôi | Participant liên kết, nhóm, thông tin chuẩn bị, trạng thái | Có đơn đặt hộ nhưng chưa liên kết tài khoản |
| Review | Rating, nội dung, điều kiện đủ/không đủ | Chưa hoàn thành, không phải participant, đã review |
| Hồ sơ và thông báo | Dữ liệu cá nhân, thông báo đã/chưa đọc, bảo mật phiên | Tài khoản khóa hoặc phiên hết hiệu lực |

### 9.2. Khu vực vận hành [D]

1. Dashboard và danh sách công việc cần xử lý.
2. Quản lý tài khoản, vai trò và hồ sơ.
3. Tour, phiên bản tour, lịch trình và ảnh.
4. Lịch lặp, lịch chuyến, sức chứa và người điều phối.
5. Booking, participant, chia nhóm và guide.
6. Danh sách điểm danh theo chuyến/nhóm/hoạt động, tối ưu di động.
7. Danh mục sản phẩm, variant, bảng giá và combo.
8. Asset và lịch phân bổ theo khoảng thời gian.
9. Chuẩn bị đồ cấp chuyến; thiếu/cấp đủ/đã thu hồi.
10. Đơn thuê, màn giao nhận theo mã asset.
11. Khoản phí, tiền cọc và đối soát cuối đơn.
12. Giao dịch, yêu cầu hoàn và các trường hợp cần đối soát.
13. Khuyến mãi, bậc và lịch sử áp dụng.
14. Bài viết, tag, kỹ năng và nội dung tour.
15. Chính sách hoàn tiền, cấu hình và audit.

### 9.3. Nguyên tắc trải nghiệm

- Luôn hiển thị ngày, giờ, múi giờ và đơn vị tiền rõ ràng tại bước xác nhận.
- Hiển thị tổng tiền cùng phần giải thích: số người/số lượng × đơn giá × số ngày, giảm giá, cọc và phí.
- Những hành động gây mất quyền lợi như hủy đơn, xác nhận mất thiết bị hoặc hủy phí phải có bản xem trước tác động và lý do.
- Phân biệt hết dữ liệu với lỗi; không hiển thị giá 0 khi chưa tải được giá.
- Trạng thái không chỉ thể hiện bằng màu; có nhãn chữ, mô tả lỗi gắn đúng trường và điều hướng bằng bàn phím.
- Với guide, ưu tiên chọn đúng chuyến/nhóm, tránh thao tác điểm danh nhầm khi nhiều chuyến có tên giống nhau.
- Khi mất kết nối lúc gửi, cho phép kiểm tra kết quả và gửi lại an toàn; không mặc định thất bại rồi tạo bản ghi mới.
- Không đưa tên bảng, FK hay trạng thái nội bộ khó hiểu vào giao diện khách hàng nếu không cần để quyết định.

## 10. Yêu cầu phi chức năng

Các ngưỡng đo dưới đây là **mục tiêu đề xuất**, chưa được đo trên một hệ thống RenTrekk đang chạy. Phải chốt ngân sách và môi trường thử nghiệm trước khi dùng làm SLA.

| Mã | Nhóm | Yêu cầu và cách xác nhận | Ưu tiên |
|---|---|---|---|
| NFR-01 | Quyền truy cập | Mọi endpoint nghiệp vụ kiểm tra vai trò và quyền trên đối tượng; test đổi ID đơn/participant/asset không vượt quyền | P0 |
| NFR-02 | Xác thực | Mật khẩu băm an toàn, token nhạy cảm không lưu rõ; phiên bị thu hồi không tiếp tục dùng được; giới hạn thử đăng nhập/reset | P0 |
| NFR-03 | Dữ liệu cá nhân | Che bớt email/điện thoại ở danh sách; thông tin khẩn cấp chỉ phục vụ chuyến; nhật ký không ghi mật khẩu/token/toàn bộ payload nhạy cảm | P0 |
| NFR-04 | Toàn vẹn đồng thời | Kiểm thử nhiều request đặt chỗ/cấp asset/hoàn tiền cùng lúc, không oversell, cấp trùng hoặc hoàn quá trần | P0 |
| NFR-05 | Idempotency | Retry tạo đơn, callback, cấp/trả asset, xử lý phí không tạo tác động lặp; lưu đủ định danh để phát hiện | P0 |
| NFR-06 | Hiệu năng đọc | Đề xuất p95 ≤ 2 giây cho tìm kiếm/danh sách và ≤ 1 giây cho chi tiết, tại 100 phiên đồng thời và dữ liệu mẫu thống nhất; không tính mạng ngoài | P1 |
| NFR-07 | Hiệu năng ghi | Đề xuất p95 ≤ 3 giây cho chốt booking/phân bổ nội bộ; các bước chờ provider trả trạng thái đang xử lý | P1 |
| NFR-08 | Khả dụng | Đề xuất 99,5% thời gian khả dụng theo tháng, loại trừ bảo trì đã thông báo; cần chốt hạ tầng trước cam kết | P1 |
| NFR-09 | Phục hồi | Đề xuất RPO ≤ 24 giờ, RTO ≤ 4 giờ; có bài kiểm thử khôi phục bản sao lưu; giao dịch sau backup cần đối soát provider | P1 |
| NFR-10 | Quan sát vận hành | Có correlation ID, log lỗi/tác vụ, số job retry và hàng chờ; tìm được sự kiện từ mã đơn hoặc provider transaction ID | P0 |
| NFR-11 | Thời gian | Lưu thời điểm theo quy ước thống nhất, đề xuất UTC; hiển thị Asia/Ho_Chi_Minh; lịch lặp xét múi giờ nghiệp vụ | P0 |
| NFR-12 | Khả năng sử dụng | Đề xuất hỗ trợ màn 360px trở lên, bàn phím, nhãn truy cập và tương phản rõ; checklist kiểm tra các luồng P0 | P1 |
| NFR-13 | Lưu lịch sử | Không xóa cứng dữ liệu tài chính/đơn còn ràng buộc; có chính sách lưu trữ và ẩn dữ liệu cá nhân được phê duyệt | P0 |
| NFR-14 | Nội dung và file | Validate loại/kích thước tệp, xử lý nội dung rich text, giới hạn URL được sử dụng; không chạy mã người dùng từ nội dung bài viết | P0 |
| NFR-15 | Tách môi trường | Demo/test dùng dữ liệu và tài khoản thanh toán thử; không đưa bí mật môi trường vào repository hoặc tài liệu công khai | P0 |
| NFR-16 | Khả năng kiểm thử | Có dữ liệu mẫu cho mọi loại đơn, khoản phí, refund và nguồn phân bổ; đồng hồ/thời điểm test kiểm soát được | P0 |

Miền kiểm thử hiệu năng phải ghi rõ số asset, booking, participant và giao dịch; ví dụ đề xuất 10.000 asset, 100.000 Order và 300.000 Participant. Đây là dữ liệu benchmark để thống nhất, không phải dự báo quy mô kinh doanh.

## 11. Tích hợp và xử lý tác vụ nền

### 11.1. Tích hợp bên ngoài

| Tích hợp | Mục đích | Hợp đồng hành vi tối thiểu | Tình trạng |
|---|---|---|---|
| Cổng thanh toán | Thu và hoàn tiền | Sandbox, xác thực callback, định danh giao dịch, kiểm tra kết quả, idempotency, đối soát | Nhà cung cấp chưa chốt Q-12 |
| Gửi email | Reset mật khẩu, thông báo nếu được chọn | Retry, giới hạn gửi, không trả bí mật trong log, liên kết hết hạn | Chưa chốt Q-03/Q-13 |
| Lưu ảnh/file | Ảnh tour, variant, nội dung | Giới hạn loại/dung lượng, quyền upload, URL hiển thị và xóa an toàn | Chưa chốt Q-13 |
| Đăng nhập ngoài | Tài khoản liên kết | Kiểm tra provider subject, xác thực callback, tránh ghép sai danh tính | P2; provider chưa chốt |
| Bản đồ | Hiển thị địa điểm chính | Có thể dùng địa chỉ/tọa độ hiện có; không yêu cầu GPS theo dõi | Tùy chọn P2 |

Không cần dịch vụ ngoài để mô tả ERD, nhưng tính năng thanh toán thật/reset email cần hợp đồng tích hợp cụ thể. PRD không tự đăng ký tài khoản, chọn gói trả phí hoặc gửi dữ liệu khách ra ngoài.

### 11.2. Tác vụ nền

| Mã | Tác vụ | Tính an toàn và quan sát được |
|---|---|---|
| JOB-01 | Hết hạn giữ chỗ/giữ tài nguyên | Chỉ xử lý đơn còn ở trạng thái đủ điều kiện; giải phóng một lần; không hủy đơn vừa được xác nhận |
| JOB-02 | Sinh chuyến từ lịch lặp | Chạy lại không tạo trùng cùng rule/occurrence; ghi lần chạy, lỗi và kỳ được xử lý |
| JOB-03 | Gửi thông báo | Tách lỗi gửi khỏi giao dịch đặt đơn; chống gửi lặp cho cùng sự kiện |
| JOB-04 | Đối soát thanh toán/hoàn tiền | Kiểm tra giao dịch chưa rõ kết quả; tránh thu/hoàn lần hai; có cảnh báo quá thời gian chờ |
| JOB-05 | Nhắc nhận/trả và cảnh báo quá hạn | Nhắc theo cấu hình; không coi nhắc đã gửi là khách đã nhận hay đã trả đồ |
| JOB-06 | Dọn token hết hạn | Không xóa thông tin đang cần phát hiện reuse hoặc đối soát phiên; chính sách lưu giữ được chốt |

Hàng đợi, outbox, lịch chạy, số lần retry và nơi giữ trạng thái tác vụ chưa thể hiện trong ERD. Thiết kế kỹ thuật có thể chọn cơ chế phù hợp, nhưng phải chứng minh yêu cầu “không mất sự kiện và không tạo tác động lặp” của các luồng tài chính/tài nguyên.

## 12. Chỉ số sản phẩm và báo cáo vận hành

### 12.1. Đo thành công [D]

| Chỉ số | Định nghĩa | Nguồn | Mục tiêu |
|---|---|---|---|
| Tỷ lệ booking được xác nhận | Booking Confirmed / booking gửi xác nhận hợp lệ trong kỳ | Orders, booking, lịch sử trạng thái cần thiết kế | Đo baseline trước, chưa đặt % tùy ý |
| Tỷ lệ thanh toán thành công | Lần thu Succeeded / lần thu đã có kết quả cuối | Transactions | Phân tách lỗi provider và lỗi nghiệp vụ |
| Mức lấp đầy chuyến | Participant có hiệu lực / total_slots của Trip | Trips, Participants, Orders | Theo chuyến/kỳ; không tính hold hết hạn |
| Mức dùng thiết bị | Thời gian asset được sử dụng / thời gian đủ điều kiện phục vụ | Assignments và lịch tình trạng | Chỉ tính được chính xác khi có lịch tình trạng |
| Trả đúng hạn | Assignment trả đúng hạn / assignment phải trả trong kỳ | Assignments | Theo đơn thuê/chuyến/quà |
| Thời gian giải quyết hoàn | Thời điểm refund thành công − thời điểm yêu cầu hợp lệ | Transactions + thời điểm yêu cầu cần ghi nhận | Mục tiêu sau khi chốt provider |
| Sự cố toàn vẹn | Số oversell, cấp trùng, ghi nhận tiền lặp hoặc hoàn quá trần | Kiểm tra dữ liệu và audit | **0** trong nghiệm thu |
| Tỷ lệ review hợp lệ | Participant có review / participant đủ điều kiện | Reviews, Participants, Trips, Orders | Không dùng để ép khách đánh giá |

Không suy ra tỷ lệ chuyển đổi từ lượt xem tour đến mua chỉ bằng ERD hiện tại vì chưa có dữ liệu lượt xem/funnel. Nếu cần analytics, định nghĩa sự kiện, consent và phạm vi thu thập riêng.

### 12.2. Báo cáo vận hành tối thiểu

- Danh sách chuyến sắp khởi hành, số khách còn thiếu để đạt tối thiểu, số người chưa phân nhóm và nhu cầu thiết bị còn thiếu.
- Đơn chờ thanh toán, sắp hết giữ chỗ, chờ xử lý, cần đối soát và đã hủy nhưng hoàn chưa xong.
- Asset đang được giữ, đang ở khách/chuyến, quá hạn, hỏng hoặc mất; nguồn phân bổ phải truy ra được.
- Thu dịch vụ, thu cọc, hoàn dịch vụ, hoàn cọc, phí hợp lệ và phí đã giải quyết phải tách nhau.
- Hiệu quả khuyến mãi theo lần áp hợp lệ và khoản giảm thực tế; không tính các lần thử/hủy như doanh thu mới.

Các chỉ số “doanh thu kế toán”, thuế, lợi nhuận và báo cáo tài chính chuẩn hóa nằm ngoài phạm vi đã xác định. Không đổi tên tổng tiền đã thu thành lợi nhuận.

## 13. Ma trận truy vết ERD

Ma trận dưới bao phủ **51/51 bảng Logical** của nguồn. “Được bao phủ” có nghĩa có yêu cầu hoặc vai trò dữ liệu tương ứng trong PRD, không có nghĩa mỗi bảng cần một màn hình CRUD độc lập.

| # | Bảng | Vai trò sản phẩm | Yêu cầu liên quan |
|---|---|---|---|
| 1 | ROLES | Vai trò truy cập | FR-A06, mục 3 |
| 2 | USERS | Tài khoản, danh tính thao tác | FR-A01–FR-A07 |
| 3 | PROFILES | Hồ sơ cá nhân | FR-A03 |
| 4 | ACCESS_TOKENS | Kiểm soát access token/thu hồi phiên | FR-A02, FR-A05 |
| 5 | REFRESH_TOKENS | Refresh, rotation và token family | FR-A05 |
| 6 | PASSWORD_RESET_TOKENS | Reset mật khẩu có thời hạn | FR-A04 |
| 7 | USER_EXTERNAL_LOGINS | Liên kết nhà cung cấp đăng nhập | FR-A07 |
| 8 | CATEGORIES | Phân loại tour, sản phẩm và combo | FR-T01, FR-P01, FR-P04 |
| 9 | LOCATIONS | Địa điểm chính của tour | FR-T01 |
| 10 | TOURS | Sản phẩm tour và version | FR-T01, FR-T05 |
| 11 | TOUR_IMAGES | Bộ ảnh tour | FR-T02 |
| 12 | TOUR_ACTIVITIES | Lịch trình theo tour | FR-T03, FR-V01 |
| 13 | TOUR_PREPARATION_ITEMS | Đồ khách tự mang | FR-T04 |
| 14 | TOUR_PROVIDED_ITEMS | Cấu hình đồ đơn vị cấp | FR-T04, FR-I01 |
| 15 | TOUR_RECURRENCE_RULES | Quy tắc sinh lịch chuyến | FR-D03 |
| 16 | TRIPS | Lần khởi hành, giá và sức chứa | FR-D01–FR-D08, FR-B03 |
| 17 | TRIP_GROUPS | Nhóm và guide phụ trách | FR-D05, FR-D06 |
| 18 | TRIP_PROVIDED_ITEMS | Nhu cầu đồ cấp cho chuyến | FR-I01, FR-I04 |
| 19 | ORDERS | Đơn thương mại chung | FR-B01, FR-R01, FR-F01–FR-F09 |
| 20 | TRIP_BOOKING_ORDERS | Chi tiết booking tour | FR-B01–FR-B07 |
| 21 | BOOKING_PARTICIPANTS | Danh sách người tham gia | FR-B02, FR-B05, FR-D06 |
| 22 | ACTIVITY_ATTENDANCES | Điểm danh theo participant/activity | FR-V01–FR-V03 |
| 23 | REVIEWS | Review từ lần tham gia | FR-V04–FR-V06 |
| 24 | PRODUCTS | Dòng sản phẩm cho thuê | FR-P01 |
| 25 | PRODUCT_VARIANTS | Biến thể, SKU và cấu hình thuê | FR-P01, FR-P06 |
| 26 | PRODUCT_VARIANT_IMAGES | Ảnh biến thể | FR-P03 |
| 27 | EQUIPMENT_ASSETS | Thiết bị vật lý | FR-P02, FR-I02–FR-I07 |
| 28 | PRODUCT_BUNDLES | Combo thuê | FR-P04 |
| 29 | PRODUCT_BUNDLE_ITEMS | Thành phần combo hiện hành | FR-P04 |
| 30 | RENTAL_PRICE_TIERS | Giá theo số ngày và đối tượng thuê | FR-P05, FR-R03 |
| 31 | RENTAL_ORDERS | Khoảng thuê, nhân viên xử lý, cọc | FR-R01, FR-R05, FR-C01 |
| 32 | RENTAL_ORDER_ITEMS | Dòng thuê variant hoặc combo | FR-R02, FR-R03 |
| 33 | RENTAL_BUNDLE_ITEM_SNAPSHOTS | Thành phần combo đã chốt | FR-R04 |
| 34 | ASSET_ASSIGNMENTS | Phân bổ vật lý dùng chung | FR-I02–FR-I07, FR-R06, FR-R07 |
| 35 | RENTAL_CHARGES | Phí phát sinh | FR-C02–FR-C06 |
| 36 | PROMOTIONS | Chương trình, phạm vi, hạn mức | FR-M01, FR-M05 |
| 37 | PROMOTION_TIERS | Ngưỡng và quyền lợi | FR-M02, FR-M03 |
| 38 | APPLIED_PROMOTIONS | Lần áp quyền lợi vào đơn/dòng | FR-M04, FR-M06, FR-M07 |
| 39 | REFUND_POLICIES | Chính sách phiên bản | FR-F05 |
| 40 | REFUND_POLICY_RULES | Ngưỡng hoàn theo thời gian | FR-F06, FR-F07 |
| 41 | TRANSACTIONS | Thu/hoàn và tham chiếu gốc | FR-F01–FR-F09, FR-C05 |
| 42 | POSTS | Nội dung hướng dẫn | FR-N01 |
| 43 | TAGS | Nhãn phân loại nội dung | FR-N02 |
| 44 | SOFT_SKILLS | Chủ đề kỹ năng | FR-N02 |
| 45 | POST_TAGS | Liên kết bài–tag | FR-N02 |
| 46 | POST_SOFT_SKILLS | Liên kết bài–kỹ năng | FR-N02 |
| 47 | TOUR_POSTS | Nội dung liên quan tour | FR-N03 |
| 48 | PARTICIPANT_POST_READS | Trạng thái đọc của participant | FR-N04, FR-N05 |
| 49 | NOTIFICATIONS | Thông báo đến tài khoản | FR-O01 |
| 50 | AUDIT_LOGS | Dấu vết người/tác vụ thay đổi | FR-O02 |
| 51 | SYSTEM_CONFIGURATIONS | Giá trị cấu hình vận hành | FR-O03 |

### 13.1. Những gì ERD chưa đủ để xác nhận

1. **Enum và transition:** tên trạng thái, actor được chuyển và điều kiện chuyển chưa được định nghĩa chỉ bằng trường status.
2. **Quyền theo phạm vi:** role_id không đủ biểu diễn mọi quy tắc “chỉ được giao”, phê duyệt phí hoặc phê duyệt hoàn.
3. **Liên kết participant:** linked_user_id nullable chưa mô tả cơ chế mời/xác minh và quyền review của người không có tài khoản.
4. **Tính idempotent:** mã provider transaction không thay toàn bộ idempotency key của tạo đơn, hoàn tiền, job và webhook.
5. **Cọc và phân bổ tiền:** thiếu quy ước rõ tổng tiền và dữ liệu bù cọc/settlement từng phí.
6. **Lịch lặp:** thiếu định danh occurrence/chống trùng và quy tắc sửa lịch đã sinh.
7. **Nhật ký tài nguyên:** assigned_at/returned_at không mặc nhiên cung cấp toàn bộ lịch sửa khoảng giữ hoặc lịch tình trạng tài sản.
8. **Thông báo và yêu cầu hủy:** chưa có mô hình rõ cho email delivery, outbox, yêu cầu hủy/duyệt hoàn hoặc lần thử tích hợp.
9. **Version bất biến:** có trường family/version nhưng vẫn cần chặn thay đổi các activity và rule con của version đã khóa.
10. **Bằng chứng và điều chỉnh:** thiếu dữ liệu ảnh bàn giao/hỏng, dòng điều chỉnh giá, kiểm duyệt review và lịch sử gia hạn nếu phạm vi cần chúng.

Những điểm này là việc cần thiết kế ở bước tiếp theo, không phải kết luận phải tạo đúng mười bảng mới. Có thể giải bằng ràng buộc, audit có cấu trúc, service hoặc dữ liệu bổ sung tùy yêu cầu đã được duyệt.

## 14. Kịch bản nghiệm thu đầu cuối

Mỗi kịch bản phải chạy với quyền phù hợp, kiểm tra cả giao diện/API và dữ liệu lưu. Các con số là dữ liệu test, không phải chính sách kinh doanh mặc định.

| Mã | Điều kiện / thao tác | Kết quả mong đợi | Truy vết |
|---|---|---|---|
| UAT-01 | Đăng ký email đã có với khác chữ hoa/thường | Bị xử lý theo cùng quy tắc chuẩn hóa; không sinh hai tài khoản trái quy định | FR-A01 |
| UAT-02 | Reset bằng token đã dùng hoặc hết hạn | Bị từ chối; mật khẩu và phiên không bị thay đổi ngoài chính sách | FR-A04 |
| UAT-03 | Khóa tài khoản đang có phiên | Phiên không tiếp tục truy cập dữ liệu được bảo vệ | FR-A05, FR-A06 |
| UAT-04 | Trip còn một chỗ, hai khách đồng thời đặt một chỗ | Chỉ một giữ chỗ/xác nhận thành công; tổng cam kết không vượt capacity | FR-B03, BR-07 |
| UAT-05 | Một booking có 3 người, chỉ một người có tài khoản | Lưu đủ ba participant; hai linked_user_id trống; người đặt không tự thành tác giả ba review | FR-B02, FR-B05 |
| UAT-06 | Chuyển participant vào group của Trip khác hoặc nhóm đã đầy | Bị từ chối; nhóm cũ không bị mất khi thao tác thất bại | FR-D06, BR-09, BR-10 |
| UAT-07 | Hold hết hạn và callback đến gần đồng thời | Chỉ một kết quả nghiệp vụ nhất quán; nếu không thể giữ dịch vụ thì chuyển đối soát, không oversell | FR-F08, JOB-01 |
| UAT-08 | Gửi cùng callback thanh toán ba lần | Chỉ một tác động số tiền; không thêm ba đơn/thông báo xác nhận | FR-F02, BR-32 |
| UAT-09 | Tạo version tour mới và thay hoạt động | Trip/attendance lịch sử vẫn gắn version/hoạt động cũ | FR-T05 |
| UAT-10 | Gửi điểm danh bằng activity của tour khác | Bị từ chối; không tạo attendance sai | FR-V02, BR-11 |
| UAT-11 | Guide đoán ID participant ngoài nhóm được giao | Không được xem/chỉnh dữ liệu ngoài phạm vi | NFR-01, mục 3 |
| UAT-12 | Tạo dòng thuê vừa có variant vừa có bundle hoặc không có cả hai | Bị từ chối trước khi tính giá/cấp tài nguyên | FR-R02, BR-13 |
| UAT-13 | Thuê hai combo, mỗi combo có hai gậy và một lều | Nhu cầu bốn gậy, hai lều; cấp thiếu thành phần không coi là giao đủ | FR-R04, BR-16 |
| UAT-14 | Sửa thành phần combo sau khi đơn đã chốt | Đơn cũ vẫn dùng snapshot; đơn mới dùng cấu hình mới | FR-R04, BR-17 |
| UAT-15 | Asset đã giữ cho chuyến, khách thuê cùng khoảng | Bị từ chối cấp asset đó; có thể cấp asset khác đủ điều kiện | FR-I03 |
| UAT-16 | Hai Staff đồng thời cấp cùng asset cho hai nguồn | Chỉ một phân bổ thành công; không có hai assignment hiệu lực xung đột | FR-I03, BR-19 |
| UAT-17 | Assignment có hai nguồn hoặc không có nguồn | Bị từ chối; không tồn tại allocation không xác định được mục đích | FR-I02 |
| UAT-18 | Asset đã quá hạn trả nhưng chưa returned_at | Không coi là sẵn có; cảnh báo đơn tương lai bị ảnh hưởng | FR-I06, BR-20 |
| UAT-19 | Gia hạn chồng lịch đã cam kết cho đơn khác | Từ chối/đề xuất đổi asset theo quyền; không âm thầm sửa booking khác | FR-R09 |
| UAT-20 | Phí 120.000, cọc đang giữ 300.000 | Theo phương án được duyệt: bù 120.000, hoàn 180.000; không thu trùng phí | FR-C05 |
| UAT-21 | Tạo phí hỏng gắn asset chưa từng cấp cho đơn | Bị từ chối hoặc vào quy trình ngoại lệ có phê duyệt riêng; không hợp thức hóa tự động | FR-C02 |
| UAT-22 | Hủy phí đã được xác định | Giữ dấu vết, lý do, người và thời điểm; tổng nghĩa vụ được tính lại nhất quán | FR-C04 |
| UAT-23 | Hai khách tranh lượt cuối của khuyến mãi | Không vượt hạn mức; người không nhận ưu đãi được thấy tổng tiền mới trước xác nhận | FR-M05 |
| UAT-24 | Áp promotion của Order A vào dòng thuê Order B | Bị từ chối | FR-M04, BR-24 |
| UAT-25 | Khuyến mãi quà thiết bị còn điều kiện tiền nhưng hết asset | Không hứa giao quà không có; xử lý theo lựa chọn đã chốt ở Q-08 | FR-M06 |
| UAT-26 | Sửa refund policy sau khi Order đã chốt | Order cũ vẫn tính theo policy version cũ | FR-F05, BR-31 |
| UAT-27 | Thu 1.000.000, đã hoàn 600.000, đồng thời hai yêu cầu hoàn 300.000 | Tổng hoàn thành công/đang giữ không vượt 1.000.000 | FR-F07, BR-30 |
| UAT-28 | Refund provider timeout sau khi có thể đã xử lý | Hệ thống đối soát/retry cùng định danh, không tạo hoàn mới không kiểm tra | FR-F08 |
| UAT-29 | Participant đã review, gửi lần hai | Không tạo review thứ hai; có thể sửa nếu chính sách cho phép | FR-V04, BR-12 |
| UAT-30 | Participant thuộc chuyến chưa hoàn thành hoặc đơn chưa paid | Chưa cho đăng review | FR-V04 |
| UAT-31 | Đọc lại bài hướng dẫn nhiều lần | Không tạo nhiều quan hệ participant/post hoặc coi đó là nhiều người đã đọc | FR-N04 |
| UAT-32 | Chạy tác vụ sinh chuyến cùng occurrence hai lần | Chỉ một Trip được tạo | FR-D03, JOB-02 |
| UAT-33 | Hủy đơn thuê khi đã giao một phần | Không giải phóng asset đang ở khách; hệ thống yêu cầu xử lý trả/kết thúc sớm | FR-R07, FR-F09 |
| UAT-34 | Gửi email thất bại sau thanh toán thành công | Order vẫn ghi đúng thanh toán; có retry thông báo; không yêu cầu khách thanh toán lại | JOB-03 |
| UAT-35 | Xóa/ẩn variant đang có đơn lịch sử | Đơn và asset vẫn truy vết được; variant không nhận đơn mới | FR-P07, BR-05 |
| UAT-36 | Khách truy cập notification hoặc export của người khác | Từ chối theo quyền đối tượng, không chỉ theo đăng nhập | FR-O01, FR-O06, NFR-01 |

### 14.1. Bộ dữ liệu nghiệm thu tối thiểu

Đề xuất có: 1 Admin, 2 Staff, 2 Guide, nhiều Customer; 2 tour family với version cũ/mới; Trip nháp/mở/đã hoàn/hủy; booking đặt hộ; participant chưa nhóm/chưa tài khoản; variant đủ kho/thiếu kho; combo dùng chung một variant; asset tốt/hỏng/mất/chưa trả; chương trình giảm tiền và quà thiết bị; policy nhiều ngưỡng; giao dịch thành công/thất bại/hoàn một phần; phí theo asset và toàn đơn. Không dùng thông tin cá nhân thật để tạo dữ liệu kiểm thử.

## 15. Kế hoạch phát hành và điều kiện nghiệm thu

### 15.1. Các giai đoạn đề xuất

| Giai đoạn | Kết quả bàn giao | Điều kiện để đi tiếp |
|---|---|---|
| R0 — Chốt nghiệp vụ | Duyệt PRD, quyết định Q chặn P0, tập trạng thái và công thức tiền | Quyền, scope, thời gian, cọc/hoàn không còn mâu thuẫn |
| R1 — Nền tảng và danh mục | Tài khoản/quyền, hồ sơ, tour/version, sản phẩm/variant/asset, audit | Kiểm thử quyền và lịch sử đạt |
| R2 — Đặt tour | Trip, booking nhiều người, giữ chỗ, thanh toán, phân nhóm/guide, điểm danh | Capacity, callback, version và quyền participant đạt |
| R3 — Thuê đồ và kho chung | Variant/combo, snapshot, cấp/trả, đồ cấp chuyến, phí/cọc, hoàn | Không cấp trùng, quyết toán không thu/hoàn trùng |
| R4 — Hoàn thiện phạm vi | Khuyến mãi, lịch lặp, nội dung, review, thông báo và báo cáo | Các kịch bản P1 được chọn đạt |
| R5 — Pilot | Dữ liệu thật giới hạn, giám sát, quy trình hỗ trợ và phục hồi | Người vận hành thực hiện được luồng đầu cuối và xử lý ngoại lệ |

Không gán tuần hoặc ngày hoàn thành khi chưa biết số người, năng lực, deadline và tích hợp. Nếu chỉ làm demo môn học, có thể dùng sandbox thanh toán và mô phỏng gửi thông báo, nhưng phải dán nhãn môi trường và vẫn kiểm tra quy tắc toàn vẹn.

### 15.2. Definition of Ready

Một hạng mục được đưa vào triển khai khi có actor, phạm vi quyền, dữ liệu đầu vào, trạng thái trước/sau, nhánh lỗi, quy tắc tính toán và tiêu chí nghiệm thu. Hạng mục có Q chặn chưa chốt phải được tách phần độc lập hoặc giữ ở trạng thái chưa sẵn sàng.

### 15.3. Definition of Done

- Yêu cầu FR của phạm vi phát hành có test/biên bản nghiệm thu tương ứng, cả luồng thuận và lỗi.
- Những quy tắc chống oversell/cấp trùng/thu hoàn lặp được kiểm tra đồng thời, không chỉ kiểm tra từng thao tác riêng.
- Kiểm thử phân quyền theo đối tượng đạt; audit các thao tác nhạy cảm có thể truy vết.
- Không có lỗi nghiêm trọng gây mất dữ liệu, lộ dữ liệu, sai tiền hoặc cam kết tài nguyên trùng.
- Danh mục/giá/policy lịch sử không thay đổi khi cập nhật cấu hình mới.
- Luồng vận hành khi provider lỗi, job retry và khôi phục dữ liệu được mô tả và thử trên môi trường kiểm thử.
- Có hướng dẫn vận hành ngắn cho giao/nhận đồ, hủy/hoàn, phí và tình huống cần đối soát.
- PRD, ERD và hành vi đã triển khai không mâu thuẫn; những thay đổi phạm vi được ghi quyết định rõ ràng.

### 15.4. Điều kiện chưa được đưa lên môi trường thật

Chưa duyệt Q về tiền/cọc/hoàn; chưa xác minh callback; có thể tạo assignment chồng nhau; chưa kiểm tra quyền participant; chưa có cách xác định giao dịch đã xử lý; hoặc chưa có phương án phục hồi/đối soát sau lỗi. Đây là tiêu chí release của sản phẩm, không phải yêu cầu dừng việc soạn tài liệu.

## 16. Rủi ro, giả định và quyết định cần chốt

### 16.1. Danh sách quyết định mở

| Mã | Quyết định cần chốt | Phương án dự thảo để thảo luận | Ảnh hưởng / thời điểm chốt |
|---|---|---|---|
| Q-01 | Một tài khoản có thể nhiều vai trò không? | Theo ERD: một role/tài khoản; phân công vận hành kiểm tra riêng | Chặn thiết kế quyền R1 |
| Q-02 | Staff/Admin có tạo đơn hộ khách không? | P0 chỉ Customer tạo; vận hành quản lý đơn đã có | Trường người thao tác, audit và giao diện R2/R3 |
| Q-03 | Có bắt buộc xác minh email, reset qua kênh nào? | Email reset; xác minh email cần thiết kế token riêng | Tài khoản và gửi email R1 |
| Q-04 | Cách tính ngày thuê, TTL giữ chỗ, thu toàn bộ hay từng phần? | Ngày 24h bắt đầu; TTL cấu hình; tour thanh toán đủ tiền dịch vụ, thuê thu đủ tiền dịch vụ + cọc trước giao | Chặn checkout/giá R2/R3 |
| Q-05 | Chuyến được tạo thủ công hay chỉ theo lịch lặp; khóa tour version lúc nào? | Cho thủ công theo FK nullable; khóa version khi có booking xác nhận | Lịch và tính bất biến R2 |
| Q-06 | Guide có thể dẫn nhiều nhóm cùng chuyến? Có cho trùng lịch không? | Một guide/nhóm; tránh hai chuyến chồng thời gian, số nhóm cùng chuyến cần chốt | Phân công guide R2 |
| Q-07 | Hủy toàn đơn/một participant, hủy sau khởi hành và hủy bởi đơn vị tổ chức? | P0 hủy toàn đơn trước dịch vụ; hủy từ phía tổ chức có chính sách riêng | Chặn hủy/hoàn, capacity và thông báo |
| Q-08 | Quà khuyến mãi là thiết bị cho mượn hay tặng sở hữu? Hết quà xử lý sao? | Quyền dùng có thu hồi; không thay quyền lợi khi chưa được khách chấp nhận | Kho và pricing khuyến mãi R4 |
| Q-09 | Ngưỡng promotion, cộng dồn, lượt dùng và hoàn lượt khi hủy? | Bậc cao nhất đủ điều kiện, xét trước giảm; thứ tự dòng rồi đơn; chỉ applied tính lượt | Chặn bộ máy promotion R4 |
| Q-10 | Ai được review nếu participant không có tài khoản; no-show có review không? | Chỉ tài khoản đã xác minh liên kết; chưa mở review ẩn danh; no-show cần chính sách | Quyền review R4; cơ chế liên kết phải chốt sớm tại Q-16 |
| Q-11 | Đồ cấp tính theo người/nhóm/chuyến, buffer vệ sinh và đổi loại asset? | 3 cơ sở số lượng; buffer cấu hình; P0 chỉ đổi cùng variant | Kho chung R3 |
| Q-12 | Provider thanh toán, tiền tệ, total_amount, cọc bù phí, cơ sở hoàn và quyền duyệt? | Một tiền tệ VND; tách dịch vụ/cọc/phí; Admin duyệt ngoại lệ; cần dữ liệu settlement rõ | Chặn thanh toán thật R2/R3 |
| Q-13 | Kênh thông báo, file storage, biểu mẫu xuất? | In-app P1, email reset P0; chưa chốt SMS hoặc provider | Tích hợp và UX |
| Q-14 | Mức hiệu năng, khả dụng, lưu trữ dữ liệu và ngân sách? | Các ngưỡng NFR là mục tiêu thảo luận | Chặn SLA/pilot thật |
| Q-15 | MVP là demo học phần hay sản phẩm vận hành; deadline/đội ngũ? | Chia release theo rủi ro, chưa cam kết lịch | Chốt roadmap và phạm vi release |
| Q-16 | Ai được mời/liên kết tài khoản với participant, xác minh bằng cách nào và cho phép hủy liên kết khi nào? | Chủ tài khoản xác minh quyền sở hữu lời mời; Staff không tự ghép chỉ theo email; mọi đổi liên kết có audit | Chặn FR-B05 và kiểm thử quyền participant ở R2 |
| Q-17 | Ai chịu trách nhiệm khi mất/hỏng đồ cấp chuyến hoặc quà thuộc đơn tour; có thu phí không? | MVP ghi ngoại lệ và xử lý vận hành; chưa tự tính/thu phí ngoài đơn thuê; không dùng RentalCharge cho booking tour | Chặn tự động quyết toán đồ cấp chuyến/quà tour; xác định phạm vi trước R3/R4 |

Giá trị như tỷ lệ cọc, mức phí mất/hỏng, số giờ miễn phí trả trễ, thời hạn sửa review, ngưỡng tối thiểu khởi hành và hạn hủy không được tự bịa thành cấu hình production. Người có trách nhiệm sản phẩm/vận hành phải phê duyệt.

### 16.2. Rủi ro chính và biện pháp

| Rủi ro | Tác động | Biện pháp và bằng chứng cần có |
|---|---|---|
| Bán vượt chỗ hoặc cấp trùng asset | Không thực hiện được cam kết | Kiểm tra nguyên tử, kiểm thử đồng thời UAT-04/UAT-16 |
| Coi cọc là doanh thu, trừ phí hai lần | Sai tiền và tranh chấp | Chốt Q-12, quyết toán có dữ liệu đối soát, UAT-20 |
| Callback/hoàn tiền lặp | Thu/hoàn vượt số đúng | Idempotency, monotonic trạng thái, UAT-08/UAT-27/UAT-28 |
| Sửa tour/policy làm đổi lịch sử | Sai dịch vụ đã bán/quyền hoàn | Version bất biến và test cập nhật cấu hình |
| Guest participant bị liên kết sai | Lộ dữ liệu và review giả | Xác minh liên kết, quyền đối tượng, chốt Q-10 |
| Asset trả muộn phá đơn kế tiếp | Thiếu đồ sát giờ giao | Không tự giải phóng theo đồng hồ, cảnh báo và thay thế có kiểm soát |
| Lạm dụng trạng thái nháp hoặc soft delete | Bỏ qua điều kiện xác nhận hoặc che lịch sử | Guard theo transition, audit và dữ liệu tham chiếu lịch sử |
| Phạm vi tăng vượt khả năng nhóm | Không hoàn tất luồng cốt lõi | Chốt Q-15 và Definition of Done theo release |

### 16.3. Quy tắc quản lý thay đổi PRD

Khi một Q được quyết định, ghi ngày, người quyết định, phương án chọn và FR/BR/UAT bị ảnh hưởng; thay nhãn [D]/[Q] bằng quyết định được duyệt ở đúng phần. Không chỉ sửa ERD rồi giữ nguyên công thức tiền hoặc tiêu chí nghiệm thu cũ. Mỗi phiên bản PRD cần giữ dấu vết thay đổi có ý nghĩa đối với người triển khai.

## 17. Phụ lục nguồn và giới hạn suy luận

### 17.1. Dấu vết nguồn

- File nguồn: `D:\FPTU\Fall2026\PRN232\RenTrekk\Conceptual.drawio`.
- SHA-256 tại lúc đọc: `e6329620c2788cdcf5a936da143013df66dcc23f78da037134c0ae058d237ed3`.
- Bản trích bảng/trường/relationship: [artifacts/prd/erd-source.json](./artifacts/prd/erd-source.json).
- Cơ sở bổ sung: quyết định nghiệp vụ trong cuộc trao đổi về tour/activity, participant, promotion, assignment và review; không suy ra quyền hạn hoặc SLA từ hình vẽ.
- Ngày tài liệu: **13/10/2026**, theo múi giờ người dùng Asia/Saigon.

### 17.2. Thứ tự xử lý khi nguồn mâu thuẫn

Quyết định nghiệp vụ đã xác nhận → định nghĩa dữ liệu có khóa/ràng buộc rõ → relationship có giải thích → suy luận từ tên/đường vẽ. Nếu hai nguồn cùng có cơ sở nhưng mâu thuẫn, ghi Q thay vì tự chọn một nguồn là “đúng tuyệt đối”.

Các relationship nét đứt/suy ra không được chuyển thành cột FK mới mà không có nhu cầu dữ liệu. Cardinality `0..1` cho nguồn của assignment không có nghĩa assignment được phép không có nguồn nào: ba quan hệ optional còn phải kết hợp bằng quy tắc “đúng một nguồn”.

### 17.3. Tình trạng tài liệu

Đây là PRD được dựng từ ERD và quyết định hội thoại, chưa có nghiên cứu khách hàng, phỏng vấn vận hành, cam kết pháp lý, benchmark hệ thống hoặc xác nhận nhà cung cấp. Các yêu cầu dự thảo đủ chi tiết để phân tích, ước lượng và lập test case; phần phụ thuộc quyết định mở phải được chốt trước khi triển khai. Tài liệu không khẳng định sản phẩm hiện tại đã đáp ứng bất kỳ FR/NFR/UAT nào.

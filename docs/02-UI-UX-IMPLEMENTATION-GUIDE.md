# RenTrek FE — Hướng dẫn triển khai UI/UX sau Backend

> Đính kèm file này vào mọi chat tạo mới hoặc chỉnh sửa Frontend RenTrek.
> Đây là chỉ dẫn thực thi cho AI/Developer, không phải mô tả tham khảo.

## 1. Mục tiêu

Khi Backend của một luồng đã hoàn thành, triển khai hoặc sửa Frontend tại:

`D:\FPTU\Fall2026\PRN232\RenTrekk\rentTrek-fe`

UI/UX phải dựa trên bộ thiết kế tại:

`D:\FPTU\Fall2026\PRN232\FE_RenTrek\RenTrekk Design System (1)`

Giữ nguyên nhận diện màu hiện tại của Frontend RenTrek: **xanh rừng, cam đất, nền trung tính ấm**. Chỉ lấy cấu trúc màn hình, phân cấp thông tin, component, trạng thái và hành vi UX từ bộ thiết kế. Không chuyển hệ thống sang palette xanh đêm `Night/Dawn/Mist` nếu người dùng không yêu cầu rõ.

## 2. Thứ tự nguồn chuẩn

Khi các nguồn khác nhau, giải quyết theo thứ tự sau:

1. **Backend đang chạy và API contract** quyết định dữ liệu, validation, quyền và hành vi nghiệp vụ.
2. **Yêu cầu hiện tại của người dùng** quyết định phạm vi màn hình và thay đổi.
3. **Code cùng quy ước Frontend hiện có** quyết định kiến trúc, khả năng tương thích và cách tích hợp.
4. **RenTrekk Design System** quyết định bố cục, phân cấp, component và UX.
5. **Figma hoặc ảnh tham chiếu được cung cấp trong chat** quyết định chi tiết thị giác của màn hình cụ thể.

Quy tắc xử lý xung đột:

- Backend quyết định **dữ liệu và nghiệp vụ**.
- Design System/Figma quyết định **bố cục và tương tác**.
- `src/index.css` và giao diện RenTrek hiện tại quyết định **màu sắc thương hiệu**.
- Không tạo field, trạng thái hoặc hành động mà Backend chưa hỗ trợ.
- Không hiển thị field chỉ vì mockup có nếu luồng hiện tại không cần.

## 3. Tài liệu phải đọc trước khi sửa code

Chỉ đọc phần liên quan đến task, nhưng phải đọc đủ nguồn sau:

### Frontend

- `rentTrek-fe/README.md`
- `rentTrek-fe/docs/01-CONVENTIONS.md`
- `rentTrek-fe/src/index.css`
- Route, component, hook, service và test đang liên quan đến màn hình cần sửa.

### Backend

- API contract trong `rentTrek-be/docs/`.
- Tài liệu riêng của luồng nếu có.
- Controller, request/response DTO và validator khi tài liệu chưa rõ hoặc có dấu hiệu lệch code.

### Design System — chỉ đọc, không sửa

- `uploads/Screen_Spec.md`: route, nội dung, trạng thái và mapping dữ liệu.
- `uploads/PRD_RenTrekk.md`: mục tiêu nghiệp vụ và hành trình người dùng.
- `uploads/UI_Design_Prompt.md`: nguyên tắc component, accessibility và trạng thái.
- `RenTrekk Design System.dc.html`: component, spacing, typography và tương tác mẫu.
- `RenTrekk Sitemap & Shells.dc.html`: shell và điều hướng.
- File `RenTrekk Batch ...dc.html` tương ứng với màn hình đang làm.

Không sao chép nguyên `.dc.html`, inline style hoặc `support.js` vào ứng dụng React. Chuyển thiết kế thành component React, CSS Module và token hiện có.

## 4. Palette bắt buộc giữ lại

Nguồn chuẩn màu là `rentTrek-fe/src/index.css` và các màn hình RenTrek hiện tại.

| Vai trò | Màu hiện tại |
|---|---|
| Primary xanh rừng | `#204B39` |
| Primary đậm / heading | `#173D2D`, `#154D33` |
| Accent cam đất | `#C55742`, `#E0674A` |
| Điểm nhấn ấm | `#E4B74F` |
| Nền trang | `#FAFAFA`, `#F7F5EE` |
| Surface | `#FFFFFF`, `#FFFDF7` |
| Border | `#DDE4DD`, `#E1E5E9` |
| Chữ chính | `#1D2420`, `#173D2D` |
| Chữ phụ | `#66706A`, `#69766F` |
| Lỗi / destructive | `#C62828` hoặc token lỗi đang có |

Quy tắc màu:

- Dùng semantic CSS variable thay vì rải hex mới trong component.
- Ưu tiên mở rộng token trong `src/index.css` khi một vai trò màu được dùng từ hai nơi trở lên.
- Primary dùng cho điều hướng, nút chính, focus và trạng thái active.
- Accent cam đất dùng cho CTA chuyển đổi; tối đa một CTA accent nổi bật trong một vùng hành động.
- Destructive dùng màu lỗi, không dùng accent thương hiệu.
- Trạng thái luôn có chữ hoặc icon; màu không được là tín hiệu duy nhất.
- Mọi cặp chữ/nền đạt WCAG AA: chữ thường tối thiểu `4.5:1`, chữ lớn tối thiểu `3:1`.
- Không đưa palette `Night/Dawn/Mist` của tài liệu tham chiếu vào FE nếu chưa được yêu cầu đổi thương hiệu.

## 5. Nguyên tắc UI/UX

- Dùng font **Be Vietnam Pro** đã có trong dự án.
- Dùng thang spacing `4/8`: `4, 8, 12, 16, 24, 32, 40, 48, 64`.
- Radius ưu tiên `8, 12, 16px`; tránh bo góc quá lớn nếu màn hình hiện tại không dùng.
- Vùng bấm trên mobile tối thiểu `44 × 44px`.
- Khung desktop tham chiếu `1440px`, nội dung tối đa khoảng `1200–1280px`.
- Giao diện phải responsive; kiểm tra ít nhất desktop và mobile `375px` dù file thiết kế chỉ có desktop.
- Giữ phân cấp rõ: tiêu đề, mô tả ngắn, nội dung chính, hành động chính, thông tin phụ.
- Dùng card, shadow và border có tiết chế; không biến mọi nội dung thành card.
- Form chỉ hỏi dữ liệu Backend bắt buộc hoặc thật sự cần cho nghiệp vụ.
- Lỗi form nằm cạnh field; focus field lỗi đầu tiên khi submit thất bại.
- Nút submit có loading, bị disable khi gửi và chống gửi trùng.
- Stepper/progress phải khớp chính xác màn hình đang hiển thị.
- Mọi trang gọi API có đủ: loading, error, empty và success.
- Không hiển thị GUID, tên bảng, foreign key hoặc enum thô cho người dùng.
- Tiền dùng VND: `1.250.000 ₫`. Ngày giờ hiển thị theo múi giờ Việt Nam khi cần xác nhận.

## 6. Kiến trúc gọi API bắt buộc

Luồng chuẩn:

`Page/Component → React Query hook → feature service → axiosClient → Backend`

Yêu cầu:

- Chỉ dùng Axios qua `src/api/axiosClient.js`; không gọi `fetch` hoặc Axios trực tiếp trong component.
- Khai báo endpoint trong `src/api/endpoints.js`; không hard-code URL API.
- Mỗi feature có service, query keys và hook riêng theo `docs/01-CONVENTIONS.md`.
- Dùng `cleanParams` cho query string.
- Field request/response giữ camelCase đúng contract.
- Không gửi field do server quản lý.
- Dùng React Hook Form cho form phức tạp.
- Map lỗi Backend về đúng field bằng `applyServerErrors`.
- Mutation thành công phải cập nhật hoặc invalidate đúng cache.
- Quyền trên FE chỉ phục vụ UX; Backend vẫn là nơi chặn thật bằng `401/403`.

## 7. Quy trình khi Backend vừa hoàn thành một luồng

1. Xác định endpoint, request, response, validation, quyền và lỗi nghiệp vụ từ Backend.
2. Chạy hoặc kiểm tra endpoint thật trước khi nối UI nếu môi trường cho phép.
3. Tìm màn hình tương ứng trong `Screen_Spec.md`, sitemap và file Batch.
4. Audit route, component, service, hook và test hiện có trong FE.
5. Lập mapping nội bộ: `API field → UI field → trạng thái hiển thị → hành động`.
6. Viết test thất bại cho hành vi mới hoặc lỗi cần sửa.
7. Thêm endpoint, service, query key và hook.
8. Triển khai UI bằng component hiện có; chỉ tạo component chung khi có ít nhất hai nơi dùng.
9. Áp dụng bố cục từ Design System nhưng giữ palette RenTrek hiện tại.
10. Kiểm tra toàn luồng bằng Backend local: dữ liệu thật, payload, loading, lỗi và điều hướng.

## 8. Quy trình khi chỉnh sửa Frontend hiện có

- Đọc màn hình và test hiện tại trước khi sửa.
- Giữ thay đổi nhỏ nhất đủ giải quyết yêu cầu.
- Giữ hành vi đang đúng; không redesign toàn màn hình nếu task chỉ sửa một phần.
- Không xóa hoặc ghi đè thay đổi chưa commit của người dùng.
- Tái sử dụng component và token hiện có trước khi tạo mới.
- Nếu thiết kế cũ lệch Design System, sửa trong phạm vi task và ghi rõ phần còn lệch.
- Nếu Backend và FE lệch contract, xác nhận code Backend đang chạy rồi cập nhật FE; không đoán payload.

## 9. Kiểm tra trước khi báo hoàn thành

Chỉ báo hoàn thành khi có bằng chứng mới từ các bước sau:

- Test mục tiêu đã từng fail trước thay đổi và đã pass sau thay đổi.
- `npm test` pass.
- `npm run lint` không có error.
- `npm run build` pass.
- Kiểm tra desktop và mobile `375px`.
- Kiểm tra keyboard focus, label, thông báo lỗi và contrast.
- Kiểm tra request thật dùng đúng URL, method, header và payload.
- Kiểm tra loading, error, empty, success và submit lặp.
- So sánh màn hình với file Design System/Figma tương ứng.
- Xác nhận màu vẫn thuộc palette xanh rừng–cam đất của RenTrek.

Nếu không thể chạy một bước, báo rõ phần chưa kiểm tra. Không dùng từ “hoàn thành” cho phần chưa có bằng chứng.

## 10. Báo cáo cuối mỗi task

Báo cáo ngắn gọn:

1. Màn hình/luồng đã làm.
2. API đã nối.
3. File chính đã sửa.
4. Test, lint và build đã chạy cùng kết quả.
5. Phần chưa kiểm tra hoặc phụ thuộc Backend.

Không commit, push hoặc tạo PR nếu người dùng chưa yêu cầu.

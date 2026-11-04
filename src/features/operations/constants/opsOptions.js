export const OPS_LABELS = {
  Admin: 'Quản trị viên', Staff: 'Nhân viên', Guide: 'Hướng dẫn viên', Customer: 'Khách hàng',
  Active: 'Đang hoạt động', Locked: 'Đã khóa', Inactive: 'Ngừng hoạt động',
  Tour: 'Tour trekking', Rental: 'Thuê thiết bị', All: 'Tất cả', Equipment: 'Thiết bị', Bundle: 'Combo',
  PendingPayment: 'Chờ thanh toán', Confirmed: 'Đã xác nhận', InFulfillment: 'Đang thực hiện', Completed: 'Hoàn thành', Cancelled: 'Đã hủy', Expired: 'Hết hạn',
  Unpaid: 'Chưa thanh toán', PartiallyPaid: 'Thanh toán một phần', Paid: 'Đã thanh toán', NeedsReconciliation: 'Cần đối soát', Refunded: 'Đã hoàn tiền', PendingRefund: 'Chờ hoàn tiền',
  Draft: 'Bản nháp', Published: 'Đã xuất bản', Archived: 'Đã lưu trữ', Paused: 'Tạm dừng',
  Visible: 'Đang hiển thị', Hidden: 'Đã ẩn', PickupToday: 'Giao hôm nay', ReturnToday: 'Nhận hôm nay', Overdue: 'Quá hạn',
  Order: 'Toàn đơn', Line: 'Dòng thuê', OrderAmount: 'Giá trị đơn', ParticipantCount: 'Số hành khách', RentalDays: 'Số ngày thuê',
  Percentage: 'Phần trăm', FixedAmount: 'Số tiền cố định', GiftItem: 'Tặng thiết bị', Skill: 'Kỹ năng', Location: 'Địa điểm', News: 'Tin tức',
  Reserved: 'Đang giữ chỗ', Issued: 'Đã giao', Returned: 'Đã nhận lại', LostOrException: 'Mất / sự cố', Applied: 'Đã áp dụng', Reversed: 'Đã đảo ngược',
  Collection: 'Thu tiền', Refund: 'Hoàn tiền', Succeeded: 'Thành công', Pending: 'Đang xử lý', PendingApproval: 'Chờ duyệt', Failed: 'Thất bại',
  Manual: 'Thủ công', BankTransfer: 'Chuyển khoản', Cash: 'Tiền mặt', TourFee: 'Phí tour', RentalFee: 'Phí thuê', AdditionalCharge: 'Phí phát sinh',
  Create: 'Tạo mới', Update: 'Cập nhật', Lock: 'Khóa', Unlock: 'Mở khóa', Revoke: 'Thu hồi phiên', Delete: 'Ẩn dữ liệu', Claim: 'Nhận xử lý', Cancel: 'Hủy đơn', ManualPayment: 'Thu tiền thủ công', Hide: 'Ẩn', Unhide: 'Khôi phục',
  High: 'Khẩn cấp', Medium: 'Cần xử lý',
};

export const OPS_ENUM = Object.freeze({ ADMIN: 'Admin', STAFF: 'Staff', LOCKED: 'Locked', ACTIVE: 'Active', TOUR: 'Tour', RENTAL: 'Rental', HIDDEN: 'Hidden', PUBLISHED: 'Published', DRAFT: 'Draft' });
export const options = (...values) => values.map((value) => ({ value, label: OPS_LABELS[value] ?? value }));
export const roleOptions = options('Customer', 'Staff', 'Guide', 'Admin');
export const orderStatusOptions = options('PendingPayment', 'Confirmed', 'InFulfillment', 'Completed', 'Cancelled', 'Expired');
export const paymentStatusOptions = options('Unpaid', 'PartiallyPaid', 'Paid', 'NeedsReconciliation', 'Refunded');

export const userFields = [
  { name: 'email', label: 'Email', type: 'email', required: true, maxLength: 255 },
  { name: 'fullName', label: 'Họ và tên', required: true, maxLength: 100 },
  { name: 'phone', label: 'Số điện thoại', type: 'tel' },
  { name: 'role', label: 'Vai trò', type: 'select', options: options('Staff', 'Guide'), required: true },
  { name: 'password', label: 'Mật khẩu tạm thời', type: 'password', required: true, minLength: 8, maxLength: 128, hint: 'Có chữ hoa, chữ thường, số và ký tự đặc biệt.' },
  { name: 'careerStartDate', label: 'Ngày vào nghề', type: 'date' },
];
export const profileFields = [
  { name: 'fullName', label: 'Họ và tên', required: true, maxLength: 100 },
  { name: 'phone', label: 'Số điện thoại', type: 'tel' },
  { name: 'dateOfBirth', label: 'Ngày sinh', type: 'date' },
  { name: 'address', label: 'Địa chỉ', maxLength: 500 },
  { name: 'careerStartDate', label: 'Ngày vào nghề', type: 'date' },
  { name: 'bio', label: 'Giới thiệu', type: 'textarea' },
];
export const participantFields = [
  ...profileFields.filter((field) => ['fullName', 'phone', 'dateOfBirth'].includes(field.name)),
  { name: 'emergencyContactName', label: 'Người liên hệ khẩn cấp', maxLength: 100 },
  { name: 'emergencyContactPhone', label: 'Điện thoại khẩn cấp', type: 'tel' },
  { name: 'reason', label: 'Lý do điều chỉnh', type: 'textarea', required: true, maxLength: 500 },
];

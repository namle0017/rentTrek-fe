// Value = đúng string BE serialize (xem "Phụ lục: Enum" trong BE/docs/03-API-CONTRACT.md).
export const USER_ROLE = Object.freeze({
  ADMIN: 'Admin',
  STAFF: 'Staff',
  CUSTOMER: 'Customer',
  TOUR_GUIDE: 'TourGuide',
});

export const USER_ROLE_LABEL = {
  [USER_ROLE.ADMIN]: 'Quản trị viên',
  [USER_ROLE.STAFF]: 'Nhân viên',
  [USER_ROLE.CUSTOMER]: 'Khách hàng',
  [USER_ROLE.TOUR_GUIDE]: 'Hướng dẫn viên',
};

export const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

export const TRIP_STATUS = Object.freeze({
  OPEN: 'Open',
  CLOSED: 'Closed',
});

export const TRIP_STATUS_LABEL = {
  [TRIP_STATUS.OPEN]: 'Đang mở',
  [TRIP_STATUS.CLOSED]: 'Đã đóng',
  Draft: 'Nháp',
  ClosedForBooking: 'Đã đóng bán',
  InProgress: 'Đang diễn ra',
  Completed: 'Đã hoàn thành',
  Cancelled: 'Đã hủy',
};

export const BOOKING_STATUS = Object.freeze({
  PENDING_PAYMENT: 'PendingPayment',
  CONFIRMED: 'Confirmed',
  IN_FULFILLMENT: 'InFulfillment',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
});

export const PAYMENT_STATUS = Object.freeze({
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
  NEEDS_RECONCILIATION: 'NeedsReconciliation',
});

export const ORDER_TYPE = Object.freeze({
  RENTAL: 'Rental',
  TRIP_BOOKING: 'TripBooking',
});

export const ORDER_TYPE_LABEL = {
  [ORDER_TYPE.RENTAL]: 'Thuê thiết bị',
  [ORDER_TYPE.TRIP_BOOKING]: 'Tour',
};

// Toàn bộ OrderStatus / OrderPaymentStatus (03.1 Phụ lục A) — dùng cho đơn thuê và "Đơn của tôi"
export const ORDER_STATUS_LABEL = {
  Draft: 'Nháp',
  PendingPayment: 'Chờ thanh toán',
  Confirmed: 'Đã xác nhận',
  InFulfillment: 'Đang thực hiện',
  Completed: 'Hoàn tất',
  Expired: 'Hết hạn',
  Cancelled: 'Đã hủy',
};

export const ORDER_PAYMENT_STATUS_LABEL = {
  Unpaid: 'Chưa thanh toán',
  Paid: 'Đã thanh toán',
  PartiallyRefunded: 'Hoàn một phần',
  Refunded: 'Đã hoàn tiền',
  NeedsReconciliation: 'Cần đối soát',
};

export const REFUND_CASE_STATUS = Object.freeze({
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
});

export const REFUND_CASE_STATUS_LABEL = {
  [REFUND_CASE_STATUS.REQUESTED]: 'Chờ xử lý',
  [REFUND_CASE_STATUS.APPROVED]: 'Đã gửi kế toán',
  [REFUND_CASE_STATUS.COMPLETED]: 'Hoàn tất',
  [REFUND_CASE_STATUS.REJECTED]: 'Bị từ chối',
  [REFUND_CASE_STATUS.FAILED]: 'Chuyển khoản thất bại',
  [REFUND_CASE_STATUS.CANCELLED]: 'Đã hủy',
};

// Đồng bộ whitelist RefundBankCodes ở BE
export const REFUND_BANKS = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'ICB', name: 'VietinBank' },
  { code: 'VBA', name: 'Agribank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'HDB', name: 'HDBank' },
  { code: 'VIB', name: 'VIB' },
  { code: 'SHB', name: 'SHB' },
  { code: 'MSB', name: 'MSB' },
  { code: 'OCB', name: 'OCB' },
  { code: 'SSB', name: 'SeABank' },
];

export const REFUND_CONSENT_TEXT =
  'Tôi đồng ý cung cấp thông tin tài khoản ngân hàng để RenTrekk xử lý yêu cầu hoàn tiền này. Thông tin chỉ được dùng cho việc hoàn tiền, chỉ nhân sự có thẩm quyền được truy cập và sẽ được xóa theo thời hạn lưu trữ của hệ thống.';

export const API_ERROR_CODE = Object.freeze({
  REFUND_AMOUNT_CHANGED: 'REFUND_AMOUNT_CHANGED',
});

export const PAYMENT_TRANSACTION_STATUS = Object.freeze({
  PENDING_APPROVAL: 'PendingApproval',
  PENDING: 'Pending',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
});

export const PAYMENT_TRANSACTION_STATUS_LABEL = {
  [PAYMENT_TRANSACTION_STATUS.PENDING_APPROVAL]: 'Chờ duyệt',
  [PAYMENT_TRANSACTION_STATUS.PENDING]: 'Đang xử lý',
  [PAYMENT_TRANSACTION_STATUS.SUCCEEDED]: 'Thành công',
  [PAYMENT_TRANSACTION_STATUS.FAILED]: 'Thất bại',
  [PAYMENT_TRANSACTION_STATUS.CANCELLED]: 'Đã hủy',
};

export const POST_TYPE = Object.freeze({
  GUIDE: 'Guide',
  SKILL: 'Skill',
  NEWS: 'News',
});

export const POST_TYPE_LABEL = {
  [POST_TYPE.GUIDE]: 'Hướng dẫn',
  [POST_TYPE.SKILL]: 'Kỹ năng',
  [POST_TYPE.NEWS]: 'Tin tức',
};

export const POST_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
});

export const POST_STATUS_LABEL = {
  [POST_STATUS.DRAFT]: 'Nháp',
  [POST_STATUS.PUBLISHED]: 'Đã xuất bản',
};

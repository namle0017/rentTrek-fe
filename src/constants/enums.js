// Value = đúng string BE serialize (xem "Phụ lục: Enum" trong BE/docs/03-API-CONTRACT.md).
export const USER_ROLE = Object.freeze({
  ADMIN: 'Admin',
  STAFF: 'Staff',
  CUSTOMER: 'Customer',
  GUIDE: 'Guide',
  TOUR_GUIDE: 'TourGuide',
});

export const USER_ROLE_LABEL = {
  [USER_ROLE.ADMIN]: 'Quản trị viên',
  [USER_ROLE.STAFF]: 'Nhân viên điều phối',
  [USER_ROLE.CUSTOMER]: 'Khách hàng',
  [USER_ROLE.GUIDE]: 'Hướng dẫn viên',
  [USER_ROLE.TOUR_GUIDE]: 'Hướng dẫn viên',
};

export const TRIP_STATUS = Object.freeze({
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED_FOR_BOOKING: 'ClosedForBooking',
  IN_PROGRESS: 'InProgress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
});

export const TRIP_STATUS_LABEL = {
  [TRIP_STATUS.DRAFT]: 'Bản nháp',
  [TRIP_STATUS.OPEN]: 'Đang mở bán',
  [TRIP_STATUS.CLOSED_FOR_BOOKING]: 'Đã chốt khách',
  [TRIP_STATUS.IN_PROGRESS]: 'Đang diễn ra',
  [TRIP_STATUS.COMPLETED]: 'Đã hoàn thành',
  [TRIP_STATUS.CANCELLED]: 'Đã hủy',
  Draft: 'Nháp',
  Open: 'Đang mở',
  Closed: 'Đã đóng',
  ClosedForBooking: 'Đã đóng bán',
  InProgress: 'Đang diễn ra',
  Completed: 'Đã hoàn thành',
  Cancelled: 'Đã hủy',
};

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  EXCUSED: 'Excused',
});

export const ATTENDANCE_STATUS_LABEL = {
  [ATTENDANCE_STATUS.PRESENT]: 'Có mặt',
  [ATTENDANCE_STATUS.ABSENT]: 'Vắng mặt',
  [ATTENDANCE_STATUS.LATE]: 'Đến muộn',
  [ATTENDANCE_STATUS.EXCUSED]: 'Có phép',
};

export const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

export const PAYMENT_TYPE = Object.freeze({
  COLLECTION: 'Collection',
  REFUND: 'Refund',
});

export const PAYMENT_TYPE_LABEL = {
  [PAYMENT_TYPE.COLLECTION]: 'Thu tiền',
  [PAYMENT_TYPE.REFUND]: 'Hoàn tiền',
};

export const PAYMENT_PURPOSE = Object.freeze({
  TOUR_FEE: 'TourFee',
  RENTAL_FEE: 'RentalFee',
  ADDITIONAL_CHARGE: 'AdditionalCharge',
});

export const PAYMENT_PURPOSE_LABEL = {
  [PAYMENT_PURPOSE.TOUR_FEE]: 'Tiền tour',
  [PAYMENT_PURPOSE.RENTAL_FEE]: 'Tiền thuê thiết bị',
  [PAYMENT_PURPOSE.ADDITIONAL_CHARGE]: 'Phí phạt / phát sinh',
};

export const BOOKING_STATUS = Object.freeze({
  PENDING_PAYMENT: 'PendingPayment',
  CONFIRMED: 'Confirmed',
  IN_FULFILLMENT: 'InFulfillment',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
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

export const PAYMENT_STATUS = Object.freeze({
  PENDING_APPROVAL: 'PendingApproval',
  PENDING: 'Pending',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
  NEEDS_RECONCILIATION: 'NeedsReconciliation',
});

export const PAYMENT_STATUS_LABEL = {
  [PAYMENT_STATUS.PENDING_APPROVAL]: 'Chờ duyệt',
  [PAYMENT_STATUS.PENDING]: 'Đang xử lý',
  [PAYMENT_STATUS.SUCCEEDED]: 'Thành công',
  [PAYMENT_STATUS.FAILED]: 'Thất bại',
  [PAYMENT_STATUS.CANCELLED]: 'Đã hủy',
  [PAYMENT_STATUS.UNPAID]: 'Chưa thanh toán',
  [PAYMENT_STATUS.PAID]: 'Đã thanh toán',
  [PAYMENT_STATUS.REFUNDED]: 'Đã hoàn tiền',
  [PAYMENT_STATUS.NEEDS_RECONCILIATION]: 'Cần đối soát',
};

// Alias tương thích ngược cho cả hai module
export const PAYMENT_TRANSACTION_STATUS = PAYMENT_STATUS;
export const PAYMENT_TRANSACTION_STATUS_LABEL = PAYMENT_STATUS_LABEL;

export const PAYMENT_METHOD = Object.freeze({
  BANK_TRANSFER: 'BankTransfer',
  CASH: 'Cash',
});

export const PAYMENT_METHOD_LABEL = {
  [PAYMENT_METHOD.BANK_TRANSFER]: 'Chuyển khoản (VietQR)',
  [PAYMENT_METHOD.CASH]: 'Tiền mặt',
};

export const REFUND_TAB = Object.freeze({
  PENDING_APPROVAL: 'PendingApproval',
  PENDING: 'Pending',
  FAILED: 'Failed',
  NEEDS_RECONCILIATION: 'NeedsReconciliation',
  HISTORY: 'History',
});

export const REFUND_TAB_LABEL = {
  [REFUND_TAB.PENDING_APPROVAL]: 'Chờ duyệt',
  [REFUND_TAB.PENDING]: 'Đang hoàn',
  [REFUND_TAB.FAILED]: 'Thất bại',
  [REFUND_TAB.NEEDS_RECONCILIATION]: 'Cần đối soát',
  [REFUND_TAB.HISTORY]: 'Lịch sử đã xử lý',
};

export const REFUND_POLICY_TYPE = Object.freeze({
  TOUR: 'Tour',
  RENTAL: 'Rental',
});

export const REFUND_POLICY_TYPE_LABEL = {
  [REFUND_POLICY_TYPE.TOUR]: 'Tour trekking',
  [REFUND_POLICY_TYPE.RENTAL]: 'Thuê thiết bị',
};

export const REFUND_POLICY_STATUS = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  EXPIRED: 'Expired',
});

export const REFUND_POLICY_STATUS_LABEL = {
  [REFUND_POLICY_STATUS.ACTIVE]: 'Đang áp dụng',
  [REFUND_POLICY_STATUS.INACTIVE]: 'Tạm ngưng',
  [REFUND_POLICY_STATUS.EXPIRED]: 'Hết hiệu lực',
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

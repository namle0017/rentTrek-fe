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

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

export const BOOKING_STATUS = Object.freeze({
  PENDING_PAYMENT: 'PendingPayment',
  CONFIRMED: 'Confirmed',
});

export const BOOKING_STATUS_LABEL = {
  [BOOKING_STATUS.PENDING_PAYMENT]: 'Chờ thanh toán',
  [BOOKING_STATUS.CONFIRMED]: 'Đã xác nhận',
};

export const PAYMENT_STATUS = Object.freeze({
  UNPAID: 'Unpaid',
  PAID: 'Paid',
});

export const PAYMENT_STATUS_LABEL = {
  [PAYMENT_STATUS.UNPAID]: 'Chưa thanh toán',
  [PAYMENT_STATUS.PAID]: 'Đã thanh toán',
};

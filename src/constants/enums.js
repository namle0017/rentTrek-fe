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

export const PAYMENT_STATUS = Object.freeze({
  PENDING_APPROVAL: 'PendingApproval',
  PENDING: 'Pending',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
});

export const PAYMENT_STATUS_LABEL = {
  [PAYMENT_STATUS.PENDING_APPROVAL]: 'Chờ duyệt',
  [PAYMENT_STATUS.PENDING]: 'Đang xử lý',
  [PAYMENT_STATUS.SUCCEEDED]: 'Thành công',
  [PAYMENT_STATUS.FAILED]: 'Thất bại',
  [PAYMENT_STATUS.CANCELLED]: 'Đã hủy',
};

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

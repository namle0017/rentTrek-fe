export const CUSTOMER_REPORT_SOURCE = { RENTAL: 'Rental', TRIP: 'Trip' };

export const CUSTOMER_REPORT_SOURCE_LABEL = {
  Rental: 'Đơn thuê',
  Trip: 'Chuyến đi',
};

export const CUSTOMER_REPORT_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'InProgress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

export const CUSTOMER_REPORT_STATUS_LABEL = {
  Open: 'Mới gửi',
  InProgress: 'Đang xử lý',
  Resolved: 'Đã xử lý',
  Rejected: 'Từ chối',
};

// Khớp BE CustomerReportCategories
export const RENTAL_REPORT_CATEGORY_LABEL = {
  Damaged: 'Hư hỏng / Rách / Gãy cọc',
  WrongVariant: 'Sai kích cỡ / Sai loại',
  MissingAccessory: 'Thiếu linh kiện / Phụ kiện',
  NotAsDescribed: 'Không đúng như mô tả',
  Other: 'Vấn đề khác',
};

export const TRIP_REPORT_CATEGORY_LABEL = {
  Guide: 'Hướng dẫn viên',
  Schedule: 'Lịch trình / Giờ giấc',
  Safety: 'An toàn',
  Service: 'Dịch vụ (ăn ở, di chuyển)',
  Equipment: 'Thiết bị được cấp',
  Payment: 'Thanh toán / Hoàn tiền',
  Other: 'Vấn đề khác',
};

export const PREFERRED_ACTION_LABEL = {
  Exchange: 'Đổi thiết bị khác',
  Refund: 'Hoàn tiền',
  Repair: 'Sửa chữa / Hỗ trợ tại chỗ',
  Feedback: 'Chỉ góp ý để cải thiện',
  Other: 'Khác',
};

export function categoryLabel(sourceType, category) {
  const map =
    sourceType === CUSTOMER_REPORT_SOURCE.RENTAL ? RENTAL_REPORT_CATEGORY_LABEL : TRIP_REPORT_CATEGORY_LABEL;
  return map[category] || category;
}

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

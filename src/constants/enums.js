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

// Value = đúng string BE serialize (xem "Phụ lục: Enum" trong BE/docs/03-API-CONTRACT.md).
// TODO: cập nhật khi BE chốt danh sách enum.

export const USER_ROLE = Object.freeze({
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
});

export const USER_ROLE_LABEL = {
  [USER_ROLE.ADMIN]: 'Quản trị viên',
  [USER_ROLE.CUSTOMER]: 'Khách hàng',
};

export const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

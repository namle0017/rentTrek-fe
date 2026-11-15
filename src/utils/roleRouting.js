import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';

const swapPrefix = (path, from, to) =>
  path === from || path.startsWith(`${from}/`) ? to + path.slice(from.length) : path;

/** `/admin/...` → `/staff/...` (đường dẫn khác giữ nguyên). */
export const toStaffPath = (path) => swapPrefix(path, ROUTES.ADMIN, ROUTES.STAFF);

/** `/staff/...` → `/admin/...` (đường dẫn khác giữ nguyên). */
export const toAdminPath = (path) => swapPrefix(path, ROUTES.STAFF, ROUTES.ADMIN);

/** Đường dẫn back-office đúng prefix theo vai trò: Staff ở `/staff`, Admin ở `/admin`. */
export const toBackofficePath = (path, role) =>
  role === USER_ROLE.STAFF ? toStaffPath(path) : toAdminPath(path);

/**
 * Xác định route trang chủ theo vai trò (Role-based Home Routing)
 * - Admin: Trang Tổng quan (/admin)
 * - Staff: Trang Tổng quan vận hành (/staff)
 * - Guide: Cổng Hướng dẫn viên (/guide/trips)
 * - Customer / Khách vãng lai: Trang chủ renTrek (/)
 */
export function getRoleHomeRoute(role) {
  if (role === USER_ROLE.ADMIN) return ROUTES.ADMIN;
  if (role === USER_ROLE.STAFF) return ROUTES.STAFF;
  if (role === USER_ROLE.GUIDE) {
    return ROUTES.GUIDE_TRIPS;
  }
  return ROUTES.HOME;
}

/** Admin và Staff (người trực tiếp quản lý kho) được tạo / sửa sản phẩm, biến thể và thiết bị. */
export function canManageCatalog(role) {
  return role === USER_ROLE.ADMIN || role === USER_ROLE.STAFF;
}

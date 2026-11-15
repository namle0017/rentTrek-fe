import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';

/**
 * Xác định route trang chủ theo vai trò (Role-based Home Routing)
 * - Admin / Staff: Trang Tổng quan Admin (/admin)
 * - Guide: Cổng Hướng dẫn viên (/guide/trips)
 * - Customer / Khách vãng lai: Trang chủ renTrek (/)
 */
export function getRoleHomeRoute(role) {
  if (role === USER_ROLE.ADMIN || role === USER_ROLE.STAFF) {
    return ROUTES.ADMIN;
  }
  if (role === USER_ROLE.GUIDE) {
    return ROUTES.GUIDE_TRIPS;
  }
  return ROUTES.HOME;
}

/** Admin và Staff (người trực tiếp quản lý kho) được tạo / sửa sản phẩm, biến thể và thiết bị. */
export function canManageCatalog(role) {
  return role === USER_ROLE.ADMIN || role === USER_ROLE.STAFF;
}

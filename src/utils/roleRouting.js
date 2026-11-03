import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';

/**
 * Xác định route trang chủ theo vai trò (Role-based Home Routing)
 * - Admin / Staff: Trang Tổng quan Admin (/admin)
 * - Guide / TourGuide: Cổng Hướng dẫn viên (/guide/trips)
 * - Customer / Khách vãng lai: Trang chủ renTrek (/)
 */
export function getRoleHomeRoute(role) {
  if (role === USER_ROLE.ADMIN || role === USER_ROLE.STAFF) {
    return ROUTES.ADMIN;
  }
  if (role === USER_ROLE.GUIDE || role === USER_ROLE.TOUR_GUIDE) {
    return ROUTES.GUIDE_TRIPS;
  }
  return ROUTES.HOME;
}

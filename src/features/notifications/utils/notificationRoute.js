import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';

/**
 * Đường dẫn đích khi bấm vào một thông báo, theo relatedEntityType/relatedEntityId của BE.
 * BE gửi "Order" cho cả đơn tour lẫn đơn thuê → phân biệt bằng type thông báo (Rental*).
 * Trả null khi không có trang phù hợp (chỉ đánh dấu đã đọc).
 */
export function notificationRoute(notification, role) {
  const { relatedEntityType: entity, relatedEntityId: id, type } = notification ?? {};
  if (!entity || !id) return null;

  const isAdmin = role === USER_ROLE.ADMIN || role === USER_ROLE.STAFF;
  const isGuide = role === USER_ROLE.GUIDE;
  const isRental = typeof type === 'string' && type.startsWith('Rental');

  switch (entity) {
    case 'Order':
      if (isRental) return isAdmin ? ROUTES.ADMIN_RENTAL_ORDER_DETAIL(id) : ROUTES.RENTAL_ORDER_DETAIL(id);
      return isAdmin ? ROUTES.ADMIN_ORDER(id) : ROUTES.TRIP_BOOKING_DETAIL(id);
    case 'TripBookingOrder':
      return isAdmin ? ROUTES.ADMIN_ORDER(id) : ROUTES.TRIP_BOOKING_DETAIL(id);
    case 'RentalOrder':
      return isAdmin ? ROUTES.ADMIN_RENTAL_ORDER_DETAIL(id) : ROUTES.RENTAL_ORDER_DETAIL(id);
    case 'RefundCase':
      return isAdmin ? ROUTES.ADMIN_REFUNDS : ROUTES.MY_REFUND_DETAIL(id);
    case 'Trip':
      if (isAdmin) return ROUTES.ADMIN_TRIP_DETAIL(id);
      if (isGuide) return ROUTES.GUIDE_TRIP_GROUP(id);
      return ROUTES.MY_TRIPS;
    case 'RentalReport':
      return isAdmin ? ROUTES.ADMIN_RENTAL_REPORTS : null;
    case 'CustomerReport':
      return isAdmin ? `${ROUTES.ADMIN_CUSTOMER_REPORTS}?id=${id}` : ROUTES.MY_REPORTS;
    default:
      return null;
  }
}

/** Trang thông báo theo vai trò (khách dùng layout chính, Guide/Admin dùng layout riêng). */
export function notificationsPath(role) {
  if (role === USER_ROLE.ADMIN || role === USER_ROLE.STAFF) return ROUTES.ADMIN_NOTIFICATIONS;
  if (role === USER_ROLE.GUIDE) return ROUTES.GUIDE_NOTIFICATIONS;
  return ROUTES.NOTIFICATIONS;
}

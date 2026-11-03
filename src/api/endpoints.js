// Path tương đối với VITE_API_BASE_URL (đã gồm /api/v1).
// Đồng bộ với BE/docs/03-API-CONTRACT.md — thêm / sửa API thì cập nhật cả 2 nơi.
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION_EMAIL: '/auth/resend-verification-email',
  },
  USERS: {
    ROOT: '/users',
    ME: '/users/me',
    PASSWORD: '/users/me/password',
    SESSIONS: '/users/me/sessions',
    SESSION_BY_ID: (familyId) => `/users/me/sessions/${familyId}`,
    REVOKE_OTHER_SESSIONS: '/users/me/sessions/revoke-others',
    MY_ORDERS: '/users/me/orders',
  },
  BUNDLES: {
    ROOT: '/bundles',
    BY_ID: (id) => `/bundles/${id}`,
  },
  RENTAL_AVAILABILITY: '/rental-availability',
  RENTAL_ORDERS: {
    ROOT: '/rental-orders',
    QUOTE: '/rental-orders/quote',
    BY_ID: (orderId) => `/rental-orders/${orderId}`,
  },
  PAYMENTS: {
    BY_ORDER: (orderId) => `/orders/${orderId}/payments`,
    BY_ID: (orderId, paymentId) => `/orders/${orderId}/payments/${paymentId}`,
  },
  PRODUCTS: {
    CATEGORIES: '/products/categories',
    ROOT: '/products',
    BY_ID: (id) => `/products/${id}`,
    IMAGES: (id) => `/products/${id}/images`,
  },
  TOURS: {
    ROOT: '/tours',
    BY_ID: (id) => `/tours/${id}`,
  },
  POSTS: {
    ROOT: '/posts',
    TAXONOMY: '/posts/taxonomy',
    BY_SLUG: (slug) => `/posts/${encodeURIComponent(slug)}`,
  },
  ADMIN_POSTS: {
    ROOT: '/admin/posts',
    BY_ID: (postId) => `/admin/posts/${postId}`,
  },
  ADMIN_CATALOG: {
    TOURS: '/admin/tours',
    PRODUCTS: '/admin/products',
    PRODUCT_BY_ID: (productId) => `/admin/products/${productId}`,
  },
  // Chỉ có ở môi trường Development của BE (đồng hồ giả lập)
  DEV_CLOCK: '/dev/clock',
  ADMIN_RENTAL_ORDERS: {
    ROOT: '/admin/rental-orders',
    BY_ID: (orderId) => `/admin/rental-orders/${orderId}`,
    HANDOVER: (orderId) => `/admin/rental-orders/${orderId}/handover`,
    RETURNS: (orderId) => `/admin/rental-orders/${orderId}/returns`,
    CHARGES: (orderId) => `/admin/rental-orders/${orderId}/charges`,
    ASSESS_CHARGE: (orderId, chargeId) => `/admin/rental-orders/${orderId}/charges/${chargeId}/assess`,
    VOID_CHARGE: (orderId, chargeId) => `/admin/rental-orders/${orderId}/charges/${chargeId}/void`,
    COMPLETE: (orderId) => `/admin/rental-orders/${orderId}/complete`,
  },
  TRIPS: {
    BY_ID: (tripId) => `/trips/${tripId}`,
    STATUS: (tripId) => `/trips/${tripId}/status`,
    GROUPING: (tripId) => `/trips/${tripId}/grouping`,
    GROUP_GUIDE: (tripId, groupId) => `/trips/${tripId}/groups/${groupId}/guide`,
    BOOKING_GROUP: (tripId, bookingOrderId) => `/trips/${tripId}/bookings/${bookingOrderId}/group`,
    SPLIT_BOOKING: (tripId, bookingOrderId) => `/trips/${tripId}/bookings/${bookingOrderId}/split`,
    PUBLISH_GROUPING: (tripId) => `/trips/${tripId}/grouping/publish`,
  },
  TRIP_BOOKINGS: {
    ROOT: '/trip-bookings',
    BY_ID: (orderId) => `/trip-bookings/${orderId}`,
    GROUPING: (orderId) => `/trip-bookings/${orderId}/grouping`,
    PARTICIPANT: (orderId, participantId) => `/trip-bookings/${orderId}/participants/${participantId}`,
    CANCEL: (orderId) => `/trip-bookings/${orderId}/cancel`,
    CANCELLATION_PREVIEW: (orderId) => `/trip-bookings/${orderId}/cancellation-preview`,
    INVITE_LINK: (orderId) => `/trip-bookings/${orderId}/invite-link`,
    ROTATE_INVITE_LINK: (orderId) => `/trip-bookings/${orderId}/invite-link/rotate`,
    PREVIEW_INVITATION: '/trip-bookings/participant-invitations/preview',
  },
  REFUND_CASES: {
    BY_ID: (refundCaseId) => `/refund-cases/${refundCaseId}`,
  },
  ADMIN_REFUND_CASES: {
    ROOT: '/admin/refund-cases',
    EXPORT: '/admin/refund-cases/export',
    EXPORT_CODES: '/admin/refund-cases/export/verification-codes',
    REJECT: (refundCaseId) => `/admin/refund-cases/${refundCaseId}/reject`,
    COMPLETE: (refundCaseId) => `/admin/refund-cases/${refundCaseId}/complete`,
    MARK_FAILED: (refundCaseId) => `/admin/refund-cases/${refundCaseId}/mark-failed`,
  },
};

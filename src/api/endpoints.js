// Path tương đối với VITE_API_BASE_URL (đã gồm /api/v1).
// Đồng bộ với BE/docs/03-API-CONTRACT.md — thêm / sửa API thì cập nhật cả 2 nơi.
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
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
  TRIP_BOOKINGS: {
    ROOT: '/trip-bookings',
    BY_ID: (orderId) => `/trip-bookings/${orderId}`,
    INVITATIONS: (orderId) => `/trip-bookings/${orderId}/participant-invitations`,
    CLAIM_INVITATION: '/trip-bookings/participant-invitations/claim',
  },
};

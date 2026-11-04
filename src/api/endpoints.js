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
  ASSETS: {
    ROOT: '/admin/assets',
    BULK_CREATE: '/admin/assets/bulk-create',
    VARIANTS: '/admin/assets/variants',
    BY_CODE: (code) => `/admin/assets/${code}`,
    STATUS: (code) => `/admin/assets/${code}/status`,
    HISTORY: (code) => `/admin/assets/${code}/history`,
    SCHEDULE_GANTT: '/admin/assets/schedule-gantt',
  },
  TRIP_PROVIDED_ITEMS: {
    BY_TRIP: (tripId) => `/admin/trips/${tripId}/provided-items`,
    AVAILABLE_ASSETS: (tripId, itemId) => `/admin/trips/${tripId}/provided-items/${itemId}/available-assets`,
    ASSIGN: (tripId, itemId) => `/admin/trips/${tripId}/provided-items/${itemId}/assignments`,
    UNASSIGN: (tripId, assignmentId) => `/admin/trips/${tripId}/assignments/${assignmentId}`,
    ISSUE: (tripId) => `/admin/trips/${tripId}/provided-items/issue`,
    RETURN: (tripId) => `/admin/trips/${tripId}/provided-items/return`,
  },
  RENTAL_HANDOVER: {
    HANDOVER_CHECKLIST: (orderCode) => `/admin/rental-orders/${orderCode}/handover-checklist`,
    HANDOVER_SCAN: (orderCode) => `/admin/rental-orders/${orderCode}/handover/scan`,
    HANDOVER_COMPLETE: (orderCode) => `/admin/rental-orders/${orderCode}/handover/complete`,
    RETURN_CHECKLIST: (orderCode) => `/admin/rental-orders/${orderCode}/return-checklist`,
    RETURN_SCAN: (orderCode) => `/admin/rental-orders/${orderCode}/return/scan`,
    RETURN_REPORT_LOST: (orderCode) => `/admin/rental-orders/${orderCode}/return/report-lost`,
    RETURN_COMPLETE: (orderCode) => `/admin/rental-orders/${orderCode}/return/complete`,
  },
  RENTAL_CHARGES: {
    BY_ORDER: (orderCode) => `/admin/rental-orders/${orderCode}/charges`,
    CREATE: (orderCode) => `/admin/rental-orders/${orderCode}/charges`,
    ASSESS: (id) => `/admin/rental-charges/${id}/assess`,
    VOID: (id) => `/admin/rental-charges/${id}/void`,
    COMPLETE_ORDER: (orderCode) => `/admin/rental-orders/${orderCode}/complete`,
  },
};

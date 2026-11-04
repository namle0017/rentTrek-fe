// Path tương đối với VITE_API_BASE_URL (đã gồm /api/v1).
// Đồng bộ với BE/docs/03-API-CONTRACT.md — thêm / sửa API thì cập nhật cả 2 nơi.
export const API_ENDPOINTS = {
  ADMIN: {
    DASHBOARD: { STATS: '/admin/dashboard/stats', ALERTS: '/admin/dashboard/alerts', KPIS: '/admin/dashboard/kpis' },
    USERS: '/admin/users', STAFF: '/admin/users/staff', CATEGORIES: '/admin/categories', LOCATIONS: '/admin/locations', TAGS: '/admin/tags', SOFT_SKILLS: '/admin/soft-skills',
    ORDERS: '/admin/orders', RENTALS: '/admin/rental-orders', PROMOTIONS: '/admin/promotions', POSTS: '/admin/posts', SETTINGS: '/admin/settings', AUDIT: '/admin/audit-logs', REVIEWS: '/admin/reviews',
    REPORTS: { REVENUE: '/admin/reports/revenue', OCCUPANCY: '/admin/reports/trip-occupancy', UTILIZATION: '/admin/reports/asset-utilization', REFUNDS: '/admin/reports/refunds-and-charges' },
    DETAIL: (root, id) => `${root}/${encodeURIComponent(id)}`,
    ACTION: (root, id, action) => `${root}/${encodeURIComponent(id)}/${action}`,
  },
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
};

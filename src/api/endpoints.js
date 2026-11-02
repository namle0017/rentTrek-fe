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
  // Phân hệ Tài chính & Hoàn tiền (Namle - Section 17 & 20 trong 03-API-CONTRACT.md)
  PAYMENTS: {
    ROOT: '/admin/payments',
    MANUAL_PAY: (orderId) => `/admin/orders/${orderId}/payments/manual`,
  },
  REFUNDS: {
    ROOT: '/admin/refunds',
    APPROVE: (paymentId) => `/admin/refunds/${paymentId}/approve`,
    RETRY: (paymentId) => `/admin/refunds/${paymentId}/retry`,
    MARK_MANUAL: (paymentId) => `/admin/refunds/${paymentId}/mark-manual`,
  },
  RECONCILE: {
    ACCEPT: (orderId) => `/admin/orders/${orderId}/reconcile-accept`,
    REFUND: (orderId) => `/admin/orders/${orderId}/reconcile-refund`,
  },
  REFUND_POLICIES: {
    ROOT: '/admin/refund-policies',
    BY_ID: (policyId) => `/admin/refund-policies/${policyId}`,
    RULES: (policyId) => `/admin/refund-policies/${policyId}/rules`,
    CLONE_VERSION: (policyId) => `/admin/refund-policies/${policyId}/clone-version`,
  },
};

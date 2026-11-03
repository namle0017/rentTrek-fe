// Path tương đối với VITE_API_BASE_URL (đã gồm /api/v1).
// Đồng bộ với BE/docs/03-API-CONTRACT.md — thêm / sửa API thì cập nhật cả 2 nơi.
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GOOGLE: '/auth/google',
  },
  USERS: {
    ROOT: '/users',
    ME: '/users/me',
    AVATAR: '/users/me/avatar',
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
    ADMIN_RECURRENCE: {
      BY_TOUR: (tourId) => `/admin/tours/${tourId}/recurrence-rules`,
      BY_ID: (ruleId) => `/admin/recurrence-rules/${ruleId}`,
      PREVIEW: (ruleId) => `/admin/recurrence-rules/${ruleId}/preview`,
      GENERATE: (ruleId) => `/admin/recurrence-rules/${ruleId}/generate`,
    },
    ADMIN_TRIPS: {
      ROOT: '/admin/trips',
      BY_ID: (tripId) => `/admin/trips/${tripId}`,
      READINESS_CHECKLIST: (tripId) => `/admin/trips/${tripId}/readiness-checklist`,
      OPEN_BOOKING: (tripId) => `/admin/trips/${tripId}/open-booking`,
      CLOSE_BOOKING: (tripId) => `/admin/trips/${tripId}/close-booking`,
      START: (tripId) => `/admin/trips/${tripId}/start`,
      COMPLETE: (tripId) => `/admin/trips/${tripId}/complete`,
      CANCEL: (tripId) => `/admin/trips/${tripId}/cancel`,
      BOOKINGS: (tripId) => `/admin/trips/${tripId}/bookings`,
      MANIFEST: (tripId) => `/admin/trips/${tripId}/manifest`,
      GROUPS_BOARD: (tripId) => `/admin/trips/${tripId}/groups-board`,
      GROUPS: (tripId) => `/admin/trips/${tripId}/groups`,
      GROUP_BY_ID: (tripId, groupId) => `/admin/trips/${tripId}/groups/${groupId}`,
      ASSIGN_PARTICIPANT_GROUP: (tripId) => `/admin/trips/${tripId}/participants/assign-group`,
      AUTO_GROUP: (tripId) => `/admin/trips/${tripId}/auto-group`,
      SPLIT_APPROVE: (tripId, bookingId) =>
        `/admin/trips/${tripId}/bookings/${bookingId}/split-approve`,
      ATTENDANCE_MATRIX: (tripId) => `/admin/trips/${tripId}/attendance-matrix`,
      ATTENDANCES: (tripId) => `/admin/trips/${tripId}/attendances`,
      ATTENDANCES_HISTORY: (tripId) => `/admin/trips/${tripId}/attendances/history`,
    },
    GUIDE: {
      TRIPS: '/guide/trips',
      GROUP_ROSTER: (tripId) => `/guide/trips/${tripId}/group`,
      PARTICIPANT_DETAIL: (participantId) => `/guide/participants/${participantId}`,
      BATCH_ATTENDANCE: (tripId) => `/guide/trips/${tripId}/attendances/batch`,
      ITINERARY: (tripId) => `/guide/trips/${tripId}/itinerary`,
      PROVIDED_ITEMS: (tripId) => `/guide/trips/${tripId}/provided-items`,
    },
  },
};
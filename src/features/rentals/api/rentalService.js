import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

// Contract: 03-API-CONTRACT.md §6, §7; BE/docs/03.1-API-CONTRACT-RENTAL-CUSTOMER.md
export const rentalService = {
  getBundles: (params) => axiosClient.get(API_ENDPOINTS.BUNDLES.ROOT, { params: cleanParams(params) }),
  getBundleById: (id, params) =>
    axiosClient.get(API_ENDPOINTS.BUNDLES.BY_ID(id), { params: cleanParams(params) }),
  checkAvailability: (payload) => axiosClient.post(API_ENDPOINTS.RENTAL_AVAILABILITY, payload),
  quote: (payload) => axiosClient.post(API_ENDPOINTS.RENTAL_ORDERS.QUOTE, payload),
  create: (payload, idempotencyKey) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_ORDERS.ROOT, payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  getOrderById: (orderId) => axiosClient.get(API_ENDPOINTS.RENTAL_ORDERS.BY_ID(orderId)),

  // Customer payments (VietQR SePay)
  createPayment: (orderId, payload = { paymentMethod: 'BankTransfer' }) =>
    axiosClient.post(API_ENDPOINTS.PAYMENTS.BY_ORDER(orderId), payload),
  getPaymentStatus: (orderId, paymentId) => axiosClient.get(API_ENDPOINTS.PAYMENTS.BY_ID(orderId, paymentId)),

  // Unsupported operations must return the actual API error, never simulated financial outcomes.
  getCancellationPreview: (orderId) => axiosClient.get(`/rental-orders/${orderId}/cancellation-preview`),
  cancel: (orderId, payload) => axiosClient.post(`/rental-orders/${orderId}/cancel`, payload),
  requestChargeReview: (orderId, chargeId, payload) =>
    axiosClient.post(`/rental-orders/${orderId}/charges/${chargeId}/review-requests`, payload),
};

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
  getCancellationPreview: (orderId) =>
    axiosClient.get(API_ENDPOINTS.RENTAL_ORDERS.CANCELLATION_PREVIEW(orderId)),
  // Huỷ đơn đã thanh toán theo chính sách cọc (phí do server tính, khách xác nhận số tiền đã xem ở preview)
  cancelPaid: (orderId, payload) => axiosClient.post(API_ENDPOINTS.RENTAL_ORDERS.CANCEL_PAID(orderId), payload),
  confirmReceipt: (orderId) => axiosClient.post(API_ENDPOINTS.RENTAL_ORDERS.CONFIRM_RECEIPT(orderId)),
  uploadIssuePhoto: (orderId, { file, assignmentId, note }) => {
    const form = new FormData();
    form.append('file', file);
    if (assignmentId) form.append('assignmentId', assignmentId);
    if (note) form.append('note', note);
    return axiosClient.post(API_ENDPOINTS.RENTAL_ORDERS.ISSUE_PHOTOS(orderId), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  quoteExtension: (orderId, payload) => axiosClient.post(API_ENDPOINTS.RENTAL_ORDERS.EXTENSION_QUOTE(orderId), payload),
  extend: (orderId, payload) => axiosClient.post(API_ENDPOINTS.RENTAL_ORDERS.EXTENSIONS(orderId), payload),
  getActivePolicy: () => axiosClient.get(API_ENDPOINTS.RENTAL_POLICY_ACTIVE),
  cancel: (orderId, payload) => axiosClient.post(`/rental-orders/${orderId}/cancel`, payload),
  reportItemIssue: (orderId, payload) => axiosClient.post(`/rental-orders/${orderId}/issues`, payload),
  requestChargeReview: (orderId, chargeId, payload) =>
    axiosClient.post(`/rental-orders/${orderId}/charges/${chargeId}/review-requests`, payload),
};

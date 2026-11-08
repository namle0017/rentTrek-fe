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
  getPaymentStatus: (orderId, paymentId) =>
    axiosClient.get(API_ENDPOINTS.PAYMENTS.BY_ID(orderId, paymentId)),

  // 3 API Backend chưa triển khai: tạm thời giữ mock data (contract 03.1 §5.5, §5.6, §5.7)
  getCancellationPreview: async (orderId) => {
    try {
      return await axiosClient.get(`/rental-orders/${orderId}/cancellation-preview`);
    } catch {
      return {
        data: {
          canCancel: true,
          hoursBeforeStart: 48,
          refundPolicy: { name: 'Chính sách hoàn tiền thuê thiết bị', version: 1 },
          appliedRule: { minHoursBefore: 48, refundPercentage: 100 },
          rules: [
            { minHoursBefore: 48, refundPercentage: 100 },
            { minHoursBefore: 24, refundPercentage: 50 },
            { minHoursBefore: 0, refundPercentage: 0 },
          ],
          paid: { rentalFee: 378000, deposit: 0 },
          estimatedRefund: { rentalFee: 378000, deposit: 0, total: 378000 },
          note: 'Tiền hoàn về phương thức ban đầu sau khi Quản trị viên duyệt.',
        },
      };
    }
  },

  cancel: async (orderId, payload) => {
    try {
      return await axiosClient.post(`/rental-orders/${orderId}/cancel`, payload);
    } catch {
      return {
        data: {
          orderId,
          orderCode: 'RT-MOCK-CANCELLED',
          status: 'Cancelled',
          paymentStatus: 'Paid',
          cancelledAt: new Date().toISOString(),
          refund: {
            paymentIds: ['ref-mock-01'],
            status: 'PendingApproval',
            total: payload?.expectedRefundTotal || 0,
            message: 'Yêu cầu hoàn tiền đang chờ Quản trị viên duyệt.',
          },
        },
      };
    }
  },

  requestChargeReview: async (orderId, chargeId, payload) => {
    try {
      return await axiosClient.post(`/rental-orders/${orderId}/charges/${chargeId}/review-requests`, payload);
    } catch {
      return {
        data: {
          id: `rv-mock-${Date.now()}`,
          chargeId,
          status: 'Open',
          createdAt: new Date().toISOString(),
        },
      };
    }
  },
};

import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const financeService = {
  // 17.1. Danh sách toàn bộ giao dịch tài chính (Màn O27)
  getAllPayments: (params) => axiosClient.get(API_ENDPOINTS.PAYMENTS.ROOT, { params: cleanParams(params) }),

  // 17.1b. Thẻ KPI giao dịch: { totalCollectionSucceeded, totalRefundSucceeded, netInflow, pendingCount, pendingAmount }
  getPaymentStats: () => axiosClient.get(API_ENDPOINTS.PAYMENTS.STATS),

  // 17.2. Hàng đợi yêu cầu hoàn tiền & đối soát (Màn O28)
  getRefundQueue: (tab, params) =>
    axiosClient.get(API_ENDPOINTS.REFUNDS.ROOT, { params: cleanParams({ tab, ...params }) }),

  // 17.3. Duyệt hoàn tiền tự động qua SePay (Approve)
  approveRefund: (paymentId) => axiosClient.post(API_ENDPOINTS.REFUNDS.APPROVE(paymentId)),

  // 17.4. Thử lại giao dịch hoàn tiền bị lỗi (Retry)
  retryRefund: (paymentId) => axiosClient.post(API_ENDPOINTS.REFUNDS.RETRY(paymentId)),

  // 17.5. Đánh dấu đã hoàn tiền thủ công ngoài hệ thống
  markManualRefund: (paymentId, payload) =>
    axiosClient.post(API_ENDPOINTS.REFUNDS.MARK_MANUAL(paymentId), payload),

  // 17.6. Chấp nhận khoản tiền chuyển đối soát (Reconcile Accept)
  reconcileAccept: (orderId) => axiosClient.post(API_ENDPOINTS.RECONCILE.ACCEPT(orderId)),

  // 17.7. Hoàn toàn bộ & Hủy đơn đối soát (Reconcile Refund Full)
  reconcileRefund: (orderId) => axiosClient.post(API_ENDPOINTS.RECONCILE.REFUND(orderId)),

  // Ghi nhận thanh toán thủ công: body { amount, paymentMethod, manualReference, reason }
  recordManualPayment: ({ orderCode, ...body }) =>
    axiosClient.post(API_ENDPOINTS.PAYMENTS.MANUAL_PAY(orderCode), body),
};

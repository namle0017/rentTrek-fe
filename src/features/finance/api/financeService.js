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

  // 20.1. Danh sách chính sách hoàn tiền (Màn O34)
  getRefundPolicies: () => axiosClient.get(API_ENDPOINTS.REFUND_POLICIES.ROOT),

  // 20.3. Chi tiết chính sách & bảng quy tắc
  getRefundPolicyById: (policyId) => axiosClient.get(API_ENDPOINTS.REFUND_POLICIES.BY_ID(policyId)),

  // 20.2. Tạo chính sách hoàn tiền mới
  createRefundPolicy: (payload) => axiosClient.post(API_ENDPOINTS.REFUND_POLICIES.ROOT, payload),

  // 20.4. Sửa chính sách hoàn tiền
  updateRefundPolicy: (policyId, payload) =>
    axiosClient.put(API_ENDPOINTS.REFUND_POLICIES.BY_ID(policyId), payload),

  // 20.5. Cập nhật bảng quy tắc hoàn tiền
  updateRefundPolicyRules: (policyId, rules) =>
    axiosClient.put(API_ENDPOINTS.REFUND_POLICIES.RULES(policyId), { rules }),

  // 20.6. Nhân bản chính sách sang phiên bản mới
  cloneRefundPolicyVersion: (policyId) =>
    axiosClient.post(API_ENDPOINTS.REFUND_POLICIES.CLONE_VERSION(policyId)),

  // Ghi nhận thanh toán thủ công: { orderCode, orderId, amount, paymentMethod, manualReference, reason }
  recordManualPayment: ({ orderCode, orderId, ...body } = {}) => {
    const code = orderCode || orderId;
    return axiosClient.post(API_ENDPOINTS.PAYMENTS.MANUAL_PAY(code), { orderCode: code, ...body });
  },
};

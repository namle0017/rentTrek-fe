import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const financeService = {
  // 17.1. Danh sách toàn bộ giao dịch tài chính (Màn O27)
  getAllPayments: (params) => {
    return axiosClient.get(API_ENDPOINTS.PAYMENTS.ROOT, { params: cleanParams(params) });
  },

  // Thống kê thẻ KPI giao dịch
  getPaymentStats: () => {
    return axiosClient.get(`${API_ENDPOINTS.PAYMENTS.ROOT}/stats`);
  },

  // 17.2. Hàng đợi yêu cầu hoàn tiền & đối soát (Màn O28)
  getRefundQueue: (tab, params) => {
    return axiosClient.get(API_ENDPOINTS.REFUNDS.ROOT, {
      params: cleanParams({ tab, ...params }),
    });
  },

  // 17.3. Duyệt hoàn tiền tự động qua SePay (Approve)
  approveRefund: (paymentId) => {
    return axiosClient.post(API_ENDPOINTS.REFUNDS.APPROVE(paymentId));
  },

  // 17.4. Thử lại giao dịch hoàn tiền bị lỗi (Retry)
  retryRefund: (paymentId) => {
    return axiosClient.post(API_ENDPOINTS.REFUNDS.RETRY(paymentId));
  },

  // 17.5. Đánh dấu đã hoàn tiền thủ công ngoài hệ thống
  markManualRefund: (paymentId, payload) => {
    return axiosClient.post(API_ENDPOINTS.REFUNDS.MARK_MANUAL(paymentId), payload);
  },

  // 17.6. Chấp nhận khoản tiền chuyển đối soát (Reconcile Accept)
  reconcileAccept: (orderId) => {
    return axiosClient.post(API_ENDPOINTS.RECONCILE.ACCEPT(orderId));
  },

  // 17.7. Hoàn toàn bộ & Hủy đơn đối soát (Reconcile Refund Full)
  reconcileRefund: (orderId) => {
    return axiosClient.post(API_ENDPOINTS.RECONCILE.REFUND(orderId));
  },

  // 20.1. Danh sách chính sách hoàn tiền (Màn O34)
  getRefundPolicies: () => {
    return axiosClient.get(API_ENDPOINTS.REFUND_POLICIES.ROOT);
  },

  // 20.3. Chi tiết chính sách & bảng quy tắc
  getRefundPolicyById: (policyId) => {
    return axiosClient.get(API_ENDPOINTS.REFUND_POLICIES.BY_ID(policyId));
  },

  // 20.2. Tạo chính sách hoàn tiền mới
  createRefundPolicy: (payload) => {
    return axiosClient.post(API_ENDPOINTS.REFUND_POLICIES.ROOT, payload);
  },

  // 20.4. Sửa chính sách hoàn tiền
  updateRefundPolicy: (policyId, payload) => {
    return axiosClient.put(API_ENDPOINTS.REFUND_POLICIES.BY_ID(policyId), payload);
  },

  // 20.5. Cập nhật bảng quy tắc hoàn tiền
  updateRefundPolicyRules: (policyId, rules) => {
    return axiosClient.put(API_ENDPOINTS.REFUND_POLICIES.RULES(policyId), { rules });
  },

  // 20.6. Nhân bản chính sách sang phiên bản mới
  cloneRefundPolicyVersion: (policyId) => {
    return axiosClient.post(API_ENDPOINTS.REFUND_POLICIES.CLONE_VERSION(policyId));
  },

  // Ghi nhận thanh toán thủ công ngoài hệ thống (Màn O15 hỗ trợ Khoa)
  recordManualPayment: (payload) => {
    return axiosClient.post(API_ENDPOINTS.PAYMENTS.MANUAL_PAY(payload.orderId), payload);
  },
};

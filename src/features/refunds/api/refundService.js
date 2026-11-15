import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

const { REFUND_CASES, ADMIN_REFUND_CASES } = API_ENDPOINTS;

export const refundService = {
  getById: (refundCaseId) => axiosClient.get(REFUND_CASES.BY_ID(refundCaseId)),
  // Khách nhập STK cho hồ sơ đang chờ (no-show, hoàn cọc sau khi trả đồ)
  submitBankInfo: ({ refundCaseId, payload }) => axiosClient.post(REFUND_CASES.BANK_INFO(refundCaseId), payload),

  getAdminQueue: (params) => axiosClient.get(ADMIN_REFUND_CASES.ROOT, { params: cleanParams(params) }),
  requestExportCode: () => axiosClient.post(ADMIN_REFUND_CASES.EXPORT_CODES),
  exportExcel: (payload) => axiosClient.post(ADMIN_REFUND_CASES.EXPORT, payload, { responseType: 'blob' }),
  reject: ({ refundCaseId, payload }) => axiosClient.post(ADMIN_REFUND_CASES.REJECT(refundCaseId), payload),
  complete: ({ refundCaseId, payload }) =>
    axiosClient.post(ADMIN_REFUND_CASES.COMPLETE(refundCaseId), payload),
  markFailed: ({ refundCaseId, payload }) =>
    axiosClient.post(ADMIN_REFUND_CASES.MARK_FAILED(refundCaseId), payload),
};

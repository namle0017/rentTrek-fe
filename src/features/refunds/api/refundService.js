import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

const { REFUND_CASES, ADMIN_REFUND_CASES, REFUNDS } = API_ENDPOINTS;

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 };
// File Excel có ảnh + upload chứng từ có thể lâu hơn timeout mặc định 15s
const IMPORT_UPLOAD = { ...MULTIPART, timeout: 180000 };

export const refundService = {
  getById: (refundCaseId) => axiosClient.get(REFUND_CASES.BY_ID(refundCaseId)),
  /** Hồ sơ hoàn tiền của khách đang đăng nhập; status có thể là nhiều giá trị cách nhau bởi dấu phẩy. */
  getMine: (params) => axiosClient.get(REFUND_CASES.ROOT, { params: cleanParams(params) }),
  /** Gửi lại yêu cầu (kèm STK mới) cho hồ sơ bị từ chối / thất bại. */
  resubmit: ({ refundCaseId, payload }) => axiosClient.post(REFUND_CASES.RESUBMIT(refundCaseId), payload),
  /** Khách nhập (lại) tài khoản nhận hoàn cho hồ sơ đang chờ STK. */
  submitBankInfo: ({ refundCaseId, payload }) => axiosClient.post(REFUND_CASES.BANK_INFO(refundCaseId), payload),

  getAdminQueue: (params) => axiosClient.get(ADMIN_REFUND_CASES.ROOT, { params: cleanParams(params) }),
  requestExportCode: () => axiosClient.post(ADMIN_REFUND_CASES.EXPORT_CODES),
  exportExcel: (payload) => axiosClient.post(ADMIN_REFUND_CASES.EXPORT, payload, { responseType: 'blob' }),
  /** payload: { expectedRowVersion, note? } — Requested → Approved (Admin/Staff). */
  approve: ({ refundCaseId, payload }) => axiosClient.post(ADMIN_REFUND_CASES.APPROVE(refundCaseId), payload),
  reject: ({ refundCaseId, payload }) => axiosClient.post(ADMIN_REFUND_CASES.REJECT(refundCaseId), payload),
  /** formData: providerTransactionId, expectedRowVersion, files (1..3 ảnh chứng từ). */
  complete: ({ refundCaseId, formData }) =>
    axiosClient.post(ADMIN_REFUND_CASES.COMPLETE(refundCaseId), formData, MULTIPART),
  markFailed: ({ refundCaseId, payload }) =>
    axiosClient.post(ADMIN_REFUND_CASES.MARK_FAILED(refundCaseId), payload),

  /** Nhập file Excel kết quả của kế toán; dryRun=true chỉ xem trước, không ghi DB. */
  importResult: (file, dryRun) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dryRun', String(Boolean(dryRun)));
    return axiosClient.post(ADMIN_REFUND_CASES.IMPORT_RESULT, formData, IMPORT_UPLOAD);
  },

  /** Tải ảnh chứng từ (cần token nên không dùng <img src> trực tiếp); interceptor trả về Blob. */
  fetchProofBlob: (path) => axiosClient.get(path, { responseType: 'blob' }),

  // Luồng hoàn tiền thủ công theo payment (không qua hồ sơ)
  getManualRefunds: (params) => axiosClient.get(REFUNDS.ROOT, { params: cleanParams(params) }),
  markManual: ({ paymentId, formData }) =>
    axiosClient.post(REFUNDS.MARK_MANUAL(paymentId), formData, MULTIPART),
};

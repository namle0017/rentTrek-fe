import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

const { ADMIN_RENTAL_ORDERS: URLS } = API_ENDPOINTS;

export const rentalOpsService = {
  getAll: (params) => axiosClient.get(URLS.ROOT, { params: cleanParams(params) }),
  getById: (orderId) => axiosClient.get(URLS.BY_ID(orderId)),
  // assignmentIds rỗng = giao toàn bộ thiết bị đang giữ
  handover: ({ orderId, assignmentIds }) => axiosClient.post(URLS.HANDOVER(orderId), { assignmentIds }),
  returnAssets: ({ orderId, items }) => axiosClient.post(URLS.RETURNS(orderId), { items }),
  createCharge: ({ orderId, payload }) => axiosClient.post(URLS.CHARGES(orderId), payload),
  assessCharge: ({ orderId, chargeId }) => axiosClient.post(URLS.ASSESS_CHARGE(orderId, chargeId)),
  voidCharge: ({ orderId, chargeId, reason }) => axiosClient.post(URLS.VOID_CHARGE(orderId, chargeId), { reason }),
  // Admin: quyết toán cọc (staff dùng submitReturnReport)
  complete: ({ orderId }) => axiosClient.post(URLS.COMPLETE(orderId)),
  // Ảnh bằng chứng: stage = Handover | Return | Damage; ảnh giao / nhận phải gắn assignmentId
  uploadEvidence: ({ orderId, file, stage, assignmentId, note }) => {
    const form = new FormData();
    form.append('file', file);
    form.append('stage', stage);
    if (assignmentId) form.append('assignmentId', assignmentId);
    if (note) form.append('note', note);
    return axiosClient.post(URLS.EVIDENCE_PHOTOS(orderId), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteEvidence: ({ orderId, photoId }) => axiosClient.delete(URLS.EVIDENCE_PHOTO(orderId, photoId)),
  reportNoShow: ({ orderId, note }) => axiosClient.post(URLS.NO_SHOW(orderId), { note }),
  submitReturnReport: ({ orderId, note }) => axiosClient.post(URLS.REPORTS(orderId), { note }),
};

const { ADMIN_RENTAL_REPORTS: REPORTS } = API_ENDPOINTS;

export const rentalReportService = {
  getAll: (params) => axiosClient.get(REPORTS.ROOT, { params: cleanParams(params) }),
  getById: (reportId) => axiosClient.get(REPORTS.BY_ID(reportId)),
  approve: ({ reportId, reviewNote, expectedRowVersion }) =>
    axiosClient.post(REPORTS.APPROVE(reportId), { reviewNote, expectedRowVersion }),
  reject: ({ reportId, reviewNote, expectedRowVersion }) =>
    axiosClient.post(REPORTS.REJECT(reportId), { reviewNote, expectedRowVersion }),
};

import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

const { ADMIN_RENTAL_ORDERS: URLS } = API_ENDPOINTS;

export const rentalOpsService = {
  getAll: (params) => axiosClient.get(URLS.ROOT, { params: cleanParams(params) }),
  getById: (orderId) => axiosClient.get(URLS.BY_ID(orderId)),
  // kind: 'handover' | 'return'; date = YYYY-MM-DD (bỏ trống = hôm nay)
  getSchedule: (kind, date) =>
    axiosClient.get(kind === 'return' ? URLS.RETURN_LIST : URLS.HANDOVER_LIST, { params: cleanParams({ date }) }),
  exportScheduleCsv: (kind, date) =>
    axiosClient.get(kind === 'return' ? URLS.RETURN_LIST : URLS.HANDOVER_LIST, {
      params: cleanParams({ date, format: 'csv' }),
      responseType: 'blob',
    }),
  getAdjustments: (orderId) => axiosClient.get(URLS.ADJUSTMENTS(orderId)),
  claim: ({ orderId }) => axiosClient.post(URLS.CLAIM(orderId)),
  // assignmentIds rỗng = giao toàn bộ thiết bị đang giữ
  handover: ({ orderId, assignmentIds }) => axiosClient.post(URLS.HANDOVER(orderId), { assignmentIds }),
  returnAssets: ({ orderId, items }) => axiosClient.post(URLS.RETURNS(orderId), { items }),
  createCharge: ({ orderId, payload }) => axiosClient.post(URLS.CHARGES(orderId), payload),
  assessCharge: ({ orderId, chargeId }) => axiosClient.post(URLS.ASSESS_CHARGE(orderId, chargeId)),
  voidCharge: ({ orderId, chargeId, reason }) => axiosClient.post(URLS.VOID_CHARGE(orderId, chargeId), { reason }),
  complete: ({ orderId }) => axiosClient.post(URLS.COMPLETE(orderId)),
};

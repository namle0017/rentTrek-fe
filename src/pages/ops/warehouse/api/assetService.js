import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const assetService = {
  getAll: (params) => axiosClient.get(API_ENDPOINTS.ASSETS.ROOT, { params: cleanParams(params) }),
  getByCode: (code) => axiosClient.get(API_ENDPOINTS.ASSETS.BY_CODE(code)),
  bulkCreate: (payload) => axiosClient.post(API_ENDPOINTS.ASSETS.BULK_CREATE, payload),
  updateStatus: (code, payload) => axiosClient.patch(API_ENDPOINTS.ASSETS.STATUS(code), payload),
  getHistory: (code) => axiosClient.get(API_ENDPOINTS.ASSETS.HISTORY(code)),
  getGantt: (params) => axiosClient.get(API_ENDPOINTS.ASSETS.SCHEDULE_GANTT, { params: cleanParams(params) }),
};

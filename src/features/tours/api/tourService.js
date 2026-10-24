import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const tourService = {
  getAll: (params) => axiosClient.get(API_ENDPOINTS.TOURS.ROOT, { params: cleanParams(params) }),
  getById: (id) => axiosClient.get(API_ENDPOINTS.TOURS.BY_ID(id)),
};

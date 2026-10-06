import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const userService = {
  getMe: () => axiosClient.get(API_ENDPOINTS.USERS.ME),
  updateMe: (payload) => axiosClient.put(API_ENDPOINTS.USERS.ME, payload),
  getAll: (params) => axiosClient.get(API_ENDPOINTS.USERS.ROOT, { params: cleanParams(params) }),
};

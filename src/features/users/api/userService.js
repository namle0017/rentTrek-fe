import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const userService = {
  getMe: () => axiosClient.get(API_ENDPOINTS.USERS.ME),
  updateMe: (payload) => axiosClient.put(API_ENDPOINTS.USERS.ME, payload),
  changePassword: (payload) => axiosClient.put(API_ENDPOINTS.USERS.PASSWORD, payload),
  getSessions: () => axiosClient.get(API_ENDPOINTS.USERS.SESSIONS),
  revokeSession: (familyId) => axiosClient.delete(API_ENDPOINTS.USERS.SESSION_BY_ID(familyId)),
  revokeOtherSessions: () => axiosClient.post(API_ENDPOINTS.USERS.REVOKE_OTHER_SESSIONS),
  getAll: (params) => axiosClient.get(API_ENDPOINTS.USERS.ROOT, { params: cleanParams(params) }),
};

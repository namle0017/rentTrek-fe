import axiosClient from '@/api/axiosClient';
import { cleanParams } from '@/utils/cleanParams';

export const opsService = {
  get: (endpoint, params) => axiosClient.get(endpoint, { params: cleanParams(params) }),
  write: ({ endpoint, method = 'post', body }) => axiosClient.request({ url: endpoint, method, data: body }),
};

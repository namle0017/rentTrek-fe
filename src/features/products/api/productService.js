import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const productService = {
  getAll: (params) => axiosClient.get(API_ENDPOINTS.PRODUCTS.ROOT, { params: cleanParams(params) }),
  getById: (id) => axiosClient.get(API_ENDPOINTS.PRODUCTS.BY_ID(id)),
  create: (payload) => axiosClient.post(API_ENDPOINTS.PRODUCTS.ROOT, payload),
  update: (id, payload) => axiosClient.put(API_ENDPOINTS.PRODUCTS.BY_ID(id), payload),
  remove: (id) => axiosClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id)),
};

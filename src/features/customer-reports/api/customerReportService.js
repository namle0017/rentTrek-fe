import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

const { CUSTOMER_REPORTS: CUSTOMER } = API_ENDPOINTS;
const ADMIN = API_ENDPOINTS.ADMIN.CUSTOMER_REPORTS;

export const customerReportKeys = {
  all: ['customer-reports'],
  mine: (orderId) => ['customer-reports', 'mine', orderId ?? 'all'],
  adminList: (params) => ['customer-reports', 'admin', 'list', params],
  adminDetail: (id) => ['customer-reports', 'admin', 'detail', id],
  summary: ['customer-reports', 'admin', 'summary'],
};

export const customerReportService = {
  uploadImage: (file) => {
    const form = new FormData();
    form.append('file', file);
    return axiosClient.post(CUSTOMER.IMAGES, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  create: (payload) => axiosClient.post(CUSTOMER.ROOT, payload),
  getMine: (orderId) => axiosClient.get(CUSTOMER.MINE, { params: cleanParams({ orderId }) }),

  adminGetAll: (params) => axiosClient.get(ADMIN.ROOT, { params: cleanParams(params) }),
  adminGetSummary: () => axiosClient.get(ADMIN.SUMMARY),
  adminGetById: (id) => axiosClient.get(ADMIN.BY_ID(id)),
  adminUpdateStatus: ({ id, status, adminNote }) =>
    axiosClient.patch(ADMIN.STATUS(id), { status, adminNote }),
};

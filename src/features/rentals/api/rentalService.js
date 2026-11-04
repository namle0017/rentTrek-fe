import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

// Contract: BE/docs/03.1-API-CONTRACT-RENTAL-CUSTOMER.md §4.4–4.6, §5.1, §5.2, §5.4
export const rentalService = {
  getBundles: (params) => axiosClient.get(API_ENDPOINTS.BUNDLES.ROOT, { params: cleanParams(params) }),
  getBundleById: (id, params) =>
    axiosClient.get(API_ENDPOINTS.BUNDLES.BY_ID(id), { params: cleanParams(params) }),
  checkAvailability: (payload) => axiosClient.post(API_ENDPOINTS.RENTAL_AVAILABILITY, payload),
  quote: (payload) => axiosClient.post(API_ENDPOINTS.RENTAL_ORDERS.QUOTE, payload),
  create: (payload, idempotencyKey) =>
    axiosClient.post(API_ENDPOINTS.RENTAL_ORDERS.ROOT, payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  getOrderById: (orderId) => axiosClient.get(API_ENDPOINTS.RENTAL_ORDERS.BY_ID(orderId)),
};

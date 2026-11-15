import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';

// Contract: BE/docs/03.1-API-CONTRACT-RENTAL-CUSTOMER.md §4.7
export const promotionService = {
  getAvailable: () => axiosClient.get(API_ENDPOINTS.PROMOTIONS),
};

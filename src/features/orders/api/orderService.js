import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

// Dùng chung cho đơn thuê và đơn tour — contract 03.1 §5.3, §6.1, §6.2
export const orderService = {
  getMyOrders: (params) =>
    axiosClient.get(API_ENDPOINTS.USERS.MY_ORDERS, { params: cleanParams(params) }),
  createPayment: (orderId) =>
    axiosClient.post(API_ENDPOINTS.PAYMENTS.BY_ORDER(orderId), { paymentMethod: 'BankTransfer' }),
  getPayment: (orderId, paymentId) =>
    axiosClient.get(API_ENDPOINTS.PAYMENTS.BY_ID(orderId, paymentId)),
};

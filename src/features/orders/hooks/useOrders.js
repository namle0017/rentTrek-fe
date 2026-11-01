import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { PAYMENT_TRANSACTION_STATUS } from '@/constants/enums';
import { orderKeys } from '../api/orderKeys';
import { orderService } from '../api/orderService';

const PAYMENT_POLL_MS = 5000; // contract §6.2: poll mỗi 5 giây

export function useMyOrders(params, options) {
  return useQuery({
    queryKey: orderKeys.myList(params),
    queryFn: () => orderService.getMyOrders(params),
    select: (res) => res.data, // PagedResult
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useCreatePayment() {
  return useMutation({ mutationFn: orderService.createPayment });
}

/** Poll trạng thái tới khi hết `Pending` (thành công / thất bại / hủy). */
export function usePaymentStatus(orderId, paymentId) {
  return useQuery({
    queryKey: orderKeys.payment(orderId, paymentId),
    queryFn: () => orderService.getPayment(orderId, paymentId),
    select: (res) => res.data,
    enabled: Boolean(orderId && paymentId),
    refetchInterval: (query) =>
      query.state.data?.data?.status === PAYMENT_TRANSACTION_STATUS.PENDING ? PAYMENT_POLL_MS : false,
  });
}

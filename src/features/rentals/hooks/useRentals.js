import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { orderKeys } from '@/features/orders/api/orderKeys';
import { rentalKeys } from '../api/rentalKeys';
import { rentalService } from '../api/rentalService';

export function useBundles(params) {
  return useQuery({
    queryKey: rentalKeys.bundleList(params),
    queryFn: () => rentalService.getBundles(params),
    select: (res) => res.data, // PagedResult
    placeholderData: keepPreviousData,
  });
}

export function useBundle(id) {
  return useQuery({
    queryKey: rentalKeys.bundleDetail(id),
    queryFn: () => rentalService.getBundleById(id),
    select: (res) => res.data,
    enabled: Boolean(id),
  });
}

export function useRentalAvailability() {
  return useMutation({ mutationFn: rentalService.checkAvailability });
}

// Báo giá không lưu gì phía server → dùng mutation, gọi lại mỗi lần khách đổi lựa chọn
export function useRentalQuote() {
  return useMutation({ mutationFn: rentalService.quote });
}

export function useCreateRentalOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }) => rentalService.create(payload, idempotencyKey),
    onSuccess: (res) => {
      queryClient.setQueryData(rentalKeys.orderDetail(res.data.id), res);
      queryClient.invalidateQueries({ queryKey: orderKeys.myLists() });
      toast.success(res.message || 'Đã tạo đơn thuê.');
    },
  });
}

export function useRentalOrder(orderId) {
  return useQuery({
    queryKey: rentalKeys.orderDetail(orderId),
    queryFn: () => rentalService.getOrderById(orderId),
    select: (res) => res.data,
    enabled: Boolean(orderId),
  });
}

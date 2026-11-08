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

// 3 API Backend chưa triển khai: giữ mock data/fallback
export function useRentalCancellationPreview(orderId) {
  return useQuery({
    queryKey: ['rental', 'cancellationPreview', orderId],
    queryFn: () => rentalService.getCancellationPreview(orderId),
    select: (res) => res.data,
    enabled: Boolean(orderId),
  });
}

export function useCancelRentalOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }) => rentalService.cancel(orderId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: rentalKeys.orderDetail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.myLists() });
      toast.success(res.data?.message || 'Đã gửi yêu cầu hủy đơn thuê.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn thuê.');
    },
  });
}

export function useRequestRentalChargeReview() {
  return useMutation({
    mutationFn: ({ orderId, chargeId, payload }) =>
      rentalService.requestChargeReview(orderId, chargeId, payload),
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu kiểm tra lại phí.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu kiểm tra lại phí.');
    },
  });
}

export function useCreateRentalPayment() {
  return useMutation({
    mutationFn: ({ orderId, payload }) => rentalService.createPayment(orderId, payload),
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Khởi tạo thanh toán thất bại.');
    },
  });
}

export function useRentalPaymentStatus(orderId, paymentId, options = {}) {
  return useQuery({
    queryKey: ['rental', 'paymentStatus', orderId, paymentId],
    queryFn: () => rentalService.getPaymentStatus(orderId, paymentId),
    select: (res) => res.data,
    enabled: Boolean(orderId && paymentId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'Succeeded' || status === 'Failed' || status === 'Cancelled') {
        return false;
      }
      return 3000;
    },
    ...options,
  });
}

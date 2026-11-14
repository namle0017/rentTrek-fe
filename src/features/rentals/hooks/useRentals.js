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
      queryClient.invalidateQueries({ queryKey: ['rentals', 'availability'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', 'quote'] });
      toast.success(res.message || 'Đã tạo đơn thuê.');
    },
  });
}

export function useRentalOrder(orderId, options = {}) {
  return useQuery({
    queryKey: rentalKeys.orderDetail(orderId),
    queryFn: () => rentalService.getOrderById(orderId),
    select: (res) => res.data,
    enabled: Boolean(orderId),
    ...options,
  });
}

// Báo giá huỷ đơn đã thanh toán: phí theo chính sách cọc, chỉ tải khi khách mở hộp huỷ
export function useRentalCancellationPreview(orderId, options = {}) {
  return useQuery({
    queryKey: ['rental', 'cancellationPreview', orderId],
    queryFn: () => rentalService.getCancellationPreview(orderId),
    select: (res) => res.data,
    enabled: Boolean(orderId),
    staleTime: 0,
    ...options,
  });
}

function useOrderMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: rentalKeys.orderDetail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.myLists() });
      toast.success(res?.message || successMessage);
    },
  });
}

export function useCancelPaidRentalOrder() {
  return useOrderMutation(
    ({ orderId, payload }) => rentalService.cancelPaid(orderId, payload),
    'Đã huỷ đơn thuê.',
  );
}

export function useConfirmRentalReceipt() {
  return useOrderMutation(({ orderId }) => rentalService.confirmReceipt(orderId), 'Đã xác nhận nhận đồ.');
}

export function useRentalExtensionQuote() {
  return useMutation({ mutationFn: ({ orderId, payload }) => rentalService.quoteExtension(orderId, payload) });
}

export function useExtendRentalOrder() {
  return useOrderMutation(
    ({ orderId, payload }) => rentalService.extend(orderId, payload),
    'Đã tạo yêu cầu gia hạn.',
  );
}

export function useActiveRentalPolicy() {
  return useQuery({
    queryKey: [...rentalKeys.all, 'policy', 'active'],
    queryFn: rentalService.getActivePolicy,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCancelRentalOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }) => rentalService.cancel(orderId, payload),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(rentalKeys.orderDetail(variables.orderId), res);
      queryClient.invalidateQueries({ queryKey: rentalKeys.orderDetail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.myLists() });
      queryClient.invalidateQueries({ queryKey: ['rentals', 'availability'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', 'quote'] });
      toast.success(res.message || 'Đã hủy đơn thuê chưa thanh toán.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn thuê.');
    },
  });
}

export function useReportRentalIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }) => rentalService.reportItemIssue(orderId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: rentalKeys.orderDetail(variables.orderId) });
      toast.success(res?.message || 'Báo cáo sự cố thiết bị đã được gửi tới Quản lý kho RenTrek.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Không thể gửi báo cáo sự cố.');
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
      toast.error(err.message || 'Khởi tạo thanh toán thất bại.');
    },
  });
}

// additional = khoản thu sau khi đơn đã trả (gia hạn / phí vượt cọc): chỉ dừng khi chính khoản đó có kết quả
export function useRentalPaymentStatus(orderId, paymentId, options = {}, additional = false) {
  return useQuery({
    queryKey: ['rental', 'paymentStatus', orderId, paymentId],
    queryFn: () => rentalService.getPaymentStatus(orderId, paymentId),
    select: (res) => res.data,
    enabled: Boolean(orderId && paymentId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      const paymentStatus = query.state.data?.data?.orderPaymentStatus;
      if (!additional && paymentStatus && paymentStatus !== 'Unpaid') return false;
      if (status === 'Succeeded' || status === 'Failed' || status === 'Cancelled') {
        return false;
      }
      return 3000;
    },
    ...options,
  });
}

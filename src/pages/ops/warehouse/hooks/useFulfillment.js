import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { fulfillmentService } from '../api/fulfillmentService';
import { assetKeys } from '../api/assetKeys';

export const fulfillmentKeys = {
  all: ['fulfillment'],
  handover: (orderCode) => [...fulfillmentKeys.all, 'handover', orderCode],
  return: (orderCode) => [...fulfillmentKeys.all, 'return', orderCode],
  charges: (orderCode) => [...fulfillmentKeys.all, 'charges', orderCode],
};

// Handover (O24)
export function useHandoverChecklist(orderCode) {
  return useQuery({
    queryKey: fulfillmentKeys.handover(orderCode),
    queryFn: () => fulfillmentService.getHandoverChecklist(orderCode),
    select: (res) => res.data,
    enabled: Boolean(orderCode),
  });
}

export function useHandoverScan(orderCode) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => fulfillmentService.scanHandover(orderCode, payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Quét giao thiết bị thành công');
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.handover(orderCode) });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi quét thiết bị';
      toast.error(msg);
    },
  });
}

export function useCompleteHandover(orderCode) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => fulfillmentService.completeHandover(orderCode, payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Hoàn tất bàn giao đơn thuê thành công');
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.handover(orderCode) });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi hoàn tất bàn giao';
      toast.error(msg);
    },
  });
}

// Return (O25)
export function useReturnChecklist(orderCode) {
  return useQuery({
    queryKey: fulfillmentKeys.return(orderCode),
    queryFn: () => fulfillmentService.getReturnChecklist(orderCode),
    select: (res) => res.data,
    enabled: Boolean(orderCode),
  });
}

export function useReturnScan(orderCode) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => fulfillmentService.scanReturn(orderCode, payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Nhận lại thiết bị thành công');
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.return(orderCode) });
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.charges(orderCode) });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi nhận lại thiết bị';
      toast.error(msg);
    },
  });
}

export function useReportLostAsset(orderCode) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => fulfillmentService.reportLostAsset(orderCode, payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã ghi nhận báo mất thiết bị và tạo phí đền bù');
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.return(orderCode) });
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.charges(orderCode) });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi ghi nhận báo mất';
      toast.error(msg);
    },
  });
}

export function useCompleteReturn(orderCode) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => fulfillmentService.completeReturn(orderCode, payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Hoàn tất thu hồi thiết bị');
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.return(orderCode) });
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.charges(orderCode) });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi hoàn tất thu hồi';
      toast.error(msg);
    },
  });
}

// Charges & Settlement (O26)
export function useRentalCharges(orderCode) {
  return useQuery({
    queryKey: fulfillmentKeys.charges(orderCode),
    queryFn: () => fulfillmentService.getRentalCharges(orderCode),
    select: (res) => res.data,
    enabled: Boolean(orderCode),
  });
}

export function useCreateRentalCharge(orderCode) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => fulfillmentService.createRentalCharge(orderCode, payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Tạo phí phát sinh thành công');
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.charges(orderCode) });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi tạo phí phát sinh';
      toast.error(msg);
    },
  });
}

export function useAssessRentalCharge(orderCode) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chargeId) => fulfillmentService.assessRentalCharge(chargeId),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã chốt phí phát sinh (Assessed)');
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.charges(orderCode) });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi chốt phí phát sinh';
      toast.error(msg);
    },
  });
}

export function useVoidRentalCharge(orderCode) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chargeId, payload }) => fulfillmentService.voidRentalCharge(chargeId, payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã hủy phí phát sinh');
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.charges(orderCode) });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi hủy phí';
      toast.error(msg);
    },
  });
}

export function useCompleteOrder(orderCode) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fulfillmentService.completeOrder(orderCode),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã nghiệm thu và đóng hoàn tất đơn thuê');
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.charges(orderCode) });
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.handover(orderCode) });
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.return(orderCode) });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi đóng đơn thuê';
      toast.error(msg);
    },
  });
}

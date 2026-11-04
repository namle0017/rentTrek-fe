import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { financeKeys } from '../api/financeKeys';
import { financeService } from '../api/financeService';

export function usePayments(params) {
  return useQuery({
    queryKey: financeKeys.paymentList(params),
    queryFn: () => financeService.getAllPayments(params),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: financeKeys.paymentStats(),
    queryFn: financeService.getPaymentStats,
    select: (res) => res.data,
  });
}

export function useRecordManualPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => financeService.recordManualPayment(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Ghi nhận thanh toán thủ công thành công');
      queryClient.invalidateQueries({ queryKey: financeKeys.paymentLists() });
      queryClient.invalidateQueries({ queryKey: financeKeys.paymentStats() });
    },
    onError: (err) => {
      toast.error(err.message || 'Không thể ghi nhận thanh toán thủ công');
    },
  });
}

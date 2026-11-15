import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { refundKeys } from '../api/refundKeys';
import { refundService } from '../api/refundService';

export function useManualRefunds(params) {
  return useQuery({
    queryKey: refundKeys.manual(params),
    queryFn: () => refundService.getManualRefunds(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  });
}

export function useMarkManualRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refundService.markManual,
    onSuccess: (response) => toast.success(response.message || 'Đã ghi nhận hoàn tiền thủ công'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: refundKeys.manuals() }),
  });
}

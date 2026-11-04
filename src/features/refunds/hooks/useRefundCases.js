import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { refundKeys } from '../api/refundKeys';
import { refundService } from '../api/refundService';

export function useRefundCase(refundCaseId) {
  return useQuery({
    queryKey: refundKeys.detail(refundCaseId),
    queryFn: () => refundService.getById(refundCaseId),
    select: (response) => response.data,
    enabled: Boolean(refundCaseId),
  });
}

export function useRefundQueue(params) {
  return useQuery({
    queryKey: refundKeys.queue(params),
    queryFn: () => refundService.getAdminQueue(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  });
}

/** Thao tác hàng đợi: luôn tải lại danh sách, kể cả khi lỗi vì người khác vừa xử lý cùng hồ sơ. */
function useQueueMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (response) => {
      if (response.message) toast.success(response.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: refundKeys.queues() }),
    ...options,
  });
}

export function useRejectRefund() {
  return useQueueMutation(refundService.reject);
}

export function useCompleteRefund() {
  return useQueueMutation(refundService.complete);
}

export function useMarkRefundFailed() {
  return useQueueMutation(refundService.markFailed);
}

export function useRequestExportCode() {
  return useMutation({ mutationFn: refundService.requestExportCode });
}

// gcTime 0: file chứa số tài khoản đầy đủ, không giữ lại trong mutation cache
export function useExportRefunds() {
  return useQueueMutation(refundService.exportExcel, { gcTime: 0, onSuccess: undefined });
}

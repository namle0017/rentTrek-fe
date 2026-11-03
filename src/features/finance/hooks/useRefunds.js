import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { financeKeys } from '../api/financeKeys';
import { financeService } from '../api/financeService';

export function useRefundQueue(tab, params) {
  return useQuery({
    queryKey: financeKeys.refundQueue(tab, params),
    queryFn: () => financeService.getRefundQueue(tab, params),
    select: (res) => res.data,
  });
}

export function useApproveRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId) => financeService.approveRefund(paymentId),
    onSuccess: (res) => {
      toast.success(res.message || 'Duyệt hoàn tiền qua SePay thành công');
      queryClient.invalidateQueries({ queryKey: financeKeys.refunds() });
      queryClient.invalidateQueries({ queryKey: financeKeys.payments() });
    },
    onError: (err) => {
      if (err.statusCode === 429) {
        toast.warning('Đã vượt quá 10 thao tác duyệt / 60 giây. Vui lòng chờ giây lát.');
      } else {
        toast.error(err.message || 'Lỗi khi duyệt lệnh hoàn tiền');
      }
    },
  });
}

export function useRetryRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId) => financeService.retryRefund(paymentId),
    onSuccess: (res) => {
      toast.success(res.message || 'Đã gửi lệnh thử lại qua SePay');
      queryClient.invalidateQueries({ queryKey: financeKeys.refunds() });
      queryClient.invalidateQueries({ queryKey: financeKeys.payments() });
    },
    onError: (err) => {
      toast.error(err.message || 'Không thể thử lại giao dịch hoàn tiền');
    },
  });
}

export function useMarkManualRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, payload }) => financeService.markManualRefund(paymentId, payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Đã ghi nhận hoàn tiền thủ công');
      queryClient.invalidateQueries({ queryKey: financeKeys.refunds() });
      queryClient.invalidateQueries({ queryKey: financeKeys.payments() });
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi ghi nhận hoàn tiền thủ công');
    },
  });
}

export function useReconcileAccept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => financeService.reconcileAccept(orderId),
    onSuccess: (res) => {
      toast.success(res.message || 'Đã chấp nhận khoản tiền và hoàn tất đối soát');
      queryClient.invalidateQueries({ queryKey: financeKeys.refunds() });
      queryClient.invalidateQueries({ queryKey: financeKeys.payments() });
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi chấp nhận khoản tiền đối soát');
    },
  });
}

export function useReconcileRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => financeService.reconcileRefund(orderId),
    onSuccess: (res) => {
      toast.success(res.message || 'Đã hoàn toàn bộ tiền và đóng đơn hàng');
      queryClient.invalidateQueries({ queryKey: financeKeys.refunds() });
      queryClient.invalidateQueries({ queryKey: financeKeys.payments() });
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi hoàn tiền và hủy đơn');
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { financeKeys } from '../api/financeKeys';
import { financeService } from '../api/financeService';

export function useRefundPolicies() {
  return useQuery({
    queryKey: financeKeys.policyLists(),
    queryFn: financeService.getRefundPolicies,
    select: (res) => res.data,
  });
}

export function useRefundPolicy(policyId) {
  return useQuery({
    queryKey: financeKeys.policyDetail(policyId),
    queryFn: () => financeService.getRefundPolicyById(policyId),
    select: (res) => res.data,
    enabled: Boolean(policyId),
  });
}

export function useCreateRefundPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => financeService.createRefundPolicy(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Tạo chính sách hoàn tiền thành công');
      queryClient.invalidateQueries({ queryKey: financeKeys.policyLists() });
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi tạo chính sách hoàn tiền');
    },
  });
}

export function useUpdateRefundPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, payload }) => financeService.updateRefundPolicy(policyId, payload),
    onSuccess: (res, { policyId }) => {
      toast.success(res.message || 'Cập nhật chính sách thành công');
      queryClient.invalidateQueries({ queryKey: financeKeys.policyLists() });
      queryClient.invalidateQueries({ queryKey: financeKeys.policyDetail(policyId) });
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi cập nhật chính sách');
    },
  });
}

export function useUpdateRefundPolicyRules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, rules }) => financeService.updateRefundPolicyRules(policyId, rules),
    onSuccess: (res, { policyId }) => {
      toast.success(res.message || 'Cập nhật bảng quy tắc hoàn tiền thành công');
      queryClient.invalidateQueries({ queryKey: financeKeys.policyLists() });
      queryClient.invalidateQueries({ queryKey: financeKeys.policyDetail(policyId) });
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi cập nhật quy tắc hoàn tiền');
    },
  });
}

export function useCloneRefundPolicyVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policyId) => financeService.cloneRefundPolicyVersion(policyId),
    onSuccess: (res) => {
      toast.success(res.message || 'Nhân bản phiên bản mới thành công');
      queryClient.invalidateQueries({ queryKey: financeKeys.policyLists() });
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi nhân bản chính sách');
    },
  });
}

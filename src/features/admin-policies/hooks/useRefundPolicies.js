import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { policyKeys } from '../api/policyKeys';
import policyService from '../api/policyService';

export function useRefundPolicyList(params) {
  return useQuery({
    queryKey: policyKeys.refundList(params),
    queryFn: () => policyService.getRefundPolicies(params),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  });
}

export function useRefundPolicy(id) {
  return useQuery({
    queryKey: policyKeys.refundDetail(id),
    queryFn: () => policyService.getRefundPolicy(id),
    select: (res) => res.data,
    enabled: Boolean(id),
  });
}

function useRefundMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (res) => {
      toast.success(res?.message || successMessage);
      queryClient.invalidateQueries({ queryKey: policyKeys.refund() });
      // Dropdown tạo chuyến đi phụ thuộc danh sách chính sách đang áp dụng
      queryClient.invalidateQueries({ queryKey: ['admin-trips', 'active-refund-policies'] });
    },
    onError: (err) => {
      toast.error(err?.message || 'Thao tác thất bại');
    },
  });
}

export const useCreateRefundPolicy = () =>
  useRefundMutation((payload) => policyService.createRefundPolicy(payload), 'Đã tạo chính sách hoàn tiền');
export const useUpdateRefundPolicy = () =>
  useRefundMutation(({ id, payload }) => policyService.updateRefundPolicy(id, payload), 'Đã lưu thay đổi');
export const useCloneRefundPolicy = () =>
  useRefundMutation((id) => policyService.cloneRefundPolicy(id), 'Đã tạo phiên bản mới (bản nháp)');
export const useActivateRefundPolicy = () =>
  useRefundMutation((id) => policyService.activateRefundPolicy(id), 'Đã áp dụng chính sách');
export const useArchiveRefundPolicy = () =>
  useRefundMutation((id) => policyService.archiveRefundPolicy(id), 'Đã ngừng áp dụng chính sách');
export const useDeleteRefundPolicy = () =>
  useRefundMutation((id) => policyService.deleteRefundPolicy(id), 'Đã xoá chính sách');

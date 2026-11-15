import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { policyKeys } from '../api/policyKeys';
import policyService from '../api/policyService';

export function useRentalPolicyList() {
  return useQuery({
    queryKey: policyKeys.rentalList(),
    queryFn: () => policyService.getRentalPolicies(),
    select: (res) => res.data,
  });
}

export function useRentalPolicy(id) {
  return useQuery({
    queryKey: policyKeys.rentalDetail(id),
    queryFn: () => policyService.getRentalPolicy(id),
    select: (res) => res.data,
    enabled: Boolean(id),
  });
}

export function useActiveRentalPolicy(enabled = true) {
  return useQuery({
    queryKey: policyKeys.rentalActive(),
    queryFn: () => policyService.getActiveRentalPolicy(),
    select: (res) => res.data,
    enabled,
  });
}

export function useCreateRentalPolicyVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => policyService.createRentalPolicyVersion(payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã tạo phiên bản chính sách thuê đồ mới');
      queryClient.invalidateQueries({ queryKey: policyKeys.rental() });
    },
    onError: (err) => {
      toast.error(err?.message || 'Không tạo được phiên bản mới');
    },
  });
}

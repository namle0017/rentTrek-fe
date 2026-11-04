import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { opsService } from '@/features/operations/api/opsService';
import { opsKeys } from '@/features/operations/api/opsKeys';

export function useOperations(endpoint, params, enabled = true) {
  return useQuery({
    queryKey: opsKeys.resource(endpoint, params),
    queryFn: () => opsService.get(endpoint, params),
    select: (response) => response.data,
    enabled: Boolean(endpoint) && enabled,
  });
}

export function useWriteOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: opsService.write,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: opsKeys.all });
    },
  });
}

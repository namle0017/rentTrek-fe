import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userKeys } from '../api/userKeys';
import { userService } from '../api/userService';

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (familyId) => userService.revokeSession(familyId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions() });
      toast.success(response?.message || 'Đã đăng xuất thiết bị thành công');
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể đăng xuất thiết bị, vui lòng thử lại');
    },
  });
}

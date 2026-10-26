import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userKeys } from '../api/userKeys';
import { userService } from '../api/userService';

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.revokeOtherSessions(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions() });
      toast.success(response?.message || 'Đã đăng xuất khỏi tất cả các thiết bị khác');
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể đăng xuất các thiết bị khác, vui lòng thử lại');
    },
  });
}

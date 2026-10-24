import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userKeys } from '../api/userKeys';
import { userService } from '../api/userService';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => userService.updateMe(payload),
    onSuccess: (response) => {
      // response là body ApiResponse<UserDetailResponse>
      queryClient.setQueryData(userKeys.me(), response);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      toast.success(response.message || 'Cập nhật thông tin cá nhân thành công!');
    },
    onError: (error) => {
      toast.error(error.message || 'Cập nhật thông tin thất bại');
    },
  });
}

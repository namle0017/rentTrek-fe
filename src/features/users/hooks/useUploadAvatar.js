import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userService } from '../api/userService';
import { userKeys } from '../api/userKeys';

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.uploadAvatar,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      toast.success(res.message || 'Cập nhật ảnh đại diện thành công!');
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể tải lên ảnh đại diện');
    },
  });
}

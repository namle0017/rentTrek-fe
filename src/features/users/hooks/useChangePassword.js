import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userService } from '../api/userService';

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload) => userService.changePassword(payload),
    onSuccess: (response) => {
      toast.success(
        response?.message || 'Đổi mật khẩu thành công. Các phiên trên thiết bị khác đã được đăng xuất an toàn.',
      );
    },
    onError: (error) => {
      toast.error(error.message || 'Đổi mật khẩu thất bại, vui lòng thử lại.');
    },
  });
}

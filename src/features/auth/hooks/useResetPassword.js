import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { authService } from '../api/authService';

export function useResetPassword() {
  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (res) => {
      toast.success(res.message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
    },
    onError: (error) => {
      toast.error(error.message || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.');
    },
  });
}

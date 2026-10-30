import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { authService } from '../api/authService';

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (res) => {
      toast.success(res.message || 'Mã xác thực OTP đã được gửi đến email của bạn!');
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể gửi mã xác thực. Vui lòng thử lại sau.');
    },
  });
}

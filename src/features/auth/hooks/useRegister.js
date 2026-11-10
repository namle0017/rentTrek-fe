import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { authService } from '../api/authService';

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (res) => {
      toast.success(
        res.message || 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực OTP.',
      );
    },
  });
}

import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '../api/authService';

export function useRegister() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (res) => {
      login(res.data); // { accessToken, refreshToken, user } — theo API Contract
      toast.success(res.message || 'Đăng ký tài khoản thành công! Chào mừng bạn đến với renTrek');
    },
  });
}

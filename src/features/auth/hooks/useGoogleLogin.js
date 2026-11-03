import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '../api/authService';

export function useGoogleLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: authService.googleLogin,
    onSuccess: (res) => {
      login(res.data);
      toast.success(res.message || 'Đăng nhập Google thành công! Chào mừng bạn đến với renTrek');
    },
    onError: (error) => {
      toast.error(error.message || 'Đăng nhập Google thất bại');
    },
  });
}

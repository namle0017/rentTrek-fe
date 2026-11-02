import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '../api/authService';

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      // Hỗ trợ cả res.data lẫn res (nếu axios client trả trực tiếp)
      login(res?.data || res);
      toast.success(res?.message || 'Đăng nhập thành công');
    },
  });
}

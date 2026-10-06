import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '../api/authService';

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      login(res.data); // { accessToken, refreshToken } — theo API Contract
      toast.success(res.message);
    },
  });
}

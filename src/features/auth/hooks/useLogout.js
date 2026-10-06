import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { tokenStorage } from '@/utils/tokenStorage';
import { authService } from '../api/authService';

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout({ refreshToken: tokenStorage.getRefreshToken() }),
    // Gọi API logout lỗi thì vẫn đăng xuất ở FE, không cần báo lỗi
    meta: { skipGlobalErrorToast: true },
    onSettled: () => {
      logout();
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });
}

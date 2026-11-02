import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

/**
 * Chặn route cần đăng nhập. `roles` (tuỳ chọn): chỉ cho các role này vào.
 * Hỗ trợ so khớp role không phân biệt hoa thường để tránh lỗi lệch format giữa FE và BE.
 */
export default function ProtectedRoute({ roles }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner fullScreen />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;

  if (roles && roles.length > 0) {
    const userRole = String(currentUser?.role || '').toLowerCase();
    const isAllowed = roles.some((r) => String(r).toLowerCase() === userRole);
    if (!isAllowed) {
      return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }
  }

  return <Outlet />;
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

/**
 * Chặn route cần đăng nhập. `roles` (tuỳ chọn): chỉ cho các role này vào.
 * Chỉ để trải nghiệm — chặn thật do BE (401/403).
 */
export default function ProtectedRoute({ roles }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner fullScreen />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  if (roles && !roles.includes(currentUser.role)) return <Navigate to={ROUTES.FORBIDDEN} replace />;

  return <Outlet />;
}

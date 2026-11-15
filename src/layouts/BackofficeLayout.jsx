import { Navigate, useLocation } from 'react-router-dom';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import { toBackofficePath } from '@/utils/roleRouting';
import AdminLayout from './AdminLayout';
import StaffLayout from './StaffLayout';

/**
 * Chọn layout back-office theo vai trò: Staff dùng StaffLayout dưới `/staff`, Admin dùng AdminLayout dưới `/admin`.
 * Link nội bộ vẫn trỏ `/admin/...`; vào sai prefix thì chuyển sang prefix của vai trò.
 */
export default function BackofficeLayout() {
  const { currentUser } = useAuth();
  const { pathname, search, hash } = useLocation();
  const isStaff = currentUser?.role?.toLowerCase() === USER_ROLE.STAFF.toLowerCase();

  const target = toBackofficePath(pathname, isStaff ? USER_ROLE.STAFF : USER_ROLE.ADMIN);
  if (target !== pathname) return <Navigate to={`${target}${search}${hash}`} replace />;

  return isStaff ? <StaffLayout /> : <AdminLayout />;
}

import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from './AdminLayout';
import StaffLayout from './StaffLayout';

/** Chọn layout back-office theo vai trò: Staff dùng StaffLayout, Admin dùng AdminLayout (cùng URL). */
export default function BackofficeLayout() {
  const { currentUser } = useAuth();
  const isStaff = currentUser?.role?.toLowerCase() === USER_ROLE.STAFF.toLowerCase();
  return isStaff ? <StaffLayout /> : <AdminLayout />;
}

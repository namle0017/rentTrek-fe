import BackofficeShell from './BackofficeShell';
import { ADMIN_NAV } from './navigation';

export default function AdminLayout() {
  return <BackofficeShell nav={ADMIN_NAV} fallbackName="Quản trị viên" />;
}

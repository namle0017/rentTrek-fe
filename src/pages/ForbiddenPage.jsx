import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getRoleHomeRoute } from '@/utils/roleRouting';

export default function ForbiddenPage() {
  const { currentUser } = useAuth();
  const homeRoute = getRoleHomeRoute(currentUser?.role);

  return (
    <div className="status-page">
      <h1>403</h1>
      <p>Bạn không có quyền truy cập trang này.</p>
      <Link to={homeRoute} className="btn btn-primary">
        Về trang chủ
      </Link>
    </div>
  );
}

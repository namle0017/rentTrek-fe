import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getRoleHomeRoute } from '@/utils/roleRouting';

export default function NotFoundPage() {
  const { currentUser } = useAuth();
  const homeRoute = getRoleHomeRoute(currentUser?.role);

  return (
    <div className="status-page">
      <h1>404</h1>
      <p>Trang bạn tìm không tồn tại.</p>
      <Link to={homeRoute} className="btn btn-primary">
        Về trang chủ
      </Link>
    </div>
  );
}

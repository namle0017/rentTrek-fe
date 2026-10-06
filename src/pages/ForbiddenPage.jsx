import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function ForbiddenPage() {
  return (
    <div className="status-page">
      <h1>403</h1>
      <p>Bạn không có quyền truy cập trang này.</p>
      <Link to={ROUTES.HOME} className="btn btn-primary">
        Về trang chủ
      </Link>
    </div>
  );
}

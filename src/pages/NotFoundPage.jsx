import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <div className="status-page">
      <h1>404</h1>
      <p>Trang bạn tìm không tồn tại.</p>
      <Link to={ROUTES.HOME} className="btn btn-primary">
        Về trang chủ
      </Link>
    </div>
  );
}

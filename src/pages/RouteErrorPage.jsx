import { Link, useRouteError } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/** Hiển thị khi component trong route bị lỗi lúc render (thay cho màn hình lỗi mặc định của React Router). */
export default function RouteErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="status-page">
      <h1>Đã có lỗi xảy ra</h1>
      <p>Vui lòng tải lại trang hoặc thử lại sau.</p>
      <Link to={ROUTES.HOME} className="btn btn-primary">
        Về trang chủ
      </Link>
    </div>
  );
}

import { Link, useRouteError } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getRoleHomeRoute } from '@/utils/roleRouting';

/** Hiển thị khi component trong route bị lỗi lúc render (thay cho màn hình lỗi mặc định của React Router). */
export default function RouteErrorPage() {
  const error = useRouteError();
  console.error(error);
  const { currentUser } = useAuth();
  const homeRoute = getRoleHomeRoute(currentUser?.role);

  return (
    <div className="status-page">
      <h1>Đã có lỗi xảy ra</h1>
      <p>Vui lòng tải lại trang hoặc thử lại sau.</p>
      <Link to={homeRoute} className="btn btn-primary">
        Về trang chủ
      </Link>
    </div>
  );
}

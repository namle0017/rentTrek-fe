import { Link, NavLink, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { currentUser } = useAuth();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          renTrek Admin
        </Link>
        <nav className={styles.nav}>
          <NavLink to={ROUTES.ADMIN} end>
            Tổng quan
          </NavLink>
          <NavLink to={ROUTES.ADMIN_PRODUCT_CREATE}>Thêm sản phẩm</NavLink>
        </nav>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>Xin chào, {currentUser?.fullName ?? currentUser?.email}</header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

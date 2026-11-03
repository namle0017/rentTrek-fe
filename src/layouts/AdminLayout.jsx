import { NavLink, Outlet } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import DevClockBar from './DevClockBar';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div style={{ padding: '0 0 16px 8px' }}>
          <BrandLogo size="md" theme="light" suffix="Admin" />
        </div>
        <nav className={styles.nav}>
          {isAdmin && (
            <>
              <NavLink to={ROUTES.ADMIN} end>
                Tổng quan
              </NavLink>
              <NavLink to={ROUTES.ADMIN_TOURS}>Tour</NavLink>
              <NavLink to={ROUTES.ADMIN_PRODUCTS}>Sản phẩm</NavLink>
              <NavLink to={ROUTES.ADMIN_REFUNDS}>Hoàn tiền</NavLink>
            </>
          )}
          <NavLink to={ROUTES.ADMIN_RENTAL_ORDERS}>Đơn thuê</NavLink>
          <NavLink to={ROUTES.ADMIN_POSTS}>Bài viết</NavLink>
        </nav>
      </aside>

      <div className={styles.content}>
        <DevClockBar />
        <header className={styles.header}>Xin chào, {currentUser?.fullName ?? currentUser?.email}</header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

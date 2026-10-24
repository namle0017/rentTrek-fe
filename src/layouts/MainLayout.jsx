import { Link, NavLink, Outlet } from 'react-router-dom';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAuth } from '@/hooks/useAuth';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const { currentUser, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  const handleLogoutClick = () => logoutMutation.mutate();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link to={ROUTES.HOME} className={styles.logo}>
            renTrek
          </Link>
          <nav className={styles.nav}>
            <NavLink to={ROUTES.PRODUCTS}>Sản phẩm</NavLink>
            <NavLink to={ROUTES.TOURS}>Tour Trekking</NavLink>
            {currentUser?.role === USER_ROLE.ADMIN && <NavLink to={ROUTES.ADMIN}>Quản trị</NavLink>}
            {isAuthenticated ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleLogoutClick}
                disabled={logoutMutation.isPending}
              >
                Đăng xuất
              </button>
            ) : (
              <Link to={ROUTES.LOGIN} className="btn btn-primary">
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className={`container ${styles.main}`}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className="container">© {new Date().getFullYear()} renTrek</div>
      </footer>
    </div>
  );
}

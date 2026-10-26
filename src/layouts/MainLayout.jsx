import { Link, NavLink, Outlet } from 'react-router-dom';
import { USER_ROLE, USER_ROLE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAuth } from '@/hooks/useAuth';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const { currentUser, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  const handleLogoutClick = () => logoutMutation.mutate();

  const getRoleBadgeClass = (role) => {
    if (role === USER_ROLE.ADMIN) return `${styles.roleBadge} ${styles.roleBadgeAdmin}`;
    if (role === USER_ROLE.STAFF) return `${styles.roleBadge} ${styles.roleBadgeStaff}`;
    if (role === USER_ROLE.TOUR_GUIDE) return `${styles.roleBadge} ${styles.roleBadgeTourGuide}`;
    return styles.roleBadge;
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link to={ROUTES.HOME} className={styles.logo}>
            ▲ renTrek
          </Link>

          <nav className={styles.nav}>
            <NavLink to={ROUTES.PRODUCTS}>Sản phẩm</NavLink>
            <NavLink to={ROUTES.TOURS}>Tour Trekking</NavLink>
            <NavLink to={ROUTES.HOME}>Trang chủ</NavLink>
            <NavLink to={ROUTES.PRODUCTS}>Sản phẩm & Đồ thuê</NavLink>
            {currentUser?.role === USER_ROLE.ADMIN && <NavLink to={ROUTES.ADMIN}>Quản trị</NavLink>}

            <div className={styles.authSection}>
              {isAuthenticated ? (
                <>
                  <div className={styles.userInfo}>
                    <Link to={ROUTES.PROFILE} className={styles.userNameLink} title="Xem hồ sơ cá nhân">
                      <span className={styles.userAvatar}>
                        {(currentUser?.fullName || currentUser?.email || 'U')[0].toUpperCase()}
                      </span>
                      <span className={styles.userName}>{currentUser?.fullName || currentUser?.email}</span>
                    </Link>
                    {currentUser?.role && (
                      <span className={getRoleBadgeClass(currentUser.role)}>
                        {USER_ROLE_LABEL[currentUser.role] || currentUser.role}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleLogoutClick}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? 'Đang thoát...' : 'Đăng xuất'}
                  </button>
                </>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} className="btn btn-outline">
                    Đăng nhập
                  </Link>
                  <Link to={ROUTES.REGISTER} className="btn btn-primary">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className={`container ${styles.main}`}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className="container">© {new Date().getFullYear()} renTrek — Nền tảng Cho thuê Thiết bị & Tour Trekking</div>
      </footer>
    </div>
  );
}

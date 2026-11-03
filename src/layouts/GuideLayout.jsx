import { Link, NavLink, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/features/guide/pages/GuidePortal.module.css';

export default function GuideLayout() {
  const { currentUser } = useAuth();

  return (
    <div className={styles.guideShell}>
      <header className={styles.topHeader}>
        <Link to={ROUTES.GUIDE_TRIPS} className={styles.brand}>
          🧭 RenTrek Field Guide
        </Link>
        <div className={styles.userPill}>
          <span>{currentUser?.fullName ?? currentUser?.email ?? 'Guide'}</span>
          <Link to={ROUTES.GUIDE_TRIPS} className={styles.homeLink}>
            Trang chủ
          </Link>
        </div>
      </header>

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <nav className={styles.bottomNav}>
        <NavLink
          to={ROUTES.GUIDE_TRIPS}
          className={({ isActive }) =>
            `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`
          }
        >
          📋 Lịch dẫn đoàn (G01)
        </NavLink>
        <NavLink
          to={ROUTES.PROFILE}
          className={({ isActive }) =>
            `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`
          }
        >
          👤 Hồ sơ cá nhân
        </NavLink>
      </nav>
    </div>
  );
}

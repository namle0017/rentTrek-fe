import { Link, NavLink, Outlet } from 'react-router-dom';
import { USER_ROLE, USER_ROLE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/features/guide/pages/GuidePortal.module.css';

export default function GuideLayout() {
  const { currentUser } = useAuth();
  const isAdminOrStaff =
    currentUser?.role === USER_ROLE.ADMIN || currentUser?.role === USER_ROLE.STAFF;

  return (
    <div className={styles.guideShell}>
      {/* Top Header hỗ trợ cả Desktop lẫn Mobile */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeftGroup}>
          <Link to={ROUTES.GUIDE_TRIPS} className={styles.brand}>
            <span className={styles.brandIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </span>
            <span>renTrek Field Guide</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className={styles.desktopNav} aria-label="Điều hướng cổng Guide">
            <NavLink
              to={ROUTES.GUIDE_TRIPS}
              end
              className={({ isActive }) =>
                `${styles.desktopNavLink} ${isActive ? styles.desktopNavLinkActive : ''}`
              }
            >
              Lịch dẫn đoàn
            </NavLink>
            <NavLink
              to={ROUTES.PROFILE}
              className={({ isActive }) =>
                `${styles.desktopNavLink} ${isActive ? styles.desktopNavLinkActive : ''}`
              }
            >
              Hồ sơ cá nhân
            </NavLink>
          </nav>
        </div>

        <div className={styles.headerRightGroup}>
          {/* Nút thoát về Quản trị Admin nếu user là Admin hoặc Staff */}
          {isAdminOrStaff && (
            <Link to={ROUTES.ADMIN} className={styles.adminSwitchBtn} title="Quay lại giao diện Admin">
              ← Quay lại Quản trị Admin
            </Link>
          )}

          <div className={styles.userPill}>
            <span className={styles.userFullName}>
              {currentUser?.fullName ?? currentUser?.email ?? 'Guide'}
            </span>
            {currentUser?.role && (
              <span className={styles.userRoleTag}>
                {USER_ROLE_LABEL[currentUser.role] ?? currentUser.role}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Vùng nội dung chính co giãn theo viewport */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Bottom Nav: Chỉ hiển thị trên Mobile (< 768px), tự động ẩn trên Desktop */}
      <nav className={styles.bottomNav} aria-label="Điều hướng mobile">
        <NavLink
          to={ROUTES.GUIDE_TRIPS}
          end
          className={({ isActive }) =>
            `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`
          }
        >
          <span>Lịch dẫn đoàn</span>
        </NavLink>

        <NavLink
          to={ROUTES.PROFILE}
          className={({ isActive }) =>
            `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`
          }
        >
          <span>Hồ sơ</span>
        </NavLink>

        {isAdminOrStaff && (
          <NavLink
            to={ROUTES.ADMIN}
            className={({ isActive }) =>
              `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`
            }
          >
            <span>Về Admin</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}

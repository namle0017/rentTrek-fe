import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';
import OutdoorIcon from '@/components/OutdoorIcon';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import PortalSidebar from './components/PortalSidebar';
import { GUIDE_NAV } from './navigation';
import styles from './GuideLayout.module.css';

function getGuidePageTitle(pathname) {
  if (pathname === ROUTES.GUIDE || pathname === ROUTES.GUIDE_TRIPS) return 'Lịch dẫn đoàn thực địa';
  if (pathname.includes('/group')) return 'Thành viên & Khách đoàn';
  if (pathname.includes('/attendance')) return 'Điểm danh nhanh thực địa';
  if (pathname.includes('/itinerary')) return 'Lịch trình đoàn';
  if (pathname.includes('/provided-items')) return 'Đồ cấp cho đoàn';
  if (pathname.startsWith('/guide/participants/')) return 'Thông tin thành viên';
  if (pathname === ROUTES.GUIDE_PROFILE) return 'Hồ sơ cá nhân';
  if (pathname === ROUTES.GUIDE_NOTIFICATIONS) return 'Thông báo';
  return 'Cổng Hướng dẫn viên';
}

export default function GuideLayout() {
  const { currentUser } = useAuth();
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const dropdownRef = useRef(null);

  const pageTitle = getGuidePageTitle(location.pathname);
  const displayName = currentUser?.fullName || currentUser?.email || 'Hướng dẫn viên';
  const initial = (displayName[0] || 'G').toUpperCase();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate(ROUTES.LOGIN, { replace: true }),
    });
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar dùng chung kiểu với Admin/Staff (ẩn dưới 1024px, thay bằng thanh điều hướng đáy) */}
      <PortalSidebar nav={GUIDE_NAV} className={styles.guideSidebar} ariaLabel="Điều hướng chính Guide" />

      {/* ===== Vùng Content ===== */}
      <div className={styles.content}>
        {/* Top Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {/* Mobile Brand (Ẩn trên Desktop) */}
            <Link to={ROUTES.GUIDE_TRIPS} className={styles.mobileBrand}>
              <BrandLogo size="sm" theme="light" suffix="Guide" to={ROUTES.GUIDE_TRIPS} />
            </Link>

            {/* Desktop Page Title (Ẩn trên Mobile) */}
            <h1 className={styles.headerTitle}>{pageTitle}</h1>
          </div>

          <div className={styles.headerRight}>
            {/* Network Offline/Online Indicator */}
            <span
              className={styles.networkStatusBadge}
              title={isOnline ? 'Đang kết nối Internet' : 'Mất kết nối mạng - Chế độ thực địa Offline'}
            >
              <span
                className={styles.networkDot}
                style={{ backgroundColor: isOnline ? '#22c55e' : '#f59e0b' }}
              />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </span>

            <NotificationBell />

            {/* Mobile User Pill */}
            <Link to={ROUTES.GUIDE_PROFILE} className={styles.mobileUserPill}>
              <span>{displayName.split(' ').slice(-1)[0]}</span>
            </Link>

            {/* Desktop User Dropdown */}
            <div className={styles.userDropdownWrapper} ref={dropdownRef}>
              <button
                type="button"
                className={styles.userTriggerBtn}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
              >
                <span className={styles.triggerAvatar} aria-hidden="true">
                  {initial}
                </span>
                <span className={styles.displayName}>{displayName}</span>
                <OutdoorIcon name={isDropdownOpen ? 'chevronUp' : 'chevron'} size={12} />
              </button>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <Link
                    to={ROUTES.GUIDE_PROFILE}
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <OutdoorIcon name="user" size={14} />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className={styles.main}>
          <Outlet />
        </main>

        {/* Mobile Fixed Bottom Navigation Bar (< 1024px) */}
        <nav className={styles.bottomNav} aria-label="Thanh điều hướng di động">
          <NavLink
            to={ROUTES.GUIDE_TRIPS}
            end
            className={({ isActive }) =>
              `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`
            }
          >
            <OutdoorIcon name="compass" size={20} />
            <span>Lịch đoàn</span>
          </NavLink>

          <NavLink
            to={ROUTES.GUIDE_PROFILE}
            className={({ isActive }) =>
              `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`
            }
          >
            <OutdoorIcon name="user" size={20} />
            <span>Hồ sơ</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}

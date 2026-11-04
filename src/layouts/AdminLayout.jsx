import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE_LABEL } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import styles from './AdminLayout.module.css';

function getPageTitle(pathname) {
  if (pathname === ROUTES.ADMIN) return 'Tổng quan';
  if (pathname === ROUTES.ADMIN_PROFILE) return 'Thông tin cá nhân';
  if (pathname === ROUTES.ADMIN_TRIP_CREATE) return 'Tạo chuyến đi mới';
  if (pathname === ROUTES.ADMIN_TRIPS) return 'Quản lý chuyến đi';
  if (pathname.startsWith(`${ROUTES.ADMIN_TRIPS}/`)) return 'Điều hành chuyến đi';
  if (pathname.includes('/recurrence-rules')) return 'Quy tắc lịch lặp chuyến';
  if (pathname === ROUTES.ADMIN_PRODUCT_CREATE) return 'Thêm sản phẩm';
  if (pathname === ROUTES.OPS_TRANSACTIONS) return 'Giao dịch';
  if (pathname === ROUTES.OPS_REFUNDS) return 'Hoàn tiền & Đối soát';
  if (pathname === ROUTES.OPS_REFUND_POLICY_CREATE) return 'Tạo chính sách hoàn tiền';
  if (pathname.startsWith(ROUTES.OPS_REFUND_POLICIES)) return 'Chính sách hoàn tiền';
  if (pathname === ROUTES.OPS_ASSETS) return 'Quản lý kho thiết bị';
  if (pathname === ROUTES.OPS_ASSETS_SCHEDULE) return 'Lịch Gantt thiết bị';
  if (pathname.includes('/provided-items')) return 'Chuẩn bị đồ cấp chuyến';
  return 'Quản trị hệ thống';
}

export default function AdminLayout() {
  const { currentUser } = useAuth();
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);
  const displayName = currentUser?.fullName || currentUser?.email || 'Quản trị viên';

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
      <aside className={styles.sidebar}>
        <Link to={ROUTES.ADMIN} className={styles.logo}>
          renTrek Admin
        </Link>
        <nav className={styles.nav}>
          <NavLink to={ROUTES.ADMIN} end>
            Tổng quan
          </NavLink>
          <NavLink to={ROUTES.ADMIN_TRIPS}>Quản lý chuyến đi</NavLink>
          <NavLink to={ROUTES.ADMIN_PRODUCT_CREATE}>Thêm sản phẩm</NavLink>

          <div className={styles.sectionHeader}>Tài chính</div>
          <NavLink to={ROUTES.OPS_TRANSACTIONS}>Giao dịch</NavLink>
          <NavLink to={ROUTES.OPS_REFUNDS}>Hoàn tiền & Đối soát</NavLink>
          <NavLink to={ROUTES.OPS_REFUND_POLICIES}>Chính sách hoàn tiền</NavLink>

          <div className={styles.sectionHeader}>Kho & Thiết bị</div>
          <NavLink to={ROUTES.OPS_ASSETS}>Kho thiết bị</NavLink>
          <NavLink to={ROUTES.OPS_ASSETS_SCHEDULE}>Lịch Gantt thiết bị</NavLink>
          <NavLink to="/ops/trips/provided-items">Đồ cấp chuyến</NavLink>

          <div className={styles.sectionHeader}>Thực địa</div>
          <NavLink to={ROUTES.GUIDE_TRIPS}>Cổng Hướng dẫn viên</NavLink>
        </nav>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>{pageTitle}</h1>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userDropdownWrapper} ref={dropdownRef}>
              <button
                type="button"
                className={styles.userTriggerBtn}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
              >
                <span>Xin chào, {displayName}</span>
                <span className={styles.arrowIcon}>{isDropdownOpen ? '▴' : '▾'}</span>
              </button>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownUserMeta}>
                    <div className={styles.dropdownUserName}>{displayName}</div>
                    <div className={styles.dropdownUserRole}>
                      {USER_ROLE_LABEL[currentUser?.role] || currentUser?.role || 'Quản trị viên'}
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link
                    to={ROUTES.ADMIN_PROFILE}
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Thông tin cá nhân
                  </Link>
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

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

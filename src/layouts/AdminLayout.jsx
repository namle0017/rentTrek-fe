import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';
import { USER_ROLE, USER_ROLE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/api/endpoints';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/features/operations/hooks/useOperations';
import DevClockBar from './DevClockBar';
import styles from './AdminLayout.module.css';

function getPageTitle(pathname) {
  if (pathname === ROUTES.ADMIN) return 'Tổng quan';
  if (pathname === ROUTES.ADMIN_PROFILE) return 'Thông tin cá nhân';
  if (pathname === ROUTES.ADMIN_TOURS) return 'Quản lý Tour trekking';
  if (pathname.startsWith(`${ROUTES.ADMIN}/tours/`)) return 'Chi tiết Tour';
  if (pathname === ROUTES.ADMIN_PRODUCTS) return 'Quản lý Sản phẩm';
  if (pathname.startsWith(`${ROUTES.ADMIN}/products/`)) return 'Chi tiết Sản phẩm';
  if (pathname === ROUTES.ADMIN_PRODUCT_CREATE) return 'Thêm sản phẩm';
  if (pathname === ROUTES.ADMIN_TRIP_CREATE) return 'Tạo chuyến đi mới';
  if (pathname === ROUTES.ADMIN_TRIPS) return 'Quản lý chuyến đi';
  if (pathname.startsWith(`${ROUTES.ADMIN_TRIPS}/`)) return 'Điều hành chuyến đi';
  if (pathname.includes('/recurrence-rules')) return 'Quy tắc lịch lặp chuyến';
  if (pathname === ROUTES.ADMIN_RENTAL_ORDERS) return 'Quản lý Đơn thuê';
  if (pathname.startsWith(`${ROUTES.ADMIN}/rental-orders/`)) return 'Chi tiết Đơn thuê';
  if (pathname === ROUTES.ADMIN_ORDERS) return 'Đơn hàng tổng hợp';
  if (pathname.startsWith(`${ROUTES.ADMIN}/orders/`)) return 'Chi tiết Đơn hàng';
  if (pathname === ROUTES.ADMIN_POSTS) return 'Quản lý Bài viết & Cẩm nang';
  if (pathname === ROUTES.ADMIN_POST_CREATE) return 'Tạo bài viết mới';
  if (pathname.startsWith(`${ROUTES.ADMIN}/posts/`)) return 'Chỉnh sửa bài viết';
  if (pathname === ROUTES.ADMIN_REVIEWS) return 'Kiểm duyệt Đánh giá';
  if (pathname === ROUTES.ADMIN_USERS) return 'Quản lý Người dùng';
  if (pathname.startsWith(`${ROUTES.ADMIN}/users/`)) return 'Chi tiết Người dùng';
  if (pathname === ROUTES.ADMIN_MASTER) return 'Danh mục & Địa điểm';
  if (pathname === ROUTES.ADMIN_PROMOTIONS) return 'Chương trình Khuyến mãi';
  if (pathname.startsWith(`${ROUTES.ADMIN}/promotions/`)) return 'Chi tiết Khuyến mãi';
  if (pathname === ROUTES.ADMIN_REPORTS) return 'Báo cáo Vận hành';
  if (pathname === ROUTES.ADMIN_SETTINGS) return 'Cấu hình Hệ thống';
  if (pathname === ROUTES.ADMIN_AUDIT) return 'Nhật ký Kiểm toán';
  if (pathname === ROUTES.OPS_TRANSACTIONS) return 'Giao dịch';
  if (pathname === ROUTES.OPS_REFUNDS) return 'Hoàn tiền & Đối soát';
  if (pathname === ROUTES.ADMIN_REFUNDS) return 'Hàng đợi hoàn tiền';
  if (pathname === ROUTES.OPS_REFUND_POLICY_CREATE) return 'Tạo chính sách hoàn tiền';
  if (pathname.startsWith(ROUTES.OPS_REFUND_POLICIES)) return 'Chính sách hoàn tiền';
  if (pathname === ROUTES.OPS_ASSETS) return 'Quản lý kho thiết bị';
  if (pathname === ROUTES.OPS_ASSETS_SCHEDULE) return 'Lịch Gantt thiết bị';
  if (pathname.includes('/provided-items')) return 'Chuẩn bị đồ cấp chuyến';
  return 'Quản trị hệ thống';
}

export default function AdminLayout() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const alertsRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);
  const displayName = currentUser?.fullName || currentUser?.email || 'Quản trị viên';
  const alerts = useOperations(API_ENDPOINTS.ADMIN.DASHBOARD.ALERTS);

  const handleSearch = (event) => {
    event.preventDefault();
    if (search.trim()) {
      navigate(ROUTES.ADMIN_ORDERS + '?search=' + encodeURIComponent(search.trim()));
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setShowAlerts(false);
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
        <div style={{ padding: '0 0 16px 8px' }}>
          <BrandLogo size="md" theme="light" suffix="Admin" />
        </div>
        <nav className={styles.nav}>
          <NavLink to={ROUTES.ADMIN} end>
            Tổng quan
          </NavLink>

          <div className={styles.sectionHeader}>Tour & Chuyến đi</div>
          <NavLink to={ROUTES.ADMIN_TRIPS}>Quản lý chuyến đi</NavLink>
          {isAdmin && <NavLink to={ROUTES.ADMIN_TOURS}>Danh mục Tour</NavLink>}

          <div className={styles.sectionHeader}>Sản phẩm & Đơn hàng</div>
          {isAdmin && <NavLink to={ROUTES.ADMIN_PRODUCTS}>Sản phẩm</NavLink>}
          <NavLink to={ROUTES.ADMIN_RENTAL_ORDERS}>Đơn thuê thiết bị</NavLink>
          <NavLink to={ROUTES.ADMIN_ORDERS}>Đơn hàng tổng hợp</NavLink>

          <div className={styles.sectionHeader}>Nội dung & Đánh giá</div>
          <NavLink to={ROUTES.ADMIN_POSTS}>Bài viết & Cẩm nang</NavLink>
          <NavLink to={ROUTES.ADMIN_REVIEWS}>Kiểm duyệt đánh giá</NavLink>

          {isAdmin && (
            <>
              <div className={styles.sectionHeader}>Tài chính</div>
              <NavLink to={ROUTES.OPS_TRANSACTIONS}>Giao dịch</NavLink>
              <NavLink to={ROUTES.OPS_REFUNDS}>Hoàn tiền & Đối soát</NavLink>
              <NavLink to={ROUTES.ADMIN_REFUNDS}>Hàng đợi hoàn tiền</NavLink>
              <NavLink to={ROUTES.OPS_REFUND_POLICIES}>Chính sách hoàn tiền</NavLink>

              <div className={styles.sectionHeader}>Kho & Thiết bị</div>
              <NavLink to={ROUTES.OPS_ASSETS}>Kho thiết bị</NavLink>
              <NavLink to={ROUTES.OPS_ASSETS_SCHEDULE}>Lịch Gantt thiết bị</NavLink>
              <NavLink to="/ops/trips/provided-items">Đồ cấp chuyến</NavLink>

              <div className={styles.sectionHeader}>Hệ thống & Vận hành</div>
              <NavLink to={ROUTES.ADMIN_USERS}>Người dùng & Nhân sự</NavLink>
              <NavLink to={ROUTES.ADMIN_PROMOTIONS}>Khuyến mãi</NavLink>
              <NavLink to={ROUTES.ADMIN_MASTER}>Danh mục & Địa điểm</NavLink>
              <NavLink to={ROUTES.ADMIN_REPORTS}>Báo cáo vận hành</NavLink>
              <NavLink to={ROUTES.ADMIN_SETTINGS}>Cấu hình hệ thống</NavLink>
              <NavLink to={ROUTES.ADMIN_AUDIT}>Nhật ký kiểm toán</NavLink>
            </>
          )}

          <div className={styles.sectionHeader}>Thực địa</div>
          <NavLink to={ROUTES.GUIDE_TRIPS}>Cổng Hướng dẫn viên</NavLink>
        </nav>
        <Link
          to={ROUTES.HOME}
          style={{
            marginTop: 'auto',
            paddingTop: '20px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Về trang khách hàng
        </Link>
      </aside>

      <div className={styles.content}>
        <DevClockBar />
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>{pageTitle}</h1>
            <form className={styles.search} onSubmit={handleSearch}>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                aria-label="Tìm mã đơn hoặc email khách"
                placeholder="Tìm mã đơn, email khách…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="submit">Tìm</button>
            </form>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.alertWrap} ref={alertsRef}>
              <button
                type="button"
                className={styles.bell}
                aria-label={`Cảnh báo vận hành: ${alerts.data?.length ?? 0}`}
                aria-expanded={showAlerts}
                onClick={() => setShowAlerts(!showAlerts)}
              >
                <span className={styles.bellIcon}>🔔</span>
                {alerts.data?.length > 0 && <span>{alerts.data.length}</span>}
              </button>
              {showAlerts && (
                <div className={styles.alertPanel}>
                  <strong>Cảnh báo vận hành</strong>
                  {alerts.isError ? (
                    <p>Không tải được cảnh báo</p>
                  ) : alerts.isPending ? (
                    <p>Đang tải…</p>
                  ) : !alerts.data?.length ? (
                    <p>Chưa có cảnh báo</p>
                  ) : (
                    alerts.data.slice(0, 6).map((alert, index) => (
                      <Link key={index} to={alert.actionUrl} onClick={() => setShowAlerts(false)}>
                        {alert.title}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

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

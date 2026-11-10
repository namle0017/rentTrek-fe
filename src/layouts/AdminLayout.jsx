import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Map,
  Package,
  Warehouse,
  FileText,
  Tags,
  Wallet,
  Settings,
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';
import OutdoorIcon from '@/components/OutdoorIcon';
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
  if (pathname.includes('/handover')) return 'Giao thiết bị';
  if (pathname.includes('/return')) return 'Thu hồi thiết bị';
  if (pathname.includes('/settlement')) return 'Quyết toán & Phí phát sinh';
  return 'Quản trị hệ thống';
}

const navigationGroups = [
  {
    title: 'Tour & chuyến đi',
    icon: Map,
    expanded: true,
    items: [
      [ROUTES.ADMIN_TRIPS, 'Chuyến đi'],
      [ROUTES.ADMIN_TOURS, 'Danh mục tour'],
    ],
  },
  {
    title: 'Sản phẩm & đơn hàng',
    icon: Package,
    expanded: true,
    items: [
      [ROUTES.ADMIN_PRODUCTS, 'Sản phẩm'],
      [ROUTES.ADMIN_RENTAL_ORDERS, 'Đơn thuê thiết bị'],
      [ROUTES.ADMIN_ORDERS, 'Tất cả đơn hàng'],
    ],
  },
  {
    title: 'Kho & thiết bị',
    icon: Warehouse,
    items: [
      [ROUTES.OPS_ASSETS, 'Kho thiết bị'],
      [ROUTES.OPS_ASSETS_SCHEDULE, 'Lịch thiết bị'],
      ['/ops/trips/provided-items', 'Đồ cấp chuyến'],
      ['/ops/rentals/handover', 'Giao thiết bị'],
      ['/ops/rentals/return', 'Thu hồi thiết bị'],
      ['/ops/rentals/settlement', 'Quyết toán & phí'],
    ],
  },
  {
    title: 'Nội dung',
    icon: FileText,
    items: [
      [ROUTES.ADMIN_POSTS, 'Bài viết & cẩm nang'],
      [ROUTES.ADMIN_REVIEWS, 'Đánh giá'],
    ],
  },
  {
    title: 'Khuyến mãi & danh mục',
    icon: Tags,
    items: [
      [ROUTES.ADMIN_PROMOTIONS, 'Khuyến mãi'],
      [ROUTES.ADMIN_MASTER, 'Danh mục & địa điểm'],
    ],
  },
  {
    title: 'Tài chính',
    icon: Wallet,
    adminOnly: true,
    items: [
      [ROUTES.OPS_TRANSACTIONS, 'Giao dịch'],
      [ROUTES.ADMIN_REFUNDS, 'Hoàn tiền'],
      [ROUTES.OPS_REFUND_POLICIES, 'Chính sách hoàn tiền'],
    ],
  },
  {
    title: 'Hệ thống',
    icon: Settings,
    adminOnly: true,
    items: [
      [ROUTES.ADMIN_USERS, 'Người dùng & nhân sự'],
      [ROUTES.ADMIN_REPORTS, 'Báo cáo'],
      [ROUTES.ADMIN_SETTINGS, 'Cấu hình'],
      [ROUTES.ADMIN_AUDIT, 'Nhật ký kiểm toán'],
    ],
  },
];

export default function AdminLayout() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef(null);
  const alertsRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);
  const displayName =
    currentUser?.fullName || currentUser?.email || (isAdmin ? 'Quản trị viên' : 'Nhân viên vận hành');
  const alerts = useOperations(API_ENDPOINTS.ADMIN.DASHBOARD.ALERTS);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setShowAlerts(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
        setIsDropdownOpen(false);
        setShowAlerts(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate(ROUTES.LOGIN, { replace: true }),
    });
  };

  return (
    <div className={styles.layout}>
      {mobileNavOpen && (
        <button className={styles.backdrop} aria-label="Đóng menu" onClick={() => setMobileNavOpen(false)} />
      )}
      <aside id="admin-navigation" className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <BrandLogo size="md" theme="light" suffix={isAdmin ? 'Admin' : 'Vận hành'} to={ROUTES.ADMIN} />
          <button className={styles.closeMenu} aria-label="Đóng menu" onClick={() => setMobileNavOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav
          className={styles.nav}
          aria-label="Menu quản trị"
          onClick={(event) => {
            if (event.target.closest('a')) setMobileNavOpen(false);
          }}
        >
          <NavLink className={styles.overviewLink} to={ROUTES.ADMIN} end>
            <LayoutDashboard size={16} />
            Tổng quan
          </NavLink>
          <span className={styles.navCaption}>QUẢN LÝ</span>
          {navigationGroups
            .filter((group) => !group.adminOnly || isAdmin)
            .map(({ title, icon: Icon, items, expanded }) => {
              const isCurrentGroup = items.some(
                ([to]) => location.pathname === to || location.pathname.startsWith(`${to}/`),
              );
              return (
                <details className={styles.navGroup} key={title} open={isCurrentGroup || !!expanded}>
                  <summary>
                    <Icon size={16} />
                    <span>{title}</span>
                    <ChevronDown size={13} className={styles.groupChevron} />
                  </summary>
                  <div className={styles.groupLinks}>
                    {items.map(([to, label]) => (
                      <NavLink key={to} to={to} end={to === ROUTES.OPS_ASSETS}>
                        {label}
                      </NavLink>
                    ))}
                  </div>
                </details>
              );
            })}
        </nav>
        <Link className={styles.siteLink} to={ROUTES.HOME}>
          Về trang chủ <ArrowUpRight size={14} />
        </Link>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.menuToggle}
              aria-label="Mở menu quản trị"
              aria-expanded={mobileNavOpen}
              aria-controls="admin-navigation"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <Menu size={20} />
            </button>
            <h1 className={styles.headerTitle}>{pageTitle}</h1>
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
                <OutdoorIcon name="bell" size={20} className={styles.bellIcon} />

                {alerts.data?.length > 0 && <span className={styles.bellBadge}>{alerts.data.length}</span>}
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
                <span className={styles.avatar} aria-hidden="true">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className={styles.displayName}>{displayName}</span>
                <span className={styles.arrowIcon}>
                  <OutdoorIcon name={isDropdownOpen ? 'chevronUp' : 'chevron'} size={12} />
                </span>
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

        <DevClockBar compact />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import OutdoorIcon from '@/components/OutdoorIcon';
import { USER_ROLE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/api/endpoints';
import { useLogout } from '@/features/auth/hooks/useLogout';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import DevClockBar from './DevClockBar';
import PortalSidebar from './components/PortalSidebar';
import styles from './BackofficeShell.module.css';

function getPageTitle(pathname) {
  if (pathname === ROUTES.ADMIN) return 'Tổng quan';
  if (pathname === ROUTES.ADMIN_PROFILE) return 'Thông tin cá nhân';
  if (pathname === ROUTES.ADMIN_NOTIFICATIONS) return 'Thông báo';
  if (pathname === ROUTES.ADMIN_TOURS) return 'Quản lý Tour trekking';
  if (pathname.startsWith(`${ROUTES.ADMIN}/tours/`)) return 'Chi tiết Tour';
  if (pathname === ROUTES.ADMIN_PRODUCTS) return 'Quản lý Sản phẩm';
  if (pathname.startsWith(`${ROUTES.ADMIN}/products/`)) return 'Chi tiết Sản phẩm';
  if (pathname === ROUTES.ADMIN_BUNDLES) return 'Quản lý Combo';
  if (pathname.startsWith(`${ROUTES.ADMIN_BUNDLES}/`)) return 'Chi tiết Combo';
  if (pathname === ROUTES.ADMIN_PRODUCT_CREATE) return 'Thêm sản phẩm';
  if (pathname === ROUTES.ADMIN_TRIP_CREATE) return 'Thêm chuyến đi mới';
  if (pathname === ROUTES.ADMIN_TRIPS) return 'Quản lý chuyến đi';
  if (pathname.startsWith(`${ROUTES.ADMIN_TRIPS}/`)) return 'Điều hành chuyến đi';
  if (pathname.includes('/recurrence-rules')) return 'Quy tắc lịch lặp chuyến';
  if (pathname === ROUTES.ADMIN_RENTAL_ORDERS) return 'Quản lý Đơn thuê';
  if (pathname.startsWith(`${ROUTES.ADMIN}/rental-orders/`)) return 'Chi tiết Đơn thuê';
  if (pathname === ROUTES.ADMIN_ORDERS) return 'Đơn hàng tổng hợp';
  if (pathname.startsWith(`${ROUTES.ADMIN}/orders/`)) return 'Chi tiết Đơn hàng';
  if (pathname === ROUTES.ADMIN_POSTS) return 'Quản lý bài viết & cẩm nang';
  if (pathname === ROUTES.ADMIN_POST_CREATE) return 'Tạo bài viết mới';
  if (pathname.startsWith(`${ROUTES.ADMIN}/posts/`)) return 'Chỉnh sửa bài viết';
  if (pathname === ROUTES.ADMIN_REVIEWS) return 'Kiểm duyệt Đánh giá';
  if (pathname === ROUTES.ADMIN_USERS) return 'Quản lý Người dùng';
  if (pathname.startsWith(`${ROUTES.ADMIN}/users/`)) return 'Chi tiết Người dùng';
  if (pathname === ROUTES.ADMIN_MASTER) return 'Danh mục & Địa điểm';
  if (pathname === ROUTES.ADMIN_PROMOTIONS) return 'Chương trình Khuyến mãi';
  if (pathname.startsWith(`${ROUTES.ADMIN}/promotions/`)) return 'Chi tiết Khuyến mãi';
  if (pathname === ROUTES.ADMIN_REPORTS) return 'Báo cáo & phân tích số liệu';
  if (pathname === ROUTES.ADMIN_SETTINGS) return 'Cấu hình hệ thống';
  if (pathname === ROUTES.ADMIN_AUDIT) return 'Nhật ký Kiểm toán';
  if (pathname === ROUTES.OPS_TRANSACTIONS) return 'Quản lý giao dịch';
  if (pathname === ROUTES.OPS_REFUNDS) return 'Hoàn tiền & Đối soát';
  if (pathname === ROUTES.ADMIN_REFUNDS) return 'Hàng đợi hoàn tiền';
  if (pathname === ROUTES.ADMIN_REFUND_POLICY_CREATE || pathname === ROUTES.OPS_REFUND_POLICY_CREATE) return 'Tạo chính sách hoàn tiền';
  if (pathname.startsWith(`${ROUTES.ADMIN_REFUND_POLICIES}/`)) {
    return pathname.endsWith('/edit') ? 'Sửa chính sách hoàn tiền' : 'Chi tiết chính sách hoàn tiền';
  }
  if (pathname === ROUTES.ADMIN_REFUND_POLICIES || pathname.startsWith(ROUTES.OPS_REFUND_POLICIES)) return 'Chính sách hoàn tiền';
  if (pathname === ROUTES.ADMIN_RENTAL_POLICY_CREATE) return 'Tạo phiên bản chính sách thuê đồ';
  if (pathname.startsWith(`${ROUTES.ADMIN_RENTAL_POLICIES}/`)) return 'Chi tiết chính sách thuê đồ';
  if (pathname === ROUTES.ADMIN_RENTAL_POLICIES || pathname.startsWith(ROUTES.ADMIN_RENTAL_POLICY)) return 'Chính sách thuê đồ';
  if (pathname.startsWith(ROUTES.ADMIN_RENTAL_REPORTS)) return 'Báo cáo đơn thuê';
  if (pathname.startsWith(ROUTES.ADMIN_CUSTOMER_REPORTS)) return 'Báo cáo từ khách hàng';
  if (pathname === ROUTES.OPS_ASSETS) return 'Quản lý kho thiết bị';
  if (pathname === ROUTES.OPS_ASSETS_SCHEDULE) return 'Biểu đồ Gantt phân bổ thiết bị';
  if (pathname.includes('/provided-items')) return 'Cấp phát thiết bị cho chuyến đi';
  if (pathname.includes('/handover')) return 'Giao thiết bị';
  if (pathname.includes('/return')) return 'Thu hồi thiết bị';
  if (pathname.includes('/settlement')) return 'Quyết toán & Phí phát sinh';
  return 'Quản trị hệ thống';
}

/**
 * Khung back-office dùng chung cho Admin và Staff: sidebar theo `nav` + header (tiêu đề, chuông, tài khoản).
 * Mỗi vai trò có layout riêng (AdminLayout / StaffLayout) chỉ khác menu, brand và tên mặc định.
 */
export default function BackofficeShell({ nav, fallbackName }) {
  const { currentUser } = useAuth();
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);
  const displayName = currentUser?.fullName || currentUser?.email || fallbackName;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
        setIsDropdownOpen(false);
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
      <PortalSidebar
        id="admin-navigation"
        nav={nav}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        ariaLabel="Menu quản trị"
      />

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
            <NotificationBell alertsEndpoint={API_ENDPOINTS.ADMIN.DASHBOARD.ALERTS} />

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
                      {USER_ROLE_LABEL[currentUser?.role] || currentUser?.role || fallbackName}
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

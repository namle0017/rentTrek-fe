import { Link, useLocation } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import OutdoorIcon from '@/components/OutdoorIcon';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import styles from '../pages/ProfilePage.module.css';

/**
 * Khung chung cho "Tài khoản của tôi": breadcrumb + sidebar + nội dung.
 * Sidebar là link thật (URL đổi theo mục) nên Đơn của tôi / Hồ sơ / Bảo mật đi lại đúng trang.
 * `active`: 'orders' | 'profile' | 'security'.
 */
export default function AccountShell({ active, children }) {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();
  const role = currentUser?.role;
  const isAdminOrStaff = role === USER_ROLE.ADMIN || role === USER_ROLE.STAFF;
  const isGuide = role === USER_ROLE.GUIDE || role === USER_ROLE.TOUR_GUIDE;
  const isCustomer = !isAdminOrStaff && !isGuide;

  // Admin dùng /admin/profile → giữ nguyên path hiện tại khi đổi tab hồ sơ/bảo mật
  const profilePath = pathname === ROUTES.MY_ORDERS ? ROUTES.PROFILE : pathname;
  const items = [
    isCustomer && { key: 'orders', to: ROUTES.MY_ORDERS, icon: 'bag', label: 'Đơn của tôi' },
    { key: 'profile', to: profilePath, icon: 'user', label: 'Hồ sơ cá nhân' },
    { key: 'security', to: `${profilePath}?tab=security`, icon: 'shield', label: 'Bảo mật & phiên' },
  ].filter(Boolean);

  return (
    <div className={styles.pageWrapper}>
      <div className="container">
        <Breadcrumb
          items={[
            isAdminOrStaff
              ? { label: 'Tổng quan', to: ROUTES.ADMIN }
              : isGuide
                ? { label: 'Lịch dẫn đoàn', to: ROUTES.GUIDE_TRIPS }
                : { label: 'Trang chủ', to: ROUTES.HOME },
            { label: isCustomer ? 'Tài khoản của tôi' : 'Thông tin cá nhân', to: profilePath },
            { label: items.find((item) => item.key === active)?.label },
          ]}
        />

        <div className={styles.layoutGrid}>
          <aside className={styles.accountSidebar} aria-label="Menu tài khoản">
            <div className={styles.sidebarHeading}>
              {isAdminOrStaff ? 'Quản lý tài khoản' : isGuide ? 'Tài khoản Guide' : 'Tài khoản của tôi'}
            </div>
            <nav className={styles.sidebarNav}>
              {items.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`${styles.navItem} ${active === item.key ? styles.navItemActive : ''}`}
                  aria-current={active === item.key ? 'page' : undefined}
                >
                  <OutdoorIcon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          <main className={styles.mainContent}>{children}</main>
        </div>
      </div>
    </div>
  );
}

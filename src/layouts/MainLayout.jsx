import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';
import OutdoorIcon from '@/components/OutdoorIcon';
import { USER_ROLE, USER_ROLE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useRentalCart } from '@/features/rentals/hooks/useRentalCart';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarColor } from '@/utils/avatarColor';
import DevClockBar from './DevClockBar';
import styles from './MainLayout.module.css';

const exploration = ['Lều cắm trại', 'Balô', 'Đèn', 'Túi ngủ'];

export default function MainLayout() {
  const { currentUser, isAuthenticated } = useAuth();
  const rentalCart = useRentalCart();
  const cartQuantity = rentalCart.items.reduce((sum, item) => sum + item.quantity, 0);
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  // Phân quyền cách ly: Nếu Admin/Staff vào giao diện khách hàng, tự động chuyển về /admin.
  // Nếu Guide/TourGuide vào, tự động chuyển về /guide/trips.
  useEffect(() => {
    if (currentUser?.role === USER_ROLE.ADMIN || currentUser?.role === USER_ROLE.STAFF) {
      navigate(ROUTES.ADMIN, { replace: true });
    } else if (currentUser?.role === USER_ROLE.GUIDE || currentUser?.role === USER_ROLE.TOUR_GUIDE) {
      navigate(ROUTES.GUIDE_TRIPS, { replace: true });
    }
  }, [currentUser?.role, navigate]);

  // Trang có hero tràn viền tự quản lý container
  const isCatalog = [ROUTES.HOME, ROUTES.PRODUCTS, ROUTES.TOURS].includes(location.pathname);

  const handleLogoutClick = () => logoutMutation.mutate();

  const getRoleBadgeClass = (role) => {
    if (role === USER_ROLE.ADMIN) return `${styles.roleBadge} ${styles.roleBadgeAdmin}`;
    if (role === USER_ROLE.STAFF) return `${styles.roleBadge} ${styles.roleBadgeStaff}`;
    if (role === USER_ROLE.TOUR_GUIDE) return `${styles.roleBadge} ${styles.roleBadgeTourGuide}`;
    return styles.roleBadge;
  };

  const avatarColor = getAvatarColor(currentUser?.email || currentUser?.fullName);

  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>
        Đến nội dung chính
      </a>
      <DevClockBar />
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <div className={styles.logo}>
            <BrandLogo size="md" theme="light" to={ROUTES.HOME} />
          </div>

          <nav className={styles.nav} aria-label="Điều hướng chính">
            <NavLink to={ROUTES.HOME} end>
              Trang chủ
            </NavLink>
            <NavLink to={ROUTES.TOURS}>Tour trekking</NavLink>
            <NavLink to={ROUTES.PRODUCTS}>Dụng cụ thuê</NavLink>
            <NavLink to={ROUTES.GUIDES}>Cẩm nang</NavLink>
          </nav>

          <div className={styles.authSection}>
            {isAuthenticated ? (
              <>
                <Link
                  to={ROUTES.RENTAL_CART}
                  className={styles.cartLink}
                  aria-label={`Giỏ thuê, ${cartQuantity} thiết bị`}
                >
                  <OutdoorIcon name="bag" size={20} />
                  <span>Giỏ thuê ({cartQuantity})</span>
                </Link>
                <details className={styles.account}>
                <summary aria-label="Tài khoản">
                  <span
                    className={styles.avatar}
                    style={
                      currentUser?.avatarUrl
                        ? { padding: 0, overflow: 'hidden' }
                        : { backgroundColor: avatarColor.bg, color: avatarColor.text }
                    }
                  >
                    {currentUser?.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser?.fullName || 'Avatar'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      (currentUser?.fullName || currentUser?.email || 'U')[0].toUpperCase()
                    )}
                  </span>
                  <OutdoorIcon name="chevron" size={14} />
                </summary>
                <div className={styles.accountMenu}>
                  <div className={styles.accountHeader}>
                    <Link to={ROUTES.PROFILE} className={styles.accountName} title="Xem hồ sơ cá nhân">
                      {currentUser?.fullName || currentUser?.email || 'Tài khoản của bạn'}
                    </Link>
                    {currentUser?.email && currentUser?.fullName && (
                      <span className={styles.accountEmail}>{currentUser.email}</span>
                    )}
                    {currentUser?.role && currentUser.role !== USER_ROLE.CUSTOMER && (
                      <span className={getRoleBadgeClass(currentUser.role)}>
                        {USER_ROLE_LABEL[currentUser.role] || currentUser.role}
                      </span>
                    )}
                  </div>
                  <div className={styles.accountDivider} />
                  <Link to={ROUTES.PROFILE} className={styles.accountLink}>
                    <OutdoorIcon name="user" size={16} />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <Link to={ROUTES.MY_ORDERS} className={styles.accountLink}>
                    <OutdoorIcon name="bag" size={16} />
                    <span>Đơn của tôi</span>
                  </Link>
                  <div className={styles.accountDivider} />
                  <button
                    type="button"
                    className={styles.logoutBtn}
                    onClick={handleLogoutClick}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? 'Đang thoát...' : 'Đăng xuất'}
                  </button>
                </div>
              </details>
            </>
          ) : (
              <>
                <Link to={ROUTES.LOGIN} className={styles.authLink}>
                  Đăng nhập
                </Link>
                <Link to={ROUTES.REGISTER} className={styles.authBtnPrimary}>
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main id="main-content" className={isCatalog ? styles.catalogMain : `container ${styles.main}`}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerAbout}>
              <BrandLogo size="md" theme="dark" to={ROUTES.HOME} />
              <p>
                Nền tảng cho thuê thiết bị dã ngoại P2P chuyên nghiệp tại Việt Nam. Cho mượn an tâm, thuê an
                toàn thông qua quy trình kiểm định và ký quỹ bảo mật.
              </p>
            </div>
            <div>
              <h2>Khám Phá</h2>
              {exploration.map((name) => (
                <Link key={name} to={`${ROUTES.PRODUCTS}?search=${encodeURIComponent(name)}`}>
                  {name}
                </Link>
              ))}
            </div>
            <div id="owner-info">
              <h2>Dành Cho Chủ Đồ</h2>
              <p>Chức năng đăng đồ cho thuê dành cho chủ đồ sẽ sớm ra mắt.</p>
              <a href={`${ROUTES.PRODUCTS}#travel-benefits`}>Quy trình kiểm định</a>
              <a href={`${ROUTES.PRODUCTS}#travel-benefits`}>Ký quỹ bảo mật</a>
            </div>
            <div>
              <h2>Liên Hệ & Hỗ Trợ</h2>
              <p>Đồng hành cùng hành trình của bạn.</p>
              <Link to={ROUTES.PRODUCTS}>
                Khám phá thiết bị <OutdoorIcon name="arrow" size={14} />
              </Link>
              <Link to={ROUTES.LOGIN}>Tài khoản RenTrekk</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} RenTrekk. Thiết kế lấy cảm hứng từ thiên nhiên kỳ vĩ Việt Nam.</p>
            <span>Đi xa hơn. Trải nghiệm nhiều hơn.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import OutdoorIcon from '@/components/OutdoorIcon';
import { USER_ROLE, USER_ROLE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarColor } from '@/utils/avatarColor';
import styles from './MainLayout.module.css';

const exploration = ['Lều cắm trại', 'Balô', 'Đèn', 'Túi ngủ'];

function Brand() {
  return (
    <Link to={ROUTES.HOME} className={styles.logo}>
      ▲ renTrek
    </Link>
  );
}

export default function MainLayout() {
  const { currentUser, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const location = useLocation();
  // Trang có hero tràn viền tự quản lý container
  const isCatalog = [ROUTES.HOME, ROUTES.PRODUCTS, ROUTES.TOURS].includes(location.pathname);

  const handleLogoutClick = () => logoutMutation.mutate();

  const searchProducts = (event) => {
    event.preventDefault();
    const keyword = new FormData(event.currentTarget).get('search').trim();
    navigate(`${ROUTES.PRODUCTS}${keyword ? `?search=${encodeURIComponent(keyword)}` : ''}`);
  };

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
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link to={ROUTES.HOME} className={styles.logo}>
            ▲ renTrek
          </Link>

          <nav className={styles.nav} aria-label="Điều hướng chính">
            <NavLink to={ROUTES.HOME} end>
              Trang chủ
            </NavLink>
            <NavLink to={ROUTES.TOURS}>Tour Trekking</NavLink>
            <NavLink to={ROUTES.PRODUCTS}>Sản phẩm & Đồ thuê</NavLink>
            {currentUser?.role === USER_ROLE.ADMIN && (
              <NavLink to={ROUTES.ADMIN}>Quản trị</NavLink>
            )}
          </nav>

          <div className={styles.authSection}>
            {isAuthenticated ? (
              <>
                <div className={styles.userInfo}>
                  <Link to={ROUTES.PROFILE} className={styles.userNameLink} title="Xem hồ sơ cá nhân">
                    <span
                      className={styles.userAvatar}
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
                  className={styles.logoutBtn}
                  onClick={handleLogoutClick}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? 'Đang thoát...' : 'Đăng xuất'}
                </button>
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
              <Brand />
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
              {currentUser?.role === USER_ROLE.ADMIN ? (
                <Link to={ROUTES.ADMIN_PRODUCT_CREATE}>Đăng ký đăng đồ</Link>
              ) : (
                <p>Chức năng đăng đồ cho thuê dành cho chủ đồ sẽ sớm ra mắt.</p>
              )}
              <a href={`${ROUTES.PRODUCTS}#travel-benefits`}>Quy trình kiểm định</a>
              <a href={`${ROUTES.PRODUCTS}#travel-benefits`}>Ký quỹ bảo mật</a>
            </div>
            <div>
              <h2>Liên Hệ & Hỗ Trợ</h2>
              <p>Đồng hành cùng hành trình của bạn.</p>
              <Link to={ROUTES.PRODUCTS}>
                Khám phá thiết bị <OutdoorIcon name="arrow" size={14} />
              </Link>
              <Link to={ROUTES.LOGIN}>Tài khoản TrekRent</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} TrekRent. Thiết kế lấy cảm hứng từ thiên nhiên kỳ vĩ Việt Nam.</p>
            <span>Đi xa hơn. Trải nghiệm nhiều hơn.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

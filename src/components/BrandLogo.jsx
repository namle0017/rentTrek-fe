import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { AuthContext } from '@/contexts/AuthContext';
import styles from './BrandLogo.module.css';

/**
 * BrandLogo - Logo chuẩn nhận diện RenTrekk theo Design System.
 * Có wordmark "RenTrekk", vương miện 3 tia sáng bình minh (Dawn rays) trên chữ "e" và chấm cam đất ".".
 * Tự động trỏ về trang chủ tương ứng theo vai trò (Role):
 * - Admin / Staff -> /admin
 * - Guide -> /guide/trips
 * - Customer / Khách vãng lai -> /
 */
export default function BrandLogo({
  size = 'md', // 'sm' (18px) | 'md' (22px) | 'lg' (26px) | 'xl' (32px)
  theme = 'light', // 'light' (chữ trắng cho nền tối) | 'dark' (chữ xanh rừng cho nền sáng)
  asLink = true,
  to = null,
  suffix = null,
  className = '',
}) {
  const auth = useContext(AuthContext);
  const currentUser = auth?.currentUser;

  let destination = to;
  if (!destination) {
    if (currentUser?.role === USER_ROLE.ADMIN || currentUser?.role === USER_ROLE.STAFF) {
      destination = ROUTES.ADMIN;
    } else if (currentUser?.role === USER_ROLE.GUIDE || currentUser?.role === USER_ROLE.TOUR_GUIDE) {
      destination = ROUTES.GUIDE_TRIPS;
    } else {
      destination = ROUTES.HOME;
    }
  }

  const content = (
    <span className={`${styles.brandLogo} ${styles[size]} ${styles[theme]} ${className}`}>
      <span className={styles.wordmark}>
        RenTrekk
        <span aria-hidden="true" className={styles.rays}>
          <span className={`${styles.ray} ${styles.rayLeft}`} />
          <span className={`${styles.ray} ${styles.rayCenter}`} />
          <span className={`${styles.ray} ${styles.rayRight}`} />
        </span>
        <span className={styles.dot}>.</span>
      </span>
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </span>
  );

  if (!asLink) {
    return content;
  }

  return (
    <Link to={destination} className={styles.logoLink} aria-label="RenTrekk - Trang chủ">
      {content}
    </Link>
  );
}

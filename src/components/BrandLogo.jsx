import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import styles from './BrandLogo.module.css';

/**
 * BrandLogo - Logo chuẩn nhận diện RenTrekk theo Design System.
 * Có wordmark "RenTrekk", vương miện 3 tia sáng bình minh (Dawn rays) trên chữ "e" và chấm cam đất ".".
 */
export default function BrandLogo({
  size = 'md', // 'sm' (18px) | 'md' (22px) | 'lg' (26px) | 'xl' (32px)
  theme = 'light', // 'light' (chữ trắng cho nền tối) | 'dark' (chữ xanh rừng cho nền sáng)
  asLink = true,
  suffix = null,
  className = '',
}) {
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
    <Link to={ROUTES.HOME} className={styles.logoLink} aria-label="RenTrekk - Trang chủ">
      {content}
    </Link>
  );
}


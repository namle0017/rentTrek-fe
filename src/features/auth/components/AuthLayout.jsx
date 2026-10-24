import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ title, subtitle, children, alternateText, alternateLinkText, alternateLinkTo }) {
  return (
    <div className={styles.splitPage}>
      {/* Cột trái: Hero & Câu chuyện hành trình (Figma: #32:14 / #32:70) */}
      <div className={styles.heroColumn}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Link to={ROUTES.HOME} className={styles.brandLogo}>
            <span className={styles.brandIcon}>▲</span> renTrek
          </Link>

          <div className={styles.heroTextGroup}>
            <span className={styles.heroTag}>Outdoor Adventure & Gear Escrow</span>
            <h2 className={styles.heroHeading}>Chinh phục những cung đường kỳ vĩ</h2>
            <p className={styles.heroDescription}>
              Nền tảng thuê trang bị dã ngoại cao cấp và đăng ký tour trekking trọn gói. Tự tin bước vào thiên nhiên
              với hệ thống ký quỹ bảo chứng minh bạch.
            </p>

            <div className={styles.featurePills}>
              <div className={styles.featurePill}>
                <span className={styles.pillIcon}>✓</span> 100% Đồ đạc kiểm định trước giờ xuất phát
              </div>
              <div className={styles.featurePill}>
                <span className={styles.pillIcon}>✓</span> Ký quỹ bảo chứng — Hoàn cọc tức thì
              </div>
              <div className={styles.featurePill}>
                <span className={styles.pillIcon}>✓</span> Hướng dẫn viên bản địa chuyên nghiệp
              </div>
            </div>
          </div>

          <div className={styles.heroFooter}>
            <span>© {new Date().getFullYear()} renTrek Inc. Bản quyền thuộc về đội ngũ PRN232.</span>
          </div>
        </div>
      </div>

      {/* Cột phải: Khu vực xác thực (Figma: #32:31 / #32:87) */}
      <div className={styles.formColumn}>
        <div className={styles.formWrapper}>
          <div className={styles.mobileBrand}>
            <Link to={ROUTES.HOME} className={styles.brandLogoMobile}>
              <span className={styles.brandIcon}>▲</span> renTrek
            </Link>
          </div>

          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>{title}</h1>
            {subtitle && <p className={styles.formSubtitle}>{subtitle}</p>}
          </div>

          <div className={styles.formBody}>{children}</div>

          {alternateText && alternateLinkText && (
            <div className={styles.formFooter}>
              <span>{alternateText} </span>
              <Link to={alternateLinkTo} className={styles.alternateLink}>
                {alternateLinkText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import SplitText from '@/components/SplitText';
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
            <span className={styles.brandIcon}>▲</span>
            <SplitText
              tag="span"
              text="renTrek"
              effect="none"
              trigger="none"
              splitType="chars"
              hoverEffect="lift"
            />
          </Link>

          <div className={styles.heroTextGroup}>
            <span className={styles.heroTag}>
              <SplitText
                tag="span"
                text="Outdoor Adventure & Gear Escrow"
                effect="none"
                trigger="none"
                splitType="chars"
                hoverEffect="lift"
              />
            </span>
            <SplitText
              tag="h2"
              text="Chinh phục những cung đường kỳ vĩ"
              className={styles.heroHeading}
              effect="none"
              trigger="none"
              splitType="chars"
              hoverEffect="lift"
            />
            <SplitText
              tag="p"
              text="Nền tảng thuê trang bị dã ngoại cao cấp và đăng ký tour trekking trọn gói. Tự tin bước vào thiên nhiên với hệ thống ký quỹ bảo chứng minh bạch."
              className={styles.heroDescription}
              effect="none"
              trigger="none"
              splitType="words"
              hoverEffect="lift"
            />

            <div className={styles.featurePills}>
              <div className={styles.featurePill}>
                <span className={styles.pillIcon}>✓</span>
                <SplitText
                  tag="span"
                  text="100% Đồ đạc kiểm định trước giờ xuất phát"
                  splitType="words"
                  effect="none"
                  trigger="none"
                  hoverEffect="lift"
                />
              </div>
              <div className={styles.featurePill}>
                <span className={styles.pillIcon}>✓</span>
                <SplitText
                  tag="span"
                  text="Ký quỹ bảo chứng — Hoàn cọc tức thì"
                  splitType="words"
                  effect="none"
                  trigger="none"
                  hoverEffect="lift"
                />
              </div>
              <div className={styles.featurePill}>
                <span className={styles.pillIcon}>✓</span>
                <SplitText
                  tag="span"
                  text="Hướng dẫn viên bản địa chuyên nghiệp"
                  splitType="words"
                  effect="none"
                  trigger="none"
                  hoverEffect="lift"
                />
              </div>
            </div>
          </div>

          <div className={styles.heroFooter}>
            <SplitText
              tag="span"
              text={`© ${new Date().getFullYear()} renTrek Inc. Bản quyền thuộc về đội ngũ PRN232.`}
              splitType="words"
              effect="none"
              trigger="none"
              hoverEffect="lift"
            />
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

import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './TourCard.module.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b';

export default function TourCard({ tour }) {
  // BE trả badgeStatus "Đang mở" | "Hết hạn" đã tính sẵn
  const isOpen = tour.badgeStatus === 'Đang mở';
  const durationText = `${tour.durationDays} Ngày ${tour.durationNights} Đêm`;
  const eyebrow = tour.categoryName || tour.locationName;
  const meta = [tour.departureDateRange && `Khởi hành ${tour.departureDateRange}`, tour.slotStatusText]
    .filter(Boolean)
    .join(' · ');

  const content = (
    <>
      <div className={styles.imageWrapper}>
        <img src={tour.thumbnailUrl || FALLBACK_IMAGE} alt="" className={styles.image} loading="lazy" />
        <span className={styles.duration}>{durationText}</span>
      </div>
      <div className={styles.body}>
        {eyebrow && (
          <p className={styles.eyebrow}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {eyebrow}
          </p>
        )}
        <h3 className={styles.title} title={tour.name}>
          {tour.name}
        </h3>
        {meta && <p className={styles.meta}>{meta}</p>}
        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <small>Giá từ</small>
            <span className={styles.price}>
              {tour.basePrice > 0 ? formatCurrency(tour.basePrice) : 'Liên hệ'}
            </span>
          </div>
          {/* span, không phải button: cả card đã là Link */}
          <span className={isOpen ? styles.cta : styles.ctaClosed}>
            {isOpen ? 'Xem lịch trình' : tour.badgeStatus || 'Hết hạn'}
          </span>
        </div>
      </div>
    </>
  );

  return isOpen ? (
    <Link to={ROUTES.TOUR_DETAIL(tour.id)} className={styles.card} aria-label={tour.name}>
      {content}
    </Link>
  ) : (
    <article className={`${styles.card} ${styles.cardExpired}`} aria-label={tour.name}>
      {content}
    </article>
  );
}

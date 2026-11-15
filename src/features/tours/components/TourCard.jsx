import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './TourCard.module.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b';

export default function TourCard({ tour }) {
  // BE trả badgeStatus "Đang mở" | "Hết hạn" đã tính sẵn
  const isOpen = tour.badgeStatus === 'Đang mở';
  const durationText = tour.durationFormatted || `${tour.durationDays} ngày ${tour.durationNights} đêm`;

  const content = (
    <>
      <div className={styles.imageWrapper}>
        <img src={tour.thumbnailUrl || FALLBACK_IMAGE} alt="" className={styles.image} loading="lazy" />
        {!isOpen && <span className={styles.badge}>{tour.badgeStatus || 'Hết hạn'}</span>}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title} title={tour.name}>
          {tour.name}
        </h3>
        <p className={styles.meta}>
          {durationText}
          {tour.locationName && <> · {tour.locationName}</>}
        </p>
        {tour.departureDateRange && <p className={styles.meta}>Khởi hành {tour.departureDateRange}</p>}
        <div className={styles.footer}>
          {tour.basePrice > 0 && (
            <span className={styles.price}>
              <small>Từ</small> {formatCurrency(tour.basePrice)}
            </span>
          )}
          {tour.slotStatusText && <span className={styles.slot}>{tour.slotStatusText}</span>}
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

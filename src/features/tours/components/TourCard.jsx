import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import styles from './TourCard.module.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b';

export default function TourCard({ tour }) {
  // BE trả badgeStatus "Đang mở" | "Hết hạn" đã tính sẵn
  const isOpen = tour.badgeStatus === 'Đang mở';
  const durationText = tour.durationFormatted || `${tour.durationDays} ngày ${tour.durationNights} đêm`;

  return (
    <article className={`${styles.card} ${isOpen ? '' : styles.cardExpired}`}>
      <div className={styles.imageWrapper}>
        <img src={tour.thumbnailUrl || FALLBACK_IMAGE} alt={tour.name} className={styles.image} loading="lazy" />
        <span className={`${styles.badge} ${isOpen ? styles.badgeOpen : styles.badgeExpired}`}>
          {tour.badgeStatus || (isOpen ? 'Đang mở' : 'Hết hạn')}
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title} title={tour.name}>
          {tour.name}
        </h3>
        {tour.locationName && (
          <p className={styles.location}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21Z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            {tour.locationName}
          </p>
        )}

        <dl className={styles.infoGrid}>
          <div>
            <dt>Thời gian</dt>
            <dd>{durationText}</dd>
          </div>
          <div>
            <dt>Khởi hành</dt>
            <dd>{tour.departureDateRange || 'Đang cập nhật'}</dd>
          </div>
        </dl>

        <div className={styles.metaRow}>
          {tour.difficultyLevel && <span className={styles.difficulty}>{tour.difficultyLevel}</span>}
          {tour.slotStatusText && (
            <span className={isOpen ? styles.slotOpen : styles.slotClosed}>{tour.slotStatusText}</span>
          )}
        </div>

        {isOpen ? (
          <Link to={ROUTES.TOUR_DETAIL(tour.id)} className={styles.detailButton}>
            Xem chi tiết
          </Link>
        ) : (
          <span className={`${styles.detailButton} ${styles.detailButtonDisabled}`} aria-disabled="true">
            Xem chi tiết
          </span>
        )}
      </div>
    </article>
  );
}

import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './TourCard.module.css';

export default function TourCard({ tour }) {
  const isOpen = tour.status?.toLowerCase() === 'active' || tour.badgeStatus === 'Đang mở';
  const durationText = `${tour.durationDays}N${tour.durationNights}Đ`;

  return (
    <Link to={ROUTES.TOUR_DETAIL(tour.id)} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={tour.thumbnailUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'}
          alt={tour.name}
          className={styles.image}
          loading="lazy"
        />
        <span className={`${styles.badge} ${isOpen ? styles.badgeOpen : styles.badgeExpired}`}>
          {tour.badgeStatus || (isOpen ? 'Đang mở' : 'Hết hạn')}
        </span>
        <span className={styles.difficultyTag}>{tour.difficultyLevel}</span>
      </div>

      <div className={styles.body}>
        {tour.locationName && (
          <div className={styles.location}>
            <span>📍</span> {tour.locationName}
          </div>
        )}

        <h3 className={styles.title} title={tour.name}>
          {tour.name}
        </h3>

        <div className={styles.infoRow}>
          <span className={styles.infoItem}>
            <span>⏱️</span> {durationText}
          </span>
          {tour.departureDateRange && (
            <span className={styles.infoItem}>
              <span>📅</span> {tour.departureDateRange}
            </span>
          )}
        </div>

        {tour.slotStatusText && (
          <div className={`${styles.slotStatus} ${!isOpen ? styles.slotStatusExpired : ''}`}>
            <span>{isOpen ? '🟢' : '⚪'}</span>
            <strong>{tour.slotStatusText}</strong>
          </div>
        )}

        <div className={styles.footer}>
          <div>
            <div className={styles.priceLabel}>Giá trọn gói</div>
            <div className={styles.price}>{formatCurrency(tour.basePrice)}</div>
          </div>
          <button type="button" className={styles.btnDetail}>
            Chi tiết
          </button>
        </div>
      </div>
    </Link>
  );
}

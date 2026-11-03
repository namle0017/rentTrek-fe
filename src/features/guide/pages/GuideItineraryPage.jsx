import { Link, useParams } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { useGuideItinerary } from '../hooks/useGuidePortal';
import styles from './GuidePortal.module.css';

export default function GuideItineraryPage() {
  const { tripId } = useParams();
  const { data: itinerary, isLoading, isError, error, refetch } = useGuideItinerary(tripId);

  if (isLoading) return <Spinner />;
  if (isError || !itinerary) return <ErrorState message={error?.message} onRetry={refetch} />;

  const days = itinerary.days ?? [];

  return (
    <>
      <div className={styles.subNavRow}>
        <Link to={ROUTES.GUIDE_TRIP_GROUP(tripId)} className={styles.btnOutline}>
          ← Danh sách nhóm (G02)
        </Link>
        <Link to={ROUTES.GUIDE_ATTENDANCE(tripId)} className={styles.btnAccent}>
          ✓ Điểm danh (G04)
        </Link>
        <Link to={ROUTES.GUIDE_PROVIDED_ITEMS(tripId)} className={styles.btnOutline}>
          🎒 Đồ cấp (G06)
        </Link>
      </div>

      <div className={styles.tripCard}>
        <h1 className={styles.cardTitle}>Lịch trình Chuyến đi & Tiến độ Hoạt động (Màn G05 - 24.5)</h1>
        <p className={styles.metaText}>Tour: {itinerary.tourName}</p>
      </div>

      {days.length === 0 ? (
        <div className={styles.tripCard}>
          <p className={styles.metaText}>Chưa có lịch trình chi tiết cho chuyến đi này.</p>
        </div>
      ) : (
        days.map((day) => (
          <div key={day.dayNumber} className={styles.tripCard}>
            <h2 className={styles.cardTitle}>{day.title}</h2>
            {(day.activities ?? []).map((act) => (
              <div
                key={act.activityId}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: act.isCurrent ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  background: act.isCurrent ? '#fff7ed' : '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong>
                    {act.startTime} ({act.durationMinutes} phút) — {act.name}
                  </strong>
                  <span className={`${styles.badge} ${styles.badgePositive}`}>
                    Điểm danh: {act.attendanceRate}
                  </span>
                </div>
                {act.isCurrent && (
                  <span className={`${styles.badge} ${styles.badgeWarning}`}>🔥 Chặng đang diễn ra</span>
                )}
                {act.description && <p className={styles.metaText}>{act.description}</p>}
              </div>
            ))}
          </div>
        ))
      )}
    </>
  );
}

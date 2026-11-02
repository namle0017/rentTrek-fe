import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { TRIP_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import { useGuideTrips } from '../hooks/useGuidePortal';
import styles from './GuidePortal.module.css';

export default function GuideTripsPage() {
  const [tab, setTab] = useState('today'); // 'today' | 'upcoming' | 'completed'
  const { data: trips = [], isLoading, isError, error, refetch } = useGuideTrips(tab);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <>
      <div>
        <h1 className={styles.cardTitle} style={{ fontSize: '1.35rem' }}>
          Lịch Dẫn Đoàn Thực Địa (Màn G01)
        </h1>
        <p className={styles.metaText}>
          Chỉ hiển thị các nhóm bạn được phân công phụ trách. Hoàn toàn bảo mật thông tin tài
          chính.
        </p>
      </div>

      <div className={styles.tabBar}>
        <button
          type="button"
          className={`${styles.tabItem} ${tab === 'today' ? styles.tabItemActive : ''}`}
          onClick={() => setTab('today')}
        >
          Hôm nay
        </button>
        <button
          type="button"
          className={`${styles.tabItem} ${tab === 'upcoming' ? styles.tabItemActive : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Sắp tới
        </button>
        <button
          type="button"
          className={`${styles.tabItem} ${tab === 'completed' ? styles.tabItemActive : ''}`}
          onClick={() => setTab('completed')}
        >
          Đã xong
        </button>
      </div>

      {trips.length === 0 ? (
        <div className={styles.tripCard}>
          <p className={styles.metaText}>
            Không có chuyến đi nào trong mục này. Bạn có thể chuyển sang tab Sắp tới hoặc Đã xong.
          </p>
        </div>
      ) : (
        trips.map((item) => {
          const mapsUrl =
            item.meetingLocation?.latitude && item.meetingLocation?.longitude
              ? `https://www.google.com/maps/search/?api=1&query=${item.meetingLocation.latitude},${item.meetingLocation.longitude}`
              : null;

          return (
            <div key={`${item.tripId}-${item.groupId}`} className={styles.tripCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span className={`${styles.badge} ${styles.badgePositive}`}>{item.groupName}</span>
                <span className={`${styles.badge} ${styles.badgeWarning}`}>
                  {TRIP_STATUS_LABEL[item.tripStatus] ?? item.tripStatus}
                </span>
              </div>

              <h2 className={styles.cardTitle}>{item.tourName}</h2>

              <p className={styles.metaText}>
                🕒 Khởi hành: <strong>{formatDate(item.startAt)}</strong> →{' '}
                {formatDate(item.endAt)}
              </p>

              <p className={styles.metaText}>
                👥 Sĩ số nhóm: <strong>{item.participantCount}</strong> / {item.maxParticipants}{' '}
                khách
              </p>

              {item.meetingLocation?.name && (
                <p className={styles.metaText}>
                  📍 Điểm tập kết: <strong>{item.meetingLocation.name}</strong> (
                  {item.meetingLocation.address})
                  {mapsUrl && (
                    <>
                      {' '}
                      ·{' '}
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--color-primary)', fontWeight: 700 }}
                      >
                        Mở bản đồ ↗
                      </a>
                    </>
                  )}
                </p>
              )}

              <div className={styles.actionGrid}>
                <Link to={ROUTES.GUIDE_TRIP_GROUP(item.tripId)} className={styles.btnPrimary}>
                  👥 Danh sách khách (G02)
                </Link>
                <Link to={ROUTES.GUIDE_ATTENDANCE(item.tripId)} className={styles.btnAccent}>
                  ✓ Điểm danh nhanh (G04)
                </Link>
                <Link to={ROUTES.GUIDE_ITINERARY(item.tripId)} className={styles.btnOutline}>
                  🗺️ Lịch trình (G05)
                </Link>
                <Link to={ROUTES.GUIDE_PROVIDED_ITEMS(item.tripId)} className={styles.btnOutline}>
                  🎒 Đồ cấp đoàn (G06)
                </Link>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}

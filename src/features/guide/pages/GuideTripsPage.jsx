import { useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '@/components/Spinner';
import { TRIP_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import { useGuideTrips } from '../hooks/useGuidePortal';
import styles from './GuidePortal.module.css';

const MOCK_GUIDE_TRIPS = {
  today: [
    {
      tripId: 'TRIP-2026-FANSIPAN',
      groupId: 'grp-01',
      groupName: 'Đoàn 01 - Chinh phục Fansipan',
      tripStatus: 'IN_PROGRESS',
      tourName: 'Trekking Fansipan - Nóc Nhà Đông Dương',
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      participantCount: 8,
      maxParticipants: 10,
      meetingLocation: {
        name: 'Trạm Tôn - Cổng Vườn Quốc Gia Hoàng Liên',
        address: 'Xã San Sả Hồ, Sa Pa, Lào Cai',
        latitude: 22.3503,
        longitude: 103.7745,
      },
    },
  ],
  upcoming: [
    {
      tripId: 'TRIP-2026-TAXUA',
      groupId: 'grp-02',
      groupName: 'Đoàn 02 - Săn mây Tà Xùa',
      tripStatus: 'OPEN',
      tourName: 'Săn mây Tà Xùa - Sống Lưng Khủng Long',
      startAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      endAt: new Date(Date.now() + 9 * 24 * 3600 * 1000).toISOString(),
      participantCount: 12,
      maxParticipants: 15,
      meetingLocation: {
        name: 'Ngã Ba Bản Tà Xùa',
        address: 'Bắc Yên, Sơn La',
        latitude: 21.2854,
        longitude: 104.4628,
      },
    },
  ],
  completed: [
    {
      tripId: 'TRIP-2026-PUTALENG',
      groupId: 'grp-00',
      groupName: 'Đoàn 00 - Pú Tả Lèng mùa đỗ quyên',
      tripStatus: 'COMPLETED',
      tourName: 'Chinh phục Đỉnh Pú Tả Lèng',
      startAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      endAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      participantCount: 10,
      maxParticipants: 10,
      meetingLocation: {
        name: 'Bản Tả Lèng',
        address: 'Tam Đường, Lai Châu',
        latitude: 22.385,
        longitude: 103.582,
      },
    },
  ],
};

export default function GuideTripsPage() {
  const [tab, setTab] = useState('today'); // 'today' | 'upcoming' | 'completed'
  const { data: rawTrips, isLoading } = useGuideTrips(tab);

  const trips = (rawTrips && rawTrips.length > 0) ? rawTrips : (MOCK_GUIDE_TRIPS[tab] || []);

  if (isLoading) return <Spinner />;

  return (
    <>
      <div>
        <h1 className={styles.cardTitle} style={{ fontSize: '1.35rem' }}>
          Lịch dẫn đoàn thực địa
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
                Khởi hành: <strong>{formatDate(item.startAt)}</strong> →{' '}
                {formatDate(item.endAt)}
              </p>

              <p className={styles.metaText}>
                Sĩ số nhóm: <strong>{item.participantCount}</strong> / {item.maxParticipants}{' '}
                khách
              </p>

              {item.meetingLocation?.name && (
                <p className={styles.metaText}>
                  Điểm tập kết: <strong>{item.meetingLocation.name}</strong> (
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
                  Danh sách khách
                </Link>
                <Link to={ROUTES.GUIDE_ATTENDANCE(item.tripId)} className={styles.btnAccent}>
                  Điểm danh nhanh
                </Link>
                <Link to={ROUTES.GUIDE_ITINERARY(item.tripId)} className={styles.btnOutline}>
                  Lịch trình
                </Link>
                <Link to={ROUTES.GUIDE_PROVIDED_ITEMS(item.tripId)} className={styles.btnOutline}>
                  Đồ cấp đoàn
                </Link>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}

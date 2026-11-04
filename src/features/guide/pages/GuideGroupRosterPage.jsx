import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ATTENDANCE_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useGuideGroupRoster } from '../hooks/useGuidePortal';
import styles from './GuidePortal.module.css';

export default function GuideGroupRosterPage() {
  const { tripId } = useParams();
  const [search, setSearch] = useState('');
  const { data: roster, isLoading, isError, error, refetch } = useGuideGroupRoster(tripId, search);

  if (isLoading) return <Spinner />;
  if (isError || !roster) return <ErrorState message={error?.message} onRetry={refetch} />;

  const participants = roster.participants ?? [];

  return (
    <>
      <div className={styles.subNavRow}>
        <Link to={ROUTES.GUIDE_TRIPS} className={styles.btnOutline}>
          ← Lịch dẫn đoàn
        </Link>
        <Link to={ROUTES.GUIDE_ATTENDANCE(tripId)} className={styles.btnAccent}>
          Điểm danh nhanh
        </Link>
        <Link to={ROUTES.GUIDE_ITINERARY(tripId)} className={styles.btnOutline}>
          Lịch trình
        </Link>
        <Link to={ROUTES.GUIDE_PROVIDED_ITEMS(tripId)} className={styles.btnOutline}>
          Đồ cấp đoàn
        </Link>
      </div>

      <div className={styles.tripCard}>
        <span className={`${styles.badge} ${styles.badgePositive}`}>{roster.groupName}</span>
        <h1 className={styles.cardTitle}>{roster.tourName} — Thành viên nhóm</h1>
        {roster.currentActivity && (
          <p className={styles.metaText}>
            Hoạt động hiện tại: <strong>{roster.currentActivity.name}</strong> (Ngày{' '}
            {roster.currentActivity.dayNumber} · {roster.currentActivity.startTime})
          </p>
        )}

        <input
          type="search"
          placeholder="Tìm nhanh tên hoặc SĐT thành viên..."
          className={styles.input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {participants.length === 0 ? (
        <div className={styles.tripCard}>
          <p className={styles.metaText}>Không tìm thấy thành viên nào trong nhóm.</p>
        </div>
      ) : (
        participants.map((p) => (
          <div key={p.participantId} className={styles.tripCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className={styles.cardTitle}>{p.fullName}</h3>
                <p className={styles.metaText}>
                  {p.age ? `${p.age} tuổi` : 'Chưa rõ tuổi'} · SĐT: {p.phone || 'Chưa cập nhật'}
                </p>
              </div>
              <span
                className={`${styles.badge} ${
                  p.currentAttendanceStatus === 'Present'
                    ? styles.badgePositive
                    : p.currentAttendanceStatus
                      ? styles.badgeWarning
                      : styles.badgeDanger
                }`}
              >
                {ATTENDANCE_STATUS_LABEL[p.currentAttendanceStatus] ?? 'Chưa điểm danh'}
              </span>
            </div>

            <div className={styles.actionGrid}>
              {p.phone ? (
                <a href={`tel:${p.phone}`} className={styles.btnPrimary}>
                  Gọi điện ngay
                </a>
              ) : (
                <span className={styles.btnOutline}>Không có SĐT</span>
              )}
              <Link to={ROUTES.GUIDE_PARTICIPANT_DETAIL(p.participantId)} className={styles.btnOutline}>
                Hồ sơ an toàn & Cứu hộ
              </Link>
            </div>
          </div>
        ))
      )}
    </>
  );
}

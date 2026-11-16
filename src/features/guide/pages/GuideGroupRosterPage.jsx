import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ATTENDANCE_STATUS_LABEL, TRIP_STATUS, TRIP_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useGuideBatchAttendance, useGuideGroupRoster } from '../hooks/useGuidePortal';
import styles from './GuidePortal.module.css';

const STATUS_BUTTONS = [
  { status: 'Present', label: 'Có mặt', activeClass: 'statusBtnPresent' },
  { status: 'Late', label: 'Đến muộn', activeClass: 'statusBtnLate' },
  { status: 'Absent', label: 'Vắng mặt', activeClass: 'statusBtnAbsent' },
];

export default function GuideGroupRosterPage() {
  const { tripId } = useParams();
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);
  const { data: roster, isLoading, isError, error, refetch } = useGuideGroupRoster(tripId, search);
  const attendanceMutation = useGuideBatchAttendance(tripId);

  if (isLoading) return <Spinner />;
  if (isError || !roster) return <ErrorState message={error?.message} onRetry={refetch} />;

  const participants = roster.participants ?? [];
  const activityId = roster.currentActivity?.activityId;
  // BE chỉ nhận điểm danh khi chuyến InProgress (409 TRIP_NOT_IN_PROGRESS)
  const isInProgress = roster.tripStatus === TRIP_STATUS.IN_PROGRESS;
  const canTakeAttendance = isInProgress && Boolean(activityId) && !attendanceMutation.isPending;

  const submit = async (payload, successText) => {
    setFeedback(null);
    try {
      const res = await attendanceMutation.mutateAsync({
        activityId,
        clientBatchId: crypto.randomUUID(),
        ...payload,
      });
      setFeedback({ type: 'success', text: `${successText} (${res.data?.progressText ?? 'đã lưu'}).` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể lưu điểm danh.' });
    }
  };

  const handleMarkAllPresent = () =>
    submit({ markAllPresent: true, attendances: [] }, 'Đã đánh dấu cả nhóm có mặt');

  const handleStatus = (participant, status) => {
    const saved = participant.currentAttendanceStatus;
    if (saved === status) return;

    let reason = null;
    if (saved) {
      // BE bắt buộc lý do khi sửa trạng thái đã lưu (REASON_REQUIRED_FOR_UPDATE)
      reason = window.prompt(`Lý do đổi trạng thái của ${participant.fullName}:`)?.trim();
      if (!reason) return;
    }

    submit(
      { markAllPresent: false, attendances: [{ participantId: participant.participantId, status, reason }] },
      `Đã lưu ${participant.fullName}: ${ATTENDANCE_STATUS_LABEL[status] ?? status}`,
    );
  };

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

        {isInProgress ? (
          <button
            type="button"
            className={styles.btnAccent}
            onClick={handleMarkAllPresent}
            disabled={!canTakeAttendance || participants.length === 0}
          >
            Đánh dấu tất cả có mặt
          </button>
        ) : (
          <p className={`${styles.badge} ${styles.badgeWarning}`} role="status">
            Chuyến đang ở trạng thái {TRIP_STATUS_LABEL[roster.tripStatus] ?? roster.tripStatus}. Điểm danh sẽ
            mở khi Điều hành đóng bán và bấm “Bắt đầu chuyến”.
          </p>
        )}
      </div>

      {feedback && (
        <p
          className={`${styles.badge} ${feedback.type === 'error' ? styles.badgeDanger : styles.badgePositive}`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </p>
      )}

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

            {isInProgress && (
              <div className={styles.statusBtnGroup}>
                {STATUS_BUTTONS.map(({ status, label, activeClass }) => (
                  <button
                    key={status}
                    type="button"
                    className={`${styles.statusBtn} ${p.currentAttendanceStatus === status ? styles[activeClass] : ''}`}
                    aria-pressed={p.currentAttendanceStatus === status}
                    onClick={() => handleStatus(p, status)}
                    disabled={!canTakeAttendance}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

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

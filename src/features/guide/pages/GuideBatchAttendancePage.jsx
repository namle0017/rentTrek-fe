import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import {
  useGuideBatchAttendance,
  useGuideGroupRoster,
  useGuideItinerary,
} from '../hooks/useGuidePortal';
import styles from './GuidePortal.module.css';

const OFFLINE_QUEUE_KEY = 'rentrek_guide_offline_attendance_queue';

function readOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeOfflineQueue(queue) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore storage errors
  }
}

function createClientBatchId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `guide-sync-${crypto.randomUUID()}`;
  }
  return `guide-sync-${Date.now()}`;
}

export default function GuideBatchAttendancePage() {
  const { tripId } = useParams();
  const { data: roster, isLoading, isError, error, refetch } = useGuideGroupRoster(tripId);
  const { data: itinerary } = useGuideItinerary(tripId);
  const batchMutation = useGuideBatchAttendance(tripId);

  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [reasonsByParticipant, setReasonsByParticipant] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState(() => readOfflineQueue());

  if (isLoading) return <Spinner />;
  if (isError || !roster) return <ErrorState message={error?.message} onRetry={refetch} />;

  const allActivities = (itinerary?.days ?? []).flatMap((d) =>
    (d.activities ?? []).map((a) => ({ ...a, dayNumber: d.dayNumber })),
  );
  const activeActivityId =
    selectedActivityId ||
    roster.currentActivity?.activityId ||
    allActivities[0]?.activityId ||
    '';

  const submitPayload = async (payload) => {
    setFeedback(null);
    const clientBatchId = payload.clientBatchId || createClientBatchId();
    const fullPayload = { ...payload, clientBatchId };

    try {
      const res = await batchMutation.mutateAsync(fullPayload);
      const data = res.data;
      setFeedback({
        type: 'success',
        text: `Đã lưu điểm danh thành công (${data?.progressText ?? 'Hoàn tất'}).`,
      });
    } catch (err) {
      // Nếu mất mạng thực địa, đẩy vào hàng đợi Offline kèm clientBatchId để chống trùng lặp khi gửi lại
      if (!navigator.onLine) {
        const nextQueue = [...offlineQueue, { tripId, payload: fullPayload }];
        setOfflineQueue(nextQueue);
        writeOfflineQueue(nextQueue);
        setFeedback({
          type: 'warning',
          text: 'Thiết bị đang mất sóng. Đã lưu bản ghi vào hàng đợi Offline để đồng bộ lại khi có mạng!',
        });
        return;
      }
      setFeedback({ type: 'error', text: err.message || 'Không thể gửi điểm danh.' });
    }
  };

  const handleMarkAllPresent = () => {
    if (!activeActivityId) return;
    submitPayload({
      activityId: activeActivityId,
      markAllPresent: true,
      attendances: [],
    });
  };

  const handleSingleStatus = (participant, nextStatus) => {
    if (!activeActivityId) return;
    const isChangingSaved =
      participant.currentAttendanceStatus && participant.currentAttendanceStatus !== nextStatus;
    const reason = (reasonsByParticipant[participant.participantId] || '').trim();

    if (isChangingSaved && !reason) {
      setFeedback({
        type: 'error',
        text: `Vui lòng nhập lý do trước khi đổi trạng thái đã lưu của ${participant.fullName}.`,
      });
      return;
    }

    submitPayload({
      activityId: activeActivityId,
      markAllPresent: false,
      attendances: [
        {
          participantId: participant.participantId,
          status: nextStatus,
          reason: reason || null,
        },
      ],
    });
  };

  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    const remaining = [];
    for (const item of offlineQueue) {
      try {
        await batchMutation.mutateAsync(item.payload);
      } catch {
        remaining.push(item);
      }
    }
    setOfflineQueue(remaining);
    writeOfflineQueue(remaining);
    setFeedback({
      type: remaining.length === 0 ? 'success' : 'warning',
      text:
        remaining.length === 0
          ? 'Đã đồng bộ toàn bộ hàng đợi điểm danh Offline thành công!'
          : `Còn ${remaining.length} bản ghi chưa đồng bộ được.`,
    });
  };

  return (
    <>
      <div className={styles.subNavRow}>
        <Link to={ROUTES.GUIDE_TRIP_GROUP(tripId)} className={styles.btnOutline}>
          ← Danh sách nhóm (G02)
        </Link>
        <Link to={ROUTES.GUIDE_ITINERARY(tripId)} className={styles.btnOutline}>
          🗺️ Lịch trình (G05)
        </Link>
      </div>

      <div className={styles.tripCard}>
        <h1 className={styles.cardTitle}>Điểm danh Thực địa 1 Chạm (Màn G04 - 24.4)</h1>
        <p className={styles.metaText}>
          Nhóm: <strong>{roster.groupName}</strong> · Hỗ trợ đồng bộ Offline Idempotency
        </p>

        <label htmlFor="activitySelect" className={styles.metaText}>
          Chọn chặng hoạt động điểm danh:
        </label>
        <select
          id="activitySelect"
          className={styles.input}
          value={activeActivityId}
          onChange={(e) => setSelectedActivityId(e.target.value)}
        >
          {allActivities.map((act) => (
            <option key={act.activityId} value={act.activityId}>
              Ngày {act.dayNumber} ({act.startTime}) — {act.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={styles.btnAccent}
          onClick={handleMarkAllPresent}
          disabled={batchMutation.isPending || !activeActivityId}
        >
          ✓ Đánh dấu TẤT CẢ CÓ MẶT (1 chạm)
        </button>

        {offlineQueue.length > 0 && (
          <button type="button" className={styles.btnPrimary} onClick={handleSyncOfflineQueue}>
            🔄 Đồng bộ {offlineQueue.length} bản ghi Offline đang chờ
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={styles.tripCard}
          style={{
            borderLeftColor: feedback.type === 'error' ? '#dc2626' : '#166534',
          }}
        >
          <strong>{feedback.text}</strong>
        </div>
      )}

      {(roster.participants ?? []).map((p) => (
        <div key={p.participantId} className={styles.tripCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{p.fullName}</strong>
            <span className={styles.metaText}>{p.phone || ''}</span>
          </div>

          <div className={styles.statusBtnGroup}>
            <button
              type="button"
              className={`${styles.statusBtn} ${
                p.currentAttendanceStatus === 'Present' ? styles.statusBtnPresent : ''
              }`}
              onClick={() => handleSingleStatus(p, 'Present')}
            >
              ✓ Có mặt
            </button>
            <button
              type="button"
              className={`${styles.statusBtn} ${
                p.currentAttendanceStatus === 'Late' ? styles.statusBtnLate : ''
              }`}
              onClick={() => handleSingleStatus(p, 'Late')}
            >
              ⏳ Đến muộn
            </button>
            <button
              type="button"
              className={`${styles.statusBtn} ${
                p.currentAttendanceStatus === 'Absent' ? styles.statusBtnAbsent : ''
              }`}
              onClick={() => handleSingleStatus(p, 'Absent')}
            >
              ✕ Vắng mặt
            </button>
          </div>

          <input
            type="text"
            placeholder="Nhập lý do (bắt buộc nếu sửa trạng thái đã lưu)..."
            className={styles.input}
            value={reasonsByParticipant[p.participantId] ?? ''}
            onChange={(e) =>
              setReasonsByParticipant((prev) => ({
                ...prev,
                [p.participantId]: e.target.value,
              }))
            }
          />
        </div>
      ))}
    </>
  );
}

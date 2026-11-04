import { useState } from 'react';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABEL } from '@/constants/enums';
import { formatDate } from '@/utils/formatDate';
import {
  useTripAttendanceHistory,
  useTripAttendanceMatrix,
  useUpdateTripAttendances,
} from '../hooks/useAdminTrips';
import styles from '../pages/AdminTripOps.module.css';

export default function TripAttendanceMatrixTab({ tripId }) {
  const [groupFilter, setGroupFilter] = useState('');
  const {
    data: matrix,
    isLoading,
    isError,
    error,
    refetch,
  } = useTripAttendanceMatrix(tripId, groupFilter || undefined);
  const { data: history = [] } = useTripAttendanceHistory(tripId);
  const updateAttendances = useUpdateTripAttendances(tripId);

  const [pendingEdit, setPendingEdit] = useState(null);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState(null);

  const activities = matrix?.activities ?? [];
  const participants = matrix?.participants ?? [];

  const handleCellChange = async (participant, activity, nextStatus, existingCell) => {
    if (!nextStatus) return;
    setFeedback(null);

    // Nếu ô điểm danh đã có trạng thái trước đó và người dùng sửa sang trạng thái khác -> Bắt buộc nhập lý do (11.2)
    if (existingCell?.status && existingCell.status !== nextStatus) {
      setPendingEdit({
        participantId: participant.participantId,
        participantName: participant.fullName,
        activityId: activity.activityId,
        activityName: activity.name,
        oldStatus: existingCell.status,
        newStatus: nextStatus,
      });
      setReason('');
      return;
    }

    try {
      await updateAttendances.mutateAsync({
        activityId: activity.activityId,
        records: [
          {
            participantId: participant.participantId,
            status: nextStatus,
            reason: null,
          },
        ],
      });
      setFeedback({
        type: 'success',
        text: `Đã ghi nhận điểm danh "${ATTENDANCE_STATUS_LABEL[nextStatus]}" cho ${participant.fullName}.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể lưu điểm danh.' });
    }
  };

  const handleConfirmReasonEdit = async (e) => {
    e.preventDefault();
    if (!pendingEdit) return;
    setFeedback(null);
    try {
      await updateAttendances.mutateAsync({
        activityId: pendingEdit.activityId,
        records: [
          {
            participantId: pendingEdit.participantId,
            status: pendingEdit.newStatus,
            reason: reason.trim(),
          },
        ],
      });
      setPendingEdit(null);
      setReason('');
      setFeedback({
        type: 'success',
        text: 'Đã cập nhật điểm danh và lưu lịch sử kiểm toán (Audit Log).',
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể cập nhật điểm danh.' });
    }
  };

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Ma trận Điểm danh Hoạt động Tour (Màn O14)</h2>
            <p className={styles.subtitle}>
              Chọn trạng thái điểm danh cho từng khách theo từng chặng hoạt động. Khi sửa trạng thái đã lưu,
              hệ thống yêu cầu lý do và ghi Audit Log.
            </p>
          </div>

          <div className={styles.field} style={{ minWidth: 240 }}>
            <input
              type="text"
              placeholder="Lọc theo Group ID (tùy chọn)..."
              className={styles.input}
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            />
          </div>
        </div>

        {feedback && (
          <div
            className={`${styles.alertBanner} ${
              feedback.type === 'error' ? styles.alertError : styles.alertSuccess
            }`}
            style={{ marginBottom: 14 }}
          >
            {feedback.text}
          </div>
        )}

        {activities.length === 0 || participants.length === 0 ? (
          <p className={styles.subtitle}>
            Chưa có hoạt động lịch trình hoặc chưa có hành khách tham gia chuyến đi này.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Hành khách</th>
                  <th>Nhóm</th>
                  {activities.map((act) => (
                    <th key={act.activityId}>
                      <div>
                        Ngày {act.dayNumber} · {act.startTime}
                      </div>
                      <div>{act.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.participantId}>
                    <td>
                      <strong>{p.fullName}</strong>
                    </td>
                    <td>{p.groupName || 'Chưa phân nhóm'}</td>
                    {activities.map((act) => {
                      const cell = p.attendances?.[act.activityId];
                      return (
                        <td key={act.activityId}>
                          <select
                            className={styles.select}
                            value={cell?.status ?? ''}
                            onChange={(e) => handleCellChange(p, act, e.target.value, cell)}
                          >
                            <option value="">-- Chưa điểm danh --</option>
                            {Object.values(ATTENDANCE_STATUS).map((st) => (
                              <option key={st} value={st}>
                                {ATTENDANCE_STATUS_LABEL[st]}
                              </option>
                            ))}
                          </select>
                          {cell?.checkedBy && (
                            <div className={styles.subtitle} style={{ fontSize: "var(--font-size-section-title)" }}>
                              Bởi: {cell.checkedBy}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bảng lịch sử chỉnh sửa điểm danh (11.3) */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Lịch sử Kiểm toán Chỉnh sửa Điểm danh ({history.length})</h3>
        </div>

        {history.length === 0 ? (
          <p className={styles.subtitle}>Chưa có lịch sử chỉnh sửa điểm danh nào.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Thời điểm</th>
                  <th>Người thực hiện</th>
                  <th>Hành động</th>
                  <th>Chi tiết & Lý do điều chỉnh</th>
                </tr>
              </thead>
              <tbody>
                {history.map((log) => (
                  <tr key={log.auditLogId}>
                    <td>{formatDate(log.createdAt)}</td>
                    <td>
                      <strong>{log.actorName}</strong>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeInfo}`}>{log.action}</span>
                    </td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal nhập lý do sửa điểm danh đã lưu (11.2) */}
      {pendingEdit && (
        <div className={styles.modalBackdrop}>
          <form className={styles.modalCard} onSubmit={handleConfirmReasonEdit}>
            <h2 className={styles.cardTitle}>Nhập lý do điều chỉnh điểm danh</h2>
            <p className={styles.subtitle}>
              Bạn đang thay đổi trạng thái điểm danh của khách <strong>{pendingEdit.participantName}</strong>{' '}
              tại hoạt động <strong>{pendingEdit.activityName}</strong> từ{' '}
              <strong>{ATTENDANCE_STATUS_LABEL[pendingEdit.oldStatus]}</strong> sang{' '}
              <strong>{ATTENDANCE_STATUS_LABEL[pendingEdit.newStatus]}</strong>.
            </p>
            <div className={styles.field}>
              <label htmlFor="editReason">Lý do điều chỉnh (bắt buộc) *</label>
              <textarea
                id="editReason"
                className={styles.textarea}
                placeholder="VD: Khách đến muộn 15 phút do kẹt xe tại đèo..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <div className={styles.actionRow} style={{ justifyContent: 'flex-end' }}>
              <button type="button" className={styles.btnOutline} onClick={() => setPendingEdit(null)}>
                Hủy
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={updateAttendances.isPending}>
                Lưu điều chỉnh
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

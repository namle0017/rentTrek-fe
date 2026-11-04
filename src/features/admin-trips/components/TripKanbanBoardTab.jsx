import { useState } from 'react';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { useKanbanGroupMutations, useKanbanGroupsBoard } from '../hooks/useAdminTrips';
import styles from '../pages/AdminTripOps.module.css';

export default function TripKanbanBoardTab({ tripId }) {
  const { data: board, isLoading, isError, error, refetch } = useKanbanGroupsBoard(tripId);
  const { createGroup, updateGroup, deleteGroup, assignParticipantGroup, autoGroup, approveSplit } =
    useKanbanGroupMutations(tripId);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({
    groupName: '',
    maxParticipants: 10,
    guideUserId: '',
  });
  const [splitModalBooking, setSplitModalBooking] = useState(null);
  const [splitReason, setSplitReason] = useState('');
  const [feedback, setFeedback] = useState(null);

  const unassigned = board?.unassignedParticipants ?? [];
  const groups = board?.groups ?? [];

  const openNewGroupModal = () => {
    setEditingGroup(null);
    setGroupForm({ groupName: '', maxParticipants: 10, guideUserId: '' });
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (group) => {
    setEditingGroup(group);
    setGroupForm({
      groupName: group.groupName,
      maxParticipants: group.maxParticipants,
      guideUserId: group.guide?.userId ?? '',
    });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    setFeedback(null);
    const payload = {
      groupName: groupForm.groupName.trim(),
      maxParticipants: Number(groupForm.maxParticipants),
      guideUserId: groupForm.guideUserId.trim() || null,
    };

    try {
      if (editingGroup) {
        await updateGroup.mutateAsync({ groupId: editingGroup.groupId, payload });
        setFeedback({ type: 'success', text: 'Đã cập nhật thông tin nhóm.' });
      } else {
        await createGroup.mutateAsync(payload);
        setFeedback({ type: 'success', text: 'Đã tạo nhóm mới trong chuyến.' });
      }
      setIsGroupModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể lưu thông tin nhóm.' });
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Giải tán "${groupName}"? Toàn bộ khách trong nhóm sẽ quay về cột Chưa xếp nhóm.`))
      return;
    setFeedback(null);
    try {
      await deleteGroup.mutateAsync(groupId);
      setFeedback({
        type: 'success',
        text: `Đã giải tán ${groupName} và đưa khách về cột chưa xếp nhóm.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể xóa nhóm.' });
    }
  };

  const handleAssign = async (participantId, targetGroupId) => {
    setFeedback(null);
    try {
      await assignParticipantGroup.mutateAsync({
        participantId,
        targetGroupId: targetGroupId || null,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể chuyển nhóm cho khách.' });
    }
  };

  const handleAutoGroup = async () => {
    setFeedback(null);
    try {
      const res = await autoGroup.mutateAsync();
      const result = res.data;
      setFeedback({
        type: 'success',
        text: `Thuật toán tự động chia nhóm hoàn tất: đã xếp ${
          result?.assignedCount ?? 0
        } khách (còn ${result?.remainingUnassignedCount ?? 0} khách chưa xếp).`,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể tự động chia nhóm.' });
    }
  };

  const handleConfirmSplit = async (e) => {
    e.preventDefault();
    if (!splitModalBooking) return;
    setFeedback(null);
    try {
      await approveSplit.mutateAsync({
        bookingId: splitModalBooking.bookingOrderId,
        reason: splitReason.trim(),
      });
      setSplitModalBooking(null);
      setSplitReason('');
      setFeedback({
        type: 'success',
        text: `Đã phê duyệt tách nhóm cho đơn ${splitModalBooking.orderCode}.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể phê duyệt tách đoàn.' });
    }
  };

  const onDragStart = (e, participantId) => {
    e.dataTransfer.setData('text/plain', participantId);
  };

  const onDropToGroup = (e, targetGroupId) => {
    e.preventDefault();
    const participantId = e.dataTransfer.getData('text/plain');
    if (participantId) {
      handleAssign(participantId, targetGroupId);
    }
  };

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <div className={styles.page}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Bảng Kanban Chia nhóm & Phân công Guide (Màn O12)</h2>
          <p className={styles.subtitle}>
            Kéo thả thẻ hành khách vào nhóm hoặc chọn nhanh từ menu. Ưu tiên giữ khách cùng đơn đặt ở chung
            nhóm.
          </p>
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleAutoGroup}
            disabled={autoGroup.isPending || unassigned.length === 0 || groups.length === 0}
          >
            Tự động chia nhóm (Auto-group)
          </button>
          <button type="button" className={styles.btnAccent} onClick={openNewGroupModal}>
            + Tạo nhóm mới
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`${styles.alertBanner} ${
            feedback.type === 'error' ? styles.alertError : styles.alertSuccess
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className={styles.kanbanBoard}>
        {/* Cột 1: Khách chưa xếp nhóm */}
        <div
          className={styles.kanbanColumn}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDropToGroup(e, null)}
        >
          <div className={styles.cardHeader} style={{ marginBottom: 4 }}>
            <h3 className={styles.cardTitle}>Chưa xếp nhóm ({unassigned.length})</h3>
          </div>

          {unassigned.length === 0 ? (
            <p className={styles.subtitle}>Toàn bộ hành khách đã được phân nhóm.</p>
          ) : (
            unassigned.map((p) => (
              <div
                key={p.participantId}
                className={styles.participantCard}
                draggable
                onDragStart={(e) => onDragStart(e, p.participantId)}
              >
                <div className={styles.headerRow}>
                  <strong>{p.fullName}</strong>
                  <span className={`${styles.badge} ${styles.badgeInfo}`}>{p.orderCode}</span>
                </div>
                <div className={styles.subtitle}>
                  SĐT: {p.phone || 'Chưa cập nhật'} · {p.groupingPreference}
                </div>

                <div className={styles.actionRow}>
                  <select
                    className={styles.select}
                    value=""
                    onChange={(e) => handleAssign(p.participantId, e.target.value)}
                  >
                    <option value="">+ Gán vào nhóm...</option>
                    {groups.map((g) => (
                      <option
                        key={g.groupId}
                        value={g.groupId}
                        disabled={g.currentCount >= g.maxParticipants}
                      >
                        {g.groupName} ({g.currentCount}/{g.maxParticipants})
                      </option>
                    ))}
                  </select>

                  {!p.isSplit && (
                    <button
                      type="button"
                      className={`${styles.btnOutline} ${styles.btnSm}`}
                      onClick={() => setSplitModalBooking(p)}
                    >
                      Duyệt tách đoàn
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Các cột nhóm đã tạo */}
        <div className={styles.kanbanGroupsGrid}>
          {groups.map((group) => (
            <div
              key={group.groupId}
              className={styles.kanbanColumn}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropToGroup(e, group.groupId)}
            >
              <div className={styles.headerRow}>
                <div>
                  <h3 className={styles.cardTitle}>{group.groupName}</h3>
                  <span className={styles.subtitle}>
                    Sĩ số: <strong>{group.currentCount}</strong> / {group.maxParticipants} khách
                  </span>
                </div>
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={`${styles.btnOutline} ${styles.btnSm}`}
                    onClick={() => openEditGroupModal(group)}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className={`${styles.btnDanger} ${styles.btnSm}`}
                    onClick={() => handleDeleteGroup(group.groupId, group.groupName)}
                  >
                    Giải tán
                  </button>
                </div>
              </div>

              <div>
                {group.guide ? (
                  <span className={`${styles.badge} ${styles.badgePositive}`}>
                    Guide: {group.guide.fullName}
                  </span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgeWarning}`}>Chưa gán Hướng dẫn viên</span>
                )}
              </div>

              {group.hasScheduleWarning && (
                <div className={`${styles.alertBanner} ${styles.alertError}`}>
                  {group.scheduleWarningMessage}
                </div>
              )}

              {group.participants.map((p) => (
                <div
                  key={p.participantId}
                  className={styles.participantCard}
                  draggable
                  onDragStart={(e) => onDragStart(e, p.participantId)}
                >
                  <div className={styles.headerRow}>
                    <strong>{p.fullName}</strong>
                    <span className={`${styles.badge} ${styles.badgeNeutral}`}>{p.orderCode}</span>
                  </div>
                  <div className={styles.actionRow} style={{ justifyContent: 'space-between' }}>
                    <span className={styles.subtitle}>{p.phone || ''}</span>
                    <button
                      type="button"
                      className={`${styles.btnOutline} ${styles.btnSm}`}
                      onClick={() => handleAssign(p.participantId, null)}
                    >
                      Gỡ khỏi nhóm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tạo / Sửa Nhóm */}
      {isGroupModalOpen && (
        <div className={styles.modalBackdrop}>
          <form className={styles.modalCard} onSubmit={handleSaveGroup}>
            <h2 className={styles.cardTitle}>
              {editingGroup ? 'Sửa thông tin nhóm (9.3)' : 'Tạo nhóm mới trong chuyến (9.2)'}
            </h2>

            <div className={styles.field}>
              <label htmlFor="groupName">Tên nhóm (duy nhất trong chuyến)</label>
              <input
                id="groupName"
                type="text"
                placeholder="VD: Nhóm Đại Bàng"
                className={styles.input}
                value={groupForm.groupName}
                onChange={(e) => setGroupForm({ ...groupForm, groupName: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="maxPart">Sĩ số tối đa (Max Participants)</label>
              <input
                id="maxPart"
                type="number"
                min="1"
                className={styles.input}
                value={groupForm.maxParticipants}
                onChange={(e) => setGroupForm({ ...groupForm, maxParticipants: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="guideId">Mã Hướng dẫn viên phụ trách (Guide UserId)</label>
              <input
                id="guideId"
                type="text"
                placeholder="Nhập GUID tài khoản Guide..."
                className={styles.input}
                value={groupForm.guideUserId}
                onChange={(e) => setGroupForm({ ...groupForm, guideUserId: e.target.value })}
              />
            </div>

            <div className={styles.actionRow} style={{ justifyContent: 'flex-end' }}>
              <button type="button" className={styles.btnOutline} onClick={() => setIsGroupModalOpen(false)}>
                Hủy
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Lưu nhóm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Duyệt tách đoàn (9.7) */}
      {splitModalBooking && (
        <div className={styles.modalBackdrop}>
          <form className={styles.modalCard} onSubmit={handleConfirmSplit}>
            <h2 className={styles.cardTitle}>
              Phê duyệt tách booking đi chung ({splitModalBooking.orderCode})
            </h2>
            <p className={styles.subtitle}>
              Đơn hàng này đăng ký nguyện vọng đi chung nhóm. Vui lòng nhập lý do tách đoàn để lưu vào nhật ký
              kiểm toán (Audit Log).
            </p>
            <div className={styles.field}>
              <label htmlFor="splitReason">Lý do tách đoàn *</label>
              <textarea
                id="splitReason"
                className={styles.textarea}
                value={splitReason}
                onChange={(e) => setSplitReason(e.target.value)}
                required
              />
            </div>
            <div className={styles.actionRow} style={{ justifyContent: 'flex-end' }}>
              <button type="button" className={styles.btnOutline} onClick={() => setSplitModalBooking(null)}>
                Đóng
              </button>
              <button type="submit" className={styles.btnAccent}>
                Xác nhận duyệt tách đoàn
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import {
  useAssignTripGroupGuide,
  useMoveBookingToGroup,
  usePublishTripGrouping,
  useSplitTripBooking,
  useTourGuideOptions,
  useTripGrouping,
} from '../hooks/useTripGroups';
import styles from './TripGroupingPage.module.css';

function BookingCard({ booking, currentGroupId, groups, canEdit, onMove, onSplit }) {
  return (
    <article className={styles.bookingCard}>
      <div className={styles.bookingHeader}>
        <div>
          <small>{booking.orderCode}</small>
          <strong>{booking.participantCount} người</strong>
        </div>
        {booking.isSplit && <span className={styles.splitBadge}>Đã tách</span>}
      </div>
      <ul>
        {booking.participants.map((participant) => (
          <li key={participant.participantId}>{participant.fullName}</li>
        ))}
      </ul>
      {canEdit && (
        <div className={styles.bookingActions}>
          <select
            aria-label={`Chuyển booking ${booking.orderCode}`}
            value={currentGroupId || ''}
            onChange={(event) => onMove(booking, event.target.value)}
          >
            <option value="" disabled>
              Chọn nhóm
            </option>
            {groups.map((group) => (
              <option key={group.tripGroupId} value={group.tripGroupId}>
                {group.groupName}
              </option>
            ))}
          </select>
          {booking.participantCount > 1 && (
            <button type="button" onClick={() => onSplit(booking, currentGroupId)}>
              Tách booking
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function SplitBookingDialog({
  value,
  groups,
  reason,
  assignments,
  onReason,
  onAssign,
  onClose,
  onSubmit,
  pending,
}) {
  if (!value) return null;
  const ready =
    reason.trim() && value.participants.every((participant) => assignments[participant.participantId]);

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="split-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.dialogHeader}>
          <div>
            <span className={styles.eyebrow}>{value.orderCode}</span>
            <h2 id="split-title">Tách booking</h2>
          </div>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <p className={styles.dialogWarning}>
          Chỉ tách khi không thể giữ cả booking trong một nhóm. Hệ thống lưu lý do và người duyệt.
        </p>
        <div className={styles.assignmentList}>
          {value.participants.map((participant) => (
            <label key={participant.participantId}>
              <span>{participant.fullName}</span>
              <select
                aria-label={`Nhóm của ${participant.fullName}`}
                value={assignments[participant.participantId] || ''}
                onChange={(event) => onAssign(participant.participantId, event.target.value)}
              >
                <option value="" disabled>
                  Chọn nhóm
                </option>
                {groups.map((group) => (
                  <option key={group.tripGroupId} value={group.tripGroupId}>
                    {group.groupName}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <label className={styles.reasonField}>
          <span>
            Lý do tách <b>*</b>
          </span>
          <textarea value={reason} onChange={(event) => onReason(event.target.value)} rows="3" />
        </label>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={!ready || pending}
            onClick={onSubmit}
          >
            {pending ? 'Đang lưu...' : 'Xác nhận tách'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function TripGroupingPage() {
  const { tripId } = useParams();
  const { currentUser } = useAuth();
  const groupingQuery = useTripGrouping(tripId);
  const moveMutation = useMoveBookingToGroup();
  const guideMutation = useAssignTripGroupGuide();
  const publishMutation = usePublishTripGrouping();
  const splitMutation = useSplitTripBooking();
  const canEdit = [USER_ROLE.ADMIN, USER_ROLE.STAFF].includes(currentUser?.role);
  const guideQuery = useTourGuideOptions(canEdit);
  const [splitBooking, setSplitBooking] = useState(null);
  const [splitReason, setSplitReason] = useState('');
  const [splitAssignments, setSplitAssignments] = useState({});
  const [actionError, setActionError] = useState('');
  const snapshot = groupingQuery.data;
  const guideOptions = useMemo(() => guideQuery.data || [], [guideQuery.data]);

  if (groupingQuery.isLoading) return <Spinner fullScreen />;
  if (groupingQuery.isError)
    return (
      <ErrorState
        message={groupingQuery.error?.message || 'Không thể tải dữ liệu phân nhóm.'}
        onRetry={groupingQuery.refetch}
      />
    );
  if (!snapshot) return <EmptyState message="Chưa có dữ liệu phân nhóm cho chuyến này." />;

  const moveBooking = async (booking, targetGroupId) => {
    setActionError('');
    try {
      await moveMutation.mutateAsync({
        tripId,
        bookingOrderId: booking.bookingOrderId,
        targetGroupId,
        expectedTripRowVersion: snapshot.rowVersion,
      });
    } catch (error) {
      setActionError(error?.message || 'Không thể chuyển booking.');
    }
  };

  const assignGuide = async (groupId, guideUserId) => {
    setActionError('');
    try {
      await guideMutation.mutateAsync({
        tripId,
        groupId,
        guideUserId: guideUserId || null,
        expectedTripRowVersion: snapshot.rowVersion,
      });
    } catch (error) {
      setActionError(error?.message || 'Không thể gán guide.');
    }
  };

  const openSplit = (booking, currentGroupId) => {
    setSplitBooking(booking);
    setSplitReason('');
    setSplitAssignments(
      Object.fromEntries(
        booking.participants.map((participant) => [participant.participantId, currentGroupId || '']),
      ),
    );
  };

  const closeSplit = () => {
    setSplitBooking(null);
    setSplitReason('');
    setSplitAssignments({});
  };

  const submitSplit = async () => {
    const byGroup = Object.entries(splitAssignments).reduce((result, [participantId, groupId]) => {
      if (!result[groupId]) result[groupId] = [];
      result[groupId].push(participantId);
      return result;
    }, {});
    setActionError('');
    try {
      await splitMutation.mutateAsync({
        tripId,
        bookingOrderId: splitBooking.bookingOrderId,
        reason: splitReason.trim(),
        expectedTripRowVersion: snapshot.rowVersion,
        assignments: Object.entries(byGroup).map(([tripGroupId, participantIds]) => ({
          tripGroupId,
          participantIds,
        })),
      });
      closeSplit();
    } catch (error) {
      setActionError(error?.message || 'Không thể tách booking.');
    }
  };

  const publishGrouping = async () => {
    setActionError('');
    try {
      await publishMutation.mutateAsync({
        tripId,
        expectedTripRowVersion: snapshot.rowVersion,
      });
    } catch (error) {
      setActionError(error?.message || 'Không thể chốt phân nhóm.');
    }
  };

  return (
    <main className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Quản lý Chuyến đi', to: ROUTES.ADMIN_TRIPS },
          { label: `Phân nhóm chuyến #${snapshot.tripId}` },
        ]}
      />
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>TRIP {snapshot.tripId}</span>
          <h1>Phân nhóm chuyến đi</h1>
          <p>Booking được tự xếp sau thanh toán. Staff chỉ xử lý ngoại lệ, overflow, guide và chốt.</p>
        </div>
        <span className={snapshot.groupingStatus === 'Published' ? styles.publishedBadge : styles.draftBadge}>
          {snapshot.groupingStatus === 'Published' ? 'Đã chốt' : 'Nháp'}
        </span>
      </header>

      {!canEdit && snapshot.groupingStatus === 'Draft' && (
        <section className={styles.guideNotice}>
          <strong>Nhóm nháp</strong>
          <span>Staff đang hoàn thiện phân nhóm. Danh sách có thể thay đổi trước khi chốt.</span>
        </section>
      )}

      {actionError && (
        <p className={styles.actionError} role="alert">
          {actionError}
        </p>
      )}

      <section className={styles.metrics} aria-label="Tổng quan sức chứa">
        <article>
          <span>Đã xếp</span>
          <strong>{snapshot.assignedParticipants} người</strong>
        </article>
        <article>
          <span>Chưa xếp</span>
          <strong>{snapshot.unassignedParticipants} người</strong>
        </article>
        <article>
          <span>Sức chứa chuẩn</span>
          <strong>{snapshot.standardCapacity}</strong>
        </article>
        <article>
          <span>Sức chứa vận hành</span>
          <strong>{snapshot.operationalCapacity}</strong>
        </article>
      </section>

      {canEdit && snapshot.publishBlockers?.length > 0 && (
        <section className={styles.blockers} aria-label="Điều kiện chưa đạt">
          <strong>Chưa thể chốt</strong>
          <ul>
            {snapshot.publishBlockers.map((blocker) => (
              <li key={blocker.code}>{blocker.message}</li>
            ))}
          </ul>
        </section>
      )}

      <div className={styles.board}>
        {canEdit && (
          <section className={styles.unassignedColumn}>
            <div className={styles.columnTitle}>
              <div>
                <span>NGOẠI LỆ</span>
                <h2>Đơn chưa xếp</h2>
              </div>
              <strong>{snapshot.unassignedBookings.length}</strong>
            </div>
            <div className={styles.cardList}>
              {snapshot.unassignedBookings.map((booking) => (
                <BookingCard
                  key={booking.bookingOrderId}
                  booking={booking}
                  currentGroupId=""
                  groups={snapshot.groups}
                  canEdit
                  onMove={moveBooking}
                  onSplit={openSplit}
                />
              ))}
              {snapshot.unassignedBookings.length === 0 && (
                <p className={styles.emptyColumn}>Không còn booking chưa xếp.</p>
              )}
            </div>
          </section>
        )}

        <section className={styles.groupsArea}>
          <div className={styles.groupsHeading}>
            <div>
              <span>TRIPGROUP</span>
              <h2>{snapshot.groups.length} nhóm cố định</h2>
            </div>
            <small>
              Chuẩn {snapshot.groupMaxParticipants} · overflow +{snapshot.overflowSlots}
            </small>
          </div>
          <div className={styles.groupGrid}>
            {snapshot.groups.map((group) => (
              <article
                key={group.tripGroupId}
                className={group.isOverflowing ? styles.groupOverflow : styles.groupColumn}
              >
                <div className={styles.groupHeader}>
                  <div>
                    <h3>{group.groupName}</h3>
                    <span>
                      {group.participantCount}/{group.maxParticipants} · tối đa{' '}
                      {group.maxParticipants + group.overflowSlots}
                    </span>
                  </div>
                  <span className={group.status === 'Published' ? styles.publishedBadge : styles.draftBadge}>
                    {group.status === 'Published' ? 'Đã chốt' : 'Nháp'}
                  </span>
                </div>

                {canEdit ? (
                  <label className={styles.guideField}>
                    <span>Guide</span>
                    <select
                      aria-label={`Guide của ${group.groupName}`}
                      value={group.guide?.userId || ''}
                      onChange={(event) => assignGuide(group.tripGroupId, event.target.value)}
                    >
                      <option value="">Chưa phân công</option>
                      {guideOptions.map((guide) => (
                        <option key={guide.userId} value={guide.userId}>
                          {guide.fullName}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className={styles.guideName}>
                    Guide: <strong>{group.guide?.fullName || 'Chưa phân công'}</strong>
                  </p>
                )}

                {group.isOverflowing && <p className={styles.overflowNote}>Đang dùng overflow vận hành.</p>}
                <div className={styles.cardList}>
                  {group.bookings.map((booking) => (
                    <BookingCard
                      key={`${group.tripGroupId}-${booking.bookingOrderId}`}
                      booking={booking}
                      currentGroupId={group.tripGroupId}
                      groups={snapshot.groups}
                      canEdit={canEdit && group.status !== 'Published'}
                      onMove={moveBooking}
                      onSplit={openSplit}
                    />
                  ))}
                  {group.bookings.length === 0 && <p className={styles.emptyColumn}>Nhóm chưa có booking.</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {canEdit && (
        <footer className={styles.publishBar}>
          <div>
            <strong>Chốt ở cấp chuyến</strong>
            <span>Sau khi chốt, khách mới thấy nhóm. API thường không còn cho chuyển hoặc tách.</span>
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={!snapshot.canPublish || publishMutation.isPending}
            onClick={publishGrouping}
          >
            {publishMutation.isPending ? 'Đang chốt...' : 'Chốt phân nhóm'}
          </button>
        </footer>
      )}

      <SplitBookingDialog
        value={splitBooking}
        groups={snapshot.groups}
        reason={splitReason}
        assignments={splitAssignments}
        onReason={setSplitReason}
        onAssign={(participantId, groupId) =>
          setSplitAssignments((current) => ({ ...current, [participantId]: groupId }))
        }
        onClose={closeSplit}
        onSubmit={submitSplit}
        pending={splitMutation.isPending}
      />
    </main>
  );
}

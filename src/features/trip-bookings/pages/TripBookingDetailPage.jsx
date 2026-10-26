import { useState } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import Spinner from '@/components/Spinner';
import {
  BOOKING_STATUS,
  BOOKING_STATUS_LABEL,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABEL,
} from '@/constants/enums';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import HoldCountdown from '../components/HoldCountdown';
import InvitationTokensPanel from '../components/InvitationTokensPanel';
import {
  useGenerateParticipantInvitations,
  useTripBooking,
} from '../hooks/useTripBookings';
import { canGenerateInvitations } from '../utils/bookingStatus';
import styles from './TripBookingDetailPage.module.css';

export default function TripBookingDetailPage() {
  const { orderId } = useParams();
  const { data: booking, isLoading, isError, error, refetch } = useTripBooking(orderId);
  const invitationMutation = useGenerateParticipantInvitations();
  const [invitations, setInvitations] = useState([]);
  const [invitationError, setInvitationError] = useState('');

  if (isLoading) return <Spinner fullScreen />;
  if (isError) return <ErrorState message={error?.message || 'Không thể tải booking.'} onRetry={refetch} />;
  if (!booking) return <EmptyState message="Không tìm thấy booking hoặc bạn không có quyền xem." />;

  const eligibleForInvitations = canGenerateInvitations(booking);
  const isPendingPayment =
    booking.status === BOOKING_STATUS.PENDING_PAYMENT &&
    booking.paymentStatus === PAYMENT_STATUS.UNPAID;

  const createInvitations = async () => {
    setInvitationError('');
    try {
      const response = await invitationMutation.mutateAsync(orderId);
      setInvitations(response.data || []);
    } catch (mutationError) {
      setInvitationError(mutationError?.message || 'Không thể tạo lời mời.');
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>BOOKING {booking.orderCode}</span>
          <h1>Chi tiết chuyến đi</h1>
          <p>{formatDateTime(booking.tripStartAt)} — {formatDateTime(booking.tripEndAt)}</p>
        </div>
        <div className={styles.badges}>
          <span>{BOOKING_STATUS_LABEL[booking.status] || booking.status}</span>
          {booking.canManage && (
            <span className={styles.paymentBadge}>
              {PAYMENT_STATUS_LABEL[booking.paymentStatus] || booking.paymentStatus}
            </span>
          )}
        </div>
      </header>

      {isPendingPayment && (
        <section className={styles.paymentNotice}>
          <OutdoorIcon name="shield" size={22} />
          <div>
            <strong>Booking đang chờ thanh toán</strong>
            <p>Hệ thống chưa tích hợp cổng thanh toán. Trạng thái chỉ thay đổi theo dữ liệu backend.</p>
          </div>
        </section>
      )}

      {booking.holdExpiresAt && booking.canManage && (
        <div className={styles.countdown}>
          <HoldCountdown expiresAt={booking.holdExpiresAt} onExpire={refetch} />
        </div>
      )}

      <div className={styles.layout}>
        <section className={styles.participants}>
          <div className={styles.sectionTitle}>
            <div>
              <span className={styles.kicker}>ĐOÀN CỦA BẠN</span>
              <h2>{booking.canManage ? 'Danh sách người tham gia' : 'Thông tin tham gia của bạn'}</h2>
            </div>
            <span>{booking.participantCount} người</span>
          </div>
          <div className={styles.participantList}>
            {booking.participants.map((participant, index) => (
              <article key={participant.participantId} className={styles.participant}>
                <span className={styles.avatar}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{participant.fullName}</strong>
                  <small>{participant.email}</small>
                </div>
                <span className={styles.participantStatus}>{participant.status}</span>
              </article>
            ))}
          </div>
        </section>

        <aside className={styles.summary}>
          <span className={styles.kicker}>TÓM TẮT</span>
          <h2>{booking.orderCode}</h2>
          <dl>
            <div><dt>Mã chuyến</dt><dd>{booking.tripId}</dd></div>
            <div><dt>Trạng thái chuyến</dt><dd>{booking.tripStatus}</dd></div>
            <div><dt>Số người</dt><dd>{booking.participantCount}</dd></div>
            {booking.canManage && (
              <>
                <div><dt>Đơn giá</dt><dd>{formatCurrency(booking.unitPrice)}</dd></div>
                <div><dt>Tạm tính</dt><dd>{formatCurrency(booking.subtotalAmount)}</dd></div>
                <div className={styles.total}><dt>Tổng tiền</dt><dd>{formatCurrency(booking.totalAmount)}</dd></div>
              </>
            )}
          </dl>

          {eligibleForInvitations && (
            <div className={styles.invitationAction}>
              {invitations.length > 0 && (
                <p>Tạo lại sẽ thu hồi token đang chờ và thay bằng token mới.</p>
              )}
              {invitationError && <p className={styles.error}>{invitationError}</p>}
              <button type="button" onClick={createInvitations} disabled={invitationMutation.isPending}>
                {invitationMutation.isPending
                  ? 'Đang tạo...'
                  : invitations.length > 0
                    ? 'Tạo lại lời mời'
                    : 'Tạo lời mời'}
              </button>
            </div>
          )}
        </aside>
      </div>

      <InvitationTokensPanel invitations={invitations} />
    </main>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import Spinner from '@/components/Spinner';
import {
  BOOKING_STATUS,
  ORDER_PAYMENT_STATUS_LABEL,
  ORDER_STATUS_LABEL,
  ORDER_TYPE,
  PAYMENT_STATUS,
  TRIP_STATUS_LABEL,
} from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useMyOrders } from '@/features/orders/hooks/useOrders';
import RefundProgressCard from '@/features/refunds/components/RefundProgressCard';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import CancelBookingPanel from '../components/CancelBookingPanel';
import HoldCountdown from '../components/HoldCountdown';
import { InviteLinkBox } from '../components/InvitationTokensPanel';
import ParticipantRow from '../components/ParticipantRow';
import TripPaymentPanel from '../components/TripPaymentPanel';
import { useCustomerTripGrouping, useTripBooking } from '../hooks/useTripBookings';
import {
  canCancelBooking,
  canEditParticipants,
  canShareTripLink,
  getHoldSeconds,
} from '../utils/bookingStatus';
import styles from './TripBookingDetailPage.module.css';

const TIMELINE = ['Đặt chỗ', 'Thanh toán', 'Chờ khởi hành', 'Hoàn tất'];
const TIMELINE_STEP = {
  [BOOKING_STATUS.PENDING_PAYMENT]: 1,
  [BOOKING_STATUS.CONFIRMED]: 2,
  [BOOKING_STATUS.IN_FULFILLMENT]: 2,
  [BOOKING_STATUS.COMPLETED]: TIMELINE.length,
};

const STATUS_BADGE_CLASS = {
  [BOOKING_STATUS.CONFIRMED]: styles.badgeSuccess,
  [BOOKING_STATUS.COMPLETED]: styles.badgeSuccess,
  [BOOKING_STATUS.IN_FULFILLMENT]: styles.badgeSuccess,
  [BOOKING_STATUS.PENDING_PAYMENT]: styles.badgeWarning,
  [BOOKING_STATUS.CANCELLED]: styles.badgeDanger,
  [BOOKING_STATUS.EXPIRED]: styles.badgeDanger,
};

const PAYMENT_BADGE_CLASS = {
  [PAYMENT_STATUS.PAID]: styles.badgeSuccess,
  [PAYMENT_STATUS.UNPAID]: styles.badgeWarning,
  [PAYMENT_STATUS.NEEDS_RECONCILIATION]: styles.badgeWarning,
  [PAYMENT_STATUS.REFUNDED]: styles.badgeInfo,
};

function BookingTimeline({ status }) {
  const current = TIMELINE_STEP[status];
  if (current === undefined) return null; // Đơn hủy / hết hạn đã có thông báo riêng

  return (
    <section className={styles.timelineSection} aria-label="Tiến trình đặt chỗ">
      <ol className={styles.timeline} aria-label="Tiến trình đơn">
        {TIMELINE.map((label, index) => (
          <li
            key={label}
            className={
              index < current ? styles.timelineDone : index === current ? styles.timelineActive : undefined
            }
            aria-current={index === current ? 'step' : undefined}
          >
            <span className={styles.stepIndicator}>
              {index < current ? '✓' : index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
    </section>
  );
}

function BookingGroupingPanel({ groupingQuery }) {
  if (groupingQuery.isLoading || groupingQuery.isError || !groupingQuery.data) return null;

  const grouping = groupingQuery.data;
  if (grouping.groupingStatus !== 'Published') {
    return (
      <section className={styles.groupingPending} aria-label="Trạng thái phân nhóm">
        <OutdoorIcon name="users" size={22} />
        <div>
          <strong>Đơn vị tổ chức đang hoàn thiện phân nhóm</strong>
          <p>Nhóm và guide sẽ xuất hiện tại đây sau khi được chốt, gần ngày khởi hành.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.groupingPanel} aria-label="Thông tin nhóm và hướng dẫn viên">
      <div className={styles.groupingHeader}>
        <div>
          <span className={styles.kicker}>ĐÃ CHỐT</span>
          <h2>Nhóm vận hành</h2>
        </div>
        <span className={styles.countBadge}>{grouping.groups.length} nhóm</span>
      </div>
      <div className={styles.groupingGrid}>
        {grouping.groups.map((group) => (
          <article key={group.tripGroupId} className={styles.groupCard}>
            <div className={styles.groupCardHeader}>
              <div>
                <small>TRIPGROUP</small>
                <h3>{group.groupName}</h3>
              </div>
              <span className={styles.groupBadge}>{group.participants.length} người</span>
            </div>
            <p className={styles.guideText}>Guide: {group.guide?.fullName || 'Đang cập nhật'}</p>
            <ul className={styles.groupParticipantList}>
              {group.participants.map((participant) => (
                <li key={participant.participantId}>{participant.fullName}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className={styles.groupingPrivacy}>
        Vì quyền riêng tư, hệ thống chỉ hiển thị thành viên mà bạn được phép xem.
      </p>
    </section>
  );
}

function Notice({ title, children, tone = 'warning' }) {
  return (
    <section className={tone === 'danger' ? styles.dangerNotice : styles.paymentNotice} role="alert">
      <OutdoorIcon name="shield" size={22} />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </section>
  );
}

export default function TripBookingDetailPage() {
  const { orderId } = useParams();
  const { data: booking, isLoading, isError, error, refetch } = useTripBooking(orderId);
  const groupingQuery = useCustomerTripGrouping(orderId);
  const [holdEnded, setHoldEnded] = useState(false);
  // TripBookingResponse chưa có tên tour; "đơn của tôi" có sẵn trong field title
  const { data: orderMatch } = useMyOrders(
    { search: booking?.orderCode, orderType: ORDER_TYPE.TRIP_BOOKING, pageSize: 1 },
    { enabled: Boolean(booking?.orderCode) },
  );

  if (isLoading) return <Spinner fullScreen />;
  // 404: không tồn tại hoặc không có quyền — không phân biệt để tránh lộ booking của người khác
  if (isError && error?.statusCode === 404) {
    return <EmptyState message="Không tìm thấy booking hoặc bạn không có quyền xem." />;
  }
  if (isError) return <ErrorState message={error?.message || 'Không thể tải booking.'} onRetry={refetch} />;
  if (!booking) return <EmptyState message="Không tìm thấy booking hoặc bạn không có quyền xem." />;

  const isPendingPayment =
    booking.canManage &&
    booking.status === BOOKING_STATUS.PENDING_PAYMENT &&
    booking.paymentStatus === PAYMENT_STATUS.UNPAID;
  const holdActive = !holdEnded && getHoldSeconds(booking.holdExpiresAt) > 0;
  const isGroupingRelevant = [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.IN_FULFILLMENT,
    BOOKING_STATUS.COMPLETED,
  ].includes(booking.status);
  const canEdit = canEditParticipants(booking);

  const handleHoldExpire = () => {
    setHoldEnded(true);
    void refetch();
  };

  return (
    <main className={styles.page}>
      {/* 1. Breadcrumb Full-width */}
      <Breadcrumb
        items={[
          { label: 'Trang chủ', to: ROUTES.HOME },
          { label: 'Đơn của tôi', to: ROUTES.MY_ORDERS },
          orderMatch?.items?.[0]?.title ? { label: orderMatch.items[0].title } : null,
          { label: `Đơn ${booking.orderCode}` },
        ]}
      />

      {/* 2. Header Full-width */}
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <span className={styles.kicker}>MÃ ĐẶT CHỖ · {booking.orderCode}</span>
          <h1>{orderMatch?.items[0]?.title || 'Chi tiết chuyến đi'}</h1>
          <p className={styles.tripDates}>
            <OutdoorIcon name="calendar" size={16} />
            <span>
              {formatDateTime(booking.tripStartAt)} — {formatDateTime(booking.tripEndAt)}
            </span>
          </p>
        </div>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${STATUS_BADGE_CLASS[booking.status] || styles.badgeDefault}`}>
            {ORDER_STATUS_LABEL[booking.status] || booking.status}
          </span>
          {booking.canManage && (
            <span
              className={`${styles.badge} ${PAYMENT_BADGE_CLASS[booking.paymentStatus] || styles.badgePaymentDefault}`}
            >
              {ORDER_PAYMENT_STATUS_LABEL[booking.paymentStatus] || booking.paymentStatus}
            </span>
          )}
        </div>
      </header>

      {/* 3. Progress Tracker Full-width */}
      <BookingTimeline status={booking.status} />

      {/* 4. Thông báo trạng thái / Cảnh báo */}
      {booking.paymentStatus === PAYMENT_STATUS.NEEDS_RECONCILIATION && (
        <Notice title="Thanh toán đang chờ đối soát">
          Đã nhận tiền nhưng chưa tự xác nhận được (sai số tiền hoặc quá hạn giữ chỗ). Không chuyển lại, vui
          lòng liên hệ hỗ trợ.
        </Notice>
      )}
      {booking.status === BOOKING_STATUS.CANCELLED && (
        <Notice title="Booking đã hủy" tone="danger">
          {booking.paymentStatus === PAYMENT_STATUS.REFUNDED
            ? 'Chỗ đã được giải phóng và đơn đã chuyển sang trạng thái hoàn tiền.'
            : 'Chỗ đã được giải phóng.'}
        </Notice>
      )}
      {booking.refundCase && <RefundProgressCard refundCaseId={booking.refundCase.refundCaseId} />}
      {(booking.status === BOOKING_STATUS.EXPIRED || (isPendingPayment && !holdActive)) && (
        <Notice title="Đã hết thời gian giữ chỗ" tone="danger">
          Vui lòng không chuyển khoản cho đơn này. <Link to={ROUTES.TOURS}>Đặt lại chuyến khác</Link>
        </Notice>
      )}

      {/* 5. Khối Thanh toán khi đang chờ thanh toán (Pending Payment) */}
      {isPendingPayment && holdActive && (
        <section className={styles.paymentHighlightSection} aria-label="Thanh toán đặt chỗ">
          <div className={styles.countdown}>
            <HoldCountdown expiresAt={booking.holdExpiresAt} onExpire={handleHoldExpire} />
          </div>
          <TripPaymentPanel orderId={orderId} onSettled={refetch} />
        </section>
      )}

      {/* 6. Main Content: Chia hai cột 65% / 35% */}
      <div className={styles.layout}>
        {/* CỘT TRÁI (65%): Danh sách thành viên, đoàn & Hướng dẫn viên */}
        <div className={styles.mainColumn}>
          <section className={styles.participants} aria-label="Danh sách thành viên đoàn">
            <div className={styles.sectionTitle}>
              <div>
                <span className={styles.kicker}>ĐOÀN CỦA BẠN</span>
                <h2>{booking.canManage ? 'Danh sách người tham gia' : 'Thông tin tham gia của bạn'}</h2>
              </div>
              <span className={styles.countBadge}>{booking.participantCount} người</span>
            </div>
            <div className={styles.participantList}>
              {booking.participants.map((participant, index) => (
                <ParticipantRow
                  key={participant.participantId}
                  orderId={orderId}
                  participant={participant}
                  index={index}
                  canEdit={canEdit}
                />
              ))}
            </div>
            {booking.canManage && booking.paymentStatus === PAYMENT_STATUS.PAID && (
              <p className={styles.lockedParticipants}>
                Đã thanh toán — không thể thêm hoặc xóa người. Người bổ sung cần tạo booking riêng.
              </p>
            )}
          </section>

          {isGroupingRelevant && (
            <div className={styles.groupingSection}>
              <BookingGroupingPanel groupingQuery={groupingQuery} />
            </div>
          )}
        </div>

        {/* CỘT PHẢI (35%): Tóm tắt thanh toán, Chia sẻ chuyến đi, Hủy booking */}
        <aside className={styles.sideColumn}>
          {/* Card 1: Tổng kết thanh toán */}
          <section className={styles.summaryCard} aria-label="Tóm tắt đơn đặt chỗ">
            <div className={styles.summaryHeader}>
              <span className={styles.kicker}>TÓM TẮT ĐẶT CHỖ</span>
              <h2>{booking.orderCode}</h2>
            </div>
            <dl className={styles.summaryList}>
              <div>
                <dt>Trạng thái chuyến</dt>
                <dd>{TRIP_STATUS_LABEL[booking.tripStatus] || booking.tripStatus}</dd>
              </div>
              <div>
                <dt>Số người</dt>
                <dd>{booking.participantCount} người</dd>
              </div>
              {booking.canManage && (
                <>
                  <div>
                    <dt>Đơn giá</dt>
                    <dd>{formatCurrency(booking.unitPrice)}</dd>
                  </div>
                  <div>
                    <dt>Tạm tính</dt>
                    <dd>{formatCurrency(booking.subtotalAmount)}</dd>
                  </div>
                  <div className={styles.totalRow}>
                    <dt>Tổng tiền</dt>
                    <dd>{formatCurrency(booking.totalAmount)}</dd>
                  </div>
                </>
              )}
            </dl>

            <div className={styles.paymentStatusBadgeRow}>
              <span>Trạng thái:</span>
              <strong className={booking.paymentStatus === PAYMENT_STATUS.PAID ? styles.paidText : styles.unpaidText}>
                {ORDER_PAYMENT_STATUS_LABEL[booking.paymentStatus] || booking.paymentStatus}
              </strong>
            </div>
          </section>

          {/* Card 2: Chia sẻ chuyến đi (Tách biệt) */}
          {canShareTripLink(booking) && (
            <section className={styles.shareCard} aria-label="Chia sẻ chuyến đi cho nhóm">
              <div className={styles.shareCardHeader}>
                <span className={styles.kicker}>CHIA SẺ CHUYẾN ĐI</span>
              </div>
              <div className={styles.invitationAction}>
                <InviteLinkBox orderId={orderId} />
              </div>
            </section>
          )}

          {/* Card 3: Thao tác hủy booking (Tách biệt khỏi card thanh toán và chia sẻ) */}
          {canCancelBooking(booking) && (
            <section className={styles.cancelCard} aria-label="Hủy đặt chỗ">
              <div className={styles.cancelCardHeader}>
                <span className={styles.cancelKicker}>THAY ĐỔI KẾ HOẠCH?</span>
                <p>Nếu bạn không thể tham gia, vui lòng xem chính sách hoàn hủy trước khi thực hiện.</p>
              </div>
              <CancelBookingPanel orderId={orderId} />
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

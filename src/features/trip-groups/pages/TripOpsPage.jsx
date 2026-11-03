import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import DevClockJumps from '@/components/DevClockJumps';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { TRIP_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useDevClockControls } from '@/hooks/useDevClock';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { useAdminTrip, useUpdateTripStatus } from '../hooks/useTripGroups';
import styles from './TripOpsPage.module.css';

// Bước tiếp theo theo PRD §7.2; BE vẫn kiểm tra thứ tự + thời điểm (chưa tới giờ đi thì không cho bắt đầu...)
const NEXT_STEPS = {
  Draft: [{ status: 'Open', label: 'Mở bán' }],
  Open: [{ status: 'ClosedForBooking', label: 'Đóng nhận khách' }],
  ClosedForBooking: [{ status: 'InProgress', label: 'Bắt đầu chuyến' }],
  InProgress: [{ status: 'Completed', label: 'Kết thúc chuyến' }],
};
const CANCELLABLE = ['Draft', 'Open', 'ClosedForBooking'];

export default function TripOpsPage() {
  const { tripId } = useParams();
  const { data: trip, isLoading, isError, error, refetch } = useAdminTrip(tripId);
  const updateStatus = useUpdateTripStatus();
  const devClock = useDevClockControls();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const changeStatus = (status) =>
    updateStatus.mutate({ tripId, status }, { onSuccess: () => setIsConfirmingCancel(false) });

  const start = dayjs(trip.startAt);
  const end = dayjs(trip.endAt);
  const clockTargets = [
    { label: '24 giờ trước khởi hành', at: start.subtract(24, 'hour').toISOString() },
    { label: '1 giờ trước khởi hành', at: start.subtract(1, 'hour').toISOString() },
    { label: 'Đúng giờ khởi hành', at: start.add(1, 'minute').toISOString() },
    { label: 'Giữa chuyến', at: start.add(end.diff(start) / 2, 'millisecond').toISOString() },
    { label: '1 giờ sau khi kết thúc', at: end.add(1, 'hour').toISOString() },
  ];

  return (
    <section className={styles.page} aria-labelledby="trip-ops-title">
      <header>
        <p className={styles.eyebrow}>Vận hành chuyến</p>
        <h1 id="trip-ops-title" className={styles.title}>
          {trip.tourName}
        </h1>
        <p className={styles.meta}>
          {formatDateTime(trip.startAt)} → {formatDateTime(trip.endAt)}
        </p>
      </header>

      {devClock.canControl && (
        <DevClockJumps
          targets={clockTargets}
          onJump={devClock.jumpTo}
          onReset={devClock.reset}
          isSimulated={devClock.clock?.isSimulated}
          isPending={devClock.isPending}
        />
      )}

      <div className={styles.grid}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Trạng thái chuyến</h2>
          <p className={styles.status}>{TRIP_STATUS_LABEL[trip.status] ?? trip.status}</p>
          {devClock.isAvailable && (
            <p className={styles.hint}>Giờ hệ thống hiện tại: {formatDateTime(devClock.clock.now)}</p>
          )}
          {trip.status === 'Draft' && trip.openReadinessWarning && (
            <p className={styles.warn}>{trip.openReadinessWarning}</p>
          )}

          <div className={styles.actions}>
            {(NEXT_STEPS[trip.status] ?? []).map((step) => (
              <button
                key={step.status}
                type="button"
                className="btn btn-primary"
                disabled={updateStatus.isPending || (step.status === 'Open' && !trip.canOpenForBooking)}
                onClick={() => changeStatus(step.status)}
              >
                {step.label}
              </button>
            ))}
            {CANCELLABLE.includes(trip.status) && !isConfirmingCancel && (
              <button type="button" className={`btn ${styles.danger}`} onClick={() => setIsConfirmingCancel(true)}>
                Hủy chuyến
              </button>
            )}
          </div>

          {isConfirmingCancel && (
            <div className={styles.confirm} role="alert">
              <p>Hủy chuyến này? Booking của khách cần được xử lý hủy / hoàn riêng.</p>
              <div className={styles.actions}>
                <button type="button" className="btn btn-outline" onClick={() => setIsConfirmingCancel(false)}>
                  Không
                </button>
                <button
                  type="button"
                  className={`btn ${styles.danger}`}
                  disabled={updateStatus.isPending}
                  onClick={() => changeStatus('Cancelled')}
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Thông tin</h2>
          <dl className={styles.facts}>
            <div>
              <dt>Sức chứa</dt>
              <dd>{trip.totalSlots} chỗ (tối thiểu {trip.minParticipants})</dd>
            </div>
            <div>
              <dt>Giá / người</dt>
              <dd>{formatCurrency(trip.pricePerPerson)}</dd>
            </div>
            <div>
              <dt>Số nhóm</dt>
              <dd>{trip.groupCount}</dd>
            </div>
          </dl>
          <Link to={ROUTES.TRIP_GROUPING(trip.tripId)} className={styles.link}>
            Chia nhóm &amp; hướng dẫn viên →
          </Link>
        </section>
      </div>
    </section>
  );
}

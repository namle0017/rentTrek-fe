import { useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { useRescheduleOptions, useRescheduleTripBooking } from '../hooks/useTripBookings';
import HoldCountdown from './HoldCountdown';
import TripPaymentPanel from './TripPaymentPanel';
import styles from './ReschedulePanel.module.css';

const diffLabel = (diff) =>
  diff > 0
    ? `Trả thêm ${formatCurrency(diff)}`
    : diff < 0
      ? `Hoàn lại ${formatCurrency(-diff)}`
      : 'Không chênh lệch';

/** Đổi sang chuyến khác cùng tour. Đắt hơn: giữ chỗ và thu chênh lệch; rẻ hơn: đổi ngay và hoàn phần dư. */
export default function ReschedulePanel({ orderId, onChanged }) {
  const [open, setOpen] = useState(false);
  const [toTripId, setToTripId] = useState('');
  const { data: options, isLoading, isError, error, refetch } = useRescheduleOptions(orderId);
  const reschedule = useRescheduleTripBooking();

  const settle = () => {
    void refetch();
    onChanged?.();
  };

  if (isLoading) return null;
  if (isError) {
    return (
      <p className={styles.error} role="alert">
        {error?.message || 'Không thể tải lựa chọn đổi lịch.'}
      </p>
    );
  }

  const pending = options.pending;
  if (pending) {
    return (
      <div className={styles.panel}>
        <p>
          Đang giữ chỗ ở chuyến mới. Thanh toán <b>{formatCurrency(pending.priceDiff)}</b> để hoàn tất đổi
          lịch.
        </p>
        {pending.holdExpiresAt && <HoldCountdown expiresAt={pending.holdExpiresAt} onExpire={settle} />}
        <TripPaymentPanel orderId={orderId} onSettled={settle} />
      </div>
    );
  }

  if (!options.canReschedule) {
    return options.blockedReason ? <p className={styles.muted}>{options.blockedReason}</p> : null;
  }

  const free = options.companyCancelled;
  if (!open) {
    return (
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        {free ? 'Chuyển miễn phí sang chuyến khác' : 'Đổi lịch sang chuyến khác'}
      </button>
    );
  }

  const submit = () =>
    reschedule.mutate(
      { orderId, toTripId },
      {
        onSuccess: () => {
          setOpen(false);
          setToTripId('');
          onChanged?.();
        },
      },
    );

  return (
    <div className={styles.panel}>
      <p className={styles.muted}>
        {free ? (
          'Chuyến cũ đã bị huỷ: chuyển miễn phí, không thu thêm. Chuyển xong thì hồ sơ hoàn 100% sẽ huỷ.'
        ) : (
          <>
            Phí đổi lịch {formatCurrency(options.fee)} · còn {options.remainingTimes} lần
            {options.deadline && <> · hạn chót {formatDateTime(options.deadline)}</>}
          </>
        )}
      </p>
      {options.trips.length === 0 ? (
        <p>Chưa có chuyến nào khác còn đủ chỗ cho đoàn của bạn.</p>
      ) : (
        <fieldset className={styles.trips}>
          <legend className={styles.muted}>Chọn chuyến mới</legend>
          {options.trips.map((trip) => (
            <label key={trip.tripId} className={styles.trip}>
              <input
                type="radio"
                name="reschedule-trip"
                value={trip.tripId}
                checked={toTripId === trip.tripId}
                onChange={() => setToTripId(trip.tripId)}
              />
              <span>
                {formatDateTime(trip.startAt)} — {formatDateTime(trip.endAt)}
              </span>
              <small>
                {formatCurrency(trip.pricePerPerson)}/người · còn {trip.availableSlots} chỗ ·{' '}
                {diffLabel(trip.priceDiff)}
              </small>
            </label>
          ))}
        </fieldset>
      )}
      {reschedule.isError && (
        <p className={styles.error} role="alert">
          {reschedule.error?.message || 'Không thể đổi lịch.'}
        </p>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={() => setOpen(false)}>
          Đóng
        </button>
        <button
          type="button"
          className={styles.primary}
          disabled={!toTripId || reschedule.isPending}
          onClick={submit}
        >
          Xác nhận đổi lịch
        </button>
      </div>
    </div>
  );
}

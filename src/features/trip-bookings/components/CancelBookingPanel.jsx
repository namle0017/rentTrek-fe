import { useState } from 'react';
import { PAYMENT_STATUS } from '@/constants/enums';
import { useCancelTripBooking } from '../hooks/useTripBookings';
import styles from './CancelBookingPanel.module.css';

export default function CancelBookingPanel({ orderId, paymentStatus }) {
  const cancelBooking = useCancelTripBooking();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!open) {
    return (
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        Hủy booking
      </button>
    );
  }

  const confirm = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    try {
      await cancelBooking.mutateAsync({ orderId, reason: reason.trim() || undefined });
    } catch (error) {
      setErrorMessage(error?.message || 'Không thể hủy booking.');
    }
  };

  return (
    <form className={styles.panel} onSubmit={confirm}>
      <strong>Hủy toàn bộ booking?</strong>
      <p>
        {paymentStatus === PAYMENT_STATUS.PAID
          ? 'Tất cả người trong đơn sẽ mất chỗ, đơn chuyển sang trạng thái hoàn tiền.'
          : 'Tất cả người trong đơn sẽ mất chỗ. Không thể hoàn tác.'}
      </p>
      <label htmlFor="cancel-reason">Lý do (không bắt buộc)</label>
      <textarea
        id="cancel-reason"
        rows="2"
        maxLength="500"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={() => setOpen(false)}>Giữ booking</button>
        <button type="submit" className={styles.danger} disabled={cancelBooking.isPending}>
          {cancelBooking.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
        </button>
      </div>
    </form>
  );
}

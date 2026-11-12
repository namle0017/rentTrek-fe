import { useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useExtendRentalOrder, useRentalAdjustments, useRentalExtensionQuote } from '../hooks/useRentals';
import { rentalDateLabel, vietnamDateTime } from '../utils/rentalCheckout';
import styles from '../pages/RentalCustomer.module.css';

const asUtc = (value) => new Date(/Z$|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);

/** Gia hạn đơn thuê + lịch sử điều chỉnh. Phụ phí ghi thành RentalCharge, thu khi trả thiết bị. */
export default function ExtendRentalPanel({ orderId, rentalEndAt, status }) {
  const currentEnd = asUtc(rentalEndAt);
  // BE không trả cờ canExtend: chỉ Confirmed/InFulfillment và chưa quá hạn
  const canExtend = ['Confirmed', 'InFulfillment'].includes(status) && currentEnd > new Date();
  const [newEnd, setNewEnd] = useState(() => vietnamDateTime(new Date(currentEnd.getTime() + 86400000)));
  const quote = useRentalExtensionQuote();
  const extend = useExtendRentalOrder();
  const { data: adjustments } = useRentalAdjustments(orderId);

  const payload = { newEndAt: new Date(`${newEnd}:00+07:00`).toISOString() };
  const quoted = quote.data?.data;
  const error = quote.error || extend.error;

  if (!canExtend && !adjustments?.length) return null;

  const handleQuote = (e) => {
    e.preventDefault();
    extend.reset();
    quote.mutate({ orderId, payload });
  };

  const handleExtend = () =>
    extend.mutate(
      { orderId, payload: { ...payload, acceptedExtraAmount: quoted.extraAmount } },
      { onSuccess: () => quote.reset() },
    );

  return (
    <section className={styles.card}>
      <h2>Gia hạn thuê</h2>
      {canExtend && (
        <form className={styles.stack} onSubmit={handleQuote}>
          <label className={styles.field}>
            Thời điểm trả mới
            <input
              type="datetime-local"
              value={newEnd}
              min={vietnamDateTime(currentEnd)}
              onChange={(e) => {
                setNewEnd(e.target.value);
                quote.reset();
              }}
              required
            />
          </label>
          {quoted && (
            <p>
              {quoted.oldBillableDays} → {quoted.newBillableDays} ngày · Phụ phí{' '}
              <strong>{formatCurrency(quoted.extraAmount)}</strong> (thanh toán khi trả thiết bị)
            </p>
          )}
          {error && (
            <p role="alert" className={styles.error}>
              {error.message || 'Không thể gia hạn.'}
            </p>
          )}
          <div className={styles.actions}>
            <button type="submit" className={styles.secondary} disabled={quote.isPending}>
              {quote.isPending ? 'Đang báo giá...' : 'Xem phụ phí'}
            </button>
            {quoted && (
              <button type="button" className={styles.primary} disabled={extend.isPending} onClick={handleExtend}>
                {extend.isPending ? 'Đang gia hạn...' : 'Xác nhận gia hạn'}
              </button>
            )}
          </div>
        </form>
      )}
      {adjustments?.length > 0 && (
        <ul>
          {adjustments.map((a) => (
            <li key={a.id}>
              {rentalDateLabel(a.oldEndAt)} → {rentalDateLabel(a.newEndAt)} · {formatCurrency(a.extraAmount)}
              <small> · {a.requestedByName}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

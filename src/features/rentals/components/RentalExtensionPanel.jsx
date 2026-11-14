import { useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useExtendRentalOrder, useRentalExtensionQuote } from '../hooks/useRentals';
import { vietnamDateTime } from '../utils/rentalCheckout';
import styles from '../pages/RentalCustomer.module.css';

/** Gia hạn ngày trả: báo giá → xác nhận → thanh toán QR (hạn trả chỉ đổi khi tiền vào). */
export default function RentalExtensionPanel({ orderId, rentalEndAt, onChanged }) {
  const [newEnd, setNewEnd] = useState(() => vietnamDateTime(new Date(new Date(rentalEndAt).getTime() + 86400000)));
  const quote = useRentalExtensionQuote();
  const extend = useExtendRentalOrder();
  const toIso = (value) => new Date(`${value}:00+07:00`).toISOString();
  const data = quote.data?.data;

  return (
    <section className={styles.card} aria-label="Gia hạn đơn thuê">
      <h2>Gia hạn ngày trả</h2>
      <p className={styles.hint}>
        Cần dùng thêm? Gia hạn để không bị tính phạt trả trễ. Hạn trả mới chỉ áp dụng sau khi thanh toán phần tiền thêm.
      </p>
      <label className={styles.field}>
        Ngày giờ trả mới
        <input
          type="datetime-local"
          value={newEnd}
          onChange={(event) => {
            setNewEnd(event.target.value);
            quote.reset();
          }}
        />
      </label>
      {!data ? (
        <button
          type="button"
          className={styles.secondary}
          disabled={quote.isPending || !newEnd}
          onClick={() => quote.mutate({ orderId, payload: { newEndAt: toIso(newEnd) } })}
        >
          {quote.isPending ? 'Đang báo giá...' : 'Xem giá gia hạn'}
        </button>
      ) : (
        <>
          <p>
            {data.oldBillableDays} → {data.newBillableDays} ngày · cần trả thêm <strong>{formatCurrency(data.extraAmount)}</strong>
          </p>
          <button
            type="button"
            className={styles.primary}
            disabled={extend.isPending}
            onClick={async () => {
              try {
                await extend.mutateAsync({
                  orderId,
                  payload: { newEndAt: toIso(newEnd), acceptedExtraAmount: data.extraAmount },
                });
                quote.reset();
                onChanged?.();
              } catch {
                /* lỗi hiển thị bên dưới */
              }
            }}
          >
            {extend.isPending ? 'Đang tạo...' : data.extraAmount > 0 ? 'Đồng ý và thanh toán' : 'Xác nhận gia hạn'}
          </button>
        </>
      )}
      {(quote.isError || extend.isError) && (
        <p role="alert" className={styles.error}>
          {(quote.error || extend.error)?.message || 'Không gia hạn được.'}
        </p>
      )}
    </section>
  );
}

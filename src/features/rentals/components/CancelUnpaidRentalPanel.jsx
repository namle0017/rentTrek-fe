import { useState } from 'react';
import Modal from '@/components/Modal';
import { useCancelRentalOrder } from '../hooks/useRentals';
import styles from '../pages/RentalCustomer.module.css';

export default function CancelUnpaidRentalPanel({ orderId, onCancelled }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const cancel = useCancelRentalOrder();
  return (
    <>
      <button className={styles.secondary} type="button" onClick={() => setOpen(true)}>
        Hủy đơn chưa thanh toán
      </button>
      {open && (
        <Modal
          title="Hủy đơn thuê chưa thanh toán"
          onClose={() => {
            if (!cancel.isPending) setOpen(false);
          }}
        >
          <form
            className={styles.stack}
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                await cancel.mutateAsync({ orderId, payload: { reason: reason.trim() || undefined } });
                setOpen(false);
                onCancelled?.();
              } catch {
                /* The mutation error is displayed below. */
              }
            }}
          >
            <p>
              Thiết bị đang giữ sẽ được giải phóng. Nếu bạn đã chuyển tiền nhưng trạng thái chưa cập nhật, hãy
              đóng cửa sổ này và liên hệ cửa hàng để đối soát.
            </p>
            <label className={styles.field}>
              Lý do hủy (không bắt buộc)
              <textarea
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={cancel.isPending}
              />
            </label>
            {cancel.isError && (
              <p role="alert" className={styles.error}>
                {cancel.error?.message || 'Không thể hủy đơn.'}
              </p>
            )}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondary}
                disabled={cancel.isPending}
                onClick={() => setOpen(false)}
              >
                Giữ lại đơn
              </button>
              <button type="submit" className={styles.primary} disabled={cancel.isPending}>
                {cancel.isPending ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

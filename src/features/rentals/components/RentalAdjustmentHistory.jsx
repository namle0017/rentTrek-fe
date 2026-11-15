import { formatCurrency } from '@/utils/formatCurrency';
import { useRentalAdjustments } from '../hooks/useRentals';
import { rentalDateLabel } from '../utils/rentalCheckout';
import styles from '../pages/RentalCustomer.module.css';

/** Lịch sử gia hạn (chỉ đọc) từ GET /rental-orders/{id}/adjustments. Tạo gia hạn mới dùng RentalExtensionPanel. */
export default function RentalAdjustmentHistory({ orderId }) {
  const { data: adjustments } = useRentalAdjustments(orderId);
  if (!adjustments?.length) return null;

  return (
    <section className={styles.card} aria-label="Lịch sử gia hạn">
      <h2>Lịch sử gia hạn</h2>
      <ul>
        {adjustments.map((a) => (
          <li key={a.id}>
            {rentalDateLabel(a.oldEndAt)} → {rentalDateLabel(a.newEndAt)} · {formatCurrency(a.extraAmount)}
            {a.requestedByName && <small> · {a.requestedByName}</small>}
          </li>
        ))}
      </ul>
    </section>
  );
}

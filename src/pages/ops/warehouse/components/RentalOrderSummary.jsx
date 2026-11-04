import { ORDER_STATUS_LABEL } from '@/constants/enums';
import styles from './RentalOrderSummary.module.css';

export default function RentalOrderSummary({ orderCode, status, facts }) {
  return (
    <section className={styles.card} aria-label="Thông tin đơn thuê">
      <div className={styles.heading}>
        <div>
          <p className={styles.label}>Đơn thuê đang xử lý</p>
          <h2 className={styles.code}>{orderCode}</h2>
        </div>
        <span className={styles.status}>
          {ORDER_STATUS_LABEL[status] || (status === 'Returned' ? 'Đã thu hồi' : status) || 'Chưa cập nhật'}
        </span>
      </div>
      <dl className={styles.facts}>
        {facts.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || 'Chưa cập nhật'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

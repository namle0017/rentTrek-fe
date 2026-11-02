import { formatCurrency } from '@/utils/formatCurrency';
import styles from './finance.module.css';

export default function TransactionSummaryCards({ stats = {}, isLoading = false }) {
  const {
    netInflow = 0,
    totalCollectionSucceeded = 0,
    totalRefundSucceeded = 0,
    pendingCount = 0,
    pendingAmount = 0,
  } = stats;

  return (
    <div className={styles.statsGrid}>
      <div className={`${styles.statCard} ${styles.statInflow}`}>
        <div className={styles.statHeader}>
          <span>Dòng tiền ròng (Net)</span>
        </div>
        <div className={styles.statValue}>
          {isLoading ? '...' : formatCurrency(netInflow)}
        </div>
        <div className={styles.statSubtext}>Thu thực tế trừ đi hoàn trả</div>
      </div>

      <div className={`${styles.statCard} ${styles.statCollection}`}>
        <div className={styles.statHeader}>
          <span>Tổng thu thành công</span>
        </div>
        <div className={styles.statValue}>
          {isLoading ? '...' : formatCurrency(totalCollectionSucceeded)}
        </div>
        <div className={styles.statSubtext}>Tiền tour, thuê đồ và phí phạt</div>
      </div>

      <div className={`${styles.statCard} ${styles.statRefund}`}>
        <div className={styles.statHeader}>
          <span>Tổng hoàn thành công</span>
        </div>
        <div className={styles.statValue} style={{ color: '#dc2626' }}>
          {isLoading ? '...' : `-${formatCurrency(totalRefundSucceeded)}`}
        </div>
        <div className={styles.statSubtext}>Hoàn tiền qua SePay và thủ công</div>
      </div>

      <div className={`${styles.statCard} ${styles.statPending}`}>
        <div className={styles.statHeader}>
          <span>Đang chờ duyệt / xử lý</span>
        </div>
        <div className={styles.statValue}>
          {isLoading ? '...' : `${pendingCount} Giao dịch`}
        </div>
        <div className={styles.statSubtext}>
          Giá trị: {isLoading ? '...' : formatCurrency(pendingAmount)}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_PURPOSE_LABEL,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABEL,
  PAYMENT_TYPE,
  PAYMENT_TYPE_LABEL,
} from '@/constants/enums';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import styles from './finance.module.css';

export default function TransactionTable({
  payments = [],
  isLoading = false,
  onSelectPayment,
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case PAYMENT_STATUS.SUCCEEDED:
        return styles.badgeSucceeded;
      case PAYMENT_STATUS.PENDING_APPROVAL:
        return styles.badgePendingApproval;
      case PAYMENT_STATUS.PENDING:
        return styles.badgePending;
      case PAYMENT_STATUS.FAILED:
        return styles.badgeFailed;
      case PAYMENT_STATUS.CANCELLED:
        return styles.badgeCancelled;
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyBox}>Đang tải dữ liệu giao dịch...</div>
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyBox}>
          <p>Không tìm thấy giao dịch nào khớp với điều kiện lọc.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn & Thời gian</th>
              <th>Dòng tiền & Mục đích</th>
              <th className={styles.numberCell}>Số tiền & Đối soát</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((item) => {
              const isRefund = item.paymentType === PAYMENT_TYPE.REFUND;
              const hasDiff =
                item.receivedAmount !== null &&
                item.receivedAmount !== undefined &&
                item.receivedAmount !== item.amount;
              const diffAmount = hasDiff ? item.receivedAmount - item.amount : 0;

              return (
                <tr
                  key={item.paymentId}
                  onClick={() => onSelectPayment && onSelectPayment(item)}
                  style={{ cursor: 'pointer' }}
                  title="Nhấp để xem toàn bộ chi tiết kiểm toán giao dịch"
                >
                  {/* Cột 1: Mã đơn & Thời gian */}
                  <td>
                    <div className={styles.orderPrimary}>
                      <span>{item.orderCode}</span>
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={(e) => handleCopy(e, item.orderCode, `ord-${item.paymentId}`)}
                        title="Sao chép mã đơn hàng"
                      >
                        {copiedId === `ord-${item.paymentId}` ? 'Đã chép' : 'Chép'}
                      </button>
                    </div>
                    {item.providerTransactionId && (
                      <div className={styles.orderSub} title="Mã giao dịch SePay / Ngân hàng">
                        Mã SePay: {item.providerTransactionId}
                      </div>
                    )}
                    <div className={styles.statSubtext} style={{ marginTop: 2 }}>
                      {formatDateTime(item.createdAt)}
                    </div>
                  </td>

                  {/* Cột 2: Dòng tiền & Mục đích */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                      <span
                        className={`${styles.badge} ${
                          isRefund ? styles.badgeRefund : styles.badgeCollection
                        }`}
                      >
                        {PAYMENT_TYPE_LABEL[item.paymentType] || item.paymentType}
                      </span>
                      <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>
                        {PAYMENT_PURPOSE_LABEL[item.purpose] || item.purpose}
                      </span>
                    </div>
                  </td>

                  {/* Cột 3: Số tiền & Đối soát */}
                  <td className={styles.numberCell}>
                    <div className={styles.amountPrimary} style={{ color: isRefund ? '#dc2626' : '#16a34a' }}>
                      {isRefund
                        ? `-${formatCurrency(Math.abs(item.amount))}`
                        : formatCurrency(item.amount)}
                    </div>
                    {item.receivedAmount !== null && item.receivedAmount !== undefined && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        Thực nhận: {formatCurrency(item.receivedAmount)}
                      </div>
                    )}
                    {hasDiff && (
                      <div>
                        <span
                          className={`${styles.diffBadge} ${
                            diffAmount > 0 ? styles.diffBadgeSuccess : styles.diffBadgeError
                          }`}
                        >
                          {diffAmount > 0
                            ? `+${formatCurrency(diffAmount)} (Thừa)`
                            : `${formatCurrency(diffAmount)} (Thiếu)`}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Cột 4: Phương thức */}
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {PAYMENT_METHOD_LABEL[item.paymentMethod] || item.paymentMethod || 'Chuyển khoản (VietQR)'}
                    </div>
                  </td>

                  {/* Cột 5: Trạng thái */}
                  <td>
                    <span className={`${styles.badge} ${getStatusBadgeClass(item.status)}`}>
                      {PAYMENT_STATUS_LABEL[item.status] || item.status}
                    </span>
                  </td>

                  {/* Cột 6: Thao tác */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className={styles.btnActionDetail}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectPayment) onSelectPayment(item);
                      }}
                      title="Xem chi tiết giao dịch trong Drawer"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

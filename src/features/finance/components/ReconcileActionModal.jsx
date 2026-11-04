import { formatCurrency } from '@/utils/formatCurrency';
import styles from './finance.module.css';

export default function ReconcileActionModal({
  order,
  actionType, // 'accept' | 'refund'
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  if (!isOpen || !order) return null;

  const isAccept = actionType === 'accept';
  const isOverpaid = order.difference > 0;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {isAccept ? 'Chấp nhận Khoản tiền & Xác nhận Đơn' : 'Hoàn Toàn bộ Tiền & Hủy Đơn'}
          </h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 8 }}>
            <div>
              Đơn hàng: <strong>{order.orderCode}</strong>
            </div>
            <div>
              Khách hàng: <strong>{order.customerName}</strong> ({order.customerPhone})
            </div>
            <div style={{ marginTop: 6 }}>
              Số tiền cần thanh toán: <strong>{formatCurrency(order.totalAmount)}</strong>
            </div>
            <div>
              Số tiền khách đã chuyển:{' '}
              <strong style={{ color: isOverpaid ? '#16a34a' : '#dc2626' }}>
                {formatCurrency(order.receivedAmount)}
              </strong>
            </div>
            <div style={{ marginTop: 4 }}>
              Chênh lệch:{' '}
              <span
                className={`${styles.badgeDifference} ${
                  isOverpaid ? styles.diffOverpaid : styles.diffUnderpaid
                }`}
              >
                {isOverpaid
                  ? `Thừa +${formatCurrency(order.difference)}`
                  : `Thiếu ${formatCurrency(order.difference)}`}
              </span>
            </div>
          </div>

          {isAccept ? (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '12px 14px',
                borderRadius: 6,
                color: '#065f46',
                fontSize: "var(--font-size-meta)",
                lineHeight: 1.5,
              }}
            >
              ✅ <strong>Quy trình xử lý:</strong>
              <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                <li>
                  Hệ thống chuyển trạng thái đơn hàng sang <strong>Đã thanh toán (Paid)</strong> và{' '}
                  <strong>Đã xác nhận (Confirmed)</strong>.
                </li>
                {isOverpaid && (
                  <li>
                    Tự động tạo lệnh hoàn tiền <strong>{formatCurrency(order.difference)}</strong> (phần nộp
                    thừa) chuyển về tài khoản cho khách qua SePay.
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <div
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                padding: '12px 14px',
                borderRadius: 6,
                color: '#9f1239',
                fontSize: "var(--font-size-meta)",
                lineHeight: 1.5,
              }}
            >
              ⚠️ <strong>Cảnh báo hủy đơn:</strong>
              <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                <li>
                  Hệ thống sẽ hoàn trả{' '}
                  <strong>100% số tiền thực nhận ({formatCurrency(order.receivedAmount)})</strong> cho khách
                  hàng.
                </li>
                <li>
                  Đơn hàng sẽ đóng ở trạng thái <strong>Hết hạn / Hủy (Expired)</strong> và giải phóng toàn bộ
                  chỗ ngồi hoặc thiết bị trong kho.
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
            Đóng
          </button>
          <button
            type="button"
            className={`btn ${isAccept ? 'btn-primary' : ''}`}
            style={!isAccept ? { background: '#dc2626', color: '#fff', border: 'none' } : {}}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : isAccept
                ? 'Xác nhận chấp nhận & Hoàn tiền thừa'
                : 'Xác nhận hoàn toàn bộ & Hủy đơn'}
          </button>
        </div>
      </div>
    </div>
  );
}

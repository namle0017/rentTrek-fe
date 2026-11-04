import { formatCurrency } from '@/utils/formatCurrency';
import styles from './finance.module.css';

export default function RefundApproveDrawer({ item, isOpen, onClose, onApprove, isApproving = false }) {
  if (!isOpen || !item) return null;

  return (
    <div className={styles.drawerBackdrop} onClick={onClose}>
      <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div>
            <h3 className={styles.modalTitle}>Chi tiết Duyệt Hoàn Tiền</h3>
            <span className={styles.statSubtext}>Mã đơn: {item.orderCode}</span>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Khách hàng yêu cầu hủy</span>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{item.customerName}</div>
            <div className={styles.statSubtext}>SĐT: {item.customerPhone}</div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Tài khoản ngân hàng thụ hưởng</span>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 6 }}>
              <div>
                Ngân hàng: <strong>{item.bankName || 'Ngân hàng thụ hưởng'}</strong>
              </div>
              <div>
                Số tài khoản: <strong>{item.bankAccount}</strong>
              </div>
              <div>
                Chủ tài khoản: <strong>{item.accountHolder || item.customerName}</strong>
              </div>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Lý do hủy đơn</span>
            <div
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                padding: '10px 14px',
                borderRadius: 6,
                color: '#9f1239',
                fontSize: 13,
              }}
            >
              "{item.cancelReason || 'Khách yêu cầu hủy đơn qua hệ thống'}"
            </div>
          </div>

          <div className={styles.calculationBox}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#334155' }}>
              Công thức tính tiền hoàn theo chính sách
            </div>

            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>Tổng tiền đã thu thực tế:</span>
              <span className={styles.calcValue}>{formatCurrency(item.totalCollected)}</span>
            </div>

            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>Thời gian trước khởi hành:</span>
              <span className={styles.calcValue}>{item.hoursBeforeDeparture} giờ</span>
            </div>

            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>Mốc chính sách áp dụng:</span>
              <span className={styles.calcValue} style={{ color: '#2563eb' }}>
                {item.policyRuleDescription}
              </span>
            </div>

            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>Tỷ lệ hoàn tiền:</span>
              <span className={styles.calcValue}>{item.refundPercentage}%</span>
            </div>

            <div className={styles.calcDivider} />

            <div className={styles.calcRow}>
              <span className={styles.calcLabel} style={{ fontWeight: 700 }}>
                Số tiền SePay sẽ chuyển hoàn:
              </span>
              <span className={styles.calcResult}>{formatCurrency(item.proposedRefund)}</span>
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#64748b',
              lineHeight: 1.5,
              background: '#f1f5f9',
              padding: '10px 12px',
              borderRadius: 6,
            }}
          >
            ℹ️ <strong>Nguyên tắc bất biến:</strong> Hệ thống tự động tính toán lại số tiền hoàn tại thời điểm
            duyệt theo chính sách tour. Không cho phép quản trị viên tự ý sửa tay số tiền nhằm đảm bảo tính
            minh bạch.
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={isApproving}>
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onApprove(item.paymentId)}
            disabled={isApproving}
            style={{ minWidth: 160 }}
          >
            {isApproving ? 'Đang duyệt SePay...' : 'Duyệt & Hoàn qua SePay'}
          </button>
        </div>
      </div>
    </div>
  );
}

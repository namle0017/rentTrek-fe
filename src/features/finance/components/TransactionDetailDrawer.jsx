import { useState } from 'react';
import {
  PAYMENT_PURPOSE_LABEL,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABEL,
  PAYMENT_TYPE,
  PAYMENT_TYPE_LABEL,
} from '@/constants/enums';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import styles from './finance.module.css';

export default function TransactionDetailDrawer({ payment, isOpen, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen || !payment) return null;

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isRefund = payment.paymentType === PAYMENT_TYPE.REFUND;
  const hasDiff =
    payment.receivedAmount !== null &&
    payment.receivedAmount !== undefined &&
    payment.receivedAmount !== payment.amount;
  const diffAmount = hasDiff ? payment.receivedAmount - payment.amount : 0;

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

  return (
    <div className={styles.drawerBackdrop} onClick={onClose}>
      <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h3 className={styles.modalTitle}>Chi Tiết Giao Dịch</h3>
              <span className={`${styles.badge} ${getStatusBadgeClass(payment.status)}`}>
                {PAYMENT_STATUS_LABEL[payment.status] || payment.status}
              </span>
            </div>
            <span className={styles.statSubtext}>Mã giao dịch: {payment.paymentId}</span>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {/* Cảnh báo nếu giao dịch Thất bại */}
          {payment.status === PAYMENT_STATUS.FAILED && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '14px 16px',
                color: '#991b1b',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                Giao dịch hoàn tiền không thành công
              </div>
              <div>{payment.failureReason || 'Lỗi kết nối cổng thanh toán hoặc tài khoản đích không hợp lệ.'}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#b91c1c' }}>
                Gợi ý xử lý: Chuyển sang màn hình <strong>Hoàn tiền & Đối soát</strong> để kiểm tra số lần đã thử lại hoặc thực hiện chuyển khoản thủ công.
              </div>
            </div>
          )}

          {/* Khối Thông tin Đơn hàng & Dịch vụ */}
          <div className={styles.calculationBox}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#1e293b' }}>
              Thông Tin Đơn Hàng & Dịch Vụ
            </div>
            <div className={styles.calcSummary}>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Mã đơn hàng:</span>
                <span className={styles.codeBadge}>
                  {payment.orderCode}
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => handleCopy(payment.orderCode, 'orderCode')}
                    title="Sao chép mã đơn"
                  >
                    {copiedKey === 'orderCode' ? 'Đã chép' : 'Chép'}
                  </button>
                </span>
              </div>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Loại dòng tiền:</span>
                <span
                  className={`${styles.badge} ${
                    isRefund ? styles.badgeRefund : styles.badgeCollection
                  }`}
                >
                  {PAYMENT_TYPE_LABEL[payment.paymentType] || payment.paymentType}
                </span>
              </div>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Mục đích:</span>
                <span className={styles.calcValue}>
                  {PAYMENT_PURPOSE_LABEL[payment.purpose] || payment.purpose}
                </span>
              </div>
              {payment.policyRuleDescription && (
                <div className={styles.calcRow}>
                  <span className={styles.calcLabel}>Mốc chính sách:</span>
                  <span style={{ fontSize: 13, color: '#0369a1', fontWeight: 600 }}>
                    {payment.policyRuleDescription}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Khối Tài chính & Số tiền */}
          <div className={styles.calculationBox}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#1e293b' }}>
              Dòng Tiền & Thực Nhận
            </div>
            <div className={styles.calcSummary}>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Số tiền kê khai:</span>
                <span
                  className={styles.calcResult}
                  style={{ color: isRefund ? '#dc2626' : '#16a34a' }}
                >
                  {isRefund
                    ? `-${formatCurrency(Math.abs(payment.amount))}`
                    : formatCurrency(payment.amount)}
                </span>
              </div>

              {payment.receivedAmount !== null && payment.receivedAmount !== undefined && (
                <div className={styles.calcRow}>
                  <span className={styles.calcLabel}>Số tiền thực nhận (Ngân hàng):</span>
                  <span className={styles.calcValue}>{formatCurrency(payment.receivedAmount)}</span>
                </div>
              )}

              {hasDiff && (
                <div className={styles.calcRow}>
                  <span className={styles.calcLabel}>Sai lệch đối soát:</span>
                  <span
                    className={`${styles.badgeDifference} ${
                      diffAmount > 0 ? styles.diffOverpaid : styles.diffUnderpaid
                    }`}
                  >
                    {diffAmount > 0
                      ? `+${formatCurrency(diffAmount)} (Thừa tiền)`
                      : `${formatCurrency(diffAmount)} (Thiếu tiền)`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Khối Tích hợp Cổng SePay & Ngân hàng */}
          <div className={styles.calculationBox}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#1e293b' }}>
              Tích Hợp SePay & Chuỗi Giao Dịch
            </div>
            <div className={styles.calcSummary}>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Phương thức:</span>
                <span className={styles.calcValue}>
                  {payment.paymentMethod || 'Chuyển khoản VietQR (Napas 247)'}
                </span>
              </div>

              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Mã giao dịch SePay:</span>
                {payment.providerTransactionId ? (
                  <span className={styles.codeBadge}>
                    {payment.providerTransactionId}
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => handleCopy(payment.providerTransactionId, 'sepayId')}
                      title="Sao chép mã SePay"
                    >
                      {copiedKey === 'sepayId' ? 'Đã chép' : 'Chép'}
                    </button>
                  </span>
                ) : (
                  <span className={styles.statSubtext}>—</span>
                )}
              </div>

              {payment.providerOrderId && (
                <div className={styles.calcRow}>
                  <span className={styles.calcLabel}>Mã đơn ảo (VA Order ID):</span>
                  <span className={styles.codeBadge}>{payment.providerOrderId}</span>
                </div>
              )}

              {payment.originalPaymentId && (
                <div className={styles.calcRow}>
                  <span className={styles.calcLabel}>Giao dịch gốc (Original):</span>
                  <span className={styles.codeBadge} style={{ color: '#6366f1' }}>
                    {payment.originalPaymentId}
                  </span>
                </div>
              )}

              {payment.retryOfPaymentId && (
                <div className={styles.calcRow}>
                  <span className={styles.calcLabel}>Lần thử lại của giao dịch:</span>
                  <span className={styles.codeBadge} style={{ color: '#f59e0b' }}>
                    {payment.retryOfPaymentId}
                  </span>
                </div>
              )}

              {payment.manualReference && (
                <div className={styles.calcRow}>
                  <span className={styles.calcLabel}>Mã tham chiếu ngoài:</span>
                  <span className={styles.codeBadge} style={{ color: '#0284c7' }}>
                    {payment.manualReference}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Khối Nhật ký Kiểm toán (Audit Timeline) */}
          <div className={styles.calculationBox}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#1e293b' }}>
              Nhật Ký Thời Gian (Audit)
            </div>
            <div className={styles.calcSummary}>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Thời điểm khởi tạo:</span>
                <span className={styles.calcValue}>{formatDateTime(payment.createdAt)}</span>
              </div>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Thời điểm hoàn tất:</span>
                <span className={styles.calcValue}>
                  {payment.processedAt ? formatDateTime(payment.processedAt) : 'Đang xử lý / Chưa hoàn tất'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.drawerFooter}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './finance.module.css';

export default function VietQrPaymentModal({
  orderCode = 'RENT-2026-1105',
  amount = 350000,
  purpose = 'Phí phạt hư hỏng / phát sinh đơn thuê',
  isOpen,
  onClose,
  onSimulateSuccess,
}) {
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const bankName = 'Ngân hàng TMCP Quân Đội (MBBank)';
  const bankAccount = '091234567899';
  const accountHolder = 'CONG TY CP RENTREKK VIET NAM';
  const transferContent = `RTK ${orderCode}`;

  // VietQR Quick Link URL chuẩn Napas 247
  const qrUrl = `https://img.vietqr.io/image/MB-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    transferContent,
  )}&accountName=${encodeURIComponent(accountHolder)}`;

  const handleSimulatePayment = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      if (onSimulateSuccess) {
        onSimulateSuccess({
          orderCode,
          amount,
          transferContent,
        });
      }
      onClose();
    }, 800);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Thanh toán VietQR Napas 247</h3>
            <span className={styles.statSubtext}>Mục đích: {purpose}</span>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.qrCard}>
            <div className={styles.qrImageFrame}>
              <img
                src={qrUrl}
                alt="VietQR Code"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  // Fallback nếu không có internet load ảnh vietqr
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = `
                    <div style="padding: 20px; font-size: 13px; color: #475569;">
                      <div style="font-size: 32px; margin-bottom: 8px;">📲</div>
                      <strong>Mã QR Chuyển khoản</strong><br/>
                      ${formatCurrency(amount)}
                    </div>
                  `;
                }}
              />
            </div>

            <div style={{ fontSize: 13, color: '#475569' }}>
              Quét mã bằng app ngân hàng bất kỳ để thanh toán tức thời
            </div>

            <div className={styles.qrBankInfo}>
              <div>Ngân hàng: <strong>{bankName}</strong></div>
              <div>Số tài khoản: <strong style={{ color: '#2563eb' }}>{bankAccount}</strong></div>
              <div>Chủ tài khoản: <strong>{accountHolder}</strong></div>
              <div>Số tiền: <strong style={{ color: '#16a34a', fontSize: 15 }}>{formatCurrency(amount)}</strong></div>
              <div>
                Nội dung chuyển khoản:{' '}
                <strong style={{ background: '#fef08a', padding: '2px 6px', borderRadius: 4 }}>
                  {transferContent}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSimulatePayment}
            disabled={isSimulating}
          >
            {isSimulating ? 'Đang nhận thanh toán...' : '⚡ Mô phỏng đã nhận tiền (Test)'}
          </button>
        </div>
      </div>
    </div>
  );
}


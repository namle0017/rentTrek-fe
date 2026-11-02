import { useState } from 'react';
import { PAYMENT_PURPOSE, PAYMENT_PURPOSE_LABEL } from '@/constants/enums';
import styles from './finance.module.css';

export default function ManualPaymentRecordModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  defaultOrderCode = '',
}) {
  const [orderCode, setOrderCode] = useState(defaultOrderCode);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState(PAYMENT_PURPOSE.TOUR_FEE);
  const [customerName, setCustomerName] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderCode.trim()) {
      setError('Vui lòng nhập mã đơn hàng.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Vui lòng nhập số tiền thu hợp lệ.');
      return;
    }
    setError('');
    onSubmit({
      orderCode: orderCode.trim().toUpperCase(),
      amount: Number(amount),
      purpose,
      customerName: customerName.trim() || 'Khách nộp tại quầy',
      referenceCode: referenceCode.trim() || `OFFLINE-REC-${Date.now().toString().slice(-4)}`,
      note: note.trim() || 'Thu tiền mặt / chuyển khoản quầy trực tiếp',
    });
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Ghi Nhận Thu Tiền Thủ Công</h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && (
              <div style={{ color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Mã đơn hàng *</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="VD: TRIP-2026-0421"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Số tiền thu (VNĐ) *</label>
              <input
                type="number"
                className={styles.filterInput}
                placeholder="VD: 3200000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Mục đích thu tiền</label>
              <select
                className={styles.filterSelect}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              >
                <option value={PAYMENT_PURPOSE.TOUR_FEE}>{PAYMENT_PURPOSE_LABEL[PAYMENT_PURPOSE.TOUR_FEE]}</option>
                <option value={PAYMENT_PURPOSE.RENTAL_FEE}>{PAYMENT_PURPOSE_LABEL[PAYMENT_PURPOSE.RENTAL_FEE]}</option>
                <option value={PAYMENT_PURPOSE.ADDITIONAL_CHARGE}>
                  {PAYMENT_PURPOSE_LABEL[PAYMENT_PURPOSE.ADDITIONAL_CHARGE]}
                </option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Họ tên người nộp tiền</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="VD: Nguyễn Văn A"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Mã phiếu thu / Mã tham chiếu</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="VD: PT-2026-0091"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ghi chú nghiệp vụ</label>
              <textarea
                className={styles.filterInput}
                style={{ height: 60, padding: '8px 12px', resize: 'vertical' }}
                placeholder="VD: Khách đóng trực tiếp tại văn phòng RenTrekk"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Ghi nhận thanh toán'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


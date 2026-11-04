import { useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './finance.module.css';

export default function RefundManualModal({ item, isOpen, onClose, onConfirm, isSubmitting = false }) {
  const [manualReference, setManualReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!manualReference.trim()) {
      setError('Vui lòng nhập mã tham chiếu giao dịch ngân hàng (FT/Mã giao dịch).');
      return;
    }
    setError('');
    onConfirm({
      manualReference: manualReference.trim(),
      note: note.trim() || 'Chuyển khoản trực tiếp qua Internet Banking doanh nghiệp',
    });
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Xác nhận Đã Hoàn Tiền Thủ Công</h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
              <div>
                Đơn hàng: <strong>{item.orderCode}</strong>
              </div>
              <div>
                Khách hàng: <strong>{item.customerName}</strong>
              </div>
              <div>
                Số tiền cần hoàn:{' '}
                <strong style={{ color: '#dc2626' }}>{formatCurrency(Math.abs(item.amount))}</strong>
              </div>
              <div>
                STK nhận: <strong>{item.bankAccount}</strong> ({item.bankName})
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Mã tham chiếu ngân hàng (Manual Reference) *</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="VD: VCB-REFUND-20261101-778899"
                value={manualReference}
                onChange={(e) => {
                  setManualReference(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
              {error && <span style={{ color: '#dc2626', fontSize: 12 }}>{error}</span>}
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ghi chú nghiệp vụ / Lý do hoàn ngoài</label>
              <textarea
                className={styles.filterInput}
                style={{ height: 75, padding: '8px 12px', resize: 'vertical' }}
                placeholder="VD: Đã chuyển khoản qua app ngân hàng công ty do tài khoản khách không nhận tự động từ cổng"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div style={{ fontSize: 12, color: '#64748b' }}>
              ⚠️ Hành động này sẽ cập nhật trạng thái đơn thành "Đã hoàn thành công" và lưu nhật ký kiểm toán
              (Audit Log) theo mã tham chiếu.
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu giao dịch hoàn thủ công'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

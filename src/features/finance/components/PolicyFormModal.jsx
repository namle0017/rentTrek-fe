import { useState } from 'react';
import { REFUND_POLICY_TYPE, REFUND_POLICY_TYPE_LABEL } from '@/constants/enums';
import styles from './finance.module.css';

export default function PolicyFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [name, setName] = useState('');
  const [policyType, setPolicyType] = useState(REFUND_POLICY_TYPE.TOUR);
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên bộ chính sách.');
      return;
    }
    setError('');
    onSubmit({
      name: name.trim(),
      policyType,
      effectiveFrom,
    });
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Tạo Chính Sách Hoàn Tiền Mới</h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Tên chính sách *</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="VD: Chính sách hoàn tiền Tour Trekking Mùa Cao Điểm"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
              {error && (
                <span style={{ color: '#dc2626', fontSize: 12 }}>{error}</span>
              )}
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Loại dịch vụ áp dụng</label>
              <select
                className={styles.filterSelect}
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
              >
                <option value={REFUND_POLICY_TYPE.TOUR}>
                  {REFUND_POLICY_TYPE_LABEL[REFUND_POLICY_TYPE.TOUR]}
                </option>
                <option value={REFUND_POLICY_TYPE.RENTAL}>
                  {REFUND_POLICY_TYPE_LABEL[REFUND_POLICY_TYPE.RENTAL]}
                </option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ngày bắt đầu có hiệu lực</label>
              <input
                type="date"
                className={styles.filterInput}
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </div>

            <div
              style={{
                background: '#f8fafc',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: 13,
                color: '#475569',
              }}
            >
              ℹ️ Sau khi tạo thành công, bạn có thể thiết lập chi tiết các mốc bậc thang (giờ trước khởi hành vs % hoàn tiền) trong bảng quy tắc.
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
              {isSubmitting ? 'Đang tạo...' : 'Tạo chính sách'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


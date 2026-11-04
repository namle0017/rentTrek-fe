import { useState } from 'react';
import styles from './finance.module.css';

export default function PolicyRuleEditorModal({ isOpen, onClose, onSave, initialData = null }) {
  const [minHoursBefore, setMinHoursBefore] = useState(initialData ? (initialData.minHoursBefore ?? 0) : 72);
  const [refundPercentage, setRefundPercentage] = useState(
    initialData ? (initialData.refundPercentage ?? 0) : 80,
  );
  const [description, setDescription] = useState(
    initialData ? (initialData.description ?? '') : 'Trước 3 ngày (≥ 72h): Hoàn 80% tiền tour',
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const hours = Number(minHoursBefore);
    const pct = Number(refundPercentage);

    if (isNaN(hours) || hours < 0) {
      setError('Số giờ tối thiểu phải là số không âm.');
      return;
    }
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setError('Tỷ lệ hoàn tiền phải nằm trong khoảng từ 0% đến 100%.');
      return;
    }
    if (!description.trim()) {
      setError('Vui lòng nhập mô tả hiển thị cho khách hàng.');
      return;
    }

    onSave({
      ruleId: initialData?.ruleId || `rule-${Date.now()}`,
      minHoursBefore: hours,
      refundPercentage: pct,
      description: description.trim(),
    });
    onClose();
  };

  const daysEquivalent = Math.floor(Number(minHoursBefore) / 24);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {initialData ? 'Chỉnh Sửa Mốc Quy Tắc' : 'Thêm Mốc Quy Tắc Hoàn Tiền'}
          </h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: "var(--font-size-meta)",
                }}
              >
                {error}
              </div>
            )}

            <div className={styles.filterGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className={styles.filterLabel}>Mốc thời gian trước khởi hành (Giờ) *</label>
                {daysEquivalent > 0 && (
                  <span style={{ fontSize: "var(--font-size-meta)", color: '#0369a1', fontWeight: "var(--font-weight-semibold)" }}>
                    ≈ {daysEquivalent} ngày trước giờ đi
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0"
                step="1"
                className={styles.filterInput}
                placeholder="Ví dụ: 72"
                value={minHoursBefore}
                onChange={(e) => {
                  setMinHoursBefore(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
              <span className={styles.statSubtext}>
                Ví dụ: 168 giờ = 7 ngày, 72 giờ = 3 ngày, 24 giờ = 1 ngày, 0 = sát giờ/sau khởi hành.
              </span>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Tỷ lệ hoàn tiền (%) *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  className={styles.filterInput}
                  placeholder="Nhập từ 0 đến 100"
                  value={refundPercentage}
                  onChange={(e) => {
                    setRefundPercentage(e.target.value);
                    if (error) setError('');
                  }}
                  style={{ width: '130px', fontWeight: "var(--font-weight-bold)" }}
                />
                <span style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-body)", color: '#1e293b' }}>%</span>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Mô tả hiển thị cho khách hàng *</label>
              <textarea
                className={styles.filterInput}
                rows="2"
                placeholder="Nhập mô tả quy định hoàn tiền hiển thị cho khách hàng..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError('');
                }}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Lưu thay đổi' : 'Thêm mốc quy tắc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

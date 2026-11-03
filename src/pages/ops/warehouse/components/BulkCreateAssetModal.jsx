import { useState } from 'react';
import { useBulkCreateAssets } from '../hooks/useAssets';
import styles from './WarehouseModals.module.css';

export default function BulkCreateAssetModal({ isOpen, onClose }) {
  const [productVariantId, setProductVariantId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [codePrefix, setCodePrefix] = useState('EQ-');
  const [initialConditionNote, setInitialConditionNote] = useState('Mới 100%, nguyên tem');
  const [validationError, setValidationError] = useState('');

  const bulkCreateMutation = useBulkCreateAssets();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productVariantId.trim()) {
      setValidationError('Vui lòng nhập Product Variant ID');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 100) {
      setValidationError('Số lượng phải từ 1 đến 100');
      return;
    }
    if (!codePrefix.trim()) {
      setValidationError('Vui lòng nhập tiền tố mã thiết bị (e.g. TENT-4P-)');
      return;
    }

    setValidationError('');
    bulkCreateMutation.mutate(
      {
        productVariantId: productVariantId.trim(),
        quantity: qty,
        codePrefix: codePrefix.trim().toUpperCase(),
        initialConditionNote: initialConditionNote.trim() || null,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Thêm thiết bị hàng loạt & cấp mã QR</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {validationError && <div className={styles.errorAlert}>{validationError}</div>}

          <div className={styles.field}>
            <label className={styles.label}>
              Mã biến thể sản phẩm (Product Variant ID) <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Nhập ID biến thể (ví dụ: <variant-id>)"
              value={productVariantId}
              onChange={(e) => setProductVariantId(e.target.value)}
              required
            />
            <span className={styles.hint}>Thiết bị sẽ được gán trực tiếp cho biến thể này để quản lý tồn kho và lên lịch.</span>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>
                Tiền tố mã QR / Barcode <span className={styles.req}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ví dụ: TENT-4P-, BAG-50L-"
                value={codePrefix}
                onChange={(e) => setCodePrefix(e.target.value)}
                required
              />
              <span className={styles.hint}>Mã sinh ra: {codePrefix.toUpperCase()}0001, {codePrefix.toUpperCase()}0002...</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Số lượng cấp mới (1 - 100) <span className={styles.req}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                className={styles.input}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ghi chú tình trạng ban đầu</label>
            <textarea
              rows={2}
              className={styles.textarea}
              placeholder="Ví dụ: Mới 100%, phụ kiện đầy đủ gồm túi + cọc"
              value={initialConditionNote}
              onChange={(e) => setInitialConditionNote(e.target.value)}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={bulkCreateMutation.isPending}>
              Hủy
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={bulkCreateMutation.isPending}>
              {bulkCreateMutation.isPending ? 'Đang tạo...' : `Xác nhận tạo ${quantity} thiết bị`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

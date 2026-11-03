import { useState, useMemo } from 'react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useBulkCreateAssets } from '../hooks/useAssets';
import styles from './WarehouseModals.module.css';

export default function BulkCreateAssetModal({ isOpen, onClose }) {
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [manualVariantId, setManualVariantId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [codePrefix, setCodePrefix] = useState('');
  const [initialConditionNote, setInitialConditionNote] = useState('Mới 100%, nguyên tem');
  const [validationError, setValidationError] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);

  const { data: productsData, isLoading: loadingProducts } = useProducts({ pageSize: 50 });
  const bulkCreateMutation = useBulkCreateAssets();

  const allVariants = useMemo(() => {
    if (!productsData?.items) return [];
    const list = [];
    productsData.items.forEach((p) => {
      if (p.variants?.length) {
        p.variants.forEach((v) => {
          list.push({
            variantId: v.id,
            productName: p.name,
            variantName: v.name,
            sku: v.sku,
            label: `${p.name} — ${v.name} (SKU: ${v.sku})`,
          });
        });
      }
    });
    return list;
  }, [productsData]);

  const effectiveVariantId = isManualInput
    ? manualVariantId
    : selectedVariantId || (allVariants.length > 0 ? allVariants[0].variantId : '');

  const effectivePrefix = codePrefix !== ''
    ? codePrefix
    : (() => {
        const found = allVariants.find((v) => v.variantId === effectiveVariantId);
        return found ? `${found.sku}-` : 'EQ-';
      })();

  if (!isOpen) return null;

  const handleVariantSelect = (e) => {
    const nextId = e.target.value;
    setSelectedVariantId(nextId);
    const found = allVariants.find((v) => v.variantId === nextId);
    if (found) {
      setCodePrefix(`${found.sku}-`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalVariantId = effectiveVariantId.trim();
    if (!finalVariantId) {
      setValidationError('Vui lòng chọn hoặc nhập Biến thể sản phẩm');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 100) {
      setValidationError('Số lượng phải từ 1 đến 100');
      return;
    }
    const finalPrefix = effectivePrefix.trim();
    if (!finalPrefix) {
      setValidationError('Vui lòng nhập tiền tố mã thiết bị (e.g. TENT-4P-)');
      return;
    }

    setValidationError('');
    bulkCreateMutation.mutate(
      {
        productVariantId: finalVariantId,
        quantity: qty,
        codePrefix: finalPrefix.toUpperCase(),
        initialConditionNote: initialConditionNote.trim() || null,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          const msg = err.response?.data?.message || 'Không thể tạo thiết bị hàng loạt';
          setValidationError(msg);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className={styles.label} style={{ margin: 0 }}>
                Biến thể sản phẩm <span className={styles.req}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsManualInput(!isManualInput)}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isManualInput ? 'Chọn từ danh mục' : 'Nhập mã ID thủ công'}
              </button>
            </div>

            {!isManualInput ? (
              <select
                className={styles.select}
                value={effectiveVariantId}
                onChange={handleVariantSelect}
                disabled={loadingProducts}
                required
              >
                {loadingProducts ? (
                  <option value="">Đang tải danh mục sản phẩm...</option>
                ) : allVariants.length === 0 ? (
                  <option value="">Chưa có sản phẩm nào</option>
                ) : (
                  allVariants.map((v) => (
                    <option key={v.variantId} value={v.variantId}>
                      {v.label}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập GUID biến thể sản phẩm..."
                value={manualVariantId}
                onChange={(e) => setManualVariantId(e.target.value)}
                required
              />
            )}
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
                value={effectivePrefix}
                onChange={(e) => setCodePrefix(e.target.value)}
                required
              />
              <span className={styles.hint}>Mã sinh ra: {effectivePrefix.toUpperCase()}0001, {effectivePrefix.toUpperCase()}0002...</span>
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

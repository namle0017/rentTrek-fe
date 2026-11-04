import { useState, useMemo } from 'react';
import { useAssetVariants, useBulkCreateAssets } from '../hooks/useAssets';
import { MOCK_CATALOG_VARIANTS } from '../constants/mockFulfillmentData';
import styles from './WarehouseModals.module.css';

export default function BulkCreateAssetModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [manualVariantId, setManualVariantId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [codePrefix, setCodePrefix] = useState('');
  const [initialConditionNote, setInitialConditionNote] = useState('Mới 100%, nguyên tem');
  const [validationError, setValidationError] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);

  const { data: apiVariants, isLoading: loadingVariants } = useAssetVariants();
  const bulkCreateMutation = useBulkCreateAssets();

  // Danh sách biến thể kết hợp từ API và Mock Catalog fallback
  const allVariants = useMemo(() => {
    const rawList = (apiVariants && apiVariants.length > 0) ? apiVariants : MOCK_CATALOG_VARIANTS;
    return rawList.map((v) => ({
      variantId: v.id,
      productName: v.productName || v.name || 'Thiết bị',
      variantName: v.variantName || v.name || 'Mặc định',
      sku: v.sku || 'SKU',
      label: `${v.productName || v.name} — ${v.variantName || ''} (SKU: ${v.sku})`,
    }));
  }, [apiVariants]);

  // Lọc theo từ khóa tìm kiếm (tên sản phẩm, biến thể hoặc SKU)
  const filteredVariants = useMemo(() => {
    if (!searchTerm.trim()) return allVariants;
    const term = searchTerm.toLowerCase();
    return allVariants.filter(
      (v) =>
        v.productName.toLowerCase().includes(term) ||
        v.variantName.toLowerCase().includes(term) ||
        v.sku.toLowerCase().includes(term)
    );
  }, [allVariants, searchTerm]);

  const effectiveVariantId = isManualInput
    ? manualVariantId
    : selectedVariantId || (filteredVariants.length > 0 ? filteredVariants[0].variantId : '');

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
      setValidationError('Vui lòng nhập tiền tố mã thiết bị (e.g. TENT-2-GREEN-)');
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

          {/* Hộp giải thích ngắn gọn về Biến thể sản phẩm */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.65rem 0.85rem', marginBottom: '0.75rem', fontSize: "var(--font-size-meta)", color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
            <strong>Biến thể sản phẩm là gì?</strong> Là phiên bản cụ thể của một sản phẩm theo kích thước, màu sắc hoặc phân loại (ví dụ: Sản phẩm <em>Lều cắm trại 2 người</em> có biến thể <em>2 người / xanh lá</em> với SKU <code>TENT-2-GREEN</code>). Khi tạo thiết bị, bạn chọn biến thể để hệ thống tự cấp mã QR theo lô.
          </div>

          <div className={styles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className={styles.label} style={{ margin: 0 }}>
                Biến thể sản phẩm <span className={styles.req}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsManualInput(!isManualInput)}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: "var(--font-size-control)", cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isManualInput ? 'Chọn từ danh mục tên thiết bị' : 'Nhập mã ID thủ công (GUID)'}
              </button>
            </div>

            {!isManualInput ? (
              <>
                {/* Thanh tìm kiếm nhanh theo tên */}
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Gõ tìm theo tên hoặc SKU (vd: lều, balo, đèn, túi ngủ...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ marginBottom: '0.45rem', fontSize: "var(--font-size-control)" }}
                />

                <select
                  className={styles.select}
                  value={effectiveVariantId}
                  onChange={handleVariantSelect}
                  disabled={loadingVariants}
                  required
                >
                  {loadingVariants ? (
                    <option value="">Đang tải danh mục sản phẩm...</option>
                  ) : filteredVariants.length === 0 ? (
                    <option value="">Không tìm thấy biến thể nào phù hợp từ khóa &quot;{searchTerm}&quot;</option>
                  ) : (
                    filteredVariants.map((v) => (
                      <option key={v.variantId} value={v.variantId}>
                        {v.label}
                      </option>
                    ))
                  )}
                </select>
              </>
            ) : (
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập GUID biến thể sản phẩm (vd: 11111111-1111-1111-1111-111111111101)..."
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
                placeholder="Ví dụ: TENT-2-GREEN-, PACK-40-"
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

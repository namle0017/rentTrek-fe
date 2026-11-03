import { useMemo, useState } from 'react';
import Spinner from '@/components/Spinner';
import { useAssignAssetsToTripItem, useAvailableAssetsForTripItem } from '../hooks/useTripProvidedItems';
import styles from './WarehouseModals.module.css';

export default function AssignGearDrawer({ tripId, item, isOpen, onClose }) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [errorMsg, setErrorMsg] = useState('');

  const { data: availableAssets, isLoading } = useAvailableAssetsForTripItem(
    tripId,
    item?.tripProvidedItemId,
    isOpen
  );

  const assignMutation = useAssignAssetsToTripItem();

  const availableMap = useMemo(() => {
    const map = new Map();
    (availableAssets || []).forEach((a) => {
      map.set(a.assetCode.toUpperCase(), a);
    });
    return map;
  }, [availableAssets]);

  if (!isOpen || !item) return null;

  const handleToggleCode = (code) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    const cleanCode = barcodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    if (!availableMap.has(cleanCode)) {
      setErrorMsg(`Mã '${cleanCode}' không khả dụng trong khung ngày hoặc không thuộc biến thể này.`);
      return;
    }

    setSelectedCodes((prev) => new Set(prev).add(cleanCode));
    setBarcodeInput('');
    setErrorMsg('');
  };

  const handleSave = () => {
    if (selectedCodes.size === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một thiết bị để gán.');
      return;
    }

    assignMutation.mutate(
      {
        tripId,
        itemId: item.tripProvidedItemId,
        payload: {
          assetCodes: Array.from(selectedCodes),
        },
      },
      {
        onSuccess: () => {
          setSelectedCodes(new Set());
          onClose();
        },
      }
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <div className={styles.badgeLine}>
              <span className={styles.codeTag}>O13 · Gán thiết bị</span>
            </div>
            <h3 className={styles.title}>{item.productName}</h3>
            <p className={styles.subtitle}>
              {item.variantName} • SKU: {item.sku} • Cần: {item.requiredQuantity} cái
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.drawerBody}>
          {/* Scanner Input */}
          <div className={styles.cardSection}>
            <h4 className={styles.sectionTitle}>Quét Barcode hoặc nhập mã thiết bị</h4>
            <form onSubmit={handleScanSubmit} className={styles.field}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ví dụ: TENT-4P-0001 (Nhấn Enter)"
                  value={barcodeInput}
                  onChange={(e) => {
                    setBarcodeInput(e.target.value);
                    setErrorMsg('');
                  }}
                  autoFocus
                />
                <button type="submit" className={styles.btnPrimary}>
                  Gán
                </button>
              </div>
              {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
              <span className={styles.hint}>
                Thiết bị sẽ được chuyển sang trạng thái <strong>Reserved (Đã giữ)</strong> trong khung ngày của chuyến.
              </span>
            </form>
          </div>

          {/* Available Assets Checklist */}
          <div className={styles.cardSection}>
            <h4 className={styles.sectionTitle}>
              Thiết bị trống trong kho ({availableAssets?.length || 0} khả dụng)
            </h4>

            {isLoading ? (
              <div className={styles.loadingBox}>
                <Spinner />
                <span>Đang tra cứu thiết bị trống trong kho...</span>
              </div>
            ) : availableAssets?.length === 0 ? (
              <p className={styles.emptyText}>
                Không có thiết bị nào rảnh trong kho khớp với biến thể này trong khung ngày của chuyến!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
                {availableAssets?.map((asset) => {
                  const isChecked = selectedCodes.has(asset.assetCode);
                  return (
                    <label
                      key={asset.assetId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        background: isChecked ? '#ecfdf5' : '#ffffff',
                        border: `1px solid ${isChecked ? '#10b981' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCode(asset.assetCode)}
                        style={{ width: '18px', height: '18px', accentColor: '#204b39' }}
                      />
                      <span className={styles.codeTag}>{asset.assetCode}</span>
                      <span style={{ fontSize: '13px', color: '#64748b', flex: 1 }}>
                        {asset.conditionNote || 'Tình trạng tốt'}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#166534',
                          background: '#dcfce7',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Sẵn sàng
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer} style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
          <div style={{ marginRight: 'auto', fontSize: '14px' }}>
            Đã chọn <strong>{selectedCodes.size}</strong> / {item.requiredQuantity} món
          </div>
          <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={assignMutation.isPending}>
            Hủy
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={assignMutation.isPending || selectedCodes.size === 0}
          >
            {assignMutation.isPending ? 'Đang lưu...' : `Xác nhận giữ ${selectedCodes.size} món`}
          </button>
        </div>
      </div>
    </div>
  );
}

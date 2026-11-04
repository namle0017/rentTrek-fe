import { useMemo, useState } from 'react';
import { useReturnTripGear } from '../hooks/useTripProvidedItems';
import styles from './WarehouseModals.module.css';

const RETURN_CONDITIONS = [
  { value: 'Normal', label: 'Bình thường (Normal)' },
  { value: 'Damaged', label: 'Hư hỏng (Damaged)' },
  { value: 'MissingAccessory', label: 'Thiếu phụ kiện (MissingAccessory)' },
  { value: 'Lost', label: 'Mất thiết bị (Lost)' },
];

export default function ReturnGearModal({ tripId, assignedAssets, isOpen, onClose }) {
  const [returnItems, setReturnItems] = useState({});
  const returnMutation = useReturnTripGear();

  // Danh sách các thiết bị chưa trả
  const activeAssets = useMemo(() => {
    return (assignedAssets || []).filter((a) => a.status === 'Issued' || a.status === 'Reserved');
  }, [assignedAssets]);

  if (!isOpen) return null;

  const handleConditionChange = (assetCode, condition) => {
    setReturnItems((prev) => ({
      ...prev,
      [assetCode]: {
        ...prev[assetCode],
        returnCondition: condition,
      },
    }));
  };

  const handleNoteChange = (assetCode, note) => {
    setReturnItems((prev) => ({
      ...prev,
      [assetCode]: {
        ...prev[assetCode],
        note,
      },
    }));
  };

  const handleToggleSelect = (assetCode) => {
    setReturnItems((prev) => {
      const next = { ...prev };
      if (next[assetCode]) {
        delete next[assetCode];
      } else {
        next[assetCode] = { returnCondition: 'Normal', note: '' };
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const all = {};
    activeAssets.forEach((a) => {
      all[a.assetCode] = { returnCondition: 'Normal', note: '' };
    });
    setReturnItems(all);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const returnList = Object.entries(returnItems).map(([code, val]) => ({
      assetCode: code,
      returnCondition: val.returnCondition || 'Normal',
      note: val.note?.trim() || null,
    }));

    if (returnList.length === 0) {
      return;
    }

    returnMutation.mutate(
      {
        tripId,
        payload: {
          returns: returnList,
        },
      },
      {
        onSuccess: () => {
          setReturnItems({});
          onClose();
        },
      }
    );
  };

  const selectedCount = Object.keys(returnItems).length;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Thu hồi thiết bị sau tour (Return Gear)</h3>
            <p className={styles.subtitle}>
              Kiểm tra tình trạng thiết bị khi đoàn hoàn tất chuyến đi và nhập lại kho.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: "var(--font-size-meta)", color: '#64748b' }}>
              Còn <strong>{activeAssets.length}</strong> món đồ đang lưu hành trong đoàn
            </span>
            <button
              type="button"
              className={styles.btnSecondary}
              style={{ padding: '4px 10px', fontSize: "var(--font-size-control)" }}
              onClick={handleSelectAll}
            >
              Chọn thu hồi tất cả
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
            {activeAssets.length === 0 ? (
              <p className={styles.emptyText}>Tất cả thiết bị của chuyến đi đã được thu hồi đầy đủ.</p>
            ) : (
              activeAssets.map((asset) => {
                const isSelected = Boolean(returnItems[asset.assetCode]);
                const itemData = returnItems[asset.assetCode] || { returnCondition: 'Normal', note: '' };

                return (
                  <div
                    key={asset.assetCode}
                    style={{
                      border: `1px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      padding: '10px 14px',
                      background: isSelected ? '#f8fafc' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(asset.assetCode)}
                        style={{ width: '18px', height: '18px', accentColor: '#204b39' }}
                      />
                      <span className={styles.codeTag}>{asset.assetCode}</span>
                      <span style={{ fontSize: "var(--font-size-meta)", color: '#64748b' }}>Trạng thái: {asset.status}</span>
                    </div>

                    {isSelected && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingLeft: '28px' }}>
                        <div>
                          <label style={{ fontSize: "var(--font-size-label)", fontWeight: "var(--font-weight-semibold)", color: '#374151' }}>Tình trạng trả</label>
                          <select
                            className={styles.select}
                            style={{ padding: '6px 8px', fontSize: "var(--font-size-control)" }}
                            value={itemData.returnCondition}
                            onChange={(e) => handleConditionChange(asset.assetCode, e.target.value)}
                          >
                            {RETURN_CONDITIONS.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "var(--font-size-label)", fontWeight: "var(--font-weight-semibold)", color: '#374151' }}>Ghi chú hư hại</label>
                          <input
                            type="text"
                            className={styles.input}
                            style={{ padding: '6px 8px', fontSize: "var(--font-size-control)" }}
                            placeholder="Mô tả nếu hỏng/mất..."
                            value={itemData.note}
                            onChange={(e) => handleNoteChange(asset.assetCode, e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={returnMutation.isPending}>
              Hủy
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={returnMutation.isPending || selectedCount === 0}
            >
              {returnMutation.isPending ? 'Đang xử lý...' : `Xác nhận thu hồi ${selectedCount} thiết bị`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

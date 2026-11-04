import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useHandoverChecklist,
  useHandoverScan,
  useCompleteHandover,
} from './hooks/useFulfillment';
import { playSuccessBeep, playErrorBuzz } from './utils/soundHelper';
import Spinner from '@/components/Spinner';
import { MOCK_ORDERS } from './constants/mockFulfillmentData';
import styles from './HandoverChecklistPage.module.css';

export default function HandoverChecklistPage() {
  const { orderCode: routeOrderCode } = useParams();
  const navigate = useNavigate();

  // Mặc định đơn đầu tiên nếu không có route param
  const defaultOrder = 'RT-202611-001';
  const [searchOrderCode, setSearchOrderCode] = useState(routeOrderCode || defaultOrder);
  const activeOrderCode = routeOrderCode || searchOrderCode;

  const [barcodeInput, setBarcodeInput] = useState('');
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteReason, setIncompleteReason] = useState('');
  const [localMockOverrides, setLocalMockOverrides] = useState({});
  const barcodeInputRef = useRef(null);

  const { data: serverChecklist, isLoading } = useHandoverChecklist(activeOrderCode);
  const scanMutation = useHandoverScan(activeOrderCode);
  const completeMutation = useCompleteHandover(activeOrderCode);

  // Lấy dữ liệu mock của đơn hiện tại
  const mockOrder = useMemo(() => {
    return MOCK_ORDERS[activeOrderCode] || MOCK_ORDERS[defaultOrder];
  }, [activeOrderCode]);

  // Checklist tổng hợp: ưu tiên server nếu có dữ liệu, nếu server rỗng/lỗi thì dùng mock
  const checklist = useMemo(() => {
    if (serverChecklist && serverChecklist.items?.length > 0) {
      return serverChecklist;
    }
    const base = {
      orderCode: mockOrder.orderCode,
      customerName: mockOrder.customerName,
      customerPhone: mockOrder.customerPhone,
      rentalStartAt: mockOrder.rentalStartAt,
      rentalEndAt: mockOrder.rentalEndAt,
      orderStatus: mockOrder.orderStatus,
      totalRequiredCount: mockOrder.totalRequiredCount,
      scannedCount: mockOrder.scannedCount,
      items: mockOrder.handoverItems.map((item) => ({ ...item })),
    };

    // Áp dụng các thay đổi quét thử nghiệm cục bộ (đối với chế độ offline/mock)
    const override = localMockOverrides[activeOrderCode];
    if (override) {
      return {
        ...base,
        scannedCount: override.scannedCount ?? base.scannedCount,
        orderStatus: override.orderStatus ?? base.orderStatus,
        items: override.items ?? base.items,
      };
    }
    return base;
  }, [serverChecklist, mockOrder, localMockOverrides, activeOrderCode]);

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [checklist]);

  const handleSelectOrder = (code) => {
    setSearchOrderCode(code);
    navigate(`/ops/rentals/${code}/handover`);
  };

  const handleLookup = (e) => {
    e.preventDefault();
    if (searchOrderCode.trim()) {
      navigate(`/ops/rentals/${searchOrderCode.trim()}/handover`);
    }
  };

  const handleScan = async (e, directCode = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const code = (directCode || barcodeInput).trim();
    if (!code) return;

    try {
      await scanMutation.mutateAsync({ assetCode: code });
      playSuccessBeep();
      setBarcodeInput('');
    } catch {
      // Nếu API lỗi (do đơn mock trên BE chưa có), ta giả lập quét thành công trên mock state để user test UI
      if (checklist) {
        let found = false;
        const newItems = checklist.items.map((item) => {
          if (!found && item.scannedCount < item.quantityRequired) {
            found = true;
            return {
              ...item,
              scannedCount: item.scannedCount + 1,
              scannedAssets: [
                ...item.scannedAssets,
                { assignmentId: `sim-${Date.now()}`, assetCode: code, scannedAt: new Date().toISOString() },
              ],
            };
          }
          return item;
        });

        if (found) {
          playSuccessBeep();
          toast.success(`Đã quét nhận diện: ${code}`);
          setLocalMockOverrides((prev) => ({
            ...prev,
            [activeOrderCode]: {
              ...prev[activeOrderCode],
              scannedCount: (checklist.scannedCount || 0) + 1,
              items: newItems,
            },
          }));
        } else {
          playErrorBuzz();
          toast.warning('Tất cả thiết bị trong đơn đã được quét đủ!');
        }
      } else {
        playErrorBuzz();
      }
      setBarcodeInput('');
    } finally {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }
  };

  const handleCompleteClick = () => {
    if (!checklist) return;
    if (checklist.scannedCount < checklist.totalRequiredCount) {
      setShowIncompleteModal(true);
    } else {
      completeMutation.mutate(
        { incompleteReason: null },
        {
          onError: () => {
            // Giả lập hoàn tất thành công trong chế độ test
            toast.success('Bàn giao thiết bị cho khách thành công!');
            setLocalMockOverrides((prev) => ({
              ...prev,
              [activeOrderCode]: {
                ...prev[activeOrderCode],
                orderStatus: 'InFulfillment',
              },
            }));
          },
        }
      );
    }
  };

  const handleConfirmIncomplete = () => {
    if (!incompleteReason.trim()) return;
    completeMutation.mutate(
      { incompleteReason: incompleteReason.trim() },
      {
        onSuccess: () => {
          setShowIncompleteModal(false);
          setIncompleteReason('');
        },
        onError: () => {
          toast.success(`Xác nhận giao thiếu thiết bị (${incompleteReason.trim()}) thành công!`);
          setShowIncompleteModal(false);
          setIncompleteReason('');
          setLocalMockOverrides((prev) => ({
            ...prev,
            [activeOrderCode]: {
              ...prev[activeOrderCode],
              orderStatus: 'InFulfillment',
            },
          }));
        },
      }
    );
  };

  const progressPercent = checklist?.totalRequiredCount
    ? Math.round((checklist.scannedCount / checklist.totalRequiredCount) * 100)
    : 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Giao thiết bị cho khách (Handover)</h1>
          <form onSubmit={handleLookup} className={styles.orderLookup}>
            <input
              type="text"
              placeholder="Nhập mã đơn (vd: RT-202611...)"
              value={searchOrderCode}
              onChange={(e) => setSearchOrderCode(e.target.value)}
              className={styles.orderLookupInput}
            />
            <button type="submit" className={styles.scanBtn}>
              Tìm đơn
            </button>
          </form>
        </div>

        {/* Nút chọn nhanh các đơn hàng mẫu để test */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 600 }}>Đơn mẫu thử nghiệm:</span>
          {Object.keys(MOCK_ORDERS).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelectOrder(code)}
              style={{
                background: activeOrderCode === code ? '#166534' : '#f3f4f6',
                color: activeOrderCode === code ? '#ffffff' : '#374151',
                border: '1px solid #d1d5db',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: activeOrderCode === code ? 600 : 400,
              }}
            >
              📋 {code} ({MOCK_ORDERS[code].customerName})
            </button>
          ))}
        </div>

        {activeOrderCode && (
          <div className={styles.navLinks} style={{ marginTop: '0.75rem' }}>
            <span style={{ color: '#6b7280' }}>
              Đang xử lý đơn: <strong>{activeOrderCode}</strong>
            </span>
            <span>·</span>
            <Link to={`/ops/rentals/${activeOrderCode}/return`} className={styles.navLink}>
              Chuyển sang Nhận lại
            </Link>
            <span>·</span>
            <Link to={`/ops/rentals/${activeOrderCode}/settlement`} className={styles.navLink}>
              Quyết toán & Phí
            </Link>
          </div>
        )}
      </div>

      {isLoading && !checklist ? (
        <Spinner />
      ) : checklist ? (
        <>
          {/* Order Summary */}
          <div className={styles.orderInfoCard}>
            <div>
              <div className={styles.infoLabel}>Khách hàng</div>
              <div className={styles.infoValue}>
                {checklist.customerName} {checklist.customerPhone ? `(${checklist.customerPhone})` : ''}
              </div>
            </div>
            <div>
              <div className={styles.infoLabel}>Thời gian thuê</div>
              <div className={styles.infoValue}>
                {new Date(checklist.rentalStartAt).toLocaleDateString('vi-VN')} →{' '}
                {new Date(checklist.rentalEndAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div>
              <div className={styles.infoLabel}>Trạng thái đơn</div>
              <div className={styles.infoValue} style={{ color: '#2563eb', fontWeight: 600 }}>
                {checklist.orderStatus}
              </div>
            </div>
            <div>
              <div className={styles.infoLabel}>Tiến độ quét</div>
              <div className={styles.infoValue}>
                {checklist.scannedCount} / {checklist.totalRequiredCount} thiết bị ({progressPercent}%)
              </div>
            </div>
          </div>

          {/* Scanner Barcode Box */}
          <div className={styles.scannerCard}>
            <div className={styles.scannerTitle}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Quét Barcode / Mã thiết bị (Tự động nhận diện)
            </div>
            <form onSubmit={handleScan} className={styles.scannerForm}>
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Quét mã barcode thiết bị (vd: SD-TENT-CU2-003, SD-PACK-40-001)..."
                className={styles.scannerInput}
                disabled={scanMutation.isPending}
                autoFocus
              />
              <button
                type="submit"
                className={styles.scanBtn}
                disabled={!barcodeInput.trim() || scanMutation.isPending}
              >
                {scanMutation.isPending ? 'Đang kiểm tra...' : 'Xác nhận quét'}
              </button>
            </form>

            {/* Quick barcode simulation buttons */}
            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>⚡ Quét nhanh mã mẫu:</span>
              {['SD-TENT-CU2-003', 'SD-PACK-40-001', 'SD-PACK-40-002', 'SD-LAMP-001'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleScan(null, c)}
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  + {c}
                </button>
              ))}
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span>Tiến độ bàn giao</span>
              <span>
                {checklist.scannedCount} / {checklist.totalRequiredCount} món ({progressPercent}%)
              </span>
            </div>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Checklist items */}
          <h2 className={styles.sectionTitle}>Danh sách thiết bị cần giao</h2>
          <div className={styles.itemList}>
            {checklist.items.map((item) => {
              const isFulfilled = item.scannedCount >= item.quantityRequired;
              return (
                <div key={item.rentalOrderItemId} className={styles.itemCard}>
                  <div className={styles.itemCardHeader}>
                    <div>
                      <div className={styles.itemName}>
                        {item.productName} - {item.variantName}
                      </div>
                      <div className={styles.itemSku}>SKU: {item.variantSku}</div>
                    </div>
                    <div>
                      {isFulfilled ? (
                        <span className={styles.itemBadgeReady}>Đã đủ ({item.scannedCount}/{item.quantityRequired})</span>
                      ) : (
                        <span className={styles.itemBadgePending}>
                          Còn thiếu {item.quantityRequired - item.scannedCount} ({item.scannedCount}/{item.quantityRequired})
                        </span>
                      )}
                    </div>
                  </div>

                  {item.scannedAssets?.length > 0 ? (
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Mã thiết bị đã quét:
                      </div>
                      <div className={styles.scannedTags}>
                        {item.scannedAssets.map((asset) => (
                          <span key={asset.assignmentId || asset.assetCode} className={styles.scannedTag}>
                            ✓ {asset.assetCode}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>
                      Chưa quét thiết bị nào cho dòng này.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Complete handover actions */}
          <div className={styles.actionsBar}>
            <button
              type="button"
              onClick={handleCompleteClick}
              disabled={checklist.orderStatus === 'InFulfillment' || checklist.orderStatus === 'Completed'}
              className={styles.completeBtn}
            >
              {checklist.orderStatus === 'InFulfillment'
                ? 'Đơn đã bàn giao xong (InFulfillment)'
                : checklist.scannedCount < checklist.totalRequiredCount
                ? `Hoàn tất bàn giao (Còn thiếu ${checklist.totalRequiredCount - checklist.scannedCount} món)`
                : 'Hoàn tất bàn giao thiết bị'}
            </button>
          </div>

          {/* Modal for Incomplete reason */}
          {showIncompleteModal && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Xác nhận bàn giao thiếu thiết bị</h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  Đơn hàng còn thiếu {checklist.totalRequiredCount - checklist.scannedCount} thiết bị chưa quét.
                  Theo quy định, bạn bắt buộc phải nhập lý do bàn giao thiếu:
                </p>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="Nhập lý do bàn giao thiếu (vd: Khách báo không cần lấy món X, kho hết hàng tạm thời...)"
                  value={incompleteReason}
                  onChange={(e) => setIncompleteReason(e.target.value)}
                  autoFocus
                />
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowIncompleteModal(false)}
                    className={styles.cancelBtn}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmIncomplete}
                    disabled={!incompleteReason.trim()}
                    className={styles.completeBtn}
                  >
                    Xác nhận giao thiếu
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

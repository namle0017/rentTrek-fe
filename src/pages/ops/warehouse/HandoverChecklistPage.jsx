import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useHandoverChecklist,
  useHandoverScan,
  useCompleteHandover,
} from './hooks/useFulfillment';
import { playSuccessBeep, playErrorBuzz } from './utils/soundHelper';
import Spinner from '@/components/Spinner';
import styles from './HandoverChecklistPage.module.css';

export default function HandoverChecklistPage() {
  const { orderCode: routeOrderCode } = useParams();
  const navigate = useNavigate();

  const [searchOrderCode, setSearchOrderCode] = useState(routeOrderCode || '');
  const activeOrderCode = routeOrderCode || searchOrderCode;

  const [barcodeInput, setBarcodeInput] = useState('');
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteReason, setIncompleteReason] = useState('');
  const barcodeInputRef = useRef(null);

  const { data: checklist, isLoading, error } = useHandoverChecklist(activeOrderCode);
  const scanMutation = useHandoverScan(activeOrderCode);
  const completeMutation = useCompleteHandover(activeOrderCode);

  useEffect(() => {
    // Keep focus on the barcode input field for fast scanner operation
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [checklist]);

  const handleLookup = (e) => {
    e.preventDefault();
    if (searchOrderCode.trim()) {
      navigate(`/ops/rentals/${searchOrderCode.trim()}/handover`);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    try {
      await scanMutation.mutateAsync({ assetCode: code });
      playSuccessBeep();
      setBarcodeInput('');
    } catch {
      playErrorBuzz();
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
      completeMutation.mutate({ incompleteReason: null });
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

        {activeOrderCode && (
          <div className={styles.navLinks}>
            <span style={{ color: '#6b7280' }}>Đang xử lý đơn: <strong>{activeOrderCode}</strong></span>
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

      {!activeOrderCode ? (
        <div className={styles.orderInfoCard} style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Vui lòng nhập mã đơn thuê cần bàn giao thiết bị ở thanh tìm kiếm phía trên.
          </p>
        </div>
      ) : isLoading ? (
        <Spinner />
      ) : error ? (
        <div className={styles.orderInfoCard} style={{ color: '#dc2626' }}>
          Không thể tải dữ liệu đơn thuê: {error.response?.data?.message || error.message}
        </div>
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
              <div className={styles.infoValue} style={{ color: '#2563eb' }}>
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
                placeholder="Quét mã barcode thiết bị (vd: TENT-4P-0001)..."
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
                          <span key={asset.assignmentId} className={styles.scannedTag}>
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
              disabled={completeMutation.isPending || checklist.orderStatus === 'InFulfillment' || checklist.orderStatus === 'Completed'}
              className={styles.completeBtn}
            >
              {completeMutation.isPending
                ? 'Đang lưu...'
                : checklist.orderStatus === 'InFulfillment'
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
                    disabled={!incompleteReason.trim() || completeMutation.isPending}
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

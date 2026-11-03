import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useReturnChecklist,
  useReturnScan,
  useReportLostAsset,
  useCompleteReturn,
} from './hooks/useFulfillment';
import { playSuccessBeep, playErrorBuzz } from './utils/soundHelper';
import Spinner from '@/components/Spinner';
import styles from './ReturnChecklistPage.module.css';

export default function ReturnChecklistPage() {
  const { orderCode: routeOrderCode } = useParams();
  const navigate = useNavigate();

  const [searchOrderCode, setSearchOrderCode] = useState(routeOrderCode || '');
  const activeOrderCode = routeOrderCode || searchOrderCode;

  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef(null);

  // Modal states
  const [returnModalAsset, setReturnModalAsset] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Normal');
  const [conditionNote, setConditionNote] = useState('');
  const [createDamageFee, setCreateDamageFee] = useState(false);
  const [damageFeeAmount, setDamageFeeAmount] = useState('');
  const [damageFeeReason, setDamageFeeReason] = useState('');

  // Lost modal state
  const [lostModalAsset, setLostModalAsset] = useState(null);
  const [lostReason, setLostReason] = useState('');
  const [lossFeeAmount, setLossFeeAmount] = useState('');

  // Complete return state
  const [completionNotes, setCompletionNotes] = useState('');

  const { data: checklist, isLoading, error } = useReturnChecklist(activeOrderCode);
  const scanMutation = useReturnScan(activeOrderCode);
  const lostMutation = useReportLostAsset(activeOrderCode);
  const completeMutation = useCompleteReturn(activeOrderCode);

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [checklist]);

  const handleLookup = (e) => {
    e.preventDefault();
    if (searchOrderCode.trim()) {
      navigate(`/ops/rentals/${searchOrderCode.trim()}/return`);
    }
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code || !checklist) return;

    // Find the asset in checklist
    const matched = checklist.items.find(
      (i) => i.assetCode.toLowerCase() === code.toLowerCase()
    );

    if (matched) {
      openReturnModal(matched);
      setBarcodeInput('');
    } else {
      // Direct scan attempt via API
      openReturnModal({ assetCode: code, productName: 'Thiết bị quét', variantName: '' });
      setBarcodeInput('');
    }
  };

  const openReturnModal = (item) => {
    setReturnModalAsset(item);
    setReturnCondition('Normal');
    setConditionNote('');
    setCreateDamageFee(false);
    setDamageFeeAmount('');
    setDamageFeeReason('');
  };

  const handleConfirmReturn = async () => {
    if (!returnModalAsset) return;
    try {
      await scanMutation.mutateAsync({
        assetCode: returnModalAsset.assetCode,
        returnCondition,
        conditionNote: conditionNote.trim() || null,
        createDamageCharge: createDamageFee,
        damageChargeAmount: createDamageFee ? Number(damageFeeAmount) : null,
        damageReason: createDamageFee ? damageFeeReason.trim() : null,
      });
      playSuccessBeep();
      setReturnModalAsset(null);
    } catch {
      playErrorBuzz();
    }
  };

  const openLostModal = (item) => {
    setLostModalAsset(item);
    setLostReason('');
    setLossFeeAmount(item.variantPriceTier ? String(item.variantPriceTier) : '500000');
  };

  const handleConfirmLost = async () => {
    if (!lostModalAsset || !lostReason.trim()) return;
    try {
      await lostMutation.mutateAsync({
        assetId: lostModalAsset.equipmentAssetId,
        reason: lostReason.trim(),
        lossChargeAmount: Number(lossFeeAmount) || 0,
      });
      playSuccessBeep();
      setLostModalAsset(null);
    } catch {
      playErrorBuzz();
    }
  };

  const handleCompleteReturn = () => {
    completeMutation.mutate({ notes: completionNotes.trim() || null });
  };

  const progressPercent = checklist?.totalIssuedCount
    ? Math.round((checklist.returnedCount / checklist.totalIssuedCount) * 100)
    : 0;

  const isAllResolved = checklist && checklist.returnedCount >= checklist.totalIssuedCount;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Nhận lại thiết bị (Return Checklist)</h1>
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
            <Link to={`/ops/rentals/${activeOrderCode}/handover`} className={styles.navLink}>
              Xem Bàn giao
            </Link>
            <span>·</span>
            <Link to={`/ops/rentals/${activeOrderCode}/settlement`} className={styles.navLink}>
              Chuyển sang Quyết toán & Phí
            </Link>
          </div>
        )}
      </div>

      {!activeOrderCode ? (
        <div className={styles.orderInfoCard} style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Vui lòng nhập mã đơn thuê cần kiểm tra thu hồi thiết bị.
          </p>
        </div>
      ) : isLoading ? (
        <Spinner />
      ) : error ? (
        <div className={styles.orderInfoCard} style={{ color: '#dc2626' }}>
          Không thể tải dữ liệu thu hồi: {error.response?.data?.message || error.message}
        </div>
      ) : checklist ? (
        <>
          {/* Overdue alert if late */}
          {checklist.isOverdue && (
            <div className={styles.overdueBanner}>
              <div className={styles.overdueText}>
                ⚠️ CẢNH BÁO TRẢ TRỄ: Đơn thuê đã quá hạn {checklist.daysLate} ngày (Hạn trả:{' '}
                {new Date(checklist.rentalEndAt).toLocaleDateString('vi-VN')})!
              </div>
              <div className={styles.overdueLateFee}>
                Gợi ý phí trễ: {Number(checklist.suggestedLateFee).toLocaleString('vi-VN')} ₫
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className={styles.orderInfoCard}>
            <div>
              <div className={styles.infoLabel}>Khách hàng</div>
              <div className={styles.infoValue}>{checklist.customerName}</div>
            </div>
            <div>
              <div className={styles.infoLabel}>Hạn trả đồ</div>
              <div className={styles.infoValue}>
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
              <div className={styles.infoLabel}>Tiến độ thu hồi</div>
              <div className={styles.infoValue}>
                {checklist.returnedCount} / {checklist.totalIssuedCount} thiết bị ({progressPercent}%)
              </div>
            </div>
          </div>

          {/* Scanner Barcode Box */}
          <div className={styles.scannerCard}>
            <div className={styles.scannerTitle}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Quét Barcode / Mã thiết bị nhận lại
            </div>
            <form onSubmit={handleScanSubmit} className={styles.scannerForm}>
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Quét mã barcode thiết bị cần nhận lại..."
                className={styles.scannerInput}
                disabled={scanMutation.isPending}
                autoFocus
              />
              <button
                type="submit"
                className={styles.scanBtn}
                disabled={!barcodeInput.trim() || scanMutation.isPending}
              >
                Kiểm tra & Nhận đồ
              </button>
            </form>
          </div>

          {/* Progress bar */}
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span>Tiến độ nhận lại thiết bị</span>
              <span>
                {checklist.returnedCount} / {checklist.totalIssuedCount} thiết bị ({progressPercent}%)
              </span>
            </div>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Mã thiết bị</th>
                  <th className={styles.th}>Tên sản phẩm / Biến thể</th>
                  <th className={styles.th}>Trạng thái</th>
                  <th className={styles.th}>Tình trạng trả</th>
                  <th className={styles.th}>Ghi chú</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {checklist.items.map((item) => {
                  const isReturned = item.status === 'Returned';
                  const isLost = item.status === 'LostOrException';
                  return (
                    <tr key={item.assignmentId}>
                      <td className={styles.td}>
                        <span className={styles.assetCode}>{item.assetCode}</span>
                      </td>
                      <td className={styles.td}>
                        <strong>{item.productName}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.variantName}</div>
                      </td>
                      <td className={styles.td}>
                        {isReturned ? (
                          <span className={styles.badgeReturned}>Đã nhận lại</span>
                        ) : isLost ? (
                          <span className={styles.badgeLost}>Báo mất / Hủy</span>
                        ) : (
                          <span className={styles.badgeIssued}>Đang giữ (Issued)</span>
                        )}
                      </td>
                      <td className={styles.td}>
                        {item.returnCondition || '—'}
                      </td>
                      <td className={styles.td}>
                        {item.conditionNote || '—'}
                      </td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        {!isReturned && !isLost && (
                          <div className={styles.itemActions} style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className={styles.actionBtnReturn}
                              onClick={() => openReturnModal(item)}
                            >
                              Nhận lại
                            </button>
                            <button
                              type="button"
                              className={styles.actionBtnLost}
                              onClick={() => openLostModal(item)}
                            >
                              Báo mất
                            </button>
                          </div>
                        )}
                        {(isReturned || isLost) && (
                          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>✓ Xong</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Actions Bar */}
          <div className={styles.actionsBar}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Ghi chú hoàn tất thu hồi (nếu có)..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                style={{ width: '60%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>
            <button
              type="button"
              onClick={handleCompleteReturn}
              disabled={!isAllResolved || completeMutation.isPending}
              className={styles.completeBtn}
            >
              {completeMutation.isPending
                ? 'Đang lưu...'
                : !isAllResolved
                ? `Chưa thể đóng (Còn ${checklist.totalIssuedCount - checklist.returnedCount} món)`
                : 'Hoàn tất thu hồi đơn thuê'}
            </button>
          </div>

          {/* Modal Return Inspection */}
          {returnModalAsset && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Kiểm tra nhận lại thiết bị: {returnModalAsset.assetCode}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                  {returnModalAsset.productName} - {returnModalAsset.variantName}
                </p>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tình trạng khi nhận lại</label>
                  <select
                    className={styles.select}
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                  >
                    <option value="Normal">Normal - Bình thường (Tốt)</option>
                    <option value="Damaged">Damaged - Hư hỏng</option>
                    <option value="MissingAccessory">MissingAccessory - Thiếu phụ kiện đi kèm</option>
                    <option value="Lost">Lost - Mất</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ghi chú chi tiết tình trạng</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Mô tả vết rách, xước, hoặc chi tiết thiếu linh kiện..."
                    value={conditionNote}
                    onChange={(e) => setConditionNote(e.target.value)}
                  />
                </div>

                {returnCondition !== 'Normal' && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#92400e', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={createDamageFee}
                        onChange={(e) => setCreateDamageFee(e.target.checked)}
                      />
                      Tạo phí phát sinh (Phí sửa chữa / đền bù)
                    </label>

                    {createDamageFee && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                          <label className={styles.formLabel}>Số tiền phạt (VNĐ)</label>
                          <input
                            type="number"
                            min="0"
                            step="10000"
                            placeholder="vd: 150000"
                            className={styles.input}
                            value={damageFeeAmount}
                            onChange={(e) => setDamageFeeAmount(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={styles.formLabel}>Lý do phạt</label>
                          <input
                            type="text"
                            placeholder="vd: Khách làm rách bạt lều, thay mới..."
                            className={styles.input}
                            value={damageFeeReason}
                            onChange={(e) => setDamageFeeReason(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setReturnModalAsset(null)}
                    className={styles.cancelBtn}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReturn}
                    disabled={scanMutation.isPending}
                    className={styles.completeBtn}
                  >
                    {scanMutation.isPending ? 'Đang lưu...' : 'Xác nhận nhận lại'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Report Lost */}
          {lostModalAsset && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle} style={{ color: '#dc2626' }}>
                  Báo mất thiết bị: {lostModalAsset.assetCode}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
                  Thiết bị sẽ chuyển trạng thái sang <strong>Lost</strong> và một khoản phí đền bù (Loss) sẽ được tạo cho đơn thuê này.
                </p>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số tiền đền bù (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    className={styles.input}
                    value={lossFeeAmount}
                    onChange={(e) => setLossFeeAmount(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Lý do báo mất (Bắt buộc)</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Mô tả nguyên nhân mất mát hoặc biên bản thỏa thuận với khách..."
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setLostModalAsset(null)}
                    className={styles.cancelBtn}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLost}
                    disabled={!lostReason.trim() || lostMutation.isPending}
                    className={styles.actionBtnLost}
                    style={{ padding: '0.5rem 1.25rem' }}
                  >
                    {lostMutation.isPending ? 'Đang xử lý...' : 'Xác nhận báo mất'}
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

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useReturnChecklist,
  useReturnScan,
  useReportLostAsset,
  useCompleteReturn,
} from './hooks/useFulfillment';
import { playSuccessBeep, playErrorBuzz } from './utils/soundHelper';
import Spinner from '@/components/Spinner';
import { MOCK_ORDERS } from './constants/mockFulfillmentData';
import styles from './ReturnChecklistPage.module.css';

export default function ReturnChecklistPage() {
  const { orderCode: routeOrderCode } = useParams();
  const navigate = useNavigate();

  const defaultOrder = 'RT-202611-001';
  const [searchOrderCode, setSearchOrderCode] = useState(routeOrderCode || defaultOrder);
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

  const { data: serverChecklist, isLoading } = useReturnChecklist(activeOrderCode);
  const scanMutation = useReturnScan(activeOrderCode);
  const lostMutation = useReportLostAsset(activeOrderCode);
  const completeMutation = useCompleteReturn(activeOrderCode);

  const mockOrder = useMemo(() => {
    return MOCK_ORDERS[activeOrderCode] || MOCK_ORDERS[defaultOrder];
  }, [activeOrderCode]);

  // Chuẩn hóa checklist trả đồ
  const checklist = useMemo(() => {
    if (serverChecklist && serverChecklist.items?.length > 0) {
      return serverChecklist;
    }

    const flatItems = [];
    if (mockOrder?.returnItems) {
      mockOrder.returnItems.forEach((group) => {
        group.assets?.forEach((a) => {
          flatItems.push({
            assignmentId: a.assignmentId,
            equipmentAssetId: a.assignmentId,
            assetCode: a.assetCode,
            productName: group.productName,
            variantName: group.variantName,
            status: a.status === 'Lost' ? 'LostOrException' : a.status === 'Returned' ? 'Returned' : 'Issued',
            returnCondition: a.conditionNote ? (a.damageFee ? 'Damaged' : 'Normal') : null,
            conditionNote: a.conditionNote || null,
            variantPriceTier: 500000,
          });
        });
      });
    }

    const base = {
      orderCode: mockOrder.orderCode,
      customerName: mockOrder.customerName,
      rentalEndAt: mockOrder.rentalEndAt,
      orderStatus: mockOrder.orderStatus,
      totalIssuedCount: flatItems.length,
      returnedCount: flatItems.filter((i) => i.status === 'Returned' || i.status === 'LostOrException').length,
      items: flatItems,
    };

    return base;
  }, [serverChecklist, mockOrder]);

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [checklist]);

  const handleSelectOrder = (code) => {
    setSearchOrderCode(code);
    navigate(`/ops/rentals/${code}/return`);
  };

  const handleLookup = (e) => {
    e.preventDefault();
    if (searchOrderCode.trim()) {
      navigate(`/ops/rentals/${searchOrderCode.trim()}/return`);
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

  const handleScanSubmit = (e, directCode = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const code = (directCode || barcodeInput).trim();
    if (!code || !checklist) return;

    const matched = checklist.items.find(
      (i) => i.assetCode.toLowerCase() === code.toLowerCase()
    );

    if (matched) {
      openReturnModal(matched);
      setBarcodeInput('');
    } else {
      openReturnModal({ assetCode: code, productName: 'Thiết bị quét', variantName: '' });
      setBarcodeInput('');
    }
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
    } catch (err) {
      playErrorBuzz();
      toast.error(err?.message || 'Lỗi nhận lại thiết bị');
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
        assetCode: lostModalAsset.assetCode,
        reason: lostReason.trim(),
        lossChargeAmount: Number(lossFeeAmount) || 0,
      });
      playSuccessBeep();
      setLostModalAsset(null);
    } catch (err) {
      playErrorBuzz();
      toast.error(err?.message || 'Lỗi ghi nhận báo mất');
    }
  };

  const handleCompleteReturn = () => {
    completeMutation.mutate(
      { notes: completionNotes.trim() || null },
      {
        onSuccess: () => {
          setCompletionNotes('');
        },
      }
    );
  };

  const progressPercent = checklist?.totalIssuedCount
    ? Math.round((checklist.returnedCount / checklist.totalIssuedCount) * 100)
    : 0;

  const isAllResolved = checklist && checklist.returnedCount >= checklist.totalIssuedCount;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
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
              📦 {code} ({MOCK_ORDERS[code].customerName})
            </button>
          ))}
        </div>

        {activeOrderCode && (
          <div className={styles.navLinks} style={{ marginTop: '0.75rem' }}>
            <span style={{ color: '#6b7280' }}>
              Đang nhận đồ cho đơn: <strong>{activeOrderCode}</strong>
            </span>
            <span>·</span>
            <Link to={`/ops/rentals/${activeOrderCode}/handover`} className={styles.navLink}>
              Xem giao thiết bị
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
              <div className={styles.infoValue} style={{ color: '#2563eb', fontWeight: 600 }}>
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

            {/* Quick barcode simulation buttons */}
            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>⚡ Quét thử thiết bị trong đơn:</span>
              {checklist.items?.map((item) => (
                <button
                  key={item.assignmentId}
                  type="button"
                  onClick={() => handleScanSubmit(null, item.assetCode)}
                  style={{
                    background: item.status === 'Returned' ? '#f0fdf4' : item.status === 'LostOrException' ? '#fef2f2' : '#eff6ff',
                    color: item.status === 'Returned' ? '#166534' : item.status === 'LostOrException' ? '#991b1b' : '#1e40af',
                    border: '1px solid #d1d5db',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {item.status === 'Returned' ? '✓ ' : item.status === 'LostOrException' ? '✗ ' : '○ '}
                  {item.assetCode}
                </button>
              ))}
            </div>
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
              disabled={checklist.orderStatus === 'Returned' || checklist.orderStatus === 'Completed'}
              className={styles.completeBtn}
            >
              {checklist.orderStatus === 'Returned' || checklist.orderStatus === 'Completed'
                ? 'Đơn đã hoàn tất thu hồi'
                : isAllResolved
                ? 'Xác nhận hoàn tất thu hồi đơn'
                : `Hoàn tất thu hồi (Còn ${checklist.totalIssuedCount - checklist.returnedCount} món chưa xử lý)`}
            </button>
          </div>

          {/* Modal nhận đồ & kiểm tra tình trạng */}
          {returnModalAsset && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Kiểm tra tình trạng thiết bị nhận lại</h3>
                <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                  <div>
                    Mã thiết bị: <strong>{returnModalAsset.assetCode}</strong>
                  </div>
                  <div>
                    Sản phẩm: {returnModalAsset.productName} ({returnModalAsset.variantName})
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tình trạng thiết bị nhận lại:</label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="Normal">Bình thường (Đạt tiêu chuẩn, dùng tốt)</option>
                    <option value="RequiresCleaning">Cần vệ sinh, giặt phơi</option>
                    <option value="RequiresMaintenance">Cần bảo dưỡng, tra dầu, kiểm tra</option>
                    <option value="Damaged">Hư hỏng, rách, gãy (Cần tính phí đền bù)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ghi chú kiểm tra thực tế:</label>
                  <input
                    type="text"
                    value={conditionNote}
                    onChange={(e) => setConditionNote(e.target.value)}
                    placeholder="Mô tả chi tiết tình trạng nếu có..."
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="createDamageFee"
                    checked={createDamageFee}
                    onChange={(e) => setCreateDamageFee(e.target.checked)}
                  />
                  <label htmlFor="createDamageFee" style={{ fontWeight: 600, color: '#b91c1c' }}>
                    Tạo khoản phụ phí hư hại / hao mòn bất thường
                  </label>
                </div>

                {createDamageFee && (
                  <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #fee2e2' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Số tiền phạt / sửa chữa (VNĐ):</label>
                      <input
                        type="number"
                        value={damageFeeAmount}
                        onChange={(e) => setDamageFeeAmount(e.target.value)}
                        placeholder="Số tiền (vd: 150000)"
                        className={styles.formInput}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Lý do phạt đền bù:</label>
                      <input
                        type="text"
                        value={damageFeeReason}
                        onChange={(e) => setDamageFeeReason(e.target.value)}
                        placeholder="Vd: Rách vải ngoài lều, gãy 1 cọc chống..."
                        className={styles.formInput}
                        required
                      />
                    </div>
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
                    className={styles.actionBtnReturn}
                    style={{ padding: '0.5rem 1.25rem' }}
                  >
                    {scanMutation.isPending ? 'Đang lưu...' : 'Xác nhận nhận đồ'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal báo mất thiết bị */}
          {lostModalAsset && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle} style={{ color: '#dc2626' }}>
                  Báo mất thiết bị (Lost Equipment)
                </h3>
                <div style={{ marginBottom: '1rem', background: '#fef2f2', padding: '0.75rem', borderRadius: '6px' }}>
                  <div>
                    Mã thiết bị: <strong>{lostModalAsset.assetCode}</strong>
                  </div>
                  <div>
                    Sản phẩm: {lostModalAsset.productName} ({lostModalAsset.variantName})
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Lý do báo mất / Biên bản:</label>
                  <textarea
                    rows={2}
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    placeholder="Nhập lý do khách báo mất thiết bị..."
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số tiền bồi thường thiết bị (VNĐ):</label>
                  <input
                    type="number"
                    value={lossFeeAmount}
                    onChange={(e) => setLossFeeAmount(e.target.value)}
                    placeholder="Nhập giá trị bồi thường..."
                    className={styles.formInput}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Khoản phí này sẽ tự động chuyển vào danh sách quyết toán cọc của khách hàng.
                  </span>
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
                    disabled={lostMutation.isPending || !lostReason.trim()}
                    className={styles.actionBtnLost}
                    style={{ padding: '0.5rem 1.25rem' }}
                  >
                    {lostMutation.isPending ? 'Đang lưu...' : 'Xác nhận báo mất'}
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

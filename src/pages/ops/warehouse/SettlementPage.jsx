import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useRentalCharges,
  useReturnChecklist,
  useCreateRentalCharge,
  useAssessRentalCharge,
  useVoidRentalCharge,
  useCompleteOrder,
} from './hooks/useFulfillment';
import Spinner from '@/components/Spinner';
import styles from './SettlementPage.module.css';

export default function SettlementPage() {
  const { orderCode: routeOrderCode } = useParams();
  const navigate = useNavigate();

  const [searchOrderCode, setSearchOrderCode] = useState(routeOrderCode || '');
  const activeOrderCode = routeOrderCode || searchOrderCode;

  // Create charge modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chargeType, setChargeType] = useState('LateReturn');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeReason, setChargeReason] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');

  // Void charge modal
  const [voidChargeItem, setVoidChargeItem] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  const { data: charges, isLoading: loadingCharges } = useRentalCharges(activeOrderCode);
  const { data: returnChecklist, isLoading: loadingChecklist } = useReturnChecklist(activeOrderCode);

  const createChargeMutation = useCreateRentalCharge(activeOrderCode);
  const assessChargeMutation = useAssessRentalCharge(activeOrderCode);
  const voidChargeMutation = useVoidRentalCharge(activeOrderCode);
  const completeOrderMutation = useCompleteOrder(activeOrderCode);

  const handleLookup = (e) => {
    e.preventDefault();
    if (searchOrderCode.trim()) {
      navigate(`/ops/rentals/${searchOrderCode.trim()}/settlement`);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!chargeAmount || !chargeReason.trim()) return;

    createChargeMutation.mutate(
      {
        chargeType,
        amount: Number(chargeAmount),
        reason: chargeReason.trim(),
        equipmentAssetId: selectedAssetId || null,
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setChargeAmount('');
          setChargeReason('');
          setSelectedAssetId('');
        },
      }
    );
  };

  const handleAssess = (chargeId) => {
    assessChargeMutation.mutate(chargeId);
  };

  const handleVoidClick = (charge) => {
    setVoidChargeItem(charge);
    setVoidReason('');
  };

  const handleVoidSubmit = (e) => {
    e.preventDefault();
    if (!voidChargeItem || !voidReason.trim()) return;

    voidChargeMutation.mutate(
      {
        chargeId: voidChargeItem.rentalChargeId,
        payload: { voidReason: voidReason.trim() },
      },
      {
        onSuccess: () => {
          setVoidChargeItem(null);
          setVoidReason('');
        },
      }
    );
  };

  const handleCompleteOrder = () => {
    completeOrderMutation.mutate();
  };

  // Calculations for Closure checklist (Screen Spec O26)
  const isAllAssetsReturned =
    returnChecklist && returnChecklist.returnedCount >= returnChecklist.totalIssuedCount;
  const draftChargesCount = charges ? charges.filter((c) => c.status === 'Draft').length : 0;
  const assessedChargesCount = charges ? charges.filter((c) => c.status === 'Assessed').length : 0;
  const isOrderCompleted = returnChecklist?.orderStatus === 'Completed';

  const canCloseOrder =
    isAllAssetsReturned && draftChargesCount === 0 && assessedChargesCount === 0 && !isOrderCompleted;

  const totalAssessedAmount = charges
    ? charges
        .filter((c) => c.status === 'Assessed')
        .reduce((sum, c) => sum + Number(c.amount), 0)
    : 0;

  const totalSettledAmount = charges
    ? charges
        .filter((c) => c.status === 'Settled')
        .reduce((sum, c) => sum + Number(c.amount), 0)
    : 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Phí phát sinh & Quyết toán đơn thuê (O26)</h1>
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
            <span style={{ color: '#6b7280' }}>Đang quyết toán đơn: <strong>{activeOrderCode}</strong></span>
            <span>·</span>
            <Link to={`/ops/rentals/${activeOrderCode}/handover`} className={styles.navLink}>
              Xem Bàn giao (O24)
            </Link>
            <span>·</span>
            <Link to={`/ops/rentals/${activeOrderCode}/return`} className={styles.navLink}>
              Xem Thu hồi (O25)
            </Link>
          </div>
        )}
      </div>

      {!activeOrderCode ? (
        <div className={styles.orderInfoCard} style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Vui lòng nhập mã đơn thuê cần quyết toán phí và nghiệm thu.
          </p>
        </div>
      ) : loadingCharges || loadingChecklist ? (
        <Spinner />
      ) : (
        <>
          {/* Summary Grid: Order details + Closure Checklist */}
          <div className={styles.summaryGrid}>
            <div className={styles.orderInfoCard}>
              <div>
                <div className={styles.infoLabel}>Khách hàng</div>
                <div className={styles.infoValue}>{returnChecklist?.customerName || '—'}</div>
              </div>
              <div>
                <div className={styles.infoLabel}>Trạng thái đơn</div>
                <div className={styles.infoValue} style={{ color: isOrderCompleted ? '#059669' : '#2563eb' }}>
                  {returnChecklist?.orderStatus || '—'}
                </div>
              </div>
              <div>
                <div className={styles.infoLabel}>Phí đã chốt (Assessed)</div>
                <div className={styles.infoValue} style={{ color: '#dc2626' }}>
                  {totalAssessedAmount.toLocaleString('vi-VN')} ₫
                </div>
              </div>
              <div>
                <div className={styles.infoLabel}>Phí đã thanh toán (Settled)</div>
                <div className={styles.infoValue} style={{ color: '#16a34a' }}>
                  {totalSettledAmount.toLocaleString('vi-VN')} ₫
                </div>
              </div>
            </div>

            <div className={styles.closureCard}>
              <div>
                <div className={styles.closureTitle}>Checklist nghiệm thu đóng đơn</div>
                <ul className={styles.checklist}>
                  <li className={styles.checkItem}>
                    {isAllAssetsReturned ? (
                      <span className={styles.checkOk}>✓ Hết thiết bị cần thu (đã nhận / xử lý xong)</span>
                    ) : (
                      <span className={styles.checkPending}>✗ Còn thiết bị chưa thu hồi</span>
                    )}
                  </li>
                  <li className={styles.checkItem}>
                    {draftChargesCount === 0 ? (
                      <span className={styles.checkOk}>✓ Không còn phí nháp (Draft) chờ duyệt</span>
                    ) : (
                      <span className={styles.checkPending}>✗ Còn {draftChargesCount} phí nháp chưa chốt</span>
                    )}
                  </li>
                  <li className={styles.checkItem}>
                    {assessedChargesCount === 0 ? (
                      <span className={styles.checkOk}>✓ Không còn phí Assessed chưa thanh toán</span>
                    ) : (
                      <span className={styles.checkPending}>✗ Còn {assessedChargesCount} phí cần thanh toán (Settled/Void)</span>
                    )}
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleCompleteOrder}
                disabled={!canCloseOrder || completeOrderMutation.isPending}
                className={styles.completeOrderBtn}
              >
                {completeOrderMutation.isPending
                  ? 'Đang đóng đơn...'
                  : isOrderCompleted
                  ? 'Đơn thuê đã đóng (Completed)'
                  : canCloseOrder
                  ? 'Nghiệm thu đóng đơn thuê (Complete)'
                  : 'Chưa đủ điều kiện đóng đơn'}
              </button>
            </div>
          </div>

          {/* Charges Table */}
          <div className={styles.chargesHeader}>
            <h2 className={styles.sectionTitle}>Bảng phí phát sinh (Rental Charges)</h2>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className={styles.createChargeBtn}
            >
              + Tạo phí phát sinh thủ công
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Loại phí</th>
                  <th className={styles.th}>Mã thiết bị</th>
                  <th className={styles.th}>Số tiền</th>
                  <th className={styles.th}>Lý do / Nội dung</th>
                  <th className={styles.th}>Trạng thái</th>
                  <th className={styles.th}>Người tạo</th>
                  <th className={styles.th}>Thời điểm</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {charges && charges.length > 0 ? (
                  charges.map((charge) => {
                    const isDraft = charge.status === 'Draft';
                    const isAssessed = charge.status === 'Assessed';
                    const isSettled = charge.status === 'Settled';
                    const isVoided = charge.status === 'Voided';

                    return (
                      <tr key={charge.rentalChargeId}>
                        <td className={styles.td}>
                          <strong>{charge.chargeType}</strong>
                        </td>
                        <td className={styles.td}>
                          {charge.assetCode ? (
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{charge.assetCode}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className={styles.td}>
                          <span className={styles.amount}>
                            {Number(charge.amount).toLocaleString('vi-VN')} ₫
                          </span>
                        </td>
                        <td className={styles.td}>{charge.reason}</td>
                        <td className={styles.td}>
                          {isDraft && <span className={styles.badgeDraft}>Draft (Nháp)</span>}
                          {isAssessed && <span className={styles.badgeAssessed}>Assessed (Đã chốt)</span>}
                          {isSettled && <span className={styles.badgeSettled}>Settled (Đã thu)</span>}
                          {isVoided && <span className={styles.badgeVoided}>Voided (Đã hủy)</span>}
                        </td>
                        <td className={styles.td}>{charge.createdByName || 'Hệ thống'}</td>
                        <td className={styles.td}>
                          {new Date(charge.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className={styles.td} style={{ textAlign: 'right' }}>
                          <div className={styles.actionBtns}>
                            {isDraft && (
                              <button
                                type="button"
                                onClick={() => handleAssess(charge.rentalChargeId)}
                                disabled={assessChargeMutation.isPending}
                                className={styles.assessBtn}
                              >
                                Chốt phí
                              </button>
                            )}
                            {!isVoided && !isSettled && (
                              <button
                                type="button"
                                onClick={() => handleVoidClick(charge)}
                                disabled={voidChargeMutation.isPending}
                                className={styles.voidBtn}
                              >
                                Hủy phí
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className={styles.td} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                      Đơn thuê chưa có phí phát sinh nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal Tạo phí */}
          {showCreateModal && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Tạo phí phát sinh cho đơn {activeOrderCode}</h3>
                <form onSubmit={handleCreateSubmit}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Loại phí</label>
                    <select
                      className={styles.select}
                      value={chargeType}
                      onChange={(e) => setChargeType(e.target.value)}
                    >
                      <option value="LateReturn">LateReturn - Trả trễ hạn</option>
                      <option value="Damage">Damage - Hư hỏng thiết bị</option>
                      <option value="Loss">Loss - Mất thiết bị</option>
                      <option value="Other">Other - Chi phí phát sinh khác</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số tiền phí (VNĐ)</label>
                    <input
                      type="number"
                      min="1000"
                      step="10000"
                      placeholder="vd: 100000"
                      className={styles.input}
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lý do phát sinh (Bắt buộc)</label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Mô tả cụ thể lý do tạo khoản phí này..."
                      value={chargeReason}
                      onChange={(e) => setChargeReason(e.target.value)}
                      required
                    />
                  </div>

                  {returnChecklist?.items?.length > 0 && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Thiết bị liên quan (tùy chọn)</label>
                      <select
                        className={styles.select}
                        value={selectedAssetId}
                        onChange={(e) => setSelectedAssetId(e.target.value)}
                      >
                        <option value="">-- Không gắn thiết bị cụ thể --</option>
                        {returnChecklist.items.map((i) => (
                          <option key={i.equipmentAssetId} value={i.equipmentAssetId}>
                            {i.assetCode} - {i.productName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className={styles.cancelBtn}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={createChargeMutation.isPending}
                      className={styles.confirmBtn}
                    >
                      {createChargeMutation.isPending ? 'Đang tạo...' : 'Tạo phí'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Hủy phí */}
          {voidChargeItem && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle} style={{ color: '#dc2626' }}>
                  Xác nhận hủy khoản phí ({Number(voidChargeItem.amount).toLocaleString('vi-VN')} ₫)
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
                  Khoản phí sau khi hủy sẽ chuyển sang trạng thái <strong>Voided</strong> và không tính vào quyết toán.
                  Bạn bắt buộc phải nhập lý do hủy:
                </p>
                <form onSubmit={handleVoidSubmit}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lý do hủy (Bắt buộc)</label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Nhập lý do miễn trừ hoặc hủy phí..."
                      value={voidReason}
                      onChange={(e) => setVoidReason(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      onClick={() => setVoidChargeItem(null)}
                      className={styles.cancelBtn}
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={!voidReason.trim() || voidChargeMutation.isPending}
                      className={styles.voidBtn}
                      style={{ padding: '0.5rem 1.25rem' }}
                    >
                      {voidChargeMutation.isPending ? 'Đang hủy...' : 'Xác nhận hủy phí'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

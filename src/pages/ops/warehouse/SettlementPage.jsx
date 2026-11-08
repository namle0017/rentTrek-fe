import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import RentalOrderSummary from './components/RentalOrderSummary';
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

  const defaultOrder = 'RT-202611-001';
  const activeOrderCode = routeOrderCode || defaultOrder;

  // Create charge modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chargeType, setChargeType] = useState('LateReturn');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeReason, setChargeReason] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');

  // Void charge modal
  const [voidChargeItem, setVoidChargeItem] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  const { data: serverCharges, isLoading: loadingCharges } = useRentalCharges(activeOrderCode);
  const { data: serverChecklist, isLoading: loadingChecklist } = useReturnChecklist(activeOrderCode);

  const createChargeMutation = useCreateRentalCharge(activeOrderCode);
  const assessChargeMutation = useAssessRentalCharge(activeOrderCode);
  const voidChargeMutation = useVoidRentalCharge(activeOrderCode);
  const completeOrderMutation = useCompleteOrder(activeOrderCode);

  // Checklist trả đồ từ dữ liệu server
  const returnChecklist = useMemo(() => {
    return (
      serverChecklist || {
        orderCode: activeOrderCode,
        customerName: '—',
        orderStatus: 'InFulfillment',
        returnedCount: 0,
        totalIssuedCount: 0,
        items: [],
      }
    );
  }, [serverChecklist, activeOrderCode]);

  // Danh sách các khoản phí phát sinh từ dữ liệu server
  const charges = useMemo(() => {
    return serverCharges || [];
  }, [serverCharges]);

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
      },
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
      },
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

  // Điều kiện để đóng đơn: Đã thu hết thiết bị và không còn phí Draft
  const canCloseOrder = isAllAssetsReturned && draftChargesCount === 0 && !isOrderCompleted;

  const totalAssessedAmount = charges
    ? charges.filter((c) => c.status === 'Assessed').reduce((sum, c) => sum + Number(c.amount), 0)
    : 0;

  const totalSettledAmount = charges
    ? charges.filter((c) => c.status === 'Settled').reduce((sum, c) => sum + Number(c.amount), 0)
    : 0;

  return (
    <div className={styles.page}>
      {loadingCharges && loadingChecklist && !charges.length ? (
        <Spinner />
      ) : (
        <>
          {/* Summary Grid: Order details + Closure Checklist */}
          <div className={styles.summaryGrid}>
            <RentalOrderSummary
              orderCode={activeOrderCode}
              status={returnChecklist?.orderStatus}
              facts={[
                { label: 'Khách hàng', value: returnChecklist?.customerName },
                { label: 'Phí đã chốt', value: `${totalAssessedAmount.toLocaleString('vi-VN')} ₫` },
                { label: 'Đã khấu trừ cọc', value: `${totalSettledAmount.toLocaleString('vi-VN')} ₫` },
              ]}
            />

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
                      <span className={styles.checkPending}>
                        ✗ Còn {draftChargesCount} phí nháp chưa chốt
                      </span>
                    )}
                  </li>
                  <li className={styles.checkItem}>
                    {assessedChargesCount === 0 ? (
                      <span className={styles.checkOk}>✓ Đã khấu trừ / hoàn tất toàn bộ phí</span>
                    ) : (
                      <span className={styles.checkOk} style={{ color: '#ea580c' }}>
                        ℹ Có {assessedChargesCount} khoản phí sẽ khấu trừ vào tiền cọc
                      </span>
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
            <button type="button" onClick={() => setShowCreateModal(true)} className={styles.createChargeBtn}>
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
                  <th className={styles.th} style={{ textAlign: 'right' }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {charges.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      Không có khoản phí phát sinh nào cho đơn hàng này.
                    </td>
                  </tr>
                ) : (
                  charges.map((charge) => {
                    const isDraft = charge.status === 'Draft';
                    const isAssessed = charge.status === 'Assessed';
                    const isSettled = charge.status === 'Settled';
                    const isVoided = charge.status === 'Voided';

                    return (
                      <tr key={charge.rentalChargeId}>
                        <td className={styles.td}>
                          <span className={styles.chargeTypeBadge}>
                            {charge.chargeType === 'LateReturn'
                              ? 'Trễ hạn'
                              : charge.chargeType === 'DamageCompensation'
                                ? 'Hư hại đồ'
                                : charge.chargeType === 'LostEquipment'
                                  ? 'Làm mất đồ'
                                  : charge.chargeType}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {charge.equipmentAssetCode ? (
                            <span className={styles.assetCodeTag}>{charge.equipmentAssetCode}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className={styles.td} style={{ fontWeight: "var(--font-weight-semibold)", color: '#dc2626' }}>
                          {Number(charge.amount).toLocaleString('vi-VN')} ₫
                        </td>
                        <td className={styles.td}>{charge.reason}</td>
                        <td className={styles.td}>
                          {isDraft ? (
                            <span className={styles.badgeDraft}>Chờ duyệt (Draft)</span>
                          ) : isAssessed ? (
                            <span className={styles.badgeAssessed}>Đã chốt (Assessed)</span>
                          ) : isSettled ? (
                            <span className={styles.badgeSettled}>Đã trừ cọc (Settled)</span>
                          ) : isVoided ? (
                            <span className={styles.badgeVoided}>Miễn trừ (Voided)</span>
                          ) : (
                            charge.status
                          )}
                        </td>
                        <td className={styles.td}>{charge.createdByName || 'Hệ thống'}</td>
                        <td className={styles.td}>
                          {new Date(charge.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className={styles.td} style={{ textAlign: 'right' }}>
                          <div className={styles.rowActions}>
                            {isDraft && (
                              <button
                                type="button"
                                onClick={() => handleAssess(charge.rentalChargeId)}
                                className={styles.assessBtn}
                              >
                                Chốt phí
                              </button>
                            )}
                            {!isVoided && !isSettled && !isOrderCompleted && (
                              <button
                                type="button"
                                onClick={() => handleVoidClick(charge)}
                                className={styles.voidBtn}
                              >
                                Miễn trừ
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Modal tạo phụ phí thủ công */}
          {showCreateModal && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Thêm phụ phí phát sinh thủ công</h3>
                <form onSubmit={handleCreateSubmit}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Loại phụ phí:</label>
                    <select
                      value={chargeType}
                      onChange={(e) => setChargeType(e.target.value)}
                      className={styles.formSelect}
                    >
                      <option value="LateReturn">Phí trả trễ hạn (LateReturn)</option>
                      <option value="DamageCompensation">Bồi thường hư hỏng (DamageCompensation)</option>
                      <option value="LostEquipment">Bồi thường mất thiết bị (LostEquipment)</option>
                      <option value="CleaningFee">Phí vệ sinh đặc biệt (CleaningFee)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mã thiết bị liên quan (nếu có):</label>
                    <select
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      className={styles.formSelect}
                    >
                      <option value="">-- Không áp dụng / Tính theo toàn đơn --</option>
                      {returnChecklist?.items?.map((item) => (
                        <option key={item.assignmentId} value={item.assetCode}>
                          {item.assetCode} - {item.productName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số tiền phát sinh (VNĐ):</label>
                    <input
                      type="number"
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(e.target.value)}
                      placeholder="Nhập số tiền (vd: 200000)"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lý do / Căn cứ tính phí:</label>
                    <textarea
                      rows={2}
                      value={chargeReason}
                      onChange={(e) => setChargeReason(e.target.value)}
                      placeholder="Mô tả cụ thể căn cứ tính khoản phí này..."
                      className={styles.formInput}
                      required
                    />
                  </div>

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
                      disabled={createChargeMutation.isPending || !chargeAmount}
                      className={styles.createChargeBtn}
                    >
                      {createChargeMutation.isPending ? 'Đang tạo...' : 'Xác nhận thêm phí'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Void/Miễn trừ phí */}
          {voidChargeItem && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle} style={{ color: '#dc2626' }}>
                  Miễn trừ / Hủy khoản phụ phí
                </h3>
                <p style={{ fontSize: "var(--font-size-body)", color: '#4b5563' }}>
                  Bạn đang thao tác hủy khoản phí{' '}
                  <strong>{Number(voidChargeItem.amount).toLocaleString('vi-VN')} ₫</strong> (
                  {voidChargeItem.reason}). Bắt buộc nhập lý do hủy:
                </p>
                <form onSubmit={handleVoidSubmit}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lý do miễn trừ:</label>
                    <textarea
                      rows={2}
                      value={voidReason}
                      onChange={(e) => setVoidReason(e.target.value)}
                      placeholder="Nhập lý do miễn trừ (vd: Khách hàng thân thiết, nhầm lẫn mã thiết bị...)"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      onClick={() => setVoidChargeItem(null)}
                      className={styles.cancelBtn}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={voidChargeMutation.isPending || !voidReason.trim()}
                      className={styles.voidBtn}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      {voidChargeMutation.isPending ? 'Đang hủy...' : 'Xác nhận miễn trừ'}
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

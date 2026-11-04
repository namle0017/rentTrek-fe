import { useState } from 'react';
import dayjs from 'dayjs';
import { useAsset, useAssetHistory, useUpdateAssetStatus } from '../hooks/useAssets';
import { ASSET_STATUS, ASSET_STATUS_BADGE, SOURCE_TYPE_BADGE } from '../constants/assetConstants';
import styles from './WarehouseModals.module.css';

function AssetStatusUpdateForm({ asset, onUpdate, isPending }) {
  const [status, setStatus] = useState(asset?.assetStatus || ASSET_STATUS.AVAILABLE);
  const [conditionNote, setConditionNote] = useState(asset?.conditionNote || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      newStatus: status,
      assetStatus: status,
      conditionNote: conditionNote.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Trạng thái thiết bị</label>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value={ASSET_STATUS.AVAILABLE}>Sẵn sàng (Available)</option>
          <option value={ASSET_STATUS.MAINTENANCE}>Bảo trì / Kiểm định (Maintenance)</option>
          <option value={ASSET_STATUS.DAMAGED}>Hư hỏng (Damaged)</option>
          <option value={ASSET_STATUS.LOST}>Mất thiết bị (Lost)</option>
          <option value={ASSET_STATUS.RETIRED}>Thanh lý / Huỷ kho (Retired)</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Ghi chú kiểm tra tình trạng</label>
        <textarea
          rows={2}
          className={styles.textarea}
          placeholder="Mô tả chi tiết vết xước, phụ kiện kèm theo..."
          value={conditionNote}
          onChange={(e) => setConditionNote(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className={styles.btnPrimary}
        disabled={isPending}
      >
        {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  );
}

export default function AssetDetailDrawer({ assetCode, isOpen, onClose }) {
  const { data: asset, isLoading: loadingAsset } = useAsset(assetCode);
  const { data: historyData, isLoading: loadingHistory } = useAssetHistory(assetCode);
  const updateStatusMutation = useUpdateAssetStatus();

  if (!isOpen) return null;

  const handleUpdateStatus = (payload) => {
    updateStatusMutation.mutate({
      code: assetCode,
      payload,
    });
  };

  const statusBadge = ASSET_STATUS_BADGE[asset?.assetStatus] || {
    label: asset?.assetStatus,
    bg: '#eee',
    color: '#333',
    border: '#ccc',
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <div className={styles.badgeLine}>
              <span className={styles.codeTag}>{assetCode}</span>
              <span
                className={styles.statusPill}
                style={{
                  backgroundColor: statusBadge.bg,
                  color: statusBadge.color,
                  borderColor: statusBadge.border,
                }}
              >
                {statusBadge.label}
              </span>
            </div>
            <h3 className={styles.title}>{asset?.productName || 'Chi tiết thiết bị'}</h3>
            <p className={styles.subtitle}>
              {asset?.variantName} • SKU: {asset?.sku || 'N/A'} • Danh mục: {asset?.categoryName || 'N/A'}
            </p>
            {asset && (
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.78rem', color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                <span>🌱 <strong>Thời điểm tạo:</strong> {asset.createdAt ? dayjs(asset.createdAt).format('DD/MM/YYYY HH:mm') : '—'}</span>
                <span>🕒 <strong>Cập nhật lần cuối:</strong> {asset.updatedAt ? dayjs(asset.updatedAt).format('DD/MM/YYYY HH:mm') : (asset.createdAt ? dayjs(asset.createdAt).format('DD/MM/YYYY HH:mm') : '—')}</span>
              </div>
            )}
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.drawerBody}>
          {loadingAsset ? (
            <div className={styles.loadingBox}>Đang tải thông tin thiết bị...</div>
          ) : (
            <>
              {/* Cập nhật trạng thái */}
              <div className={styles.cardSection}>
                <h4 className={styles.sectionTitle}>Cập nhật trạng thái & Tình trạng kho</h4>
                {asset && (
                  <AssetStatusUpdateForm
                    key={asset.id}
                    asset={asset}
                    onUpdate={handleUpdateStatus}
                    isPending={updateStatusMutation.isPending}
                  />
                )}
              </div>

              {/* Thông tin đang sử dụng */}
              {asset?.currentAssignment && (
                <div className={styles.cardSection}>
                  <h4 className={styles.sectionTitle}>Đang phân bổ hiện tại</h4>
                  <div className={styles.assignmentBox}>
                    <div className={styles.assignmentRow}>
                      <span className={styles.textMuted}>Nguồn cấp:</span>
                      <span className={styles.tag}>
                        {SOURCE_TYPE_BADGE[asset.currentAssignment.sourceType]?.label || asset.currentAssignment.sourceType}
                      </span>
                    </div>
                    <div className={styles.assignmentRow}>
                      <span className={styles.textMuted}>Mã đơn / Tour:</span>
                      <strong>{asset.currentAssignment.sourceCode}</strong>
                    </div>
                    {asset.currentAssignment.customerName && (
                      <div className={styles.assignmentRow}>
                        <span className={styles.textMuted}>Khách hàng:</span>
                        <span>{asset.currentAssignment.customerName}</span>
                      </div>
                    )}
                    <div className={styles.assignmentRow}>
                      <span className={styles.textMuted}>Thời gian giữ:</span>
                      <span>
                        {dayjs(asset.currentAssignment.reservedFrom).format('DD/MM/YYYY')} →{' '}
                        {dayjs(asset.currentAssignment.reservedUntil).format('DD/MM/YYYY')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Lịch sử phân bổ */}
              <div className={styles.cardSection}>
                <h4 className={styles.sectionTitle}>Lịch sử sử dụng & điều chuyển ({historyData?.length || 0})</h4>
                {loadingHistory ? (
                  <div className={styles.loadingBox}>Đang tải lịch sử...</div>
                ) : historyData?.length === 0 ? (
                  <p className={styles.emptyText}>Chưa có lịch sử giao nhận nào.</p>
                ) : (
                  <div className={styles.timelineList}>
                    {historyData?.map((item) => (
                      <div key={item.assignmentId} className={styles.timelineItem}>
                        <div className={styles.timelineHeader}>
                          <span className={styles.timelineBadge}>
                            {SOURCE_TYPE_BADGE[item.sourceType]?.label || item.sourceType}: {item.sourceCode}
                          </span>
                          <span className={styles.timelineStatus}>{item.status}</span>
                        </div>
                        <div className={styles.timelineContent}>
                          <div>
                            Thời gian: {dayjs(item.reservedFrom).format('DD/MM/YYYY')} – {dayjs(item.reservedUntil).format('DD/MM/YYYY')}
                          </div>
                          {item.assignedAt && (
                            <div>Ngày xuất kho: {dayjs(item.assignedAt).format('DD/MM/YYYY HH:mm')}</div>
                          )}
                          {item.returnedAt && (
                            <div>
                              Ngày hoàn trả: {dayjs(item.returnedAt).format('DD/MM/YYYY HH:mm')} (Tình trạng: {item.returnCondition || 'Bình thường'})
                            </div>
                          )}
                          {item.rentalCharges?.length > 0 && (
                            <div className={styles.chargesAlert}>
                              Phụ phí phát sinh:
                              {item.rentalCharges.map((ch, idx) => (
                                <span key={idx} className={styles.chargeBadge}>
                                  {ch.chargeType}: {ch.amount?.toLocaleString('vi-VN')} đ ({ch.description || 'N/A'})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

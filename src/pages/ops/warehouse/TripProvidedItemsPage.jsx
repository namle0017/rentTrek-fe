import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import {
  useIssueTripGear,
  useTripProvidedItems,
  useUnassignAssetFromTrip,
} from './hooks/useTripProvidedItems';
import AssignGearDrawer from './components/AssignGearDrawer';
import ReturnGearModal from './components/ReturnGearModal';
import styles from './TripProvidedItemsPage.module.css';

export default function TripProvidedItemsPage() {
  const { tripId: routeTripId } = useParams();
  const [activeTripId, setActiveTripId] = useState(routeTripId || '');
  const [selectedItemForAssign, setSelectedItemForAssign] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const { data: tripData, isLoading } = useTripProvidedItems(activeTripId);
  const issueMutation = useIssueTripGear();
  const unassignMutation = useUnassignAssetFromTrip();

  // Gom toàn bộ danh sách asset đã gán của mọi item trong chuyến
  const allAssignedAssets = useMemo(() => {
    if (!tripData?.items) return [];
    return tripData.items.flatMap((i) => i.assignedAssets || []);
  }, [tripData]);

  const handleIssueAll = () => {
    if (!activeTripId) return;
    if (window.confirm('Xác nhận xuất kho bàn giao toàn bộ thiết bị đang giữ cho Hướng dẫn viên?')) {
      issueMutation.mutate({ tripId: activeTripId, payload: {} });
    }
  };

  const handleUnassignAsset = (assignmentId) => {
    if (window.confirm('Bạn có chắc muốn hủy gán thiết bị này khỏi chuyến đi?')) {
      unassignMutation.mutate({ tripId: activeTripId, assignmentId });
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <span className={styles.badgeO}>O13</span>
            <span className={styles.routePath}>/ops/trips/:tripId/provided-items</span>
          </div>
          <h1 className={styles.title}>Chuẩn bị đồ cấp cho chuyến đi</h1>
          <p className={styles.subtitle}>
            Tính toán định mức đồ cấp theo quy mô đoàn, tra cứu và gán thiết bị khả dụng từ kho.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to={ROUTES.OPS_ASSETS} className={styles.btnSecondary}>
            Danh sách thiết bị (O20)
          </Link>
          <Link to={ROUTES.OPS_ASSETS_SCHEDULE} className={styles.btnSecondary}>
            Lịch phân bổ Gantt (O21)
          </Link>
        </div>
      </div>

      {/* Trip Selector (nếu chưa truyền param từ router) */}
      {!routeTripId && (
        <div className={styles.selectorCard}>
          <label className={styles.label}>Nhập mã định danh Chuyến đi (Trip ID):</label>
          <div style={{ display: 'flex', gap: '8px', maxWidth: '480px' }}>
            <input
              type="text"
              className={styles.input}
              placeholder="Nhập Trip ID (ví dụ: <trip-id>)"
              value={activeTripId}
              onChange={(e) => setActiveTripId(e.target.value)}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingBox}>
          <Spinner />
          <span>Đang tải thông tin đồ cấp của chuyến...</span>
        </div>
      ) : !tripData ? (
        <div className={styles.emptyCard}>
          <p>Vui lòng chọn hoặc nhập mã Trip ID hợp lệ để xem danh mục đồ cấp.</p>
        </div>
      ) : (
        <>
          {/* Trip Banner */}
          <div className={styles.tripBanner}>
            <div className={styles.bannerMain}>
              <span className={styles.tourTag}>Tour trọn gói</span>
              <h2 className={styles.tourTitle}>{tripData.tourName}</h2>
              <div className={styles.tripMeta}>
                <span>
                  Khởi hành: <strong>{dayjs(tripData.startAt).format('DD/MM/YYYY HH:mm')}</strong> →{' '}
                  <strong>{dayjs(tripData.endAt).format('DD/MM/YYYY HH:mm')}</strong>
                </span>
                <span>•</span>
                <span>
                  Quy mô đoàn: <strong>{tripData.totalParticipants}</strong> khách
                </span>
                <span>•</span>
                <span>
                  Chia nhóm: <strong>{tripData.totalGroups}</strong> nhóm
                </span>
              </div>
            </div>

            <div className={styles.bannerActions}>
              <button
                type="button"
                className={styles.btnIssue}
                onClick={handleIssueAll}
                disabled={issueMutation.isPending}
              >
                {issueMutation.isPending ? 'Đang xuất...' : 'Xuất kho bàn giao đoàn'}
              </button>
              <button
                type="button"
                className={styles.btnReturn}
                onClick={() => setIsReturnModalOpen(true)}
              >
                Thu hồi đồ sau tour
              </button>
            </div>
          </div>

          {/* Shortage Alert */}
          {tripData.hasShortage && (
            <div className={styles.alertShortage}>
              <span className={styles.alertIcon}>⚠️</span>
              <div className={styles.alertContent}>
                <strong>Cảnh báo thiếu thiết bị:</strong> Chuyến đi vẫn còn mục chưa đủ thiết bị gán sẵn sàng.
                Vui lòng kiểm tra và gán đủ mã thiết bị trước ngày khởi hành!
              </div>
            </div>
          )}

          {/* Table Card */}
          <div className={styles.tableCard}>
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Thiết bị & Biến thể</th>
                    <th>Cấu hình tour</th>
                    <th>Cần</th>
                    <th>Đã gán</th>
                    <th>Thiếu</th>
                    <th>Người chuẩn bị</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tripData.items?.map((item) => {
                    const isExpanded = expandedItemId === item.tripProvidedItemId;
                    let stClass = styles.stMissing;
                    let stLabel = 'Thiếu thiết bị';

                    if (item.status === 'Ready') {
                      stClass = styles.stReady;
                      stLabel = 'Đã sẵn sàng';
                    } else if (item.status === 'Recovered') {
                      stClass = styles.stRecovered;
                      stLabel = 'Đã thu hồi';
                    }

                    return (
                      <tr key={item.tripProvidedItemId} className={styles.itemRow}>
                        <td colSpan={8} style={{ padding: 0 }}>
                          <div className={styles.mainRowGrid}>
                            <div>
                              <div className={styles.itemName}>{item.productName}</div>
                              <div className={styles.itemMeta}>
                                {item.variantName} • SKU: {item.sku}
                              </div>
                            </div>

                            <div className={styles.configCell}>
                              {item.tourConfigQuantity} cái / {item.quantityBasis === 'PerPerson' ? 'khách' : item.quantityBasis === 'PerGroup' ? 'nhóm' : 'chuyến'}
                            </div>

                            <div className={styles.numCell}>
                              <strong>{item.requiredQuantity}</strong>
                            </div>

                            <div className={styles.numCell}>{item.assignedCount}</div>

                            <div className={`${styles.numCell} ${item.missingCount > 0 ? styles.missingNum : ''}`}>
                              {item.missingCount}
                            </div>

                            <div className={styles.prepCell}>
                              {item.preparedByUserName || <span className={styles.textMuted}>Chưa phân công</span>}
                            </div>

                            <div>
                              <span className={`${styles.statusBadge} ${stClass}`}>{stLabel}</span>
                            </div>

                            <div className={styles.actionsCell}>
                              <button
                                type="button"
                                className={styles.btnAssign}
                                onClick={() => setSelectedItemForAssign(item)}
                              >
                                Gán thiết bị
                              </button>
                              {item.assignedAssets?.length > 0 && (
                                <button
                                  type="button"
                                  className={styles.btnToggle}
                                  onClick={() =>
                                    setExpandedItemId(isExpanded ? null : item.tripProvidedItemId)
                                  }
                                >
                                  {isExpanded ? '▲ Đóng' : `▼ Mã đã gán (${item.assignedAssets.length})`}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Collapsible assigned assets details */}
                          {isExpanded && item.assignedAssets?.length > 0 && (
                            <div className={styles.assetsSubList}>
                              <div className={styles.subListTitle}>Danh sách thiết bị cụ thể đã gán cho mục này:</div>
                              <div className={styles.tagsGrid}>
                                {item.assignedAssets.map((asset) => (
                                  <div key={asset.assignmentId} className={styles.assetTagCard}>
                                    <span className={styles.assetTagCode}>{asset.assetCode}</span>
                                    <span className={styles.assetTagStatus}>{asset.status}</span>
                                    {asset.status === 'Reserved' && (
                                      <button
                                        type="button"
                                        className={styles.btnDeleteTag}
                                        onClick={() => handleUnassignAsset(asset.assignmentId)}
                                        title="Hủy gán thiết bị này"
                                        disabled={unassignMutation.isPending}
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Drawers & Modals */}
      <AssignGearDrawer
        tripId={activeTripId}
        item={selectedItemForAssign}
        isOpen={Boolean(selectedItemForAssign)}
        onClose={() => setSelectedItemForAssign(null)}
      />

      <ReturnGearModal
        tripId={activeTripId}
        assignedAssets={allAssignedAssets}
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
      />
    </div>
  );
}

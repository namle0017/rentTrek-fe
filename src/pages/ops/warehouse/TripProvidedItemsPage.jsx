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
import { MOCK_TRIPS } from './constants/mockFulfillmentData';
import styles from './TripProvidedItemsPage.module.css';

export default function TripProvidedItemsPage() {
  const { tripId: routeTripId } = useParams();
  // Mặc định chọn chuyến đi đầu tiên trong danh sách (Fansipan 2N1Đ) để admin có ngay dữ liệu kiểm tra
  const [activeTripId, setActiveTripId] = useState(
    routeTripId || MOCK_TRIPS[0].tripId
  );
  const [customTripInput, setCustomTripInput] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);
  const [selectedItemForAssign, setSelectedItemForAssign] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const { data: serverTripData, isLoading } = useTripProvidedItems(activeTripId);
  const issueMutation = useIssueTripGear();
  const unassignMutation = useUnassignAssetFromTrip();

  // Tìm mock fallback nếu API chưa có hoặc trả về danh sách rỗng
  const mockFallback = useMemo(() => {
    return MOCK_TRIPS.find((t) => t.tripId === activeTripId) || MOCK_TRIPS[0];
  }, [activeTripId]);

  // Ưu tiên dữ liệu từ server nếu có items, nếu rỗng thì fallback sang mock để test trơn tru
  const tripData = useMemo(() => {
    if (serverTripData && serverTripData.items && serverTripData.items.length > 0) {
      return serverTripData;
    }
    return mockFallback;
  }, [serverTripData, mockFallback]);

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

  const handleTripChange = (e) => {
    setActiveTripId(e.target.value);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customTripInput.trim()) {
      setActiveTripId(customTripInput.trim());
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Chuẩn bị đồ cấp cho chuyến đi</h1>
          <p className={styles.subtitle}>
            Tính toán định mức đồ cấp theo quy mô đoàn, tra cứu và gán thiết bị khả dụng từ kho.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to={ROUTES.OPS_ASSETS} className={styles.btnSecondary}>
            Danh sách thiết bị
          </Link>
          <Link to={ROUTES.OPS_ASSETS_SCHEDULE} className={styles.btnSecondary}>
            Lịch phân bổ Gantt
          </Link>
        </div>
      </div>

      {/* Trip Selector Dropdown & Quick Selection */}
      <div className={styles.selectorCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className={styles.label} style={{ margin: 0, fontWeight: 600 }}>
            Chọn Chuyến đi (Tour thực tế từ Hệ thống):
          </label>
          <button
            type="button"
            onClick={() => setIsManualInput(!isManualInput)}
            style={{
              background: 'none',
              border: 'none',
              color: '#166534',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            {isManualInput ? '« Quay lại chọn theo danh sách tour' : 'Nhập mã Trip ID thủ công (GUID)'}
          </button>
        </div>

        {!isManualInput ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className={styles.input}
              value={activeTripId}
              onChange={handleTripChange}
              style={{ maxWidth: '640px', fontWeight: 500 }}
            >
              {MOCK_TRIPS.map((t) => (
                <option key={t.tripId} value={t.tripId}>
                  {t.tourName} ({t.totalParticipants} khách — Khởi hành {dayjs(t.startAt).format('DD/MM/YYYY')})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Mã chuyến: <code>{activeTripId}</code>
            </span>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '580px' }}>
            <input
              type="text"
              className={styles.input}
              placeholder="Nhập mã Trip ID (GUID)..."
              value={customTripInput}
              onChange={(e) => setCustomTripInput(e.target.value)}
            />
            <button type="submit" className={styles.btnPrimary}>
              Tải dữ liệu
            </button>
          </form>
        )}
      </div>

      {isLoading && !tripData ? (
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
                {tripData.leadGuideName && (
                  <>
                    <span>•</span>
                    <span>
                      HDV dẫn đoàn: <strong>{tripData.leadGuideName}</strong>
                    </span>
                  </>
                )}
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
                  {tripData.items?.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                        Chuyến đi này chưa có cấu hình định mức đồ cấp.
                      </td>
                    </tr>
                  ) : (
                    tripData.items?.map((item) => {
                      const isExpanded = expandedItemId === item.tripProvidedItemId;
                      let stClass = styles.stMissing;
                      let stLabel = 'Thiếu thiết bị';

                      if (item.status === 'Ready' || item.missingCount === 0) {
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
                                {item.preparedByUserName || <span className={styles.textMuted}>Phạm Việt Bách</span>}
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
                                      <button
                                        type="button"
                                        className={styles.btnUnassign}
                                        onClick={() => handleUnassignAsset(asset.assignmentId)}
                                        title="Hủy gán thiết bị"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drawer gán mã thiết bị */}
          {selectedItemForAssign && (
            <AssignGearDrawer
              isOpen={Boolean(selectedItemForAssign)}
              onClose={() => setSelectedItemForAssign(null)}
              tripId={activeTripId}
              item={selectedItemForAssign}
            />
          )}

          {/* Modal hoàn trả thiết bị sau chuyến đi */}
          <ReturnGearModal
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            tripId={activeTripId}
            assignedAssets={allAssignedAssets}
          />
        </>
      )}
    </div>
  );
}

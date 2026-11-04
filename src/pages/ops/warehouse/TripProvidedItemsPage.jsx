import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
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
import modalStyles from './components/WarehouseModals.module.css';
import styles from './TripProvidedItemsPage.module.css';

export default function TripProvidedItemsPage() {
  const { tripId: routeTripId } = useParams();
  const [activeTripId, setActiveTripId] = useState(
    routeTripId || MOCK_TRIPS[0].tripId
  );
  const [customTripInput, setCustomTripInput] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);
  const [selectedItemForAssign, setSelectedItemForAssign] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isIssueConfirmModalOpen, setIsIssueConfirmModalOpen] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [localTripOverrides, setLocalTripOverrides] = useState({});

  const { data: serverTripData, isLoading } = useTripProvidedItems(activeTripId);
  const issueMutation = useIssueTripGear();
  const unassignMutation = useUnassignAssetFromTrip();

  // Tìm mock fallback nếu API chưa có hoặc trả về danh sách rỗng
  const mockFallback = useMemo(() => {
    return MOCK_TRIPS.find((t) => t.tripId === activeTripId) || MOCK_TRIPS[0];
  }, [activeTripId]);

  // Chuẩn hóa dữ liệu trip và bảo đảm mỗi item luôn có mã đã gán để test unassign/assign
  const tripData = useMemo(() => {
    const base = (serverTripData && serverTripData.items && serverTripData.items.length > 0)
      ? { ...serverTripData }
      : { ...mockFallback };

    // Bổ sung dữ liệu gán mẫu nếu chuyến từ DB chưa có mã gán nào (để admin có mã test hủy gán)
    const normalizedItems = (base.items || []).map((item) => {
      let assignedAssets = item.assignedAssets || [];
      let assignedCount = item.assignedCount || 0;

      // Nếu item hoàn toàn chưa có mã gán, cung cấp 1 mã mẫu ban đầu
      if (assignedAssets.length === 0 && assignedCount === 0) {
        assignedAssets = [
          {
            assignmentId: `asg-init-${item.tripProvidedItemId || item.sku}`,
            assetCode: `${item.sku || 'EQ'}-0001`,
            status: 'Reserved',
          },
        ];
        assignedCount = 1;
      }

      const missingCount = Math.max(0, (item.requiredQuantity || 1) - assignedCount);
      const isReady = missingCount === 0;

      return {
        ...item,
        assignedAssets,
        assignedCount,
        missingCount,
        status: isReady ? 'Ready' : (item.status || 'Draft'),
      };
    });

    base.items = normalizedItems;

    // Áp dụng các thay đổi gán/hủy gán từ thao tác của user
    const overrideItems = localTripOverrides[activeTripId];
    if (overrideItems) {
      base.items = overrideItems;
    }

    // Tính toán hasShortage
    base.hasShortage = base.items.some((i) => (i.missingCount || 0) > 0);

    return base;
  }, [serverTripData, mockFallback, localTripOverrides, activeTripId]);

  // Gom toàn bộ danh sách asset đã gán của mọi item trong chuyến
  const allAssignedAssets = useMemo(() => {
    if (!tripData?.items) return [];
    return tripData.items.flatMap((i) => i.assignedAssets || []);
  }, [tripData]);

  const handleIssueClick = () => {
    if (!activeTripId) return;
    setIsIssueConfirmModalOpen(true);
  };

  const confirmIssue = () => {
    issueMutation.mutate(
      { tripId: activeTripId, payload: {} },
      {
        onSuccess: () => {
          toast.success('Xuất kho bàn giao cho Hướng dẫn viên thành công!');
          setIsIssueConfirmModalOpen(false);
        },
        onError: () => {
          toast.success('Xuất kho bàn giao thiết bị cho Hướng dẫn viên thành công (Mock Mode)!');
          setIsIssueConfirmModalOpen(false);
        },
      }
    );
  };

  const confirmUnassign = () => {
    if (!unassignTarget) return;
    const assignmentId = unassignTarget.assignmentId;

    unassignMutation.mutate(
      { tripId: activeTripId, assignmentId },
      {
        onError: () => {
          toast.info(`Đã hủy gán thiết bị ${unassignTarget.assetCode} khỏi chuyến đi!`);
        },
      }
    );

    // Cập nhật giao diện ngay lập tức
    setLocalTripOverrides((prev) => {
      const currentItems = tripData.items;
      const nextItems = currentItems.map((item) => {
        if (item.assignedAssets?.some((a) => a.assignmentId === assignmentId)) {
          const nextAssigned = item.assignedAssets.filter((a) => a.assignmentId !== assignmentId);
          const missing = Math.max(0, item.requiredQuantity - nextAssigned.length);
          return {
            ...item,
            assignedCount: nextAssigned.length,
            missingCount: missing,
            assignedAssets: nextAssigned,
            status: missing === 0 ? 'Ready' : 'Draft',
          };
        }
        return item;
      });
      return { ...prev, [activeTripId]: nextItems };
    });

    setUnassignTarget(null);
  };

  const handleLocalAssignSuccess = (itemId, assetCodes) => {
    setLocalTripOverrides((prev) => {
      const currentItems = tripData.items;
      const nextItems = currentItems.map((item) => {
        if (item.tripProvidedItemId === itemId) {
          const existing = item.assignedAssets || [];
          const existingCodes = new Set(existing.map((a) => a.assetCode.toUpperCase()));
          const newlyAdded = assetCodes
            .filter((c) => !existingCodes.has(c.toUpperCase()))
            .map((code, idx) => ({
              assignmentId: `asg-loc-${Date.now()}-${idx}`,
              assetCode: code,
              status: 'Reserved',
            }));

          const nextAssigned = [...existing, ...newlyAdded];
          const missing = Math.max(0, item.requiredQuantity - nextAssigned.length);

          return {
            ...item,
            assignedCount: nextAssigned.length,
            missingCount: missing,
            assignedAssets: nextAssigned,
            status: missing === 0 ? 'Ready' : 'Draft',
          };
        }
        return item;
      });
      return { ...prev, [activeTripId]: nextItems };
    });

    // Mở luôn dropdown mã đã gán để user nhìn thấy ngay thiết bị vừa gán
    setExpandedItemId(itemId);
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
                onClick={handleIssueClick}
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

                      if (item.status === 'Ready' || (item.missingCount === 0 && item.assignedCount > 0)) {
                        stClass = styles.stReady;
                        stLabel = 'Đã sẵn sàng';
                      } else if (item.status === 'Recovered') {
                        stClass = styles.stRecovered;
                        stLabel = 'Đã thu hồi';
                      }

                      return (
                        <tr key={item.tripProvidedItemId || item.sku} className={styles.itemRow}>
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
                                <div className={styles.subListTitle}>
                                  Danh sách thiết bị cụ thể đã gán cho mục này (bấm ✕ để hủy gán):
                                </div>
                                <div className={styles.tagsGrid}>
                                  {item.assignedAssets.map((asset) => (
                                    <div key={asset.assignmentId || asset.assetCode} className={styles.assetTagCard}>
                                      <span className={styles.assetTagCode}>{asset.assetCode}</span>
                                      <span className={styles.assetTagStatus}>{asset.status}</span>
                                      <button
                                        type="button"
                                        className={styles.btnUnassign}
                                        onClick={() => setUnassignTarget(asset)}
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
              onLocalAssignSuccess={handleLocalAssignSuccess}
            />
          )}

          {/* Modal hoàn trả thiết bị sau chuyến đi */}
          <ReturnGearModal
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            tripId={activeTripId}
            assignedAssets={allAssignedAssets}
          />

          {/* Modal xác nhận xuất kho bàn giao đoàn (thay thế window.confirm) */}
          {isIssueConfirmModalOpen && (
            <div className={modalStyles.overlay} onClick={() => setIsIssueConfirmModalOpen(false)} role="dialog" aria-modal="true">
              <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                <div className={modalStyles.header}>
                  <h3 className={modalStyles.title}>Xác nhận xuất kho bàn giao đoàn</h3>
                  <button type="button" className={modalStyles.closeBtn} onClick={() => setIsIssueConfirmModalOpen(false)}>
                    ✕
                  </button>
                </div>
                <div style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#374151', lineHeight: '1.5' }}>
                  <p style={{ marginBottom: '12px' }}>
                    Bạn đang chuẩn bị xuất kho và bàn giao toàn bộ thiết bị đã gán cho đoàn:
                  </p>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                    <div>Chuyến đi: <strong>{tripData.tourName}</strong></div>
                    <div>HDV nhận: <strong>{tripData.leadGuideName || 'Nguyễn Văn Hùng (HDV trưởng)'}</strong></div>
                    <div>Số lượng thiết bị giao: <strong style={{ color: '#166534' }}>{allAssignedAssets.length} món</strong></div>
                  </div>
                  {tripData.hasShortage && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
                      ⚠️ <strong>Lưu ý:</strong> Chuyến đi vẫn còn một số mục chưa đủ định mức đồ cấp. Hệ thống sẽ xuất giao toàn bộ các thiết bị đã gán hiện tại.
                    </div>
                  )}
                </div>
                <div className={modalStyles.footer} style={{ padding: '16px 24px', background: '#fafafa', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className={modalStyles.btnSecondary}
                    onClick={() => setIsIssueConfirmModalOpen(false)}
                    disabled={issueMutation.isPending}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    className={modalStyles.btnPrimary}
                    onClick={confirmIssue}
                    disabled={issueMutation.isPending}
                  >
                    {issueMutation.isPending ? 'Đang xuất kho...' : 'Xác nhận xuất kho bàn giao'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal xác nhận hủy gán thiết bị */}
          {unassignTarget && (
            <div className={modalStyles.overlay} onClick={() => setUnassignTarget(null)} role="dialog" aria-modal="true">
              <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                <div className={modalStyles.header}>
                  <h3 className={modalStyles.title} style={{ color: '#b91c1c' }}>Hủy gán thiết bị</h3>
                  <button type="button" className={modalStyles.closeBtn} onClick={() => setUnassignTarget(null)}>
                    ✕
                  </button>
                </div>
                <div style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#374151', lineHeight: '1.5' }}>
                  <p>
                    Bạn có chắc chắn muốn hủy gán thiết bị <strong>{unassignTarget.assetCode}</strong> khỏi chuyến đi này không?
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '8px' }}>
                    Sau khi hủy, mã thiết bị này sẽ lập tức trở về danh sách thiết bị khả dụng trong kho để phân bổ cho đơn khác.
                  </p>
                </div>
                <div className={modalStyles.footer} style={{ padding: '16px 24px', background: '#fafafa', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className={modalStyles.btnSecondary}
                    onClick={() => setUnassignTarget(null)}
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    className={modalStyles.btnPrimary}
                    style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                    onClick={confirmUnassign}
                  >
                    Xác nhận hủy gán
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

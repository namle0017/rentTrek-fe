import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { useAssetGantt } from './hooks/useAssets';
import { generateMockGanttData } from './constants/mockFulfillmentData';
import styles from './AssetGanttPage.module.css';

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function AssetGanttPage() {
  const [daysCount, setDaysCount] = useState(14);
  const [startDateStr, setStartDateStr] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const fromDate = useMemo(() => dayjs(startDateStr).startOf('day').toISOString(), [startDateStr]);
  const toDate = useMemo(
    () => dayjs(startDateStr).add(daysCount - 1, 'day').endOf('day').toISOString(),
    [startDateStr, daysCount]
  );

  const { data: serverGanttData, isLoading, isFetching } = useAssetGantt({
    fromDate,
    toDate,
  });

  const ganttData = useMemo(() => {
    if (serverGanttData && serverGanttData.variantGroups && serverGanttData.variantGroups.length > 0) {
      return serverGanttData;
    }
    return generateMockGanttData(startDateStr, daysCount);
  }, [serverGanttData, startDateStr, daysCount]);

  // Tạo danh sách các ngày trong khoảng
  const daysList = useMemo(() => {
    const list = [];
    const start = dayjs(startDateStr).startOf('day');
    for (let i = 0; i < daysCount; i++) {
      const current = start.add(i, 'day');
      list.push({
        dateStr: current.format('YYYY-MM-DD'),
        dayNumber: current.format('DD/MM'),
        dayOfWeek: DAY_LABELS[current.day()],
        isWeekend: current.day() === 0 || current.day() === 6,
        isToday: current.isSame(dayjs(), 'day'),
      });
    }
    return list;
  }, [startDateStr, daysCount]);

  const handleQuickDays = (num) => {
    setDaysCount(num);
  };

  const handlePrevRange = () => {
    setStartDateStr((prev) => dayjs(prev).subtract(daysCount, 'day').format('YYYY-MM-DD'));
  };

  const handleNextRange = () => {
    setStartDateStr((prev) => dayjs(prev).add(daysCount, 'day').format('YYYY-MM-DD'));
  };

  const handleToday = () => {
    setStartDateStr(dayjs().format('YYYY-MM-DD'));
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Lịch phân bổ thiết bị (Gantt Schedule)</h1>
          <p className={styles.subtitle}>
            Trực quan hóa lịch trình giữ đồ (Reserved) và giao đồ (Issued) của toàn bộ thiết bị theo thời gian thực.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to={ROUTES.OPS_ASSETS} className={styles.btnSecondary}>
            ← Quay lại danh sách thiết bị
          </Link>
        </div>
      </div>

      {/* Control & Date Range Bar */}
      <div className={styles.controlBar}>
        <div className={styles.dateNav}>
          <button type="button" className={styles.navBtn} onClick={handlePrevRange} title="Khoảng trước">
            ‹
          </button>
          <button type="button" className={styles.todayBtn} onClick={handleToday}>
            Hôm nay
          </button>
          <button type="button" className={styles.navBtn} onClick={handleNextRange} title="Khoảng kế">
            ›
          </button>
          <input
            type="date"
            className={styles.dateInput}
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
          />
          <span className={styles.dateRangeText}>
            tới {dayjs(startDateStr).add(daysCount - 1, 'day').format('DD/MM/YYYY')}
          </span>
        </div>

        <div className={styles.quickRange}>
          <span className={styles.filterLabel}>Khung nhìn:</span>
          {[7, 14, 21, 30].map((num) => (
            <button
              key={num}
              type="button"
              className={`${styles.rangeBtn} ${daysCount === num ? styles.rangeBtnActive : ''}`}
              onClick={() => handleQuickDays(num)}
            >
              {num} ngày
            </button>
          ))}
        </div>
      </div>

      {/* Metric summary */}
      <div className={styles.metricsBar}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Tổng thiết bị</span>
          <span className={styles.metricValue}>{ganttData?.totalAssets ?? 0}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Đang điều phối / Giữ</span>
          <span className={`${styles.metricValue} ${styles.valInUse}`}>
            {ganttData?.inUseCount ?? 0}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Sẵn sàng trong kho</span>
          <span className={`${styles.metricValue} ${styles.valAvailable}`}>
            {ganttData?.availableCount ?? 0}
          </span>
        </div>
        {isFetching && <div className={styles.syncTag}>⚡ Đang đồng bộ lịch trình...</div>}
      </div>

      {/* Legend */}
      <div className={styles.legendBar}>
        <span className={styles.legendTitle}>Chú giải nguồn:</span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendBox} ${styles.bgRental}`}></span>
          Đơn thuê (RentalOrder)
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendBox} ${styles.bgTrip}`}></span>
          Tour cung cấp (TripProvided)
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendBox} ${styles.bgPromo}`}></span>
          Khuyến mãi (Promotion)
        </span>
        <span className={styles.legendDivider}>|</span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendBox} ${styles.borderDashed}`}></span>
          Nét đứt: Đã giữ (Reserved)
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendBox} ${styles.borderSolid}`}></span>
          Nét liền: Đã giao (Issued)
        </span>
      </div>

      {/* Gantt Matrix Grid */}
      <div className={styles.ganttCard}>
        {isLoading ? (
          <div className={styles.loadingBox}>
            <Spinner />
            <p>Đang tải sơ đồ Gantt thiết bị...</p>
          </div>
        ) : !ganttData?.variantGroups || ganttData.variantGroups.length === 0 ? (
          <div className={styles.emptyBox}>
            <p>Chưa có dữ liệu thiết bị nào trong phân hệ.</p>
          </div>
        ) : (
          <div className={styles.ganttScrollWrapper}>
            <div className={styles.ganttTable}>
              {/* Header: Timeline dates */}
              <div className={styles.ganttHeaderRow}>
                <div className={styles.assetHeaderCol}>Thiết bị / Biến thể</div>
                <div className={styles.timelineHeaderCols}>
                  {daysList.map((d) => (
                    <div
                      key={d.dateStr}
                      className={`${styles.dayCol} ${d.isWeekend ? styles.dayWeekend : ''} ${
                        d.isToday ? styles.dayToday : ''
                      }`}
                    >
                      <span className={styles.dayOfWeek}>{d.dayOfWeek}</span>
                      <span className={styles.dayNum}>{d.dayNumber}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variant Groups */}
              {ganttData.variantGroups.map((group) => {
                const occupancyMap = new Map();
                (group.dailyOccupancy || []).forEach((item) => {
                  const key = dayjs(item.date).format('YYYY-MM-DD');
                  occupancyMap.set(key, item);
                });

                return (
                  <div key={group.productVariantId} className={styles.variantSection}>
                    {/* Variant Title & Daily Occupancy Row */}
                    <div className={styles.variantSummaryRow}>
                      <div className={styles.variantTitleCol}>
                        <div className={styles.variantTitle}>{group.variantName}</div>
                        <div className={styles.variantMeta}>
                          SKU: {group.sku} • Tổng: {group.totalAssets} cái
                        </div>
                      </div>
                      <div className={styles.variantOccupancyGrid}>
                        {daysList.map((d) => {
                          const occ = occupancyMap.get(d.dateStr);
                          const occupied = occ?.occupiedCount ?? 0;
                          const isOver = occ?.isOverbooked ?? false;

                          return (
                            <div
                              key={d.dateStr}
                              className={`${styles.occCell} ${isOver ? styles.occOverbooked : ''}`}
                              title={`Ngày ${d.dayNumber}: Đang dùng ${occupied}/${group.totalAssets}`}
                            >
                              <span className={styles.occText}>
                                {occupied}/{group.totalAssets}
                              </span>
                              {isOver && <span className={styles.overbookedBadge}>!</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Asset Rows */}
                    {group.assets?.map((asset) => (
                      <div key={asset.assetId} className={styles.assetRow}>
                        <div className={styles.assetCodeCol}>
                          <span className={styles.assetCodeTag}>{asset.assetCode}</span>
                          <span className={styles.assetStatusMini}>{asset.assetStatus}</span>
                        </div>

                        <div className={styles.timelineRowTrack}>
                          {/* Grid background cells */}
                          <div className={styles.gridBgLayer}>
                            {daysList.map((d) => (
                              <div
                                key={d.dateStr}
                                className={`${styles.gridCell} ${d.isWeekend ? styles.gridWeekend : ''}`}
                              />
                            ))}
                          </div>

                          {/* Assignment Bars Layer */}
                          <div className={styles.barsLayer}>
                            {asset.assignments?.map((assign) => {
                              const resStart = dayjs(assign.reservedFrom).startOf('day');
                              const resEnd = dayjs(assign.reservedUntil).startOf('day');
                              const rangeStart = dayjs(startDateStr).startOf('day');
                              const rangeEnd = dayjs(startDateStr).add(daysCount, 'day').startOf('day');

                              // Bỏ qua nếu nằm ngoài khoảng đang xem
                              if (resEnd.isBefore(rangeStart) || resStart.isAfter(rangeEnd)) {
                                return null;
                              }

                              // Tính vị trí cột bắt đầu và số cột chiếm
                              const startOffset = Math.max(0, resStart.diff(rangeStart, 'day'));
                              const rawEndOffset = Math.min(daysCount, resEnd.diff(rangeStart, 'day') + 1);
                              const spanDays = Math.max(1, rawEndOffset - startOffset);

                              const leftPercent = (startOffset / daysCount) * 100;
                              const widthPercent = (spanDays / daysCount) * 100;

                              const isIssued = assign.status === 'Issued';
                              let sourceClass = styles.barRental;
                              if (assign.sourceType === 'TripProvided') sourceClass = styles.barTrip;
                              if (assign.sourceType === 'Promotion') sourceClass = styles.barPromo;

                              return (
                                <div
                                  key={assign.assignmentId}
                                  className={`${styles.ganttBar} ${sourceClass} ${
                                    isIssued ? styles.barIssued : styles.barReserved
                                  }`}
                                  style={{
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                  }}
                                  onClick={() => setSelectedAssignment(assign)}
                                  title={`${assign.sourceType}: ${assign.sourceCode} (${dayjs(assign.reservedFrom).format(
                                    'DD/MM'
                                  )} - ${dayjs(assign.reservedUntil).format('DD/MM')}) [${assign.status}]`}
                                >
                                  <span className={styles.barText}>
                                    {assign.sourceCode}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Assignment Detail Modal / Popover */}
      {selectedAssignment && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAssignment(null)}>
          <div className={styles.infoModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.infoModalHeader}>
              <h4 className={styles.infoModalTitle}>Chi tiết giữ chỗ thiết bị</h4>
              <button
                type="button"
                className={styles.infoModalClose}
                onClick={() => setSelectedAssignment(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.infoModalBody}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Loại nguồn:</span>
                <strong>{selectedAssignment.sourceType}</strong>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Mã tham chiếu:</span>
                <span className={styles.codeBadge}>{selectedAssignment.sourceCode}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Trạng thái:</span>
                <span>{selectedAssignment.status === 'Issued' ? 'Đã giao đồ (Issued)' : 'Đã giữ đồ (Reserved)'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Khoảng ngày:</span>
                <span>
                  {dayjs(selectedAssignment.reservedFrom).format('DD/MM/YYYY')} →{' '}
                  {dayjs(selectedAssignment.reservedUntil).format('DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { useAssets } from './hooks/useAssets';
import {
  ASSET_STATUS_BADGE,
  ASSET_STATUS_OPTIONS,
  SOURCE_TYPE_BADGE,
} from './constants/assetConstants';
import { MOCK_ASSETS_CATALOG } from './constants/mockFulfillmentData';
import BulkCreateAssetModal from './components/BulkCreateAssetModal';
import AssetDetailDrawer from './components/AssetDetailDrawer';
import styles from './AssetListPage.module.css';

export default function AssetListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 15;

  const [selectedAssetCode, setSelectedAssetCode] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [localUpdatedTimestamps, setLocalUpdatedTimestamps] = useState({});

  const queryParams = {
    search: searchTerm.trim() || undefined,
    assetStatus: selectedStatus || undefined,
    status: selectedStatus || undefined,
    pageNumber,
    pageSize,
  };

  const { data: pagedData, isLoading } = useAssets(queryParams);

  // Chuẩn hóa và kết hợp danh sách thiết bị để tìm kiếm theo tên tiếng Việt có/không dấu, mã số, SKU
  const displayItems = useMemo(() => {
    const serverItems = pagedData?.items || [];
    const serverCodes = new Set(serverItems.map((i) => i.assetCode.toUpperCase()));
    const extraMock = MOCK_ASSETS_CATALOG.filter((m) => !serverCodes.has(m.assetCode.toUpperCase()));
    let combined = [...serverItems, ...extraMock];

    if (selectedStatus) {
      combined = combined.filter((i) => (i.assetStatus || '').toLowerCase() === selectedStatus.toLowerCase());
    }

    if (searchTerm.trim()) {
      const normalize = (str) =>
        (str || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();

      const termNorm = normalize(searchTerm.trim());
      combined = combined.filter((i) => {
        const codeNorm = normalize(i.assetCode);
        const nameNorm = normalize(i.productName);
        const varNorm = normalize(i.variantName);
        const skuNorm = normalize(i.sku);
        return (
          codeNorm.includes(termNorm) ||
          nameNorm.includes(termNorm) ||
          varNorm.includes(termNorm) ||
          skuNorm.includes(termNorm)
        );
      });
    }

    return combined.map((item) => {
      const localUpdated = localUpdatedTimestamps[item.assetCode];
      if (localUpdated) {
        return {
          ...item,
          updatedAt: localUpdated.updatedAt,
          assetStatus: localUpdated.newStatus || item.assetStatus,
          conditionNote: localUpdated.conditionNote ?? item.conditionNote,
        };
      }
      return item;
    });
  }, [pagedData, selectedStatus, searchTerm, localUpdatedTimestamps]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNumber(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPageNumber(1);
  };

  const handleAssetUpdated = (code, updateInfo) => {
    setLocalUpdatedTimestamps((prev) => ({
      ...prev,
      [code]: {
        updatedAt: new Date().toISOString(),
        ...updateInfo,
      },
    }));
  };

  return (
    <div className={styles.container}>
      {/* Actions */}
      <div className={styles.header} style={{ justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div className={styles.actions}>
          <Link to={ROUTES.OPS_ASSETS_SCHEDULE} className={styles.btnSecondary}>
            Lịch phân bổ (Gantt)
          </Link>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setIsBulkModalOpen(true)}
          >
            + Thêm hàng loạt
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.searchCard}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên thiết bị (vd: lều, balo), SKU (TENT, PACK) hoặc số mã vạch (001, 002)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>
            Tìm kiếm
          </button>
        </form>

        <div className={styles.statusFilters}>
          <button
            type="button"
            className={`${styles.filterChip} ${selectedStatus === '' ? styles.activeChip : ''}`}
            onClick={() => handleStatusChange('')}
          >
            Tất cả trạng thái
          </button>
          {ASSET_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.filterChip} ${selectedStatus === opt.value ? styles.activeChip : ''}`}
              onClick={() => handleStatusChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <div className={styles.tableCard}>
        {isLoading && !displayItems.length ? (
          <div className={styles.loadingWrapper}>
            <Spinner />
            <span>Đang tải danh sách thiết bị...</span>
          </div>
        ) : displayItems.length === 0 ? (
          <div className={styles.emptyWrapper}>
            <p className={styles.emptyTitle}>Không tìm thấy thiết bị nào khớp từ khóa &quot;{searchTerm}&quot;</p>
            <p className={styles.emptyDesc}>
              Thử tìm kiếm với từ khóa khác (vd: <code>lều</code>, <code>balo</code>, <code>TENT</code>, <code>001</code>) hoặc bấm <strong>&quot;+ Thêm hàng loạt&quot;</strong> để cấp mã QR mới.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã thiết bị (QR / Barcode)</th>
                    <th>Sản phẩm & Biến thể</th>
                    <th>SKU</th>
                    <th>Trạng thái</th>
                    <th>Tình trạng ghi chú</th>
                    <th>Thời gian tạo & cập nhật</th>
                    <th>Đang phân bổ</th>
                    <th className={styles.thActions}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item) => {
                    const statusConfig = ASSET_STATUS_BADGE[item.assetStatus] || {
                      label: item.assetStatus,
                      bg: '#F3F4F6',
                      color: '#374151',
                      border: '#D1D5DB',
                    };
                    const assignment = item.currentAssignment;

                    return (
                      <tr key={item.id || item.assetCode} className={styles.tr}>
                        <td>
                          <button
                            type="button"
                            className={styles.assetCodeLink}
                            onClick={() => setSelectedAssetCode(item.assetCode)}
                            title="Xem chi tiết thiết bị"
                          >
                            <span className={styles.qrIcon}>▦</span>
                            <span className={styles.assetCodeText}>{item.assetCode}</span>
                          </button>
                        </td>
                        <td>
                          <div className={styles.productCell}>
                            <span className={styles.productName}>{item.productName}</span>
                            <span className={styles.variantName}>{item.variantName}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.skuTag}>{item.sku}</span>
                        </td>
                        <td>
                          <span
                            className={styles.statusBadge}
                            style={{
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color,
                              borderColor: statusConfig.border,
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td>
                          <span className={styles.conditionNote}>
                            {item.conditionNote || <span className={styles.textMuted}>Chưa cập nhật</span>}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '3px', whiteSpace: 'nowrap' }}>
                            <span title="Thời điểm tạo mới (CreatedAt)" style={{ color: '#166534', fontWeight: 500 }}>
                              🌱 Tạo: {item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss') : '—'}
                            </span>
                            <span title="Thời điểm cập nhật lần cuối (UpdatedAt)" style={{ color: '#475569', fontWeight: 500 }}>
                              🕒 Sửa: {item.updatedAt ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm:ss') : (item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss') : '—')}
                            </span>
                          </div>
                        </td>
                        <td>
                          {assignment ? (
                            <div className={styles.assignmentCell}>
                              <span
                                className={styles.sourceBadge}
                                style={{
                                  backgroundColor: SOURCE_TYPE_BADGE[assignment.sourceType]?.bg || '#f1f5f9',
                                  color: SOURCE_TYPE_BADGE[assignment.sourceType]?.color || '#334155',
                                  borderColor: SOURCE_TYPE_BADGE[assignment.sourceType]?.border || '#cbd5e1',
                                }}
                              >
                                {SOURCE_TYPE_BADGE[assignment.sourceType]?.label || assignment.sourceType}: {assignment.sourceCode}
                              </span>
                              <span className={styles.assignmentStatus}>
                                ({assignment.status === 'Issued' ? 'Đã giao' : 'Đã giữ'})
                              </span>
                            </div>
                          ) : (
                            <span className={styles.availableTag}>✓ Sẵn sàng trong kho</span>
                          )}
                        </td>
                        <td className={styles.tdActions}>
                          <button
                            type="button"
                            className={styles.btnDetail}
                            onClick={() => setSelectedAssetCode(item.assetCode)}
                          >
                            Chi tiết & Đổi trạng thái
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className={styles.paginationRow}>
              <Pagination
                pageNumber={pageNumber}
                totalPages={Math.ceil(displayItems.length / pageSize) || 1}
                totalCount={displayItems.length}
                pageSize={pageSize}
                onPageChange={setPageNumber}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal thêm thiết bị hàng loạt */}
      <BulkCreateAssetModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      {/* Drawer xem chi tiết thiết bị */}
      <AssetDetailDrawer
        assetCode={selectedAssetCode}
        isOpen={Boolean(selectedAssetCode)}
        onClose={() => setSelectedAssetCode(null)}
        onAssetUpdated={handleAssetUpdated}
      />
    </div>
  );
}

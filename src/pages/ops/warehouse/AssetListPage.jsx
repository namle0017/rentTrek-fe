import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import Spinner from '@/components/Spinner';
import OutdoorIcon from '@/components/OutdoorIcon';
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
  const [pageSize, setPageSize] = useState(10);

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

  // CRM Pagination data slicing
  const totalItems = displayItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(1, pageNumber), totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return displayItems.slice(startIndex, startIndex + pageSize);
  }, [displayItems, safePage, pageSize]);

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
      {/* Top Action Toolbar */}
      <div className={styles.topToolbar}>
        <div className={styles.pageMeta}>
          <span className={styles.itemCountBadge}>
            Tổng cộng <strong>{displayItems.length}</strong> thiết bị
          </span>
        </div>
        <div className={styles.actions}>
          <Link to={ROUTES.OPS_ASSETS_SCHEDULE} className={styles.btnSecondary}>
            <OutdoorIcon name="calendar" size={15} />
            <span>Lịch phân bổ (Gantt)</span>
          </Link>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setIsBulkModalOpen(true)}
          >
            <OutdoorIcon name="plus" size={15} />
            <span>Thêm hàng loạt</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterCard}>
        <div className={styles.filterHeader}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon} aria-hidden="true">
                <OutdoorIcon name="search" size={16} />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                aria-label="Tìm thiết bị theo tên, SKU hoặc mã vạch"
                placeholder="Tìm tên thiết bị, SKU (TENT, PACK) hoặc mã vạch (001)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageNumber(1);
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => {
                    setSearchTerm('');
                    setPageNumber(1);
                  }}
                  title="Xóa từ khóa"
                  aria-label="Xóa từ khóa"
                >
                  <OutdoorIcon name="close" size={13} />
                </button>
              )}
            </div>
            <button type="submit" className={styles.btnSearch}>
              Tìm kiếm
            </button>
          </form>

          {searchTerm.trim() && (
            <div className={styles.filterStats}>
              Tìm thấy <strong>{displayItems.length}</strong> kết quả khớp
            </div>
          )}
        </div>

        <div className={styles.statusTabs}>
          {ASSET_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.tabBtn} ${selectedStatus === opt.value ? styles.tabActive : ''}`}
              aria-pressed={selectedStatus === opt.value}
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
                    <th className={styles.colCode}>Mã thiết bị</th>
                    <th>Sản phẩm & Biến thể</th>
                    <th className={styles.colSku}>SKU</th>
                    <th className={styles.colStatus}>Trạng thái</th>
                    <th>Tình trạng / Ghi chú</th>
                    <th className={styles.colDate}>Thời gian cập nhật</th>
                    <th className={styles.colAssignment}>Phân bổ thực tế</th>
                    <th className={styles.thActions}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => {
                    const statusConfig = ASSET_STATUS_BADGE[item.assetStatus] || {
                      label: item.assetStatus,
                      bg: '#F3F4F6',
                      color: '#374151',
                      border: '#D1D5DB',
                    };
                    const assignment = item.currentAssignment;

                    return (
                      <tr key={item.id || item.assetCode} className={styles.tr}>
                        <td className={styles.colCode}>
                          <button
                            type="button"
                            className={styles.assetTag}
                            onClick={() => setSelectedAssetCode(item.assetCode)}
                            title="Bấm để xem chi tiết thiết bị"
                          >
                            {item.assetCode}
                          </button>
                        </td>
                        <td>
                          <div className={styles.productCell}>
                            <span className={styles.productName}>{item.productName}</span>
                            <span className={styles.variantName}>{item.variantName}</span>
                          </div>
                        </td>
                        <td className={styles.colSku}>
                          <span className={styles.skuTag}>{item.sku}</span>
                        </td>
                        <td className={styles.colStatus}>
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
                            {item.conditionNote || <span className={styles.textMuted}>—</span>}
                          </span>
                        </td>
                        <td className={styles.colDate}>
                          <div className={styles.dateCell}>
                            <span className={styles.dateUpdated}>
                              {item.updatedAt
                                ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm')
                                : item.createdAt
                                  ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')
                                  : '—'}
                            </span>
                            <span className={styles.dateCreated}>
                              Tạo: {item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY') : '—'}
                            </span>
                          </div>
                        </td>
                        <td className={styles.colAssignment}>
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
                            <span className={styles.availableTag}>
                              Sẵn sàng trong kho
                            </span>
                          )}
                        </td>
                        <td className={styles.tdActions}>
                          <button
                            type="button"
                            className={styles.btnDetail}
                            onClick={() => setSelectedAssetCode(item.assetCode)}
                            title="Xem chi tiết và đổi trạng thái thiết bị"
                          >
                            <OutdoorIcon name="eye" size={14} />
                            <span>Chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CRM Pagination Bar */}
            <div className={styles.paginationRow}>
              <div className={styles.paginationInfo}>
                Hiển thị{' '}
                <strong>
                  {totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, totalItems)}
                </strong>{' '}
                trên <strong>{totalItems}</strong> thiết bị
              </div>

              <div className={styles.paginationControls}>
                <div className={styles.pageSizeWrapper}>
                  <label htmlFor="pageSizeSelect" className={styles.pageSizeLabel}>
                    Hiển thị:
                  </label>
                  <select
                    id="pageSizeSelect"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageNumber(1);
                    }}
                    className={styles.pageSizeSelect}
                    aria-label="Số dòng hiển thị trên mỗi trang"
                  >
                    <option value={10}>10 dòng / trang</option>
                    <option value={15}>15 dòng / trang</option>
                    <option value={25}>25 dòng / trang</option>
                    <option value={50}>50 dòng / trang</option>
                  </select>
                </div>

                <div className={styles.pageButtons}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={safePage <= 1}
                    onClick={() => setPageNumber(1)}
                    title="Trang đầu"
                    aria-label="Trang đầu"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={safePage <= 1}
                    onClick={() => setPageNumber(safePage - 1)}
                    title="Trang trước"
                    aria-label="Trang trước"
                  >
                    ‹ Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && p - prev > 1;
                      return (
                        <span key={p} className={styles.pageNumberGroup}>
                          {showEllipsis && <span className={styles.pageEllipsis}>…</span>}
                          <button
                            type="button"
                            className={`${styles.pageNumberBtn} ${p === safePage ? styles.pageNumberActive : ''}`}
                            onClick={() => setPageNumber(p)}
                            aria-current={p === safePage ? 'page' : undefined}
                          >
                            {p}
                          </button>
                        </span>
                      );
                    })}

                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={safePage >= totalPages}
                    onClick={() => setPageNumber(safePage + 1)}
                    title="Trang sau"
                    aria-label="Trang sau"
                  >
                    Sau ›
                  </button>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={safePage >= totalPages}
                    onClick={() => setPageNumber(totalPages)}
                    title="Trang cuối"
                    aria-label="Trang cuối"
                  >
                    »
                  </button>
                </div>
              </div>
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

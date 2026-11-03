import { useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { useAssets } from './hooks/useAssets';
import {
  ASSET_STATUS_BADGE,
  ASSET_STATUS_OPTIONS,
  SOURCE_TYPE_BADGE,
} from './constants/assetConstants';
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

  const queryParams = {
    search: searchTerm.trim() || undefined,
    status: selectedStatus || undefined,
    pageNumber,
    pageSize,
  };

  const { data: pagedData, isLoading, isFetching } = useAssets(queryParams);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNumber(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPageNumber(1);
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <span className={styles.badgeO}>O20</span>
            <span className={styles.routePath}>/ops/assets</span>
          </div>
          <h1 className={styles.title}>Quản lý mã vạch & thiết bị kho (Asset)</h1>
          <p className={styles.subtitle}>
            Theo dõi từng cá thể thiết bị, mã QR vật lý, tình trạng bảo quản và trạng thái phân bổ.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to={ROUTES.OPS_ASSETS_SCHEDULE} className={styles.btnSecondary}>
            📅 Lịch phân bổ (Gantt)
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

      {/* Filter Bar */}
      <div className={styles.filterCard}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo mã thiết bị (TENT-...), SKU, tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className={styles.btnSearch}>
            Tìm kiếm
          </button>
        </form>

        <div className={styles.statusTabs}>
          {ASSET_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.tabBtn} ${selectedStatus === opt.value ? styles.tabActive : ''}`}
              onClick={() => handleStatusChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loadingWrapper}>
            <Spinner />
            <span>Đang tải danh sách thiết bị...</span>
          </div>
        ) : !pagedData?.items || pagedData.items.length === 0 ? (
          <div className={styles.emptyWrapper}>
            <p className={styles.emptyTitle}>Không tìm thấy thiết bị nào</p>
            <p className={styles.emptyDesc}>
              Thử tìm kiếm với từ khóa khác hoặc bấm <strong>"Thêm hàng loạt"</strong> để cấp mã QR cho biến thể mới.
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
                    <th>Đang phân bổ</th>
                    <th className={styles.thActions}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedData.items.map((item) => {
                    const statusConfig = ASSET_STATUS_BADGE[item.assetStatus] || {
                      label: item.assetStatus,
                      bg: '#F3F4F6',
                      color: '#374151',
                      border: '#D1D5DB',
                    };
                    const assignment = item.currentAssignment;

                    return (
                      <tr key={item.id} className={styles.tr}>
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
              <div className={styles.totalText}>
                Tổng cộng <strong>{pagedData.totalCount}</strong> thiết bị
                {isFetching && <span className={styles.fetchingText}>(Đang đồng bộ...)</span>}
              </div>
              <Pagination
                pageNumber={pagedData.pageNumber}
                totalPages={pagedData.totalPages}
                hasPrevious={pagedData.hasPrevious}
                hasNext={pagedData.hasNext}
                onPageChange={(page) => setPageNumber(page)}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals & Drawers */}
      <BulkCreateAssetModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      <AssetDetailDrawer
        assetCode={selectedAssetCode}
        isOpen={Boolean(selectedAssetCode)}
        onClose={() => setSelectedAssetCode(null)}
      />
    </div>
  );
}

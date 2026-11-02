import { useState } from 'react';
import {
  PAYMENT_PURPOSE,
  PAYMENT_PURPOSE_LABEL,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABEL,
  PAYMENT_TYPE,
  PAYMENT_TYPE_LABEL,
} from '@/constants/enums';
import styles from './finance.module.css';

export default function TransactionFilterBar({
  filters,
  onChange,
  onReset,
  onExportExcel,
  onExportCsv,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field, value) => {
    onChange({ ...filters, [field]: value, pageNumber: 1 });
  };

  const handleExport = onExportExcel || onExportCsv;

  // Đếm số lượng bộ lọc nâng cao đang được áp dụng
  const activeAdvCount = [
    filters.purpose && filters.purpose !== 'All',
    Boolean(filters.fromDate),
    Boolean(filters.toDate),
  ].filter(Boolean).length;

  return (
    <div className={styles.filterCard}>
      {/* Tầng 1: Thanh tìm kiếm & lọc nhanh cốt lõi */}
      <div className={styles.quickFilterRow}>
        <div className={styles.quickFilterLeft}>
          <input
            type="text"
            className={styles.quickSearchInput}
            placeholder="Tìm kiếm mã đơn (TRIP-...), mã giao dịch SePay..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
          />

          <select
            className={styles.quickSelect}
            value={filters.paymentType || 'All'}
            onChange={(e) => handleInputChange('paymentType', e.target.value)}
            title="Lọc theo loại dòng tiền"
          >
            <option value="All">Tất cả dòng tiền</option>
            <option value={PAYMENT_TYPE.COLLECTION}>{PAYMENT_TYPE_LABEL[PAYMENT_TYPE.COLLECTION]}</option>
            <option value={PAYMENT_TYPE.REFUND}>{PAYMENT_TYPE_LABEL[PAYMENT_TYPE.REFUND]}</option>
          </select>

          <select
            className={styles.quickSelect}
            value={filters.status || 'All'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            title="Lọc theo trạng thái"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value={PAYMENT_STATUS.SUCCEEDED}>{PAYMENT_STATUS_LABEL[PAYMENT_STATUS.SUCCEEDED]}</option>
            <option value={PAYMENT_STATUS.PENDING_APPROVAL}>
              {PAYMENT_STATUS_LABEL[PAYMENT_STATUS.PENDING_APPROVAL]}
            </option>
            <option value={PAYMENT_STATUS.PENDING}>{PAYMENT_STATUS_LABEL[PAYMENT_STATUS.PENDING]}</option>
            <option value={PAYMENT_STATUS.FAILED}>{PAYMENT_STATUS_LABEL[PAYMENT_STATUS.FAILED]}</option>
            <option value={PAYMENT_STATUS.CANCELLED}>{PAYMENT_STATUS_LABEL[PAYMENT_STATUS.CANCELLED]}</option>
          </select>
        </div>

        <div className={styles.quickFilterRight}>
          <button
            type="button"
            className={`${styles.btnAdvFilter} ${isExpanded || activeAdvCount > 0 ? styles.btnAdvFilterActive : ''}`}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            <span>Bộ lọc nâng cao</span>
            {activeAdvCount > 0 && (
              <span className={styles.filterBadgeCount}>{activeAdvCount}</span>
            )}
            <span>{isExpanded ? '▴' : '▾'}</span>
          </button>

          {handleExport && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExport}
              title="Xuất dữ liệu giao dịch ra file Excel"
            >
              Xuất file Excel
            </button>
          )}
        </div>
      </div>

      {/* Tầng 2: Bộ lọc nâng cao có thể thu gọn / mở rộng */}
      {isExpanded && (
        <div className={styles.collapsibleSection}>
          <div className={styles.collapsibleGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Mục đích thu / hoàn</label>
              <select
                className={styles.filterSelect}
                value={filters.purpose || 'All'}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
              >
                <option value="All">Tất cả mục đích</option>
                <option value={PAYMENT_PURPOSE.TOUR_FEE}>{PAYMENT_PURPOSE_LABEL[PAYMENT_PURPOSE.TOUR_FEE]}</option>
                <option value={PAYMENT_PURPOSE.RENTAL_FEE}>{PAYMENT_PURPOSE_LABEL[PAYMENT_PURPOSE.RENTAL_FEE]}</option>
                <option value={PAYMENT_PURPOSE.ADDITIONAL_CHARGE}>
                  {PAYMENT_PURPOSE_LABEL[PAYMENT_PURPOSE.ADDITIONAL_CHARGE]}
                </option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Từ ngày</label>
              <input
                type="date"
                className={styles.filterInput}
                value={filters.fromDate || ''}
                onChange={(e) => handleInputChange('fromDate', e.target.value)}
              >
              </input>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Đến ngày</label>
              <input
                type="date"
                className={styles.filterInput}
                value={filters.toDate || ''}
                onChange={(e) => handleInputChange('toDate', e.target.value)}
              >
              </input>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingBottom: 2 }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ height: 38, width: '100%' }}
                onClick={onReset}
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

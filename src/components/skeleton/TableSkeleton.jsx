import Skeleton from './Skeleton';
import styles from './Skeleton.module.css';

/**
 * TableSkeleton - Hiển thị khung bảng dữ liệu đang tải
 * @param {number} rows - Số dòng mô phỏng (mặc định: 5)
 * @param {number} cols - Số cột mô phỏng (mặc định: 6)
 * @param {boolean} hasToolbar - Có hiển thị thanh công cụ/bộ lọc không
 */
export default function TableSkeleton({ rows = 5, cols = 6, hasToolbar = true }) {
  const rowList = Array.from({ length: rows });
  const colList = Array.from({ length: cols });

  return (
    <div className={styles.tableSkeletonWrapper} role="status" aria-label="Đang tải dữ liệu...">
      {hasToolbar && (
        <div className={styles.tableToolbarSkeleton}>
          <Skeleton width="240px" height="38px" variant="rounded" />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Skeleton width="120px" height="38px" variant="rounded" />
            <Skeleton width="140px" height="38px" variant="rounded" />
          </div>
        </div>
      )}

      <div className={styles.tableHeaderSkeleton}>
        {colList.map((_, idx) => (
          <div key={`th-${idx}`} style={{ flex: idx === 0 ? 2 : 1 }}>
            <Skeleton width="70%" height="1.1rem" variant="text" />
          </div>
        ))}
      </div>

      {rowList.map((_, rIdx) => (
        <div key={`tr-${rIdx}`} className={styles.tableRowSkeleton}>
          {colList.map((_, cIdx) => (
            <div key={`td-${rIdx}-${cIdx}`} style={{ flex: cIdx === 0 ? 2 : 1 }}>
              <Skeleton
                width={cIdx === 0 ? '85%' : cIdx === cols - 1 ? '60%' : '75%'}
                height="1rem"
                variant="text"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

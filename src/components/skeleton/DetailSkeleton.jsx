import Skeleton from './Skeleton';
import styles from './Skeleton.module.css';

/**
 * DetailSkeleton - Hiển thị trang chi tiết đang tải (Header, Thống kê, Tabs, Bảng nội dung)
 */
export default function DetailSkeleton() {
  return (
    <div className={styles.detailSkeletonWrapper} role="status" aria-label="Đang tải chi tiết...">
      <div className={styles.detailHeaderSkeleton}>
        <div style={{ flex: 1 }}>
          <Skeleton width="40%" height="2rem" variant="text" />
          <Skeleton width="60%" height="1rem" variant="text" style={{ marginTop: '0.5rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Skeleton width="110px" height="38px" variant="rounded" />
          <Skeleton width="130px" height="38px" variant="rounded" />
        </div>
      </div>

      <div className={styles.statsGridSkeleton}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={`stat-${idx}`} className={styles.statCardSkeleton}>
            <Skeleton width="50%" height="0.85rem" variant="text" />
            <Skeleton width="75%" height="1.5rem" variant="text" />
          </div>
        ))}
      </div>

      <div className={styles.tabsSkeleton}>
        <Skeleton width="100px" height="32px" variant="rounded" />
        <Skeleton width="110px" height="32px" variant="rounded" />
        <Skeleton width="90px" height="32px" variant="rounded" />
        <Skeleton width="120px" height="32px" variant="rounded" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <Skeleton width="100%" height="60px" variant="rounded" />
        <Skeleton width="100%" height="120px" variant="rounded" />
        <Skeleton width="100%" height="80px" variant="rounded" />
      </div>
    </div>
  );
}

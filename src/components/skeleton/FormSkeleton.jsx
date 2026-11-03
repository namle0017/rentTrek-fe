import Skeleton from './Skeleton';
import styles from './Skeleton.module.css';

/**
 * FormSkeleton - Hiển thị form đang tải
 * @param {number} fields - Số trường form mô phỏng
 */
export default function FormSkeleton({ fields = 6 }) {
  const fieldList = Array.from({ length: fields });

  return (
    <div className={styles.formSkeletonWrapper} role="status" aria-label="Đang tải biểu mẫu...">
      <div style={{ marginBottom: '1.75rem' }}>
        <Skeleton width="45%" height="1.8rem" variant="text" />
        <Skeleton width="65%" height="1rem" variant="text" style={{ marginTop: '0.5rem' }} />
      </div>

      <div className={styles.formGridSkeleton}>
        {fieldList.map((_, idx) => (
          <div key={`field-${idx}`} className={styles.formFieldSkeleton}>
            <Skeleton width="40%" height="0.9rem" variant="text" />
            <Skeleton width="100%" height="40px" variant="rounded" />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
        <Skeleton width="100px" height="40px" variant="rounded" />
        <Skeleton width="130px" height="40px" variant="rounded" />
      </div>
    </div>
  );
}

import Skeleton from './Skeleton';
import styles from './Skeleton.module.css';

/**
 * CardSkeleton - Hiển thị danh sách thẻ (Tour/Sản phẩm) đang tải
 * @param {number} count - Số lượng thẻ (mặc định: 6)
 */
export default function CardSkeleton({ count = 6 }) {
  const cardList = Array.from({ length: count });

  return (
    <div className={styles.cardGridSkeleton} role="status" aria-label="Đang tải danh sách...">
      {cardList.map((_, idx) => (
        <div key={`card-${idx}`} className={styles.cardSkeleton}>
          <Skeleton width="100%" height="200px" variant="rectangular" />
          <div className={styles.cardBodySkeleton}>
            <Skeleton width="40%" height="0.85rem" variant="text" />
            <Skeleton width="85%" height="1.25rem" variant="text" />
            <Skeleton width="65%" height="0.9rem" variant="text" />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto',
                paddingTop: '0.75rem',
              }}
            >
              <Skeleton width="50%" height="1.2rem" variant="text" />
              <Skeleton width="80px" height="32px" variant="rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

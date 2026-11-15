import Spinner from '@/components/Spinner';
import { usePostReadAnalytics } from '../hooks/usePosts';
import styles from '../pages/AdminPosts.module.css';

/** Thống kê lượt đọc của bài viết (chỉ đọc) — GET /admin/posts/{id}/read-analytics. */
export default function PostReadAnalyticsPanel({ postId }) {
  const { data, isLoading, isError, error } = usePostReadAnalytics(postId);

  return (
    <section className={styles.panel} aria-label="Thống kê lượt đọc">
      <h2 className={styles.panelTitle}>Thống kê lượt đọc</h2>
      {isLoading && <Spinner />}
      {isError && <p role="alert">{error?.message || 'Không tải được thống kê lượt đọc.'}</p>}
      {data && (
        <dl>
          <div>
            <dt>Số người tham gia nhận bài</dt>
            <dd>{data.participantsCount}</dd>
          </div>
          <div>
            <dt>Số người đã đọc</dt>
            <dd>{data.readCount}</dd>
          </div>
          <div>
            <dt>Tỷ lệ đã đọc</dt>
            <dd>{data.readRate}%</dd>
          </div>
        </dl>
      )}
    </section>
  );
}

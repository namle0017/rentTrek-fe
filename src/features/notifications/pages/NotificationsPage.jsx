import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import styles from '@/features/orders/pages/MyOrdersPage.module.css';
import { formatDateTime } from '@/utils/formatDate';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications';

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useNotifications({
    unreadOnly: unreadOnly || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const changeFilter = (value) => {
    setUnreadOnly(value);
    setPage(1);
  };

  return (
    <section className={`container ${styles.page}`}>
      <header className={styles.header}>
        <span className={styles.kicker}>TÀI KHOẢN</span>
        <h1>Thông báo</h1>
      </header>

      <div className={styles.tabs}>
        <button type="button" aria-pressed={!unreadOnly} onClick={() => changeFilter(false)}>
          Tất cả
        </button>
        <button type="button" aria-pressed={unreadOnly} onClick={() => changeFilter(true)}>
          Chưa đọc
        </button>
        <button type="button" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
          Đánh dấu đã đọc tất cả
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState message={error.message || 'Không tải được thông báo'} onRetry={refetch} />
      ) : !data?.items?.length ? (
        <EmptyState message="Chưa có thông báo nào." />
      ) : (
        <>
          <div className={styles.list}>
            {data.items.map((n) => (
              <article
                key={n.notificationId}
                className={styles.card}
                style={n.isRead ? undefined : { borderColor: '#204b39' }}
              >
                <div className={styles.cardMain}>
                  <span className={styles.type}>{n.type}</span>
                  <strong>{n.title}</strong>
                  <small>{n.content}</small>
                </div>
                <div className={styles.cardSide}>
                  <small>{formatDateTime(n.createdAt)}</small>
                  {n.isRead ? (
                    <span className={styles.status}>Đã đọc</span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => markRead.mutate(n.notificationId)}
                      disabled={markRead.isPending}
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          <Pagination {...data} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}

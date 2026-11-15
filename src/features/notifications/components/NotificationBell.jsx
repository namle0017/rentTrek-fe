import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OutdoorIcon from '@/components/OutdoorIcon';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/utils/formatDate';
import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../hooks/useNotifications';
import { notificationRoute, notificationsPath } from '../utils/notificationRoute';
import styles from './NotificationBell.module.css';

const PREVIEW_SIZE = 6;
const MAX_ALERTS = 5;

/**
 * Chuông duy nhất trên header Guide/Admin/Staff (khách dùng chuông của MainLayout).
 * Mở ra một danh sách gộp: cảnh báo vận hành (khi có `alertsEndpoint`) ở trên, thông báo cá nhân ở dưới.
 * Badge = số thông báo chưa đọc + số cảnh báo đang mở.
 */
export default function NotificationBell({ alertsEndpoint }) {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const { data: unreadCount = 0 } = useUnreadNotificationCount(isAuthenticated);
  const notifications = useNotifications({ page: 1, pageSize: PREVIEW_SIZE }, isAuthenticated && open);
  const alerts = useOperations(alertsEndpoint, undefined, isAuthenticated);
  const markRead = useMarkNotificationRead();

  const alertItems = alertsEndpoint && Array.isArray(alerts.data) ? alerts.data.slice(0, MAX_ALERTS) : [];
  const alertCount = alertsEndpoint && Array.isArray(alerts.data) ? alerts.data.length : 0;
  const notificationItems = notifications.data?.items ?? [];
  const badgeCount = unreadCount + alertCount;
  const allPath = notificationsPath(currentUser?.role);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const openNotification = (n) => {
    setOpen(false);
    if (!n.isRead) markRead.mutate(n.notificationId);
    const target = notificationRoute(n, currentUser?.role);
    navigate(target || allPath);
  };

  const isLoading = notifications.isFetching || (alertsEndpoint && alerts.isPending);
  const isEmpty = !alertItems.length && !notificationItems.length;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.bell}
        aria-label={`Thông báo, ${badgeCount} mục mới`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
      >
        <OutdoorIcon name="bell" size={18} />
        {badgeCount > 0 && <span className={styles.badge}>{badgeCount > 99 ? '99+' : badgeCount}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Thông báo">
          <div className={styles.panelHeader}>
            <strong>Thông báo</strong>
            {unreadCount > 0 && <span>{unreadCount} chưa đọc</span>}
          </div>

          <div className={styles.list}>
            {isLoading && isEmpty ? (
              <p className={styles.empty}>Đang tải…</p>
            ) : isEmpty ? (
              <p className={styles.empty}>Chưa có thông báo nào.</p>
            ) : (
              <>
                {alertItems.map((alert, index) => (
                  <Link
                    key={alert.entityId ?? `alert-${index}`}
                    to={alert.actionUrl || allPath}
                    className={`${styles.item} ${styles.alertItem}`}
                    onClick={() => setOpen(false)}
                  >
                    <span className={styles.tag}>Cảnh báo</span>
                    <strong>{alert.title}</strong>
                    {alert.message && <small>{alert.message}</small>}
                  </Link>
                ))}
                {notificationItems.map((n) => (
                  <button
                    key={n.notificationId}
                    type="button"
                    className={`${styles.item} ${n.isRead ? '' : styles.unread}`}
                    onClick={() => openNotification(n)}
                  >
                    <strong>{n.title}</strong>
                    {n.content && <small>{n.content}</small>}
                    <time>{formatDateTime(n.createdAt)}</time>
                  </button>
                ))}
              </>
            )}
          </div>

          <Link to={allPath} className={styles.viewAll} onClick={() => setOpen(false)}>
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
}

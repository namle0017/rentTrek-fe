import { useState } from 'react';
import Spinner from '@/components/Spinner';
import { formatDateTime } from '@/utils/formatDate';
import { useRevokeOtherSessions } from '../hooks/useRevokeOtherSessions';
import { useRevokeSession } from '../hooks/useRevokeSession';
import { useSessions } from '../hooks/useSessions';
import styles from './ActiveSessionsList.module.css';

export default function ActiveSessionsList() {
  const { data: sessions, isLoading, isError } = useSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeOtherSessionsMutation = useRevokeOtherSessions();
  const [confirmRevokeOthers, setConfirmRevokeOthers] = useState(false);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
        <span className={styles.loadingText}>Đang tải danh sách thiết bị...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorBanner}>
        Không thể tải danh sách phiên làm việc. Vui lòng tải lại trang.
      </div>
    );
  }

  const sessionList = sessions || [];
  const otherSessionsCount = sessionList.filter((s) => !s.isCurrent).length;

  const handleRevokeSingle = (familyId) => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất tài khoản khỏi thiết bị này?')) {
      revokeSessionMutation.mutate(familyId);
    }
  };

  const handleRevokeOthers = () => {
    revokeOtherSessionsMutation.mutate(undefined, {
      onSuccess: () => {
        setConfirmRevokeOthers(false);
      },
    });
  };

  const getDeviceIcon = (deviceInfo = '') => {
    const lower = deviceInfo.toLowerCase();
    if (lower.includes('iphone') || lower.includes('android') || lower.includes('ipad')) {
      return '📱';
    }
    return '💻';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Thiết bị & Phiên làm việc</h2>
          <p className={styles.subtitle}>
            Danh sách các trình duyệt và thiết bị đã đăng nhập vào tài khoản của bạn.
          </p>
        </div>

        {otherSessionsCount > 0 && (
          <button
            type="button"
            className={`btn ${styles.btnRevokeAll}`}
            onClick={() => setConfirmRevokeOthers(true)}
            disabled={revokeOtherSessionsMutation.isPending}
          >
            Đăng xuất tất cả thiết bị khác ({otherSessionsCount})
          </button>
        )}
      </div>

      {confirmRevokeOthers && (
        <div className={styles.confirmBox}>
          <div className={styles.confirmContent}>
            <strong>Xác nhận đăng xuất từ xa?</strong>
            <p>
              Tất cả {otherSessionsCount} thiết bị khác sẽ bị ngắt kết nối ngay lập tức. Thiết bị hiện
              tại của bạn vẫn được duy trì.
            </p>
          </div>
          <div className={styles.confirmActions}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setConfirmRevokeOthers(false)}
              disabled={revokeOtherSessionsMutation.isPending}
            >
              Hủy
            </button>
            <button
              type="button"
              className={`btn ${styles.btnConfirmDanger}`}
              onClick={handleRevokeOthers}
              disabled={revokeOtherSessionsMutation.isPending}
            >
              {revokeOtherSessionsMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đăng xuất'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.sessionList}>
        {sessionList.map((session) => (
          <div
            key={session.familyId}
            className={`${styles.sessionCard} ${session.isCurrent ? styles.sessionCardCurrent : ''}`}
          >
            <div className={styles.deviceIconWrapper}>
              <span>{getDeviceIcon(session.deviceInfo)}</span>
            </div>

            <div className={styles.sessionDetails}>
              <div className={styles.deviceHeader}>
                <span className={styles.deviceName}>{session.deviceInfo}</span>
                {session.isCurrent && (
                  <span className={styles.currentBadge}>
                    <span className={styles.currentDot} />
                    Thiết bị hiện tại
                  </span>
                )}
              </div>

              <div className={styles.metaRow}>
                {session.ipAddress && (
                  <span className={styles.metaText}>
                    <strong>IP:</strong> {session.ipAddress}
                  </span>
                )}
                <span className={styles.metaText}>
                  <strong>Đăng nhập:</strong> {formatDateTime(session.createdAt)}
                </span>
                <span className={styles.metaText}>
                  <strong>Hoạt động gần nhất:</strong> {formatDateTime(session.lastActiveAt)}
                </span>
              </div>
            </div>

            <div className={styles.sessionAction}>
              {session.isCurrent ? (
                <span className={styles.activeText}>Đang dùng</span>
              ) : (
                <button
                  type="button"
                  className={styles.btnRevokeSingle}
                  onClick={() => handleRevokeSingle(session.familyId)}
                  disabled={revokeSessionMutation.isPending}
                  title="Đăng xuất khỏi thiết bị này"
                >
                  Đăng xuất
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

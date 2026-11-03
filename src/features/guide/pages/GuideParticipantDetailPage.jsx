import { useNavigate, useParams } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ATTENDANCE_STATUS_LABEL } from '@/constants/enums';
import { formatDate } from '@/utils/formatDate';
import { useGuideParticipantDetail } from '../hooks/useGuidePortal';
import styles from './GuidePortal.module.css';

export default function GuideParticipantDetailPage() {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const { data: detail, isLoading, isError, error, refetch } = useGuideParticipantDetail(participantId);

  if (isLoading) return <Spinner />;
  if (isError || !detail) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <>
      <div>
        <button type="button" className={styles.btnOutline} onClick={() => navigate(-1)}>
          ← Quay lại danh sách nhóm
        </button>
      </div>

      <div className={styles.tripCard}>
        <h1 className={styles.cardTitle}>{detail.fullName} (Hồ sơ An toàn - Màn G03)</h1>
        <p className={styles.metaText}>
          Ngày sinh: {detail.dateOfBirth || 'Chưa cập nhật'} {detail.age ? `(${detail.age} tuổi)` : ''}
        </p>
        <p className={styles.metaText}>Email: {detail.email}</p>
        {detail.phone && (
          <a href={`tel:${detail.phone}`} className={styles.btnPrimary}>
            📞 Gọi trực tiếp cho khách: {detail.phone}
          </a>
        )}
      </div>

      {/* Khối Liên hệ khẩn cấp (Emergency Contact) nổi bật cho cứu hộ thực địa */}
      <div className={styles.emergencyBox}>
        <h2 className={styles.cardTitle} style={{ color: '#991b1b' }}>
          🆘 Người Liên Hệ Khẩn Cấp (Emergency Contact)
        </h2>
        <p className={styles.metaText} style={{ color: '#7f1d1d', fontWeight: 600 }}>
          Họ tên: {detail.emergencyContact?.name || 'Chưa đăng ký'}
        </p>
        {detail.emergencyContact?.phone ? (
          <a href={`tel:${detail.emergencyContact.phone}`} className={styles.callBtn}>
            🚨 GỌI CỨU HỘ KHẨN CẤP: {detail.emergencyContact.phone}
          </a>
        ) : (
          <p className={styles.metaText}>Khách chưa cung cấp số điện thoại liên hệ khẩn cấp.</p>
        )}
      </div>

      {/* Thiết bị bảo hộ cấp phát */}
      <div className={styles.tripCard}>
        <h2 className={styles.cardTitle}>
          🎒 Thiết bị & Đồ bảo hộ của đoàn ({detail.assignedAssets?.length ?? 0})
        </h2>
        {!detail.assignedAssets || detail.assignedAssets.length === 0 ? (
          <p className={styles.metaText}>Chưa có thiết bị cấp phát nào được ghi nhận.</p>
        ) : (
          detail.assignedAssets.map((asset) => (
            <div
              key={`${asset.assetId}-${asset.assetCode}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div>
                <strong>{asset.productName}</strong>
                <div className={styles.metaText}>Nhận lúc: {formatDate(asset.assignedAt)}</div>
              </div>
              <span className={`${styles.badge} ${styles.badgePositive}`}>{asset.assetCode}</span>
            </div>
          ))
        )}
      </div>

      {/* Lịch sử điểm danh qua các chặng */}
      <div className={styles.tripCard}>
        <h2 className={styles.cardTitle}>
          🕒 Lịch sử Điểm danh các chặng ({detail.attendanceHistory?.length ?? 0})
        </h2>
        {!detail.attendanceHistory || detail.attendanceHistory.length === 0 ? (
          <p className={styles.metaText}>Chưa có lịch sử điểm danh nào.</p>
        ) : (
          detail.attendanceHistory.map((item) => (
            <div
              key={`${item.activityId}-${item.checkedAt}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div>
                <strong>
                  Ngày {item.dayNumber}: {item.activityName}
                </strong>
                <div className={styles.metaText}>{formatDate(item.checkedAt)}</div>
              </div>
              <span className={`${styles.badge} ${styles.badgePositive}`}>
                {ATTENDANCE_STATUS_LABEL[item.status] ?? item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

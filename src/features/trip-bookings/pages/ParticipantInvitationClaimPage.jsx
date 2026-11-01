import { Link, useLocation, useParams } from 'react-router-dom';
import OutdoorIcon from '@/components/OutdoorIcon';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/formatDate';
import { useInvitationPreview } from '../hooks/useTripBookings';
import styles from './ParticipantInvitationClaimPage.module.css';

const groupByDay = (activities) => {
  const days = new Map();
  activities.forEach((activity) => {
    if (!days.has(activity.dayNumber)) days.set(activity.dayNumber, []);
    days.get(activity.dayNumber).push(activity);
  });
  return [...days.entries()];
};

/** Link chỉ đọc cho nhóm: token nằm sau dấu #, không cần đăng nhập, không gán tài khoản. */
export default function ParticipantInvitationClaimPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const token = new URLSearchParams(location.hash.slice(1)).get('t') ?? '';
  const { data: preview, isLoading, isError } = useInvitationPreview(orderId, token);

  if (isLoading) return <Spinner fullScreen />;

  if (!token || isError || !preview) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <span className={styles.kicker}>LINK XEM CHUYẾN</span>
          <h1>Link không còn hiệu lực</h1>
          <p className={styles.intro}>
            Link sai, đã được đổi hoặc chuyến đã kết thúc. Hãy nhờ người đặt gửi lại link mới.
          </p>
          <Link className={styles.submit} to={ROUTES.HOME}>
            Về trang chủ
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icon}>
          <OutdoorIcon name="users" size={28} />
        </div>
        <span className={styles.kicker}>THÔNG TIN CHUYẾN ĐI</span>
        <h1>{preview.tourName}</h1>
        <p className={styles.intro}>
          {formatDateTime(preview.tripStartAt)} – {formatDateTime(preview.tripEndAt)} · Đặt bởi{' '}
          <b>{preview.buyerName}</b>
        </p>

        <h2 className={styles.step}>Đoàn của bạn · {preview.participantNames.length} người</h2>
        <ul className={styles.names}>
          {preview.participantNames.map((name, index) => (
            <li key={`${name}-${index}`}>{name}</li>
          ))}
        </ul>

        {preview.activities.length > 0 && <h2 className={styles.step}>Lịch hoạt động dự kiến</h2>}
        {groupByDay(preview.activities).map(([dayNumber, activities]) => (
          <section key={dayNumber} className={styles.day}>
            <h3>{activities[0].dayTitle || `Ngày ${dayNumber}`}</h3>
            <ol>
              {activities.map((activity) => (
                <li key={activity.activityId} className={activity.isCurrent ? styles.current : undefined}>
                  <time>{activity.startTime.slice(0, 5)}</time>
                  <div>
                    <strong>{activity.name}</strong>
                    {activity.isCurrent && <span className={styles.currentBadge}>Đang diễn ra theo lịch</span>}
                    {activity.description && <p>{activity.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <p className={styles.securityNote}>Link hết hạn lúc {formatDateTime(preview.expiresAt)}. Giờ theo lịch dự kiến.</p>
      </section>
    </main>
  );
}

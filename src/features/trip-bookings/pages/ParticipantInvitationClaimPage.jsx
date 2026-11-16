import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import OutdoorIcon from '@/components/OutdoorIcon';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/formatDate';
import TripActivitiesSection from '../components/TripActivitiesSection';
import { useInvitationPreview } from '../hooks/useTripBookings';
import row from '../components/ParticipantRow.module.css';
import styles from './ParticipantInvitationClaimPage.module.css';
import detail from './TripBookingDetailPage.module.css';

const TIMELINE = ['Đặt chỗ', 'Thanh toán', 'Chờ khởi hành', 'Hoàn tất'];

/** Link chỉ đọc cho nhóm: token nằm sau dấu #, không cần đăng nhập, không gán tài khoản. */
export default function ParticipantInvitationClaimPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const token = new URLSearchParams(location.hash.slice(1)).get('t') ?? '';
  const { data: preview, isLoading, isError } = useInvitationPreview(orderId, token);
  const [now] = useState(Date.now);

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

  const isOngoing = new Date(preview.tripStartAt).getTime() <= now;
  const memberCount = preview.participantNames.length;

  return (
    <main className={detail.page}>
      <Breadcrumb items={[{ label: 'Trang chủ', to: ROUTES.HOME }, { label: 'Chuyến đi của đoàn' }]} />

      <header className={detail.header}>
        <div className={detail.headerInfo}>
          <span className={detail.kicker}>CHUYẾN ĐI CỦA ĐOÀN</span>
          <h1>{preview.tourName}</h1>
          <p className={detail.tripDates}>
            <OutdoorIcon name="calendar" size={16} />
            <span>
              {formatDateTime(preview.tripStartAt)} — {formatDateTime(preview.tripEndAt)}
            </span>
          </p>
        </div>
        <div className={detail.badges}>
          <span className={`${detail.badge} ${detail.badgeSuccess}`}>
            {isOngoing ? 'Đang diễn ra' : 'Đã xác nhận'}
          </span>
        </div>
      </header>

      <section className={detail.timelineSection} aria-label="Tiến trình chuyến đi">
        <ol className={detail.timeline}>
          {TIMELINE.map((label, index) => (
            <li
              key={label}
              className={index < 2 ? detail.timelineDone : index === 2 ? detail.timelineActive : undefined}
              aria-current={index === 2 ? 'step' : undefined}
            >
              <span className={detail.stepIndicator}>{index < 2 ? '✓' : index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      </section>

      <div className={detail.layout}>
        <div className={detail.mainColumn}>
          <section className={detail.participants} aria-label="Danh sách thành viên đoàn">
            <div className={detail.sectionTitle}>
              <div>
                <span className={detail.kicker}>ĐOÀN CỦA BẠN</span>
                <h2>Danh sách người tham gia</h2>
              </div>
              <span className={detail.countBadge}>{memberCount} người</span>
            </div>
            <div className={detail.participantList}>
              {preview.participantNames.map((name, index) => (
                <article key={`${name}-${index}`} className={row.row}>
                  <div className={row.summary}>
                    <span className={row.avatar}>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{name}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <TripActivitiesSection activities={preview.activities} />
        </div>

        <aside className={detail.sideColumn}>
          <section className={detail.summaryCard} aria-label="Tóm tắt chuyến đi">
            <div className={detail.summaryHeader}>
              <span className={detail.kicker}>TÓM TẮT CHUYẾN ĐI</span>
            </div>
            <dl className={detail.summaryList}>
              <div>
                <dt>Người đặt</dt>
                <dd>{preview.buyerName}</dd>
              </div>
              <div>
                <dt>Số người</dt>
                <dd>{memberCount} người</dd>
              </div>
              <div>
                <dt>Khởi hành</dt>
                <dd>{formatDateTime(preview.tripStartAt)}</dd>
              </div>
              <div>
                <dt>Kết thúc</dt>
                <dd>{formatDateTime(preview.tripEndAt)}</dd>
              </div>
            </dl>
            <div className={detail.paymentStatusBadgeRow}>
              <span>Trạng thái:</span>
              <strong className={detail.paidText}>Đã thanh toán</strong>
            </div>
          </section>

          <section className={detail.shareCard} aria-label="Theo dõi chuyến trong tài khoản">
            <div className={detail.shareCardHeader}>
              <span className={detail.kicker}>BẠN LÀ THÀNH VIÊN ĐOÀN?</span>
            </div>
            <p className={styles.memberHint}>
              Đăng nhập bằng email người đặt đã khai cho bạn để xem chuyến này trong mục Chuyến đi của tôi.
            </p>
            <Link className={styles.submit} to={ROUTES.LOGIN}>
              Đăng nhập
            </Link>
            <p className={styles.securityNote}>
              Link hết hạn lúc {formatDateTime(preview.expiresAt)}. Giờ theo lịch dự kiến.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

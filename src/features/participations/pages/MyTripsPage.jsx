import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { TRIP_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import styles from '@/features/orders/pages/MyOrdersPage.module.css';
import AccountShell from '@/features/users/components/AccountShell';
import { formatDateTime } from '@/utils/formatDate';
import {
  useMarkParticipantPostRead,
  useMyParticipations,
  useParticipantPosts,
  useSaveParticipantReview,
} from '../hooks/useParticipations';

function ParticipantPosts({ participantId }) {
  const { data: posts, isLoading, isError, error } = useParticipantPosts(participantId);
  const markRead = useMarkParticipantPostRead(participantId);

  if (isLoading) return <Spinner />;
  if (isError) return <small>{error.message || 'Không tải được bài viết.'}</small>;
  if (!posts?.length) return <small>Chưa có bài viết chuẩn bị cho chuyến này.</small>;

  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {posts.map((post) => (
        <li key={post.postId}>
          <Link
            to={ROUTES.GUIDE_DETAIL(post.slug)}
            onClick={() => !post.isRead && markRead.mutate(post.postId)}
          >
            {post.title}
          </Link>{' '}
          <small>{post.isRead ? '· Đã đọc' : '· Chưa đọc'}</small>
        </li>
      ))}
    </ul>
  );
}

function ReviewForm({ participation }) {
  // Sửa review: điền sẵn số sao + nội dung cũ từ danh sách chuyến
  const [rating, setRating] = useState(participation.reviewRating ?? 5);
  const [comment, setComment] = useState(participation.reviewComment ?? '');
  const save = useSaveParticipantReview(participation.participantId, participation.hasReview);

  const handleSubmit = (e) => {
    e.preventDefault();
    save.mutate({ rating, comment: comment.trim() || null });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
      <label>
        Số sao{' '}
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="Cảm nhận của bạn về chuyến đi (không bắt buộc)"
        aria-label="Nội dung đánh giá"
      />
      <button type="submit" className="btn btn-primary" disabled={save.isPending}>
        {participation.hasReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
      </button>
    </form>
  );
}

function TripCard({ participation: p }) {
  const [open, setOpen] = useState(false);
  const showReview = p.canReview || p.hasReview;

  return (
    <article className={styles.card} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18 }}>
        <div className={styles.cardMain}>
          <Link to={ROUTES.TOUR_DETAIL(p.tourId)}>
            <strong>{p.tourName}</strong>
          </Link>
          <small>
            {formatDateTime(p.startAt)} – {formatDateTime(p.endAt)}
          </small>
          {p.orderId && (
            <Link to={ROUTES.TRIP_BOOKING_DETAIL(p.orderId)}>
              <small>Xem đơn đặt tour</small>
            </Link>
          )}
        </div>
        <div className={styles.cardSide}>
          <span className={styles.status}>{TRIP_STATUS_LABEL[p.tripStatus] || p.tripStatus}</span>
          <button
            type="button"
            className="btn btn-outline"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open
              ? 'Thu gọn'
              : `Bài viết${p.unreadPostCount ? ` (${p.unreadPostCount} mới)` : ''}${showReview ? ' · Đánh giá' : ''}`}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ display: 'grid', gap: 14, paddingTop: 12 }}>
          <ParticipantPosts participantId={p.participantId} />
          {showReview && <ReviewForm participation={p} />}
        </div>
      )}
    </article>
  );
}

export default function MyTripsPage() {
  const { data, isLoading, isError, error, refetch } = useMyParticipations();

  return (
    <AccountShell active="trips">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Chuyến của tôi</h1>
          <p>Các chuyến trekking bạn đã tham gia hoặc sắp khởi hành.</p>
        </header>
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState message={error.message || 'Không tải được chuyến đi'} onRetry={refetch} />
        ) : !data?.length ? (
          <EmptyState message="Bạn chưa tham gia chuyến trekking nào." />
        ) : (
          <div className={styles.list}>
            {data.map((p) => (
              <TripCard key={p.participantId} participation={p} />
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}

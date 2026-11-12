import { useState } from 'react';
import Pagination from '@/components/Pagination';
import { formatDateTime } from '@/utils/formatDate';
import { useTourReviews } from '../hooks/useTours';

export default function TourReviews({ tourId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useTourReviews(tourId, { page, pageSize: 5 });

  if (isLoading) return <small>Đang tải đánh giá...</small>;
  if (isError) return <small>{error.message || 'Không tải được đánh giá.'}</small>;
  if (!data?.reviewCount) return <small>Chưa có đánh giá nào.</small>;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <strong>
        {Number(data.averageRating).toFixed(1)}/5 ★ ({data.reviewCount} đánh giá)
      </strong>
      {data.reviews.items.map((r) => (
        <blockquote key={r.reviewId} style={{ margin: 0 }}>
          <div>
            {'★'.repeat(r.rating)}
            {'☆'.repeat(5 - r.rating)} · <b>{r.reviewerName}</b>{' '}
            <small>{formatDateTime(r.createdAt)}</small>
          </div>
          {r.comment && <p style={{ margin: '4px 0 0' }}>{r.comment}</p>}
        </blockquote>
      ))}
      <Pagination {...data.reviews} onPageChange={setPage} />
    </div>
  );
}

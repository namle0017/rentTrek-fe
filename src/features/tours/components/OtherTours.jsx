import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useTours } from '../hooks/useTours';
import TourCard from './TourCard';
import styles from './OtherTours.module.css';

// Gợi ý vài tour đang mở để khách xem thêm; ẩn hẳn khi không có tour nào khác
export default function OtherTours({ excludeId, title = 'Chuyến đi khác' }) {
  const { data } = useTours({ pageNumber: 1, pageSize: 4, status: 'Active' });
  const tours = (data?.items ?? []).filter((tour) => tour.id !== excludeId).slice(0, 3);
  if (!tours.length) return null;

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.head}>
        <h2>{title}</h2>
        <Link to={ROUTES.TOURS}>Xem tất cả tour</Link>
      </div>
      <div className={styles.grid}>
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </section>
  );
}

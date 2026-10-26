import { Link, useParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import TourBookingCard from '../components/TourBookingCard';
import TourGallery from '../components/TourGallery';
import TourGearList from '../components/TourGearList';
import TourTimeline from '../components/TourTimeline';
import { useTour } from '../hooks/useTours';
import styles from './TourDetailPage.module.css';

export default function TourDetailPage() {
  const { tourId } = useParams();
  const { data: tour, isLoading, isError, error, refetch } = useTour(tourId);

  if (isLoading) return <Spinner fullScreen />;
  if (isError) return <ErrorState message={error.message || 'Không thể tải chi tiết tour'} onRetry={refetch} />;
  if (!tour) return <EmptyState message="Không tìm thấy thông tin tour trekking này." />;

  const durationText = `${tour.durationDays} ngày ${tour.durationNights} đêm`;

  return (
    <article>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to={ROUTES.HOME}>Trang chủ</Link>
        <span>/</span>
        <Link to={ROUTES.TOURS}>Tour trekking</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text)' }}>{tour.name}</span>
      </nav>

      {/* Header Info */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>{tour.name}</h1>
        <div className={styles.metaRow}>
          <span className={styles.difficultyBadge}>{tour.difficultyLevel}</span>
          <span className={styles.metaItem}>
            <span>⏱️</span> Thời lượng: {durationText}
          </span>
          {tour.locationName && (
            <span className={styles.metaItem}>
              <span>📍</span> Địa điểm: {tour.locationName}
            </span>
          )}
          {tour.categoryName && (
            <span className={styles.metaItem}>
              <span>🏷️</span> Phân loại: {tour.categoryName}
            </span>
          )}
        </div>
      </div>

      {/* 5-Image Gallery (Figma Node 269:874) */}
      <TourGallery images={tour.images} tourName={tour.name} />

      {/* Main Content Layout */}
      <div className={styles.contentLayout}>
        <div className={styles.mainColumn}>
          {/* Section 1: Overview Description */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>🌄</span> Tổng quan chuyến đi
            </h2>
            <div className={styles.descriptionText}>{tour.description}</div>
          </section>

          {/* Section 2: Detailed Timeline */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>🗺️</span> Lịch trình chi tiết ({durationText})
            </h2>
            <TourTimeline activities={tour.activities} />
          </section>

          {/* Section 3: Gear Checklist */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>🎒</span> Trang thiết bị & Chuẩn bị
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 16px' }}>
              TrekRent cung cấp miễn phí toàn bộ lều trại và phụ kiện trekking đạt chuẩn kiểm định an toàn{' '}
              {tour.inspectionRate}%. Bạn chỉ cần mang theo đồ dùng cá nhân cần thiết.
            </p>
            <TourGearList
              providedItems={tour.providedItems}
              preparationItems={tour.preparationItems}
            />
          </section>

          {/* Section 4: Policies and Notes */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>📋</span> Quy định an toàn & Hoàn hủy
            </h2>
            <ul className={styles.policyList}>
              <li className={styles.policyItem}>
                <span>🔹</span>
                <div>
                  <strong>Điều kiện sức khỏe:</strong> Phù hợp với người có thể lực khá, không mắc bệnh tim mạch, hen suyễn hay sợ độ cao nghiêm trọng.
                </div>
              </li>
              <li className={styles.policyItem}>
                <span>🔹</span>
                <div>
                  <strong>Chính sách hoàn hủy:</strong> Hủy trước 7 ngày được hoàn 100% tiền tour. Hủy trước 3 ngày hoàn 50%.
                </div>
              </li>
              <li className={styles.policyItem}>
                <span>🔹</span>
                <div>
                  <strong>Hoàn tiền cọc trang bị:</strong> Tiền cọc thiết bị ({tour.equipmentDeposit?.toLocaleString('vi-VN')} đ) được hoàn lại 100% ngay sau khi kết thúc chuyến đi và bàn giao đồ nguyên vẹn.
                </div>
              </li>
            </ul>
          </section>
        </div>

        {/* Right Sidebar: Booking Card */}
        <div className={styles.sidebarColumn}>
          <TourBookingCard tour={tour} />
        </div>
      </div>
    </article>
  );
}

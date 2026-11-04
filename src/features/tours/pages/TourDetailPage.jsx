import { Link, useParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import { DetailSkeleton } from '@/components/skeleton';
import { POST_TYPE_LABEL } from '@/constants/enums';
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

  if (isLoading) return <DetailSkeleton />;
  if (isError)
    return <ErrorState message={error.message || 'Không thể tải chi tiết tour'} onRetry={refetch} />;
  if (!tour) return <EmptyState message="Không tìm thấy thông tin tour trekking này." />;

  return (
    <article>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to={ROUTES.HOME}>Trang chủ</Link>
        <span>/</span>
        <Link to={ROUTES.TOURS}>Tour Trekking</Link>
        {tour.locationName && (
          <>
            <span>/</span>
            <span>{tour.locationName}</span>
          </>
        )}
        <span>/</span>
        <span className={styles.breadcrumbCurrent}>{tour.name}</span>
      </nav>

      {/* 5-Image Gallery (Figma Node 269:874) */}
      <TourGallery images={tour.images} tourName={tour.name} />

      <div className={styles.contentLayout}>
        <div className={styles.mainColumn}>
          <header className={styles.headerSection}>
            <h1 className={styles.title}>{tour.name}</h1>
            <p className={styles.location}>
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21Z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              {tour.coordinatesFormatted || tour.locationName}
            </p>
            <div className={styles.chips}>
              <span className={styles.chipVerified}>
                <OutdoorIcon name="check" size={14} /> Đã kiểm định {tour.inspectionRate}%
              </span>
              <span className={styles.chipLevel}>Cấp độ: {tour.difficultyLevel}</span>
              <span className={styles.chip}>{tour.durationFormatted}</span>
            </div>
            {tour.description && <p className={styles.description}>{tour.description}</p>}
          </header>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Lịch trình tour</h2>
            <TourTimeline activities={tour.activities} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Trang bị chuyến đi</h2>
            <TourGearList providedItems={tour.providedItems} preparationItems={tour.preparationItems} />
          </section>

          {tour.relatedPosts?.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Cẩm nang & bài viết gợi ý</h2>
                <span className={styles.sectionSubtitle}>
                  Kinh nghiệm và kiến thức chuẩn bị cho chuyến đi
                </span>
              </div>
              <div className={styles.relatedPostsGrid}>
                {tour.relatedPosts.map((post) => (
                  <article key={post.postId} className={styles.relatedPostCard}>
                    <span className={styles.postTypeBadge}>
                      {POST_TYPE_LABEL[post.postType] || post.postType}
                    </span>
                    <h3 className={styles.postTitle}>
                      <Link to={ROUTES.GUIDE_DETAIL(post.slug)}>{post.title}</Link>
                    </h3>
                    <Link to={ROUTES.GUIDE_DETAIL(post.slug)} className={styles.readMoreLink}>
                      <span>Xem chi tiết</span>
                      <OutdoorIcon name="arrow" size={13} />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className={`${styles.section} ${styles.reviewRow}`}>
            <h2 className={styles.sectionTitle}>Đánh giá từ trekker</h2>
            <strong>
              {tour.rating}/5 ★ ({tour.totalReviews} đánh giá)
            </strong>
          </section>
        </div>

        <div className={styles.sidebarColumn}>
          <TourBookingCard tour={tour} />
        </div>
      </div>
    </article>
  );
}

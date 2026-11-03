import { Link, useParams } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import AdminCatalogStatusBadge from '../components/AdminCatalogStatusBadge';
import { normalizeTourStatus } from '../constants/adminCatalogStatus';
import { useAdminTour } from '../hooks/useAdminCatalog';
import styles from './AdminCatalogDetail.module.css';

export default function AdminTourDetailPage() {
  const { tourId } = useParams();
  const { data: tour, isLoading, isError, error, refetch } = useAdminTour(tourId);

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

    const status = normalizeTourStatus(tour.status);
    const images = [...tour.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder);
    const days = [...new Set(tour.activities.map((activity) => activity.dayNumber))].sort((a, b) => a - b);

    return (
      <div className={styles.layout}>
        <div className={styles.main}>
          {images.length > 0 && (
            <div className={styles.gallery}>
              {images.slice(0, 4).map((image, index) => (
                <img key={image.id} src={image.imageUrl} alt={`Ảnh ${index + 1} của tour ${tour.name}`} loading="lazy" />
              ))}
            </div>
          )}

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Thông tin chung</h2>
            <dl className={styles.facts}>
              <div>
                <dt>Danh mục</dt>
                <dd>{tour.categoryName}</dd>
              </div>
              <div>
                <dt>Địa điểm</dt>
                <dd>{tour.locationName}</dd>
              </div>
              <div>
                <dt>Thời lượng</dt>
                <dd>
                  {tour.durationDays} ngày {tour.durationNights} đêm
                </dd>
              </div>
              <div>
                <dt>Độ khó</dt>
                <dd>{tour.difficultyLevel}</dd>
              </div>
              <div>
                <dt>Giá cơ sở</dt>
                <dd>{formatCurrency(tour.basePrice)}/người</dd>
              </div>
              <div>
                <dt>Cọc thiết bị</dt>
                <dd>{formatCurrency(tour.equipmentDeposit)}</dd>
              </div>
              {tour.groupMaxParticipants && (
                <div>
                  <dt>Tối đa mỗi nhóm</dt>
                  <dd>{tour.groupMaxParticipants} người</dd>
                </div>
              )}
            </dl>
            {tour.description && <p className={styles.description}>{tour.description}</p>}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Lịch trình</h2>
            {days.length === 0 ? (
              <p className={styles.hint}>Chưa có hoạt động.</p>
            ) : (
              days.map((day) => (
                <div key={day} className={styles.day}>
                  <h3>Ngày {day}</h3>
                  <ol className={styles.list}>
                    {tour.activities
                      .filter((activity) => activity.dayNumber === day)
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((activity) => (
                        <li key={activity.id}>
                          <strong>{activity.timeFormatted}</strong> {activity.name}
                          {activity.description && <span className={styles.muted}> — {activity.description}</span>}
                        </li>
                      ))}
                  </ol>
                </div>
              ))
            )}
          </section>

          <div className={styles.twoCols}>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Đồ được cấp</h2>
              {tour.providedItems.length ? (
                <ul className={styles.list}>
                  {tour.providedItems.map((item) => (
                    <li key={item.id}>
                      {item.itemName}
                      {item.quantity ? ` × ${item.quantity}` : ''}
                      {item.note && <span className={styles.muted}> — {item.note}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.hint}>Không có.</p>
              )}
            </section>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Khách tự chuẩn bị</h2>
              {tour.preparationItems.length ? (
                <ul className={styles.list}>
                  {tour.preparationItems.map((item) => (
                    <li key={item.id}>
                      {item.itemName}
                      {item.note && <span className={styles.muted}> — {item.note}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.hint}>Không có.</p>
              )}
            </section>
          </div>
        </div>

        <aside className={styles.side}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Trạng thái</h2>
            <p className={styles.statusNow}>
              <AdminCatalogStatusBadge status={status} />
            </p>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Chuyến đang mở bán</h2>
            {tour.availableTrips.length ? (
              <ul className={styles.list}>
                {tour.availableTrips.map((trip) => (
                  <li key={trip.id} className={styles.tripRow}>
                    <Link to={ROUTES.ADMIN_TRIP_DETAIL(trip.id)} className={styles.inlineLink}>
                      {formatDate(trip.startAt)} · Vận hành chuyến →
                    </Link>
                    <span className={styles.muted}>
                      Còn {trip.availableSlots}/{trip.totalSlots} chỗ · {formatCurrency(trip.pricePerPerson)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.hint}>Chưa có chuyến.</p>
            )}
          </section>

          <Link to={ROUTES.TOUR_DETAIL(tour.id)} className={styles.inlineLink} target="_blank" rel="noreferrer">
            Xem trang công khai ↗
          </Link>
        </aside>
      </div>
    );
  };

  return (
    <section className={styles.page} aria-labelledby="admin-tour-detail-title">
      <header>
        <p className={styles.eyebrow}>
          <Link to={ROUTES.ADMIN_TOURS}>Tour</Link> / Chi tiết
        </p>
        <h1 id="admin-tour-detail-title" className={styles.title}>
          {tour?.name ?? 'Chi tiết tour'}
        </h1>
      </header>
      {renderContent()}
    </section>
  );
}

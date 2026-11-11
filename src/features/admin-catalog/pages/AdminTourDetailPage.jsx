import { Link, useParams } from 'react-router-dom';
import {
  CalendarDays,
  Compass,
  DollarSign,
  Layers,
  MapPin,
  ExternalLink,
  PlusCircle,
  Repeat,
  Shield,
  Users,
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
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
    const images = [...tour.images].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder,
    );
    const primaryImage = images.find((img) => img.isPrimary) || images[0];
    const days = [...new Set(tour.activities.map((activity) => activity.dayNumber))].sort((a, b) => a - b);

    return (
      <div className={styles.layout}>
        {/* CỘT CHÍNH (65%): Thông số, Gallery, Lịch trình Timeline, Trang bị */}
        <div className={styles.main}>
          {/* 1. Fact Sheet Card */}
          <section className={styles.panel} aria-label="Thông số tổng quan tour">
            <h2 className={styles.panelTitle}>Thông tin chung</h2>
            <div className={styles.factGrid}>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>
                  <Layers size={14} /> Danh mục
                </span>
                <strong className={styles.factValue}>{tour.categoryName}</strong>
              </div>

              <div className={styles.factItem}>
                <span className={styles.factLabel}>
                  <MapPin size={14} /> Địa điểm chính
                </span>
                <strong className={styles.factValue}>{tour.locationName}</strong>
              </div>

              <div className={styles.factItem}>
                <span className={styles.factLabel}>
                  <CalendarDays size={14} /> Thời lượng
                </span>
                <strong className={styles.factValue}>
                  {tour.durationDays} ngày {tour.durationNights} đêm
                </strong>
              </div>

              <div className={styles.factItem}>
                <span className={styles.factLabel}>
                  <Compass size={14} /> Độ khó
                </span>
                <strong className={styles.factValue}>{tour.difficultyLevel}</strong>
              </div>

              <div className={styles.factItem}>
                <span className={styles.factLabel}>
                  <DollarSign size={14} /> Giá cơ sở
                </span>
                <strong className={styles.factValue}>
                  {formatCurrency(tour.basePrice)}
                  <small className={styles.factUnit}> / người</small>
                </strong>
              </div>

              <div className={styles.factItem}>
                <span className={styles.factLabel}>
                  <Shield size={14} /> Cọc thiết bị
                </span>
                <strong className={styles.factValue}>{formatCurrency(tour.equipmentDeposit)}</strong>
              </div>

              {tour.groupMaxParticipants && (
                <div className={styles.factItem}>
                  <span className={styles.factLabel}>
                    <Users size={14} /> Tối đa mỗi nhóm
                  </span>
                  <strong className={styles.factValue}>{tour.groupMaxParticipants} người</strong>
                </div>
              )}
            </div>

            {tour.description && (
              <div className={styles.descriptionBox}>
                <h3 className={styles.descriptionTitle}>Mô tả tổng quát</h3>
                <p className={styles.description}>{tour.description}</p>
              </div>
            )}
          </section>

          {/* 2. Media Gallery */}
          {images.length > 0 && (
            <section className={styles.panel} aria-label="Thư viện ảnh tour">
              <h2 className={styles.panelTitle}>Thư viện hình ảnh ({images.length})</h2>
              <div className={styles.galleryContainer}>
                {primaryImage && (
                  <div className={styles.primaryImageWrap}>
                    <img
                      src={primaryImage.imageUrl}
                      alt={`Ảnh chính của tour ${tour.name}`}
                      className={styles.primaryImg}
                    />
                    <span className={styles.primaryBadge}>Ảnh đại diện</span>
                  </div>
                )}
                <div className={styles.thumbnailStrip}>
                  {images.map((image, index) => (
                    <div key={image.id} className={styles.thumbnailWrap}>
                      <img
                        src={image.imageUrl}
                        alt={`Ảnh ${index + 1} của tour ${tour.name}`}
                        loading="lazy"
                        className={styles.thumbImg}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 3. Lịch trình hoạt động (Timeline View) */}
          <section className={styles.panel} aria-label="Lịch trình chi tiết các ngày">
            <h2 className={styles.panelTitle}>Lịch trình chi tiết</h2>
            {days.length === 0 ? (
              <p className={styles.hint}>Chưa có lịch trình hoạt động cho tour này.</p>
            ) : (
              <div className={styles.timelineList}>
                {days.map((day) => (
                  <div key={day} className={styles.timelineDayBlock}>
                    <div className={styles.dayHeadingRow}>
                      <span className={styles.dayBadge}>NGÀY {day}</span>
                    </div>
                    <ol className={styles.activitiesTimeline}>
                      {tour.activities
                        .filter((activity) => activity.dayNumber === day)
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((activity) => (
                          <li key={activity.id} className={styles.activityItem}>
                            <div className={styles.activityTimeNode}>
                              <span className={styles.timeTag}>{activity.timeFormatted}</span>
                            </div>
                            <div className={styles.activityBody}>
                              <strong className={styles.activityName}>{activity.name}</strong>
                              {activity.description && (
                                <p className={styles.activityDesc}>{activity.description}</p>
                              )}
                            </div>
                          </li>
                        ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 4. Trang bị & Chuẩn bị (2 Cột Song Song) */}
          <div className={styles.equipmentTwoCols}>
            <section className={styles.panel} aria-label="Đồ do RenTrek cấp">
              <div className={styles.panelHeaderRow}>
                <h2 className={styles.panelTitle}>Đồ được cấp</h2>
                <span className={styles.countBadge}>{tour.providedItems.length} món</span>
              </div>
              {tour.providedItems.length ? (
                <ul className={styles.itemChecklist}>
                  {tour.providedItems.map((item) => (
                    <li key={item.id} className={styles.checkItem}>
                      <div className={styles.checkItemContent}>
                        <span className={styles.checkItemName}>{item.itemName}</span>
                        {item.quantity && <span className={styles.qtyTag}>×{item.quantity}</span>}
                      </div>
                      {item.note && <span className={styles.mutedNote}>— {item.note}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.hint}>Chưa cấu hình đồ cấp cho tour này.</p>
              )}
            </section>

            <section className={styles.panel} aria-label="Khách tự chuẩn bị">
              <div className={styles.panelHeaderRow}>
                <h2 className={styles.panelTitle}>Khách tự chuẩn bị</h2>
                <span className={styles.countBadge}>{tour.preparationItems.length} món</span>
              </div>
              {tour.preparationItems.length ? (
                <ul className={styles.itemChecklist}>
                  {tour.preparationItems.map((item) => (
                    <li key={item.id} className={styles.checkItem}>
                      <div className={styles.checkItemContent}>
                        <span className={styles.checkItemName}>{item.itemName}</span>
                      </div>
                      {item.note && <span className={styles.mutedNote}>— {item.note}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.hint}>Không có lưu ý đặc biệt cho khách.</p>
              )}
            </section>
          </div>
        </div>

        {/* CỘT PHỤ (35%): Chuyến đang mở bán & Phím tắt Quản trị */}
        <aside className={styles.side}>
          {/* Card Chuyến đang mở bán */}
          <section className={styles.panel} aria-label="Danh sách chuyến đang mở bán">
            <div className={styles.panelHeaderRow}>
              <h2 className={styles.panelTitle}>Chuyến đang mở bán</h2>
              <span className={styles.countBadge}>{tour.availableTrips.length} chuyến</span>
            </div>

            {tour.availableTrips.length ? (
              <div className={styles.tripCardsList}>
                {tour.availableTrips.map((trip) => (
                  <article key={trip.id} className={styles.tripCardItem}>
                    <div className={styles.tripCardHeader}>
                      <span className={styles.tripDate}>{formatDate(trip.startAt)}</span>
                      <strong className={styles.tripPrice}>
                        {formatCurrency(trip.pricePerPerson)}
                      </strong>
                    </div>
                    <div className={styles.tripCardMeta}>
                      <span className={styles.slotsInfo}>
                        Còn <strong>{trip.availableSlots}</strong>/{trip.totalSlots} chỗ
                      </span>
                      <Link
                        to={ROUTES.ADMIN_TRIP_DETAIL(trip.id)}
                        className={styles.dispatchTripButton}
                      >
                        Vận hành chuyến →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyTripsBox}>
                <p className={styles.hint}>Hiện chưa có chuyến nào mở bán cho tour này.</p>
                <Link to={ROUTES.ADMIN_TRIP_CREATE} className={styles.actionBtnPrimary}>
                  <PlusCircle size={14} /> Thêm chuyến đi mới
                </Link>
              </div>
            )}
          </section>

          {/* Card Quản trị & Điều phối tour */}
          <section className={styles.panel} aria-label="Thao tác điều phối tour">
            <h2 className={styles.panelTitle}>Thao tác điều phối</h2>
            <div className={styles.quickOpsList}>
              <Link
                to={ROUTES.ADMIN_RECURRENCE_RULES(tour.id)}
                className={styles.quickOpLink}
              >
                <Repeat size={15} />
                <span>Quy tắc lịch lặp sinh chuyến</span>
              </Link>
              <Link to={ROUTES.ADMIN_TRIP_CREATE} className={styles.quickOpLink}>
                <PlusCircle size={15} />
                <span>Tạo chuyến đi thủ công</span>
              </Link>
              <Link
                to={ROUTES.TOUR_DETAIL(tour.id)}
                className={styles.quickOpLink}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={15} />
                <span>Xem trang công khai trên web</span>
              </Link>
            </div>
          </section>
        </aside>
      </div>
    );
  };

  return (
    <section className={styles.page} aria-labelledby="admin-tour-detail-title">
      <header className={styles.pageHeader}>
        <Breadcrumb
          items={[
            { label: 'Quản lý Tour', to: ROUTES.ADMIN_TOURS },
            tour?.name ? { label: tour.name } : { label: 'Chi tiết tour' },
          ]}
          isLoading={isLoading}
        />
        <div className={styles.titleRow}>
          <div className={styles.titleWithBadge}>
            <h1 id="admin-tour-detail-title" className={styles.title}>
              {tour?.name ?? 'Chi tiết tour'}
            </h1>
            {tour?.status && (
              <AdminCatalogStatusBadge status={normalizeTourStatus(tour.status)} />
            )}
          </div>
          {tour && (
            <div className={styles.headerToolbar}>
              <Link
                to={ROUTES.TOUR_DETAIL(tour.id)}
                className={styles.headerSecondaryBtn}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={14} /> Xem trang công khai
              </Link>
              <Link
                to={ROUTES.ADMIN_RECURRENCE_RULES(tour.id)}
                className={styles.headerPrimaryBtn}
              >
                <Repeat size={14} /> Lịch lặp Tour
              </Link>
            </div>
          )}
        </div>
      </header>

      {renderContent()}
    </section>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import AdminCatalogStatusBadge from '../components/AdminCatalogStatusBadge';
import { TOUR_STATUS_OPTIONS } from '../constants/adminCatalogStatus';
import { useAdminTours } from '../hooks/useAdminCatalog';
import styles from './AdminCatalogPage.module.css';

const INITIAL_FILTERS = { search: '', status: '' };

export default function AdminToursPage() {
  const navigate = useNavigate();
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const params = { pageNumber, pageSize: DEFAULT_PAGE_SIZE, ...filters };
  const { data: pagedTours, isLoading, isError, error, refetch, isFetching } = useAdminTours(params);

  const handleSubmit = (event) => {
    event.preventDefault();
    setPageNumber(DEFAULT_PAGE_NUMBER);
    setFilters({ search: draftFilters.search.trim(), status: draftFilters.status });
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    if (!pagedTours?.items.length) return <EmptyState message="Chưa có tour phù hợp với bộ lọc" />;

    return (
      <>
        <p className={styles.resultMeta} role="status">
          {isFetching ? 'Đang cập nhật danh sách…' : `${pagedTours.totalItems} tour`}
        </p>
        <div className={styles.tableCard} aria-busy={isFetching}>
          <div className={styles.tableScroll} tabIndex="0" aria-label="Bảng tour, cuộn ngang trên màn hình nhỏ">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Tour</th>
                  <th scope="col">Danh mục</th>
                  <th scope="col">Địa điểm</th>
                  <th scope="col">Thời lượng</th>
                  <th scope="col">Giá cơ sở</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Sắp tới</th>
                </tr>
              </thead>
              <tbody>
                {pagedTours.items.map((tour) => (
                  <tr
                    key={tour.tourId}
                    className={styles.clickableRow}
                    onClick={() => navigate(ROUTES.ADMIN_TOUR_DETAIL(tour.tourId))}
                  >
                    <td>
                      <div className={styles.entityCell}>
                        {tour.primaryImageUrl ? (
                          <img
                            className={styles.thumbnail}
                            src={tour.primaryImageUrl}
                            alt={`Ảnh tour ${tour.name}`}
                            width="56"
                            height="44"
                            loading="lazy"
                          />
                        ) : (
                          <span className={styles.thumbnailFallback} aria-hidden="true">
                            {tour.name?.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <Link to={ROUTES.ADMIN_TOUR_DETAIL(tour.tourId)} className={styles.entityName}>
                          {tour.name}
                        </Link>
                      </div>
                    </td>
                    <td>{tour.categoryName}</td>
                    <td>{tour.mainLocationName}</td>
                    <td className={styles.numeric}>
                      {tour.durationDays}N {tour.durationNights}Đ
                    </td>
                    <td className={styles.numeric}>{formatCurrency(tour.basePrice)}</td>
                    <td>
                      <AdminCatalogStatusBadge status={tour.status} />
                    </td>
                    <td className={styles.numeric}>{tour.upcomingTripsCount} chuyến</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          pageNumber={pagedTours.pageNumber}
          totalPages={pagedTours.totalPages}
          hasPrevious={pagedTours.hasPrevious}
          hasNext={pagedTours.hasNext}
          onPageChange={setPageNumber}
        />
      </>
    );
  };

  return (
    <section className={styles.page} aria-labelledby="admin-tours-title">

      <form className={styles.filters} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Tìm tour</span>
          <input
            type="search"
            value={draftFilters.search}
            placeholder="Tên tour"
            maxLength="200"
            onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
          />
        </label>
        <label className={styles.field}>
          <span>Trạng thái tour</span>
          <select
            value={draftFilters.status}
            onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
          >
            {TOUR_STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={`btn btn-primary ${styles.filterButton}`}>
          Lọc danh sách
        </button>
      </form>

      {renderContent()}
    </section>
  );
}

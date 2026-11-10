import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLE } from '@/constants/enums';
import AdminCatalogStatusBadge from '../components/AdminCatalogStatusBadge';
import { PRODUCT_STATUS_OPTIONS } from '../constants/adminCatalogStatus';
import { useAdminProducts } from '../hooks/useAdminCatalog';
import styles from './AdminCatalogPage.module.css';

const INITIAL_FILTERS = { search: '', status: '' };
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });

export default function AdminProductsPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const navigate = useNavigate();
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const params = { pageNumber, pageSize: DEFAULT_PAGE_SIZE, ...filters };
  const { data: pagedProducts, isLoading, isError, error, refetch, isFetching } = useAdminProducts(params);

  const handleSubmit = (event) => {
    event.preventDefault();
    setPageNumber(DEFAULT_PAGE_NUMBER);
    setFilters({ search: draftFilters.search.trim(), status: draftFilters.status });
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    if (!pagedProducts?.items.length) return <EmptyState message="Chưa có sản phẩm phù hợp với bộ lọc" />;

    return (
      <>
        <p className={styles.resultMeta} role="status">
          {isFetching ? 'Đang cập nhật danh sách…' : `${pagedProducts.totalItems} sản phẩm`}
        </p>
        <div className={styles.tableCard} aria-busy={isFetching}>
          <div
            className={styles.tableScroll}
            tabIndex="0"
            aria-label="Bảng sản phẩm, cuộn ngang trên màn hình nhỏ"
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Sản phẩm</th>
                  <th scope="col">Danh mục</th>
                  <th scope="col">Biến thể</th>
                  <th scope="col">Thiết bị sẵn sàng / tổng</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {pagedProducts.items.map((product) => {
                  const availabilityMax = Math.max(product.totalAssetsCount, 1);
                  return (
                    <tr
                      key={product.productId}
                      className={styles.clickableRow}
                      onClick={() => navigate(ROUTES.ADMIN_PRODUCT_DETAIL(product.productId))}
                    >
                      <td>
                        <div className={styles.entityCell}>
                          {product.primaryImageUrl ? (
                            <img
                              className={styles.thumbnail}
                              src={product.primaryImageUrl}
                              alt={`Ảnh sản phẩm ${product.name}`}
                              width="56"
                              height="44"
                              loading="lazy"
                            />
                          ) : (
                            <span className={styles.thumbnailFallback} aria-hidden="true">
                              {product.name?.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <Link
                            to={ROUTES.ADMIN_PRODUCT_DETAIL(product.productId)}
                            className={styles.entityName}
                          >
                            {product.name}
                          </Link>
                        </div>
                      </td>
                      <td>{product.categoryName}</td>
                      <td className={styles.numeric}>{product.variantsCount} biến thể</td>
                      <td>
                        <span className={styles.availability}>
                          <strong>
                            {product.availableAssetsCount} / {product.totalAssetsCount}
                          </strong>
                          <progress
                            value={product.availableAssetsCount}
                            max={availabilityMax}
                            aria-label={`${product.availableAssetsCount} trên ${product.totalAssetsCount} thiết bị sẵn sàng`}
                          />
                        </span>
                      </td>
                      <td>
                        <AdminCatalogStatusBadge status={product.status} />
                      </td>
                      <td className={styles.date}>{dateFormatter.format(new Date(product.createdAt))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          pageNumber={pagedProducts.pageNumber}
          totalPages={pagedProducts.totalPages}
          hasPrevious={pagedProducts.hasPrevious}
          hasNext={pagedProducts.hasNext}
          onPageChange={setPageNumber}
        />
      </>
    );
  };

  return (
    <section className={styles.page} aria-labelledby="admin-products-title">
      <div className={styles.header}>
        <h1 id="admin-products-title">Sản phẩm</h1>
        {isAdmin && (
          <Link className="btn btn-primary" to={ROUTES.ADMIN_PRODUCT_CREATE}>
            <span aria-hidden="true">＋</span> Thêm sản phẩm
          </Link>
        )}
      </div>
      <form className={styles.filters} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Tìm sản phẩm</span>
          <input
            type="search"
            value={draftFilters.search}
            placeholder="Tên sản phẩm"
            maxLength="200"
            onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
          />
        </label>
        <label className={styles.field}>
          <span>Trạng thái sản phẩm</span>
          <select
            value={draftFilters.status}
            onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
          >
            {PRODUCT_STATUS_OPTIONS.map((option) => (
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

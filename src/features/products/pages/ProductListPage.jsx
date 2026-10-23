import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import { useDebounce } from '@/hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import { PRODUCT_OFFERING_LABEL, PRODUCT_SORT_OPTIONS } from '../constants/productCatalog';
import { useProductCategories, useProducts } from '../hooks/useProducts';
import styles from './ProductCatalog.module.css';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get('pageNumber'));
  const pageNumber = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE_NUMBER;
  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const offeringType = searchParams.get('offeringType') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = searchParams.get('sortOrder') ?? 'desc';
  const [draft, setDraft] = useState(null);
  // URL navigation takes precedence over a draft typed against a previous search.
  const keyword = draft?.search === search ? draft.value : search;
  const debouncedKeyword = useDebounce(keyword.trim());

  useEffect(() => {
    if (debouncedKeyword === search || debouncedKeyword !== keyword.trim()) return;
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (debouncedKeyword) next.set('search', debouncedKeyword);
        else next.delete('search');
        next.delete('pageNumber');
        return next;
      },
      { replace: true },
    );
  }, [debouncedKeyword, keyword, search, setSearchParams]);

  const categoriesQuery = useProductCategories();
  const {
    data: pagedProducts,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProducts({
    pageNumber,
    pageSize: DEFAULT_PAGE_SIZE,
    search,
    categoryId,
    offeringType,
    sortBy,
    sortOrder,
  });

  const updateFilters = (changes) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      Object.entries(changes).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      next.delete('pageNumber');
      return next;
    });
  };

  const handlePageChange = (nextPage) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('pageNumber', String(nextPage));
      return next;
    });
  };

  const handleReset = () => {
    setDraft(null);
    setSearchParams({});
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
    return (
      <div aria-busy={isFetching}>
        <p className={styles.resultCount} role="status">
          {isFetching ? 'Đang cập nhật sản phẩm…' : `${pagedProducts.totalItems} sản phẩm`}
        </p>
        {pagedProducts.items.length === 0 ? (
          <EmptyState message="Không tìm thấy sản phẩm phù hợp">
            <button type="button" className="btn btn-outline" onClick={handleReset}>
              Xem tất cả sản phẩm
            </button>
          </EmptyState>
        ) : (
          <div className={styles.productGrid}>
            {pagedProducts.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <Pagination
          pageNumber={pagedProducts.pageNumber}
          totalPages={pagedProducts.totalPages}
          hasPrevious={pagedProducts.hasPrevious}
          hasNext={pagedProducts.hasNext}
          onPageChange={handlePageChange}
        />
      </div>
    );
  };

  return (
    <section>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>TRANG BỊ CHO HÀNH TRÌNH</p>
        <h1>Thuê hoặc sở hữu, sẵn sàng khám phá.</h1>
        <p>Khám phá thiết bị trekking và cắm trại phù hợp với chuyến đi của bạn.</p>
      </header>
      <div className={styles.filters}>
        <label className={styles.searchField}>
          Tìm sản phẩm
          <input
            type="search"
            className="input"
            placeholder="Tên hoặc mô tả sản phẩm…"
            maxLength={200}
            value={keyword}
            onChange={(event) => setDraft({ search, value: event.target.value })}
          />
        </label>
        <label>
          Danh mục
          <select
            className="input"
            value={categoryId}
            disabled={categoriesQuery.isLoading}
            onChange={(event) => updateFilters({ categoryId: event.target.value })}
          >
            <option value="">Tất cả danh mục</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Hình thức
          <select
            className="input"
            value={offeringType}
            onChange={(event) => updateFilters({ offeringType: event.target.value })}
          >
            <option value="">Thuê & mua</option>
            {Object.entries(PRODUCT_OFFERING_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sắp xếp
          <select
            className="input"
            value={`${sortBy}:${sortOrder}`}
            onChange={(event) => {
              const [nextSortBy, nextSortOrder] = event.target.value.split(':');
              updateFilters({ sortBy: nextSortBy, sortOrder: nextSortOrder });
            }}
          >
            {PRODUCT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-outline" onClick={handleReset}>
          Đặt lại
        </button>
      </div>
      {categoriesQuery.isError && (
        <p className="text-error" role="alert">
          Không tải được danh mục.{' '}
          <button type="button" className="btn btn-outline" onClick={() => categoriesQuery.refetch()}>
            Thử lại
          </button>
        </p>
      )}
      {renderContent()}
    </section>
  );
}

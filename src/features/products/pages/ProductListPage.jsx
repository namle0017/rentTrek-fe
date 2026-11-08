import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import Pagination from '@/components/Pagination';
import { CardSkeleton } from '@/components/skeleton';
import { DEFAULT_PAGE_NUMBER } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import { PRODUCT_OFFERING_LABEL, PRODUCT_SORT_OPTIONS } from '../constants/productCatalog';
import { useProductCategories, useProducts } from '../hooks/useProducts';
import styles from './ProductDiscovery.module.css';

const benefits = [
  {
    icon: 'shield',
    title: 'Giá minh bạch, không thu cọc',
    description:
      'Xem báo giá theo thời gian và số lượng trước khi xác nhận. Hệ thống hiện không thu tiền cọc; thanh toán tiền thuê bằng VietQR.',
  },
  {
    icon: 'check',
    title: 'Kiểm tra kho theo lịch thuê',
    description:
      'Chọn thời điểm nhận và trả để kiểm tra thiết bị còn trống. Kho được kiểm tra lại và giữ nguyên tử khi bạn tạo đơn.',
  },
  {
    icon: 'users',
    title: 'Nhận và trả tại cửa hàng',
    description:
      'Nhận thiết bị theo lịch đã đặt, cùng nhân viên kiểm tra khi bàn giao và khi trả. Theo dõi đơn và thanh toán trong tài khoản.',
  },
];

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
    pageSize: 8,
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
    document.getElementById('equipment')?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleReset = () => {
    setDraft(null);
    setSearchParams({});
  };
  const sortValue = `${sortBy}:${sortOrder}`;
  const changeSort = (value) => {
    const [nextSortBy, nextSortOrder] = value.split(':');
    updateFilters({ sortBy: nextSortBy, sortOrder: nextSortOrder });
  };

  const renderContent = () => {
    if (isLoading) return <CardSkeleton count={6} />;
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
    <div className={styles.catalog}>
      <section className={styles.hero} aria-labelledby="discovery-title">
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.heroBadge}>NỀN TẢNG THUÊ ĐỒ DÃ NGOẠI CHUYÊN NGHIỆP</span>
          <h1 id="discovery-title">Tất cả thiết bị cho hành trình ngoài trời</h1>
          <p>
            Chọn lều trại, balô và dụng cụ trekking. Thêm vào giỏ, chọn lịch thuê, xem tổng tiền và thanh toán
            VietQR trong một luồng.
          </p>
          <Link className="btn btn-primary" to={ROUTES.RENTAL_CART}>
            Xem giỏ thuê & tính giá →
          </Link>
        </div>
      </section>
      <div className="container">
        <section className={styles.benefits} id="travel-benefits" aria-labelledby="benefits-title">
          <header className={styles.benefitsHeading}>
            <p>KHÁC BIỆT CỦA RENTREKK</p>
            <h2 id="benefits-title">3 Lớp Bảo Vệ Cho Trải Nghiệm Trekking An Tâm</h2>
          </header>
          <div className={styles.benefitGrid}>
            {benefits.map((benefit) => (
              <article className={styles.benefitCard} key={benefit.icon}>
                <span className={styles.benefitIcon}>
                  <OutdoorIcon name={benefit.icon} />
                </span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>
        <form
          className={styles.discoveryFilters}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const fields = new FormData(event.currentTarget);
            updateFilters({
              search: keyword.trim(),
              categoryId: fields.get('categoryId'),
              offeringType: fields.get('offeringType'),
            });
            document.getElementById('equipment')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <label className={styles.searchField}>
            <span>Tìm sản phẩm</span>
            <input
              name="search"
              type="search"
              placeholder="Tìm lều, balo, bếp..."
              maxLength={200}
              value={keyword}
              onChange={(event) => setDraft({ search, value: event.target.value })}
            />
          </label>
          <label className={styles.searchField}>
            <span>Danh mục thiết bị</span>
            <select
              name="categoryId"
              value={categoryId}
              disabled={categoriesQuery.isLoading}
              onChange={(event) => updateFilters({ categoryId: event.target.value })}
            >
              <option value="">Tất cả dụng cụ dã ngoại</option>
              {(categoriesQuery.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.searchField}>
            <span>Hình thức</span>
            <select
              name="offeringType"
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
          <button type="submit" className={styles.findButton}>
            <OutdoorIcon name="search" size={17} />
            Tìm kiếm thiết bị
          </button>
        </form>
        {categoriesQuery.isError && (
          <p className="text-error" role="alert">
            Không tải được danh mục.{' '}
            <button type="button" className="btn btn-outline" onClick={() => categoriesQuery.refetch()}>
              Thử lại
            </button>
          </p>
        )}
        <section className={styles.equipment} id="equipment" aria-labelledby="equipment-title">
          <header className={styles.equipmentHeading}>
            <div>
              <h2 id="equipment-title">Thiết Bị Sẵn Sàng Cho Chuyến Đi Của Bạn</h2>
              <p>Chọn thiết bị phù hợp, sẵn sàng cho hành trình khám phá</p>
            </div>
            <div className={styles.sortControls} aria-label="Sắp xếp sản phẩm">
              <button
                type="button"
                aria-pressed={sortValue === 'createdAt:desc'}
                onClick={() => changeSort('createdAt:desc')}
              >
                Mới nhất
              </button>
              <button
                type="button"
                aria-pressed={sortValue === 'pricePerDay:asc'}
                onClick={() => changeSort('pricePerDay:asc')}
              >
                Giá thuê tốt
              </button>
              <select
                aria-label="Sắp xếp"
                value={sortValue}
                onChange={(event) => changeSort(event.target.value)}
              >
                {PRODUCT_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </header>
          {(search || categoryId || offeringType) && (
            <div className={styles.activeFilters}>
              <span>{search ? `Kết quả cho “${search}”` : 'Đang áp dụng bộ lọc'}</span>
              <button type="button" onClick={handleReset}>
                Xóa bộ lọc ×
              </button>
            </div>
          )}
          {renderContent()}
        </section>
      </div>
    </div>
  );
}

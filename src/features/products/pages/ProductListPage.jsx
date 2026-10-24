import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER } from '@/constants/config';
import { useDebounce } from '@/hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import { PRODUCT_OFFERING_LABEL, PRODUCT_SORT_OPTIONS } from '../constants/productCatalog';
import { useProductCategories, useProducts } from '../hooks/useProducts';
import styles from './ProductDiscovery.module.css';

const benefits = [
  {
    icon: 'shield',
    title: 'Ký quỹ bảo mật',
    description:
      'Tiền thuê + Tiền cọc của bạn được giữ tại tài khoản trung gian của Sàn. Chủ đồ KHÔNG nhận được cho đến khi bạn đi du lịch về an toàn.',
  },
  {
    icon: 'check',
    title: 'Kiểm định 5 bước kỹ lưỡng',
    description:
      'Tất cả các sản phẩm có nhãn kiểm định đều đã trải qua quy trình xác thực chống rách, chống thấm và đầy đủ linh phụ kiện dựng lều.',
  },
  {
    icon: 'users',
    title: 'Cộng đồng dã ngoại Việt Nam',
    description:
      'Kết nối trực tiếp giữa các chủ lều giàu kinh nghiệm ở địa phương và các trekker đam mê xê dịch.',
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
    <div className={styles.catalog}>
      <section className={styles.hero} aria-labelledby="discovery-title">
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.heroBadge}>NỀN TẢNG THUÊ ĐỒ DÃ NGOẠI CHUYÊN NGHIỆP</span>
          <h1 id="discovery-title">
            Chinh phục mọi cung đường - Thuê đồ dã ngoại an tâm tuyệt đối qua sàn ký quỹ
          </h1>
          <p>
            Hàng ngàn lều trại, balo trợ lực và đồ trekking chuyên sâu sẵn sàng giao nhận trực tiếp hoặc vận
            chuyển nhanh. Bảo mật dòng tiền ký quỹ 100%.
          </p>
        </div>
      </section>
      <div className="container">
        <section className={styles.benefits} id="travel-benefits" aria-labelledby="benefits-title">
          <header className={styles.benefitsHeading}>
            <p>KHÁC BIỆT CỦA TREKRENT</p>
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
            <span>TÌM SẢN PHẨM</span>
            <input
              name="search"
              type="search"
              placeholder="Tìm lều, balo, bếp..."
              maxLength={200}
              value={keyword}
              onChange={(event) => setDraft({ search, value: event.target.value })}
            />
          </label>
          <label>
            <span>DANH MỤC THIẾT BỊ</span>
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
          <label>
            <span>HÌNH THỨC</span>
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

import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import { CardSkeleton } from '@/components/skeleton';
import { DEFAULT_PAGE_NUMBER } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import ProductImage from '@/features/products/components/ProductImage';
import { formatCurrency } from '@/utils/formatCurrency';
import { useBundles } from '../hooks/useRentals';
import styles from './Bundle.module.css';

const PAGE_SIZE = 12;

export default function BundleListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get('pageNumber'));
  const pageNumber = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE_NUMBER;
  const { data, isLoading, isError, error, refetch } = useBundles({ pageNumber, pageSize: PAGE_SIZE });

  const renderContent = () => {
    if (isLoading) return <CardSkeleton count={6} />;
    if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
    if (!data?.items?.length) return <EmptyState message="Hiện chưa có combo thiết bị nào" />;
    return (
      <>
        <div className={styles.grid}>
          {data.items.map((bundle) => (
            <article className={styles.card} key={bundle.id}>
              <Link to={ROUTES.BUNDLE_DETAIL(bundle.id)} aria-label={`Xem ${bundle.name}`}>
                <ProductImage src={bundle.coverImageUrl} alt={bundle.name} className={styles.cardImage} />
              </Link>
              <div className={styles.cardBody}>
                <h3>
                  <Link to={ROUTES.BUNDLE_DETAIL(bundle.id)}>{bundle.name}</Link>
                </h3>
                {bundle.category?.name && <p className={styles.muted}>{bundle.category.name}</p>}
                {bundle.componentSummary && <p className={styles.muted}>{bundle.componentSummary}</p>}
                <div className={styles.price}>
                  <span>Giá thuê từ</span>
                  <strong>{formatCurrency(bundle.priceFrom)}/ngày</strong>
                </div>
                <Link className={styles.cardAction} to={ROUTES.BUNDLE_DETAIL(bundle.id)}>
                  Xem combo
                </Link>
              </div>
            </article>
          ))}
        </div>
        <Pagination
          pageNumber={data.pageNumber}
          totalPages={data.totalPages}
          hasPrevious={data.hasPrevious}
          hasNext={data.hasNext}
          onPageChange={(next) => setSearchParams({ pageNumber: String(next) })}
        />
      </>
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>COMBO THIẾT BỊ</p>
        <h1>Combo thuê trọn bộ cho chuyến đi</h1>
        <p>
          Các bộ thiết bị đã được ghép sẵn, thuê tiện hơn thuê lẻ. <Link to={ROUTES.PRODUCTS}>Xem thiết bị lẻ</Link>
        </p>
      </header>
      {renderContent()}
    </div>
  );
}

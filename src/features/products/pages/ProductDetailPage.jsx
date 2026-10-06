import { Link, useParams } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import NotFoundPage from '@/pages/NotFoundPage';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { useProduct } from '../hooks/useProducts';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);

  if (isLoading) return <Spinner />;
  if (isError && error.statusCode === 404) return <NotFoundPage />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <article className="card">
      <Link to={ROUTES.PRODUCTS}>← Danh sách sản phẩm</Link>
      <h1 className="page-title">{product.name}</h1>
      <dl className="detail-list">
        <dt>Giá thuê</dt>
        <dd>{formatCurrency(product.pricePerDay)} / ngày</dd>
        <dt>Số lượng còn</dt>
        <dd>{product.quantity}</dd>
        <dt>Ngày tạo</dt>
        <dd>{formatDateTime(product.createdAt)}</dd>
      </dl>
      {product.description && <p>{product.description}</p>}
    </article>
  );
}

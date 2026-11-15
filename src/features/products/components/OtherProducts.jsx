import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import styles from '@/features/tours/components/OtherTours.module.css';
import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';

// Gợi ý vài thiết bị khác ở trang chi tiết sản phẩm; ẩn khi không có sản phẩm nào khác
export default function OtherProducts({ excludeId }) {
  const { data } = useProducts({ pageNumber: 1, pageSize: 5 });
  const products = (data?.items ?? []).filter((product) => product.id !== excludeId).slice(0, 4);
  if (!products.length) return null;

  return (
    <section className={styles.section} aria-label="Sản phẩm khác">
      <div className={styles.head}>
        <h2>Sản phẩm khác</h2>
        <Link to={ROUTES.PRODUCTS}>Xem tất cả thiết bị</Link>
      </div>
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

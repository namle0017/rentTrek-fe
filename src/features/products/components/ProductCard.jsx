import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  return (
    <Link to={ROUTES.PRODUCT_DETAIL(product.id)} className={`card ${styles.productCard}`}>
      <h3 className={styles.productName}>{product.name}</h3>
      <p className={styles.productPrice}>{formatCurrency(product.pricePerDay)} / ngày</p>
    </Link>
  );
}

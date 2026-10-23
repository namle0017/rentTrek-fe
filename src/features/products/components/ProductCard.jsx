import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductImage from './ProductImage';
import ProductOfferingBadges from './ProductOfferingBadges';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  return (
    <Link to={ROUTES.PRODUCT_DETAIL(product.id)} className={`card ${styles.productCard}`}>
      <ProductImage src={product.thumbnailUrl} alt={product.name} className={styles.productImage} />
      <div className={styles.content}>
        <ProductOfferingBadges isRentable={product.isRentable} isForSale={product.isForSale} />
        <p className={styles.category}>{product.categoryName}</p>
        <h2 className={styles.productName}>{product.name}</h2>
        {product.isRentable && (
          <p className={styles.productPrice}>
            Thuê từ <strong>{formatCurrency(product.pricePerDay)}</strong>
            <span> / ngày</span>
          </p>
        )}
        {product.isForSale && (
          <p className={styles.productPrice}>
            Mua từ <strong>{formatCurrency(product.salePrice)}</strong>
          </p>
        )}
        <span className={styles.detailLink}>Xem chi tiết →</span>
      </div>
    </Link>
  );
}

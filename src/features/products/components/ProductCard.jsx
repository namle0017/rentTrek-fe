import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductImage from './ProductImage';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const detailUrl = ROUTES.PRODUCT_DETAIL(product.id);
  return (
    <article className={styles.productCard}>
      <Link to={detailUrl} className={styles.imageLink} aria-label={`Xem ${product.name}`}>
        <ProductImage src={product.thumbnailUrl} alt={product.name} className={styles.productImage} />
        <span className={styles.imageBadge}>{product.isRentable ? 'CHO THUÊ' : 'CÓ SẴN ĐỂ MUA'}</span>
      </Link>
      <div className={styles.content}>
        <h3 className={styles.productName}>
          <Link to={detailUrl} title={product.name}>
            {product.name}
          </Link>
        </h3>
        <div className={styles.specTags}>
          {product.categoryName && <span>{product.categoryName}</span>}
          {product.isRentable && product.isForSale && <span>Thuê & mua</span>}
        </div>
        <div className={styles.prices}>
          {product.isRentable && (
            <div className={styles.rentalPrice}>
              <span>Giá thuê / ngày</span>
              <strong>
                {formatCurrency(product.pricePerDay)}
                <small>/ngày</small>
              </strong>
            </div>
          )}
          {product.isForSale && (
            <div className={product.isRentable ? styles.salePrice : styles.rentalPrice}>
              <span>Giá mua từ</span>
              <strong>{formatCurrency(product.salePrice)}</strong>
            </div>
          )}
          {product.isRentable && !product.isForSale && (
            <div className={styles.salePrice}>
              <span>Hình thức</span>
              <strong>Cho thuê</strong>
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <Link to={detailUrl} className={styles.detailLink}>
            Xem chi tiết
          </Link>
          <Link to={detailUrl} className={styles.rentLink}>
            {product.isRentable ? 'Thuê ngay' : 'Chọn mua'}
          </Link>
        </div>
      </div>
    </article>
  );
}

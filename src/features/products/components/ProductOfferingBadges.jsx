import { PRODUCT_OFFERING_LABEL, PRODUCT_OFFERING_TYPE } from '../constants/productCatalog';
import styles from './ProductCard.module.css';

export default function ProductOfferingBadges({ isRentable, isForSale }) {
  return (
    <div className={styles.badges}>
      {isRentable && (
        <span className={styles.rentalBadge}>{PRODUCT_OFFERING_LABEL[PRODUCT_OFFERING_TYPE.RENTAL]}</span>
      )}
      {isForSale && (
        <span className={styles.saleBadge}>{PRODUCT_OFFERING_LABEL[PRODUCT_OFFERING_TYPE.SALE]}</span>
      )}
    </div>
  );
}

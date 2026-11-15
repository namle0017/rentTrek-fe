import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import OutdoorIcon from '@/components/OutdoorIcon';
import { ROUTES } from '@/constants/routes';
import ProductImage from '@/features/products/components/ProductImage';
import { rentalCartActions } from '@/features/rentals/hooks/useRentalCart';
import { vietnamDateTime } from '@/features/rentals/utils/rentalCheckout';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTripSuggestedBundles } from '../hooks/useTripBookings';
import styles from './TripSuggestedBundles.module.css';

const toLocal = (value) => vietnamDateTime(new Date(/Z$|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`));

/** Combo admin gợi ý cho tour; hiển thị dạng thẻ sản phẩm nằm kế bên bill; thêm vào giỏ thuê theo ngày chuyến. */
export default function TripSuggestedBundles({ tripId, partySize }) {
  const { data } = useTripSuggestedBundles(tripId);
  if (!data?.bundles?.length) return null;
  const provided = new Set(data.providedVariantIds);

  const add = (bundle, quantity) => {
    try {
      rentalCartActions.setPeriod({ start: toLocal(data.rentalFrom), end: toLocal(data.rentalTo) });
      rentalCartActions.add({
        key: `bundle-${bundle.id}`,
        bundleId: bundle.id,
        name: bundle.name,
        imageUrl: bundle.components[0]?.primaryImageUrl,
        quantity,
      });
      toast.success(`Đã thêm ${quantity} combo ${bundle.name} vào giỏ thuê theo ngày chuyến đi.`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className={styles.section} aria-label="Combo phù hợp chuyến này">
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>GỢI Ý THIẾT BỊ</span>
          <h2>Combo phù hợp chuyến này</h2>
          <p className={styles.hint}>
            Thuê đúng ngày chuyến đi. Thêm vào giỏ sẽ đặt lại lịch thuê của giỏ theo ngày chuyến.
          </p>
        </div>
        <Link to={ROUTES.PRODUCTS} className={styles.exploreLink}>
          <span>Xem tất cả thiết bị</span>
          <OutdoorIcon name="arrow" size={14} />
        </Link>
      </div>

      <div className={styles.grid}>
        {data.bundles.map(({ bundle, note }) => {
          const available = bundle.availability?.availableQuantity ?? 0;
          const quantity = Math.min(partySize, available, 20);
          const imageUrl = bundle.components?.[0]?.primaryImageUrl || '/images/discovery/camp.jpg';

          return (
            <article key={bundle.id} className={styles.bundleCard}>
              <Link
                to={ROUTES.BUNDLE_DETAIL(bundle.id)}
                className={styles.imageLink}
                aria-label={`Xem chi tiết ${bundle.name}`}
              >
                <ProductImage src={imageUrl} alt={bundle.name} className={styles.bundleImage} />
                <span className={styles.imageBadge}>
                  {note || 'COMBO THUÊ'}
                </span>
              </Link>

              <div className={styles.content}>
                <div className={styles.bundleHead}>
                  <h3 className={styles.bundleName}>
                    <Link to={ROUTES.BUNDLE_DETAIL(bundle.id)} title={bundle.name}>
                      {bundle.name}
                    </Link>
                  </h3>
                  {bundle.priceTiers?.[0] && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Giá thuê</span>
                      <strong className={styles.priceValue}>
                        từ {formatCurrency(bundle.priceTiers[0].dailyPrice)}
                        <small>/ngày</small>
                      </strong>
                    </div>
                  )}
                </div>

                <div className={styles.componentsWrap}>
                  <span className={styles.componentsTitle}>Trang bị bao gồm</span>
                  <ul className={styles.components}>
                    {bundle.components.map((component) => (
                      <li key={component.productVariantId}>
                        <span>
                          {component.quantity} × {component.productName} · {component.variantName}
                        </span>
                        {provided.has(component.productVariantId) && (
                          <span className={styles.provided}> (tour đã cung cấp)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.actions}>
                  {available > 0 ? (
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => add(bundle, quantity)}
                    >
                      Thêm {quantity} combo vào giỏ thuê
                    </button>
                  ) : (
                    <p className={styles.unavailable}>Hết hàng trong ngày chuyến đi</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

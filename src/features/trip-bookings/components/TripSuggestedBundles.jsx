import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '@/constants/routes';
import { rentalCartActions } from '@/features/rentals/hooks/useRentalCart';
import { vietnamDateTime } from '@/features/rentals/utils/rentalCheckout';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTripSuggestedBundles } from '../hooks/useTripBookings';
import styles from './TripSuggestedBundles.module.css';

const toLocal = (value) => vietnamDateTime(new Date(/Z$|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`));

/** Combo admin gợi ý cho tour; thêm vào giỏ thuê với ngày thuê = ngày chuyến, số lượng = số người. */
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
    <section className={styles.card} aria-label="Combo phù hợp chuyến này">
      <h2>Combo phù hợp chuyến này</h2>
      <p className={styles.hint}>
        Thuê đúng ngày chuyến đi. Thêm vào giỏ sẽ đặt lại lịch thuê của giỏ theo ngày chuyến.
      </p>
      {data.bundles.map(({ bundle, note }) => {
        const available = bundle.availability?.availableQuantity ?? 0;
        const quantity = Math.min(partySize, available, 20);
        return (
          <article key={bundle.id} className={styles.bundle}>
            <div className={styles.bundleHead}>
              <Link to={ROUTES.BUNDLE_DETAIL(bundle.id)}>{bundle.name}</Link>
              {bundle.priceTiers?.[0] && (
                <span>từ {formatCurrency(bundle.priceTiers[0].dailyPrice)}/ngày</span>
              )}
            </div>
            {note && <p className={styles.note}>{note}</p>}
            <ul className={styles.components}>
              {bundle.components.map((component) => (
                <li key={component.productVariantId}>
                  {component.quantity} × {component.productName} · {component.variantName}
                  {provided.has(component.productVariantId) && (
                    <span className={styles.provided}> (tour đã cung cấp)</span>
                  )}
                </li>
              ))}
            </ul>
            {available > 0 ? (
              <button type="button" className={styles.addButton} onClick={() => add(bundle, quantity)}>
                Thêm {quantity} combo vào giỏ thuê
              </button>
            ) : (
              <p className={styles.unavailable}>Hết hàng trong ngày chuyến đi</p>
            )}
          </article>
        );
      })}
    </section>
  );
}

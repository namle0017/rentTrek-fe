import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { rentalCartActions, useRentalCart } from '../hooks/useRentalCart';
import { useRentalAvailabilityQuery } from '../hooks/useRentalQuoteQuery';
import { rentalPeriodError, rentalQuotePayload } from '../utils/rentalCheckout';
import RentalPeriodFields from './RentalPeriodFields';
import styles from '../pages/RentalCustomer.module.css';

export default function RentalConfigurator({ product, variant }) {
  const cart = useRentalCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const existingQuantity = cart.items.find((item) => item.key === variant.id)?.quantity || 0;
  const periodError = rentalPeriodError(cart.period);
  const totalQuantity = existingQuantity + quantity;
  const payload =
    !periodError && totalQuantity <= 20
      ? rentalQuotePayload({
          ...cart,
          items: [{ productVariantId: variant.id, quantity: totalQuantity }],
          promotionCode: '',
        })
      : null;
  const availability = useRentalAvailabilityQuery(payload);
  const days = availability.data?.billableDays;
  const tier = variant.rentalPriceTiers.find(
    (price) => days >= price.minDays && (price.maxDays === null || price.maxDays === undefined || days <= price.maxDays),
  );
  const add = (checkout = false) => {
    try {
      rentalCartActions.add({
        key: variant.id,
        productId: product.id,
        productVariantId: variant.id,
        name: `${product.name} · ${variant.name}`,
        imageUrl: variant.images?.[0]?.imageUrl || product.thumbnailUrl,
        quantity,
      });
      setAdded(true);
      toast.success('Đã thêm thiết bị vào giỏ thuê.');
      if (checkout) navigate(ROUTES.RENTAL_CART);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const canAdd =
    !periodError && totalQuantity <= 20 && availability.data?.isAllAvailable && !availability.isFetching;
  return (
    <section id="rental-config" className={styles.configurator} aria-label="Chọn thuê thiết bị">
      <h3>Chọn lịch &amp; thuê thiết bị</h3>
      <RentalPeriodFields period={cart.period} onChange={rentalCartActions.setPeriod} />
      <div className={styles.quantity}>
        <span>Số lượng thêm</span>
        <button
          type="button"
          aria-label="Giảm số lượng thuê"
          disabled={quantity <= 1}
          onClick={() => setQuantity(quantity - 1)}
        >
          −
        </button>
        <output>{quantity}</output>
        <button
          type="button"
          aria-label="Tăng số lượng thuê"
          disabled={quantity >= 20}
          onClick={() => setQuantity(quantity + 1)}
        >
          +
        </button>
      </div>
      {existingQuantity > 0 && (
        <p className={styles.hint}>Đã có {existingQuantity} thiết bị cùng phiên bản trong giỏ.</p>
      )}
      {periodError && (
        <p role="alert" className={styles.error}>
          {periodError}
        </p>
      )}
      {totalQuantity > 20 && (
        <p role="alert" className={styles.error}>
          Tổng số lượng phiên bản này trong giỏ tối đa 20.
        </p>
      )}
      {availability.isFetching && <p role="status">Đang kiểm tra lịch trống...</p>}
      {availability.isError && (
        <p role="alert" className={styles.error}>
          {availability.error.message}{' '}
          <button type="button" onClick={() => availability.refetch()}>
            Thử lại
          </button>
        </p>
      )}
      {availability.data && !availability.isFetching && (
        <p className={availability.data.isAllAvailable ? styles.success : styles.error} role="status">
          {availability.data.isAllAvailable
            ? `Còn ${availability.data.items[0]?.availableQuantity ?? 0} thiết bị theo lịch đã chọn.`
            : availability.data.items[0]?.message || 'Không đủ thiết bị trong lịch này.'}
        </p>
      )}
      {tier && (
        <p>
          Tạm tính phần thêm: <strong>{formatCurrency(tier.dailyPrice * days * quantity)}</strong> / {days}{' '}
          ngày. Giá cuối cùng được xác nhận trong giỏ.
        </p>
      )}
      <div className={styles.buttonStack}>
        <button type="button" className={styles.primary} disabled={!canAdd} onClick={() => add()}>
          Thêm vào giỏ thuê
        </button>
        <button type="button" className={styles.secondary} disabled={!canAdd} onClick={() => add(true)}>
          Thuê ngay
        </button>
      </div>
      {(added || cart.items.length > 0) && (
        <Link className={styles.textLink} to={ROUTES.RENTAL_CART}>
          Xem giỏ thuê ({cart.items.reduce((sum, item) => sum + item.quantity, 0)}) →
        </Link>
      )}
    </section>
  );
}

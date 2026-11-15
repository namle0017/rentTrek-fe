import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorState from '@/components/ErrorState';
import { DetailSkeleton } from '@/components/skeleton';
import { ROUTES } from '@/constants/routes';
import ProductImage from '@/features/products/components/ProductImage';
import NotFoundPage from '@/pages/NotFoundPage';
import { formatCurrency } from '@/utils/formatCurrency';
import RentalPeriodFields from '../components/RentalPeriodFields';
import { rentalCartActions, useRentalCart } from '../hooks/useRentalCart';
import { useBundle } from '../hooks/useRentals';
import { useRentalAvailabilityQuery } from '../hooks/useRentalQuoteQuery';
import { rentalPeriodError, rentalQuotePayload } from '../utils/rentalCheckout';
import styles from './Bundle.module.css';

const tierLabel = (tier) =>
  tier.maxDays === null || tier.maxDays === undefined
    ? `Từ ${tier.minDays} ngày trở lên`
    : tier.minDays === tier.maxDays
      ? `${tier.minDays} ngày`
      : `${tier.minDays} – ${tier.maxDays} ngày`;

export default function BundleDetailPage() {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const cart = useRentalCart();
  const [quantity, setQuantity] = useState(1);
  const { data: bundle, isLoading, isError, error, refetch } = useBundle(bundleId);

  const existingQuantity = cart.items.find((item) => item.key === bundleId)?.quantity || 0;
  const totalQuantity = existingQuantity + quantity;
  const periodError = rentalPeriodError(cart.period);
  const payload =
    bundle && !periodError && totalQuantity <= 20
      ? rentalQuotePayload({ ...cart, items: [{ bundleId, quantity: totalQuantity }], promotionCode: '' })
      : null;
  const availability = useRentalAvailabilityQuery(payload);

  if (isLoading) return <DetailSkeleton />;
  if (isError && error.statusCode === 404) return <NotFoundPage />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  const coverImage = bundle.components?.find((component) => component.primaryImageUrl)?.primaryImageUrl;
  const priceFrom = bundle.priceTiers?.length
    ? Math.min(...bundle.priceTiers.map((tier) => tier.dailyPrice))
    : null;
  const isAvailable = availability.data?.isAllAvailable;
  const canAdd = !periodError && totalQuantity <= 20 && isAvailable && !availability.isFetching;

  const add = (checkout) => {
    try {
      rentalCartActions.add({
        key: bundle.id,
        bundleId: bundle.id,
        name: bundle.name,
        imageUrl: coverImage,
        quantity,
      });
      toast.success(checkout ? 'Đang chuyển đến giỏ thuê...' : 'Đã thêm combo vào giỏ thuê thành công!');
      if (checkout) navigate(ROUTES.RENTAL_CART);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <article className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Trang chủ', to: ROUTES.HOME },
          { label: 'Combo thiết bị', to: ROUTES.BUNDLES },
          { label: bundle.name },
        ]}
      />
      <div className={styles.detail}>
        <div className={styles.panel}>
          <header className={styles.heading}>
            <p className={styles.eyebrow}>COMBO THIẾT BỊ</p>
            <h1>{bundle.name}</h1>
            {bundle.description && <p>{bundle.description}</p>}
          </header>
          <h2>Trong combo gồm</h2>
          <ul className={styles.components}>
            {bundle.components?.map((component) => (
              <li key={component.productVariantId}>
                <ProductImage
                  src={component.primaryImageUrl}
                  alt={component.productName}
                  className={styles.thumb}
                />
                <span>
                  {component.productName} · {component.variantName} × {component.quantity}
                </span>
              </li>
            ))}
          </ul>
          {bundle.priceTiers?.length > 0 && (
            <>
              <h2>Bảng giá theo số ngày thuê</h2>
              <table className={styles.tierTable}>
                <thead>
                  <tr>
                    <th scope="col">Số ngày thuê</th>
                    <th scope="col">Đơn giá / ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.priceTiers.map((tier) => (
                    <tr key={tier.id}>
                      <td>{tierLabel(tier)}</td>
                      <td>{formatCurrency(tier.dailyPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <aside className={styles.panel} aria-label="Cấu hình thuê combo">
          {priceFrom !== null && (
            <div className={styles.price}>
              <span>Giá thuê từ</span>
              <strong>{formatCurrency(priceFrom)}/ngày</strong>
            </div>
          )}
          <h2>Chọn lịch thuê</h2>
          <RentalPeriodFields period={cart.period} onChange={rentalCartActions.setPeriod} />
          <div className={styles.stepper}>
            <span>Số lượng combo</span>
            <div>
              <button
                type="button"
                aria-label="Giảm số lượng combo"
                disabled={quantity <= 1}
                onClick={() => setQuantity(quantity - 1)}
              >
                −
              </button>
              <output aria-live="polite">{quantity}</output>
              <button
                type="button"
                aria-label="Tăng số lượng combo"
                disabled={quantity >= 20}
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          {availability.isFetching ? (
            <p className={styles.muted}>Đang kiểm tra kho thiết bị...</p>
          ) : periodError ? (
            <p role="alert" className={styles.bad}>
              {periodError}
            </p>
          ) : totalQuantity > 20 ? (
            <p role="alert" className={styles.bad}>
              Tổng số lượng combo này trong giỏ không được vượt quá 20.
            </p>
          ) : isAvailable ? (
            <p role="status" className={styles.ok}>
              ✓ Còn đủ thiết bị cho lịch đã chọn
            </p>
          ) : (
            <p role="alert" className={styles.bad}>
              Không khả dụng trong thời gian đã chọn
            </p>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.primary} disabled={!canAdd} onClick={() => add(true)}>
              Thuê ngay
            </button>
            <button type="button" className={styles.secondary} disabled={!canAdd} onClick={() => add(false)}>
              Thêm vào giỏ
            </button>
          </div>
          {existingQuantity > 0 && (
            <p className={styles.muted}>Đã có {existingQuantity} combo này trong giỏ của bạn.</p>
          )}
          <Link to={ROUTES.RENTAL_CART}>Xem giỏ thuê →</Link>
        </aside>
      </div>
    </article>
  );
}

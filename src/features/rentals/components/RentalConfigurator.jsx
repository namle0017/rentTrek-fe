import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import OutdoorIcon from '@/components/OutdoorIcon';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { rentalCartActions, useRentalCart } from '../hooks/useRentalCart';
import { useRentalAvailabilityQuery } from '../hooks/useRentalQuoteQuery';
import { rentalPeriodError, rentalQuotePayload } from '../utils/rentalCheckout';
import RentalPeriodFields from './RentalPeriodFields';
import styles from './RentalConfigurator.module.css';

export default function RentalConfigurator({
  product,
  variant,
  onVariantChange,
  minimumDailyPrice,
}) {
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
  const tier = variant.rentalPriceTiers?.find(
    (price) =>
      days >= price.minDays &&
      (price.maxDays === null || price.maxDays === undefined || days <= price.maxDays),
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
      toast.success(
        checkout
          ? 'Đang chuyển đến giỏ thuê...'
          : 'Đã thêm thiết bị vào giỏ thuê thành công!',
      );
      if (checkout) navigate(ROUTES.RENTAL_CART);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const isAvailable = availability.data?.isAllAvailable;
  const availableCount = availability.data?.items?.[0]?.availableQuantity ?? 0;
  const canAdd = !periodError && totalQuantity <= 20 && isAvailable && !availability.isFetching;

  const basePrice = minimumDailyPrice ?? variant.rentalPriceTiers?.[0]?.dailyPrice ?? 0;
  const effectiveDailyPrice = tier?.dailyPrice ?? basePrice;
  const subtotal = effectiveDailyPrice * (days || 1) * quantity;

  return (
    <div id="rental-config" className={styles.rentalCard}>
      {/* 1. Header: GIÁ THUÊ TỪ */}
      <div className={styles.priceHeader}>
        <span className={styles.priceEyebrow}>GIÁ THUÊ TỪ</span>
        <div className={styles.priceRow}>
          <span className={styles.priceAmount}>
            {formatCurrency(basePrice)}
          </span>
          <span className={styles.priceUnit}>/ngày</span>
        </div>
      </div>

      {/* 2. Chọn phiên bản (nếu sản phẩm có nhiều phiên bản) */}
      {product.variants.length > 1 && (
        <div className={styles.variantSelectorGroup}>
          <span className={styles.variantSelectorLabel}>Phiên bản:</span>
          <div className={styles.variantPillList}>
            {product.variants.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                className={`${styles.variantPill} ${
                  variant.id === candidate.id ? styles.variantPillActive : ''
                }`}
                aria-pressed={variant.id === candidate.id}
                onClick={() => onVariantChange?.(candidate.id)}
              >
                {candidate.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Bảng giá nhiều ngày thu gọn dạng accordion */}
      {variant.rentalPriceTiers?.length > 1 && (
        <details className={styles.tierAccordion}>
          <summary className={styles.tierAccordionSummary}>
            <span>Xem bảng giá theo số ngày thuê</span>
            <OutdoorIcon name="chevron" size={13} className={styles.tierAccordionChevron} />
          </summary>
          <div className={styles.tierAccordionContent}>
            <table className={styles.tierTable}>
              <thead>
                <tr>
                  <th scope="col">Số ngày thuê</th>
                  <th scope="col">Đơn giá / ngày</th>
                </tr>
              </thead>
              <tbody>
                {variant.rentalPriceTiers.map((priceTier) => (
                  <tr key={priceTier.id}>
                    <td>
                      {priceTier.maxDays === null
                        ? `Từ ${priceTier.minDays} ngày trở lên`
                        : priceTier.minDays === priceTier.maxDays
                          ? `${priceTier.minDays} ngày`
                          : `${priceTier.minDays} – ${priceTier.maxDays} ngày`}
                    </td>
                    <td>{formatCurrency(priceTier.dailyPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {/* 4. Chọn lịch thuê */}
      <section className={styles.sectionBlock} aria-label="Chọn lịch thuê">
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>Chọn lịch thuê</h2>
          {days ? (
            <span className={styles.billableBadge}>
              <OutdoorIcon name="calendar" size={13} />
              {days} ngày
            </span>
          ) : null}
        </div>
        <RentalPeriodFields period={cart.period} onChange={rentalCartActions.setPeriod} />
      </section>

      {/* 5. Số lượng (Label trái, Stepper phải) */}
      <div className={styles.stepperRow}>
        <span className={styles.stepperLabel}>Số lượng</span>
        <div className={styles.stepperBox}>
          <button
            type="button"
            className={styles.stepperBtn}
            aria-label="Giảm số lượng thuê"
            disabled={quantity <= 1}
            onClick={() => setQuantity(quantity - 1)}
          >
            −
          </button>
          <output className={styles.stepperOutput} aria-live="polite">
            {quantity}
          </output>
          <button
            type="button"
            className={styles.stepperBtn}
            aria-label="Tăng số lượng thuê"
            disabled={quantity >= 20}
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </button>
        </div>
      </div>

      {/* 6. Tạm tính (Label trái, Giá phải) */}
      <div className={styles.subtotalRow}>
        <span className={styles.subtotalLabel}>Tạm tính</span>
        <strong className={styles.subtotalValue}>{formatCurrency(subtotal)}</strong>
      </div>

      {/* 7. Action buttons: Thuê ngay (Primary) + Thêm vào giỏ (Secondary) */}
      <div className={styles.buttonStack}>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={!canAdd}
          onClick={() => add(true)}
        >
          Thuê ngay
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          disabled={!canAdd}
          onClick={() => add(false)}
        >
          Thêm vào giỏ
        </button>
      </div>

      {/* 8. Status message dưới nút (Khả dụng / Không khả dụng) */}
      <div className={styles.statusBox}>
        {availability.isFetching ? (
          <div className={styles.statusChecking}>
            <Spinner size={14} />
            <span>Đang kiểm tra kho thiết bị...</span>
          </div>
        ) : periodError ? (
          <p role="alert" className={styles.statusError}>
            {periodError}
          </p>
        ) : totalQuantity > 20 ? (
          <p role="alert" className={styles.statusError}>
            Tổng số lượng phiên bản này trong giỏ không được vượt quá 20 chiếc.
          </p>
        ) : availability.data ? (
          isAvailable ? (
            <p role="status" className={styles.statusAvailable}>
              ✓ Còn {availableCount} thiết bị sẵn sàng trong lịch đã chọn
            </p>
          ) : (
            <p role="alert" className={styles.statusUnavailable}>
              Không khả dụng trong thời gian đã chọn
            </p>
          )
        ) : (
          <p className={styles.statusUnavailable}>
            Không khả dụng trong thời gian đã chọn
          </p>
        )}

        {existingQuantity > 0 && (
          <p className={styles.cartNote}>
            ℹ Đã có {existingQuantity} thiết bị này trong giỏ của bạn.
          </p>
        )}

        {(added || cart.items.length > 0) && (
          <div className={styles.cartLinkRow}>
            <Link className={styles.cartLink} to={ROUTES.RENTAL_CART}>
              Xem giỏ thuê ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} thiết bị) →
            </Link>
          </div>
        )}
      </div>

      {/* Trust note */}
      <div className={styles.trustNote}>
        <OutdoorIcon name="shield" size={14} />
        <span>Không thu tiền cọc · Thiết bị được vệ sinh khử trùng</span>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import ProductImage from '@/features/products/components/ProductImage';
import { formatCurrency } from '@/utils/formatCurrency';
import { rentalCartActions, useRentalCart } from '../hooks/useRentalCart';
import { useRentalAvailabilityQuery, useRentalQuoteQuery } from '../hooks/useRentalQuoteQuery';
import { rentalPeriodError, rentalQuotePayload } from '../utils/rentalCheckout';
import RentalPeriodFields from '../components/RentalPeriodFields';
import RentalPriceSummary from '../components/RentalPriceSummary';
import styles from './RentalCustomer.module.css';

export default function RentalCartPage() {
  const cart = useRentalCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [promotionInput, setPromotionInput] = useState(cart.promotionCode);
  const periodError = rentalPeriodError(cart.period);
  const payload = cart.items.length && !periodError ? rentalQuotePayload(cart) : null;
  const quoteQuery = useRentalQuoteQuery(payload, isAuthenticated);
  const availability = useRentalAvailabilityQuery(payload, !isAuthenticated);
  const quote = quoteQuery.data;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (!cart.items.length)
    return (
      <section className={styles.empty}>
        <span className={styles.eyebrow}>GIỎ THUÊ</span>
        <h1>Chuyến đi bắt đầu từ vài món đồ</h1>
        <p>Giỏ thuê đang trống. Chọn thiết bị và phiên bản phù hợp để lên lịch thuê.</p>
        <Link className={styles.primary} to={ROUTES.PRODUCTS}>
          Khám phá tất cả thiết bị
        </Link>
      </section>
    );
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>01 / CHUẨN BỊ THIẾT BỊ</span>
          <h1>Giỏ thuê của bạn</h1>
          <p>Chọn lịch nhận / trả, kiểm tra từng món và xem tổng tiền trước khi đặt.</p>
        </div>
        <Link className={styles.textLink} to={ROUTES.PRODUCTS}>
          ← Thêm thiết bị
        </Link>
      </header>
      <div className={styles.layout}>
        <div className={styles.stack}>
          <section className={styles.card}>
            <RentalPeriodFields period={cart.period} onChange={rentalCartActions.setPeriod} />
            {periodError && (
              <p role="alert" className={styles.error}>
                {periodError}
              </p>
            )}
          </section>
          <section className={styles.card} aria-label="Danh sách thiết bị trong giỏ">
            <h2>{cart.items.length} dòng sản phẩm</h2>
            {cart.items.map((item, index) => {
              const line = quote?.lines.find((value) => value.index === index);
              const stock = availability.data?.items.find((value) => value.index === index);
              return (
                <article className={styles.cartLine} key={item.key}>
                  <ProductImage src={item.imageUrl} alt={item.name} className={styles.itemImage} />
                  <div className={styles.lineInfo}>
                    <Link
                      to={
                        item.bundleId
                          ? ROUTES.BUNDLE_DETAIL(item.bundleId)
                          : ROUTES.PRODUCT_DETAIL(item.productId)
                      }
                    >
                      {item.name}
                    </Link>
                    {line && !quoteQuery.isFetching && (
                      <p>
                        {formatCurrency(line.dailyPrice)} × {quote.billableDays} ngày × {line.quantity} ={' '}
                        <strong>{formatCurrency(line.lineAmount)}</strong>
                      </p>
                    )}
                    {(line?.availabilityMessage || stock?.message) && (
                      <p role="alert" className={styles.error}>
                        {line?.availabilityMessage || stock?.message}
                      </p>
                    )}
                    <div className={styles.quantity}>
                      <button
                        type="button"
                        aria-label={`Giảm số lượng ${item.name}`}
                        disabled={item.quantity <= 1}
                        onClick={() => rentalCartActions.setQuantity(item.key, item.quantity - 1)}
                      >
                        −
                      </button>
                      <output aria-label={`Số lượng ${item.name}`}>{item.quantity}</output>
                      <button
                        type="button"
                        aria-label={`Tăng số lượng ${item.name}`}
                        disabled={item.quantity >= 20}
                        onClick={() => rentalCartActions.setQuantity(item.key, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => rentalCartActions.remove(item.key)}
                        aria-label={`Xóa ${item.name}`}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
          <form
            className={styles.card}
            onSubmit={(event) => {
              event.preventDefault();
              rentalCartActions.setPromotionCode(promotionInput.trim());
            }}
          >
            <label className={styles.field}>
              Mã khuyến mãi
              <input
                value={promotionInput}
                maxLength={50}
                onChange={(event) => setPromotionInput(event.target.value)}
                placeholder="Nhập mã nếu có"
              />
            </label>
            <div className={styles.actions}>
              <button type="submit" className={styles.secondary}>
                Áp dụng mã
              </button>
              {cart.promotionCode && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => {
                    setPromotionInput('');
                    rentalCartActions.setPromotionCode('');
                  }}
                >
                  Bỏ mã
                </button>
              )}
            </div>
          </form>
        </div>
        <aside className={styles.sidebar}>
          {isAuthenticated ? (
            <RentalPriceSummary
              quote={quote}
              loading={quoteQuery.isFetching}
              error={quoteQuery.error}
              onRetry={() => quoteQuery.refetch()}
            />
          ) : (
            <section className={styles.card}>
              <h2>Kiểm tra &amp; tính giá</h2>
              <p>
                Đăng nhập để nhận báo giá chính xác và áp dụng khuyến mãi. Giỏ thuê được giữ khi bạn đăng
                nhập.
              </p>
              {availability.isFetching && <p role="status">Đang kiểm tra kho...</p>}
              {availability.error && (
                <p role="alert" className={styles.error}>
                  {availability.error.message}
                </p>
              )}
              {availability.data && (
                <p className={availability.data.isAllAvailable ? styles.success : styles.error}>
                  {availability.data.isAllAvailable
                    ? 'Đủ thiết bị theo lịch đã chọn.'
                    : 'Một số thiết bị không đủ số lượng.'}
                </p>
              )}
              <Link className={styles.primary} to={ROUTES.LOGIN} state={{ from: location }}>
                Đăng nhập để tính giá
              </Link>
            </section>
          )}
          <button
            className={styles.primary}
            type="button"
            disabled={
              !payload ||
              (isAuthenticated &&
                (!quote?.isAllAvailable ||
                  quoteQuery.isFetching ||
                  quoteQuery.isError ||
                  !!quote.promotionError ||
                  !quote.refundPolicy))
            }
            onClick={() => navigate(ROUTES.RENTAL_CHECKOUT)}
          >
            Tiếp tục xác nhận đơn →
          </button>
          {quote && !quote.refundPolicy && (
            <p role="alert" className={styles.error}>
              Chưa có chính sách thuê đang hiệu lực. Chưa thể tạo đơn; vui lòng liên hệ cửa hàng.
            </p>
          )}
          <p className={styles.hint}>
            Hệ thống hiện không thu cọc. Nhận và trả tại cửa hàng. Thêm vào giỏ chưa giữ thiết bị.
          </p>
        </aside>
      </div>
    </div>
  );
}

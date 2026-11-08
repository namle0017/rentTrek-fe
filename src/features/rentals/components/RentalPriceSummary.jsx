import { formatCurrency } from '@/utils/formatCurrency';
import styles from '../pages/RentalCustomer.module.css';

export default function RentalPriceSummary({ quote, loading, error, onRetry }) {
  return (
    <section className={styles.card} aria-label="Tổng tiền thuê">
      <h2>Tổng tiền thuê</h2>
      {loading && <p role="status">Đang lấy báo giá và kiểm tra kho...</p>}
      {error && (
        <div role="alert" className={styles.error}>
          <p>{error.message || 'Không thể lấy báo giá.'}</p>
          <button type="button" onClick={onRetry}>
            Thử lấy lại báo giá
          </button>
        </div>
      )}
      {quote && !loading && (
        <>
          <p>
            {quote.billableDays} ngày thuê · {quote.lines.reduce((sum, line) => sum + line.quantity, 0)} thiết
            bị / combo
          </p>
          <dl className={styles.amounts}>
            <div>
              <dt>Tiền thuê</dt>
              <dd>{formatCurrency(quote.subtotalAmount)}</dd>
            </div>
            <div>
              <dt>Giảm giá</dt>
              <dd>−{formatCurrency(quote.discountAmount)}</dd>
            </div>
            <div>
              <dt>Tiền cọc</dt>
              <dd>{formatCurrency(quote.depositAmount)}</dd>
            </div>
            <div className={styles.total}>
              <dt>Cần thanh toán</dt>
              <dd>{formatCurrency(quote.totalPayable)}</dd>
            </div>
          </dl>
          {quote.promotion && (
            <p className={styles.success}>Đã áp dụng: {quote.promotion.code || quote.promotion.name}</p>
          )}
          {quote.promotionError && (
            <p role="alert" className={styles.error}>
              {quote.promotionError.message} Hãy bỏ mã hoặc nhập mã khác.
            </p>
          )}
          {!quote.isAllAvailable && (
            <p role="alert" className={styles.error}>
              Có thiết bị không đủ số lượng trong lịch đã chọn. Vui lòng sửa giỏ hoặc thời gian thuê.
            </p>
          )}
          <p className={styles.hint}>
            Giá do hệ thống tính theo bậc giá và thời gian thuê. Thiết bị chỉ được giữ khi xác nhận đơn, trong{' '}
            {quote.holdMinutes} phút chờ thanh toán.
          </p>
        </>
      )}
    </section>
  );
}

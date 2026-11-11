import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { ORDER_STATUS_LABEL, ORDER_PAYMENT_STATUS_LABEL } from '@/constants/enums';
import HoldCountdown from '@/features/trip-bookings/components/HoldCountdown';
import { formatCurrency } from '@/utils/formatCurrency';
import { useRentalOrder } from '../hooks/useRentals';
import { rentalDateLabel } from '../utils/rentalCheckout';
import RentalPaymentPanel from '../components/RentalPaymentPanel';
import CancelUnpaidRentalPanel from '../components/CancelUnpaidRentalPanel';
import styles from './RentalCustomer.module.css';

const EVENTS = {
  Created: 'Tạo đơn',
  OrderCreated: 'Tạo đơn',
  PaymentSucceeded: 'Thanh toán thành công',
  Paid: 'Thanh toán thành công',
  Confirmed: 'Xác nhận đơn',
  Handover: 'Bàn giao thiết bị',
  Issued: 'Bàn giao thiết bị',
  Returned: 'Nhận lại thiết bị',
  Completed: 'Hoàn tất đơn',
  Cancelled: 'Hủy đơn',
};
export default function RentalOrderDetailPage() {
  const { orderId } = useParams();
  const [holdEnded, setHoldEnded] = useState(false);
  const query = useRentalOrder(orderId, {
    refetchInterval: (state) =>
      state.state.data?.data?.paymentStatus === 'Unpaid' && !holdEnded ? 5000 : false,
  });
  const order = query.data;
  if (query.isLoading) return <Spinner fullScreen />;
  if (query.isError)
    return (
      <ErrorState
        message={
          query.error.statusCode === 404
            ? 'Không tìm thấy đơn thuê hoặc bạn không có quyền xem.'
            : query.error.message
        }
        onRetry={query.refetch}
      />
    );
  if (!order) return null;
  const unpaid = order.status === 'PendingPayment' && order.paymentStatus === 'Unpaid';
  const canPay = order.allowedActions?.canPay && !holdEnded;
  const amounts = order.amounts;
  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Trang chủ', to: ROUTES.HOME },
          { label: 'Đơn của tôi', to: ROUTES.MY_ORDERS },
          { label: `Đơn thuê ${order.orderCode}` },
        ]}
      />
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>ĐƠN THUÊ · {order.orderCode}</span>
          <h1>
            {order.paymentStatus === 'Paid'
              ? 'Thiết bị đã được đặt cho bạn'
              : 'Chi tiết & thanh toán đơn thuê'}
          </h1>
          <span className={styles.badge}>{ORDER_STATUS_LABEL[order.status] || order.status}</span>
          <span className={styles.badge}>
            {ORDER_PAYMENT_STATUS_LABEL[order.paymentStatus] || order.paymentStatus}
          </span>
        </div>
        <Link className={styles.textLink} to={ROUTES.MY_ORDERS}>
          Đơn của tôi →
        </Link>
      </header>
      {unpaid && order.holdExpiresAt && (
        <div className={canPay ? styles.success : styles.error}>
          <HoldCountdown
            expiresAt={order.holdExpiresAt}
            onExpire={() => {
              setHoldEnded(true);
              void query.refetch();
            }}
          />
          {!canPay && (
            <p>
              Không chuyển tiền khi đã hết thời hạn giữ hàng. Nếu đã chuyển, hãy liên hệ cửa hàng để đối soát.
            </p>
          )}
        </div>
      )}
      {order.paymentStatus === 'NeedsReconciliation' && (
        <p className={styles.error} role="alert">
          Giao dịch đang cần đối soát, có thể do số tiền hoặc thời điểm nhận tiền chưa khớp. Nếu đã chuyển
          tiền, không chuyển lại. Liên hệ cửa hàng kèm mã đơn {order.orderCode}.
        </p>
      )}
      {order.paymentStatus === 'Paid' && (
        <p role="status" className={styles.success}>
          Đã xác nhận thanh toán {formatCurrency(amounts.paidAmount)}. Vui lòng mang mã đơn khi nhận thiết bị.
        </p>
      )}
      <div className={styles.layout}>
        <div className={styles.stack}>
          {canPay && <RentalPaymentPanel orderId={orderId} onSettled={query.refetch} />}
          <section className={styles.card}>
            <h2>Thiết bị đã đặt</h2>
            <p>
              <strong>Nhận:</strong> {rentalDateLabel(order.rentalStartAt)}
              <br />
              <strong>Trả:</strong> {rentalDateLabel(order.rentalEndAt)} · {order.billableDays} ngày
            </p>
            {order.lines.map((line) => (
              <div key={line.id} className={styles.reviewLine}>
                <span>
                  {line.displayName} × {line.quantity}
                  <small>
                    {formatCurrency(line.dailyPrice)} / ngày · {line.billableDays} ngày
                  </small>
                  {line.bundleComponents?.map((component) => (
                    <small key={component.productVariantId}>
                      {component.displayName || component.variantName} × {component.quantityPerBundle}
                    </small>
                  ))}
                </span>
                <strong>{formatCurrency(line.lineAmount)}</strong>
              </div>
            ))}
          </section>
          <section className={styles.card}>
            <h2>Nhận / trả thiết bị</h2>
            <p>
              Nhận và trả tại cửa hàng theo lịch trên. Nhân viên kiểm tra, bàn giao từng thiết bị và xác nhận
              tình trạng khi trả.
            </p>
            {order.note && <p style={{ whiteSpace: 'pre-wrap' }}>{order.note}</p>}
            {order.handledBy && <p>Nhân viên phụ trách: {order.handledBy.fullName}</p>}
            {order.assets?.length > 0 && (
              <ul>
                {order.assets.map((asset) => (
                  <li key={asset.assetCode}>
                    {asset.assetCode} · {asset.status}
                  </li>
                ))}
              </ul>
            )}
          </section>
          {order.charges?.length > 0 && (
            <section className={styles.card}>
              <h2>Phí phát sinh</h2>
              {order.charges.map((charge) => (
                <p key={charge.id}>
                  {charge.description || charge.chargeType} · {formatCurrency(charge.amount)} ·{' '}
                  {charge.status}
                </p>
              ))}
              <p className={styles.hint}>
                Nếu có sai lệch, liên hệ nhân viên kèm mã đơn và mã phí để kiểm tra.
              </p>
            </section>
          )}
          {order.payments?.length > 0 && (
            <section className={styles.card}>
              <h2>Lịch sử giao dịch</h2>
              {order.payments.map((payment) => (
                <div className={styles.reviewLine} key={payment.id}>
                  <span>
                    {payment.paymentType === 'Refund' ? 'Hoàn tiền' : 'Thanh toán'} · {payment.status}
                    <small>{rentalDateLabel(payment.createdAt)}</small>
                  </span>
                  <strong>{formatCurrency(payment.amount)}</strong>
                </div>
              ))}
            </section>
          )}
          {order.timeline?.length > 0 && (
            <section className={styles.card}>
              <h2>Tiến trình đơn thuê</h2>
              <ol className={styles.timeline}>
                {order.timeline.map((event, index) => (
                  <li key={`${event.event}-${index}`}>
                    {EVENTS[event.event] || event.event} · {rentalDateLabel(event.at)}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
        <aside className={styles.sidebar}>
          <section className={styles.card}>
            <h2>Chi phí đơn thuê</h2>
            <dl className={styles.amounts}>
              <div>
                <dt>Tiền thuê</dt>
                <dd>{formatCurrency(amounts.subtotalAmount)}</dd>
              </div>
              <div>
                <dt>Giảm giá</dt>
                <dd>−{formatCurrency(amounts.discountAmount)}</dd>
              </div>
              <div>
                <dt>Cọc</dt>
                <dd>{formatCurrency(amounts.depositAmount)}</dd>
              </div>
              <div className={styles.total}>
                <dt>Tổng tiền</dt>
                <dd>{formatCurrency(amounts.totalPayable)}</dd>
              </div>
              <div>
                <dt>Đã thanh toán</dt>
                <dd>{formatCurrency(amounts.paidAmount)}</dd>
              </div>
              <div>
                <dt>Đã hoàn</dt>
                <dd>{formatCurrency(amounts.refundedAmount)}</dd>
              </div>
            </dl>
            <p className={styles.hint}>
              Chính sách: {order.refundPolicy.name} · phiên bản {order.refundPolicy.version}
            </p>
          </section>
          {order.allowedActions?.canCancel && (
            <CancelUnpaidRentalPanel orderId={orderId} onCancelled={query.refetch} />
          )}
          <Link to={ROUTES.PRODUCTS} className={styles.secondary}>
            Tiếp tục chọn thiết bị
          </Link>
          <p className={styles.hint}>
            Cần hủy đơn đã thanh toán hoặc điều chỉnh sau khi đặt? Liên hệ cửa hàng kèm mã {order.orderCode}.
          </p>
        </aside>
      </div>
    </div>
  );
}

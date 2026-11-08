import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatCurrency';
import { rentalCartActions, useRentalCart } from '../hooks/useRentalCart';
import { useCreateRentalOrder } from '../hooks/useRentals';
import { useRentalQuoteQuery } from '../hooks/useRentalQuoteQuery';
import {
  quoteConsentSignature,
  rentalDateLabel,
  rentalPeriodError,
  rentalQuotePayload,
  rentalSubmission,
} from '../utils/rentalCheckout';
import RentalPriceSummary from '../components/RentalPriceSummary';
import styles from './RentalCustomer.module.css';

export default function RentalCheckoutPage() {
  const cart = useRentalCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const createOrder = useCreateRentalOrder();
  const sending = useRef(false);
  const attempt = useRef(null);
  const [acceptedSignature, setAcceptedSignature] = useState('');
  const [message, setMessage] = useState('');
  const periodError = rentalPeriodError(cart.period);
  const payload = cart.items.length && !periodError ? rentalQuotePayload(cart) : null;
  const quoteQuery = useRentalQuoteQuery(payload, true);
  const quote = quoteQuery.data;
  const signature = quoteConsentSignature(payload, quote);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      receiverName: currentUser?.fullName || '',
      receiverPhone: currentUser?.phone || '',
      note: '',
    },
  });
  const ready =
    !!payload &&
    quote?.isAllAvailable &&
    quote.refundPolicy &&
    !quote.promotionError &&
    !quoteQuery.isFetching &&
    !quoteQuery.isError &&
    signature === acceptedSignature;
  const submit = async (values) => {
    if (!ready || sending.current) return;
    sending.current = true;
    setMessage('');
    const request = {
      ...payload,
      pickup: {
        method: 'Store',
        receiverName: values.receiverName.trim(),
        receiverPhone: values.receiverPhone.trim(),
      },
      ...(values.note.trim() ? { note: values.note.trim() } : {}),
      acceptedRefundPolicyVersion: quote.refundPolicy.version,
    };
    const fingerprint = JSON.stringify(request);
    const submission =
      attempt.current?.fingerprint === fingerprint
        ? attempt.current
        : rentalSubmission(currentUser.userId || currentUser.id || currentUser.email, request);
    attempt.current = submission;
    const ordered = cart.items.map((item) => ({ ...item }));
    try {
      const response = await createOrder.mutateAsync({
        payload: request,
        idempotencyKey: submission.idempotencyKey,
      });
      const orderId = response.data.id;
      if (!orderId)
        throw new Error(
          'Đơn đã được xử lý nhưng thiếu mã trả về. Hãy kiểm tra Đơn của tôi trước khi thử lại.',
        );
      rentalCartActions.removeOrderedItems(ordered);
      navigate(ROUTES.RENTAL_ORDER_DETAIL(orderId), { replace: true });
    } catch (error) {
      setMessage(
        error.message ||
          'Chưa xác nhận được kết quả tạo đơn. Thử lại sẽ dùng cùng mã yêu cầu để tránh trùng đơn.',
      );
      if (error.statusCode >= 400 && error.statusCode < 500) {
        setAcceptedSignature('');
        await quoteQuery.refetch();
      }
    } finally {
      sending.current = false;
    }
  };
  if (!cart.items.length)
    return (
      <section className={styles.empty}>
        <h1>Giỏ thuê đang trống</h1>
        <Link className={styles.primary} to={ROUTES.PRODUCTS}>
          Chọn thiết bị
        </Link>
        <Link className={styles.textLink} to={ROUTES.MY_ORDERS}>
          Kiểm tra đơn đã tạo
        </Link>
      </section>
    );
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>02 / XÁC NHẬN ĐƠN THUÊ</span>
          <h1>Sẵn sàng cho chuyến đi</h1>
          <p>Kiểm tra thiết bị, thời gian nhận trả và số tiền trước khi giữ hàng.</p>
        </div>
        <Link className={styles.textLink} to={ROUTES.RENTAL_CART}>
          ← Sửa giỏ thuê
        </Link>
      </header>
      <form className={styles.layout} onSubmit={event => { void handleSubmit(submit)(event); }} noValidate>
        <div className={styles.stack}>
          <section className={styles.card}>
            <h2>Thiết bị &amp; lịch nhận trả</h2>
            {periodError ? (
              <p role="alert" className={styles.error}>
                {periodError}
              </p>
            ) : (
              <p>
                <strong>Nhận:</strong> {rentalDateLabel(payload.rentalStartAt)}
                <br />
                <strong>Trả:</strong> {rentalDateLabel(payload.rentalEndAt)}
              </p>
            )}
            {quote?.lines.map((line) => (
              <div className={styles.reviewLine} key={line.index}>
                <span>
                  {line.displayName} × {line.quantity}
                  <small>
                    {formatCurrency(line.dailyPrice)} / ngày · {quote.billableDays} ngày
                  </small>
                </span>
                <strong>{formatCurrency(line.lineAmount)}</strong>
                {!line.isAvailable && <p className={styles.error}>{line.availabilityMessage}</p>}
              </div>
            ))}
          </section>
          <section className={styles.card}>
            <h2>Người nhận thiết bị</h2>
            <p className={styles.hint}>
              Nhận / trả tại cửa hàng. Vui lòng xác nhận địa điểm và giờ làm việc với cửa hàng trước khi đến.
            </p>
            <fieldset className={styles.formFields} disabled={createOrder.isPending}>
              <label className={styles.field}>
                Họ tên người nhận *
                <input
                  autoComplete="name"
                  {...register('receiverName', {
                    validate: (value) => value.trim().length >= 2 || 'Nhập họ tên ít nhất 2 ký tự.',
                    maxLength: { value: 255, message: 'Họ tên tối đa 255 ký tự.' },
                  })}
                  aria-invalid={!!errors.receiverName}
                />
              </label>
              {errors.receiverName && (
                <p role="alert" className={styles.error}>
                  {errors.receiverName.message}
                </p>
              )}
              <label className={styles.field}>
                Số điện thoại người nhận *
                <input
                  type="tel"
                  autoComplete="tel"
                  {...register('receiverPhone', {
                    required: 'Vui lòng nhập số điện thoại.',
                    pattern: {
                      value: /^(0|\+?84)(3|5|7|8|9)\d{8}$/,
                      message: 'Số điện thoại Việt Nam không hợp lệ.',
                    },
                  })}
                  aria-invalid={!!errors.receiverPhone}
                />
              </label>
              {errors.receiverPhone && (
                <p role="alert" className={styles.error}>
                  {errors.receiverPhone.message}
                </p>
              )}
              <label className={styles.field}>
                Ghi chú nhận đồ
                <textarea
                  rows={3}
                  maxLength={1000}
                  {...register('note', { maxLength: { value: 1000, message: 'Ghi chú tối đa 1000 ký tự.' } })}
                />
              </label>
            </fieldset>
          </section>
          {quote?.refundPolicy && (
            <section className={styles.card}>
              <h2>Chính sách thuê &amp; hoàn tiền</h2>
              <p>
                {quote.refundPolicy.name} · phiên bản {quote.refundPolicy.version}
              </p>
              {quote.refundPolicy.description && <p>{quote.refundPolicy.description}</p>}
              <ul>
                {quote.refundPolicy.rules.map((rule) => (
                  <li key={rule.minHoursBefore}>
                    Hủy trước thời điểm nhận từ {rule.minHoursBefore} giờ: hoàn {rule.refundPercentage}% theo
                    chính sách.
                  </li>
                ))}
              </ul>
              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={signature === acceptedSignature}
                  onChange={(event) => setAcceptedSignature(event.target.checked ? signature : '')}
                  disabled={quoteQuery.isFetching || createOrder.isPending}
                />
                Tôi đã đọc chính sách và đồng ý với thiết bị, lịch thuê và tổng tiền trên.
              </label>
            </section>
          )}
        </div>
        <aside className={styles.sidebar}>
          <RentalPriceSummary
            quote={quote}
            loading={quoteQuery.isFetching}
            error={quoteQuery.error}
            onRetry={() => quoteQuery.refetch()}
          />
          {!quote?.refundPolicy && !quoteQuery.isFetching && (
            <p role="alert" className={styles.error}>
              Chưa có chính sách thuê hiệu lực nên chưa thể tạo đơn.
            </p>
          )}
          {message && (
            <div role="alert" className={styles.error}>
              {message}
              <p>
                <Link to={ROUTES.MY_ORDERS}>Kiểm tra Đơn của tôi</Link>
              </p>
            </div>
          )}
          <button className={styles.primary} type="submit" disabled={!ready || createOrder.isPending}>
            {createOrder.isPending
              ? 'Đang giữ thiết bị...'
              : quote?.totalPayable === 0
                ? 'Xác nhận đơn 0đ'
                : 'Xác nhận đơn & thanh toán VietQR'}
          </button>
          <p className={styles.hint}>
            Sau khi tạo đơn, bạn sẽ nhận mã QR chuyển khoản. Chỉ khi ngân hàng xác nhận, đơn mới được ghi nhận
            đã thanh toán.
          </p>
        </aside>
      </form>
    </div>
  );
}

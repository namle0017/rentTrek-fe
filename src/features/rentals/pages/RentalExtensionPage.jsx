import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ORDER_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import RentalPaymentPanel from '../components/RentalPaymentPanel';
import {
  useExtendRentalOrder,
  useRentalAdjustments,
  useRentalExtensionQuote,
  useRentalOrder,
} from '../hooks/useRentals';
import { parseServerDate, rentalDateLabel, vietnamDateTime } from '../utils/rentalCheckout';
import styles from './RentalCustomer.module.css';
import ext from './RentalExtension.module.css';

const HOUR = 3600000;
const DAY = 24 * HOUR;
const MAX_RENTAL_DAYS = 60; // khớp RentalPeriodCalculator.MaxRentalDays phía BE
const QUICK_DAYS = [1, 2, 3, 7];
const EXTENDABLE_STATUSES = ['Confirmed', 'InFulfillment'];

const fromVnInput = (value) => new Date(`${value}:00+07:00`);
// Khớp BE: max(1, ceil((trả - nhận) / 24h))
const billableDays = (start, end) => Math.max(1, Math.ceil((end - start) / DAY));
const errorCode = (error) => error?.errors?.code?.[0];

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function blockedReason(order) {
  const actions = order.allowedActions || {};
  if (actions.canPayAdditional)
    return 'Đơn đang có một khoản phí chờ thanh toán. Vui lòng thanh toán khoản đó trước khi gia hạn.';
  if (!EXTENDABLE_STATUSES.includes(order.status))
    return `Đơn đang ở trạng thái “${ORDER_STATUS_LABEL[order.status] || order.status}”. Chỉ đơn đã xác nhận hoặc đang thuê mới gia hạn được.`;
  const maxLate = order.rentalPolicy?.extensionMaxDaysLate;
  return Number.isFinite(maxLate)
    ? `Đơn đã quá hạn trả hơn ${maxLate} ngày nên không thể gia hạn. Vui lòng mang thiết bị đến trả sớm nhất có thể.`
    : 'Đơn hiện không thể gia hạn. Vui lòng liên hệ cửa hàng để được hỗ trợ.';
}

function Steps({ current }) {
  const steps = ['Chọn hạn trả mới', 'Xác nhận phí', 'Thanh toán'];
  return (
    <ol className={ext.steps} aria-label="Các bước gia hạn">
      {steps.map((label, index) => {
        const step = index + 1;
        const state = step < current ? ext.stepDone : step === current ? ext.stepActive : '';
        return (
          <li key={label} className={`${ext.step} ${state}`} aria-current={step === current ? 'step' : undefined}>
            <span className={ext.stepNumber}>{step < current ? '✓' : step}</span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}

export default function RentalExtensionPage() {
  const { orderId } = useParams();
  const query = useRentalOrder(orderId);
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
  return <RentalExtensionContent order={order} onRefetch={query.refetch} />;
}

function RentalExtensionContent({ order, onRefetch }) {
  const navigate = useNavigate();
  const orderId = order.id;
  const detailRoute = ROUTES.RENTAL_ORDER_DETAIL(orderId);
  const actions = order.allowedActions || {};
  const pending = order.pendingAdditionalPayment;
  const paying = Boolean(actions.canPayAdditional && pending?.purpose === 'RentalExtension');
  const canExtend = Boolean(actions.canExtend) && !paying;

  const start = parseServerDate(order.rentalStartAt);
  const currentEnd = parseServerDate(order.rentalEndAt);
  const latestEnd = new Date(start.getTime() + MAX_RENTAL_DAYS * DAY);
  const [now] = useState(() => Date.now());
  const overdue = now > currentEnd.getTime();
  const hoursLeft = Math.floor((currentEnd.getTime() - now) / HOUR);
  const baseTime = Math.max(currentEnd.getTime(), now);

  const [newEnd, setNewEnd] = useState(() =>
    vietnamDateTime(new Date(Math.min(baseTime + DAY, latestEnd.getTime()))),
  );
  const [consent, setConsent] = useState(false);

  const newEndDate = newEnd ? fromVnInput(newEnd) : null;
  let periodError = '';
  if (!newEndDate || Number.isNaN(newEndDate.getTime())) periodError = 'Vui lòng chọn thời điểm trả mới.';
  else if (newEndDate <= currentEnd)
    periodError = `Hạn trả mới phải sau hạn trả hiện tại (${rentalDateLabel(currentEnd)}).`;
  else if (newEndDate.getTime() <= now) periodError = 'Hạn trả mới phải ở thời điểm trong tương lai.';
  else if (billableDays(start, newEndDate) > MAX_RENTAL_DAYS)
    periodError = `Tổng thời gian thuê tối đa ${MAX_RENTAL_DAYS} ngày — trả muộn nhất ${rentalDateLabel(latestEnd)}.`;

  const newEndIso = periodError ? null : newEndDate.toISOString();
  const debouncedIso = useDebouncedValue(newEndIso);
  const quote = useRentalExtensionQuote(orderId, canExtend ? debouncedIso : null);
  const settled = debouncedIso === newEndIso && !quote.isFetching;
  const quoteData = settled && newEndIso ? quote.data : undefined;
  const quoting = Boolean(newEndIso) && !settled;

  const extend = useExtendRentalOrder();
  const { data: adjustments = [] } = useRentalAdjustments(paying ? orderId : null);

  const pick = (value) => {
    setNewEnd(value);
    setConsent(false);
    extend.reset();
  };

  const submit = async () => {
    if (!quoteData || !newEndIso) return;
    try {
      const res = await extend.mutateAsync({
        orderId,
        payload: { newEndAt: newEndIso, acceptedExtraAmount: quoteData.extraAmount },
      });
      // Có phí → cache đơn đã có khoản chờ thanh toán, trang tự chuyển sang bước 3
      if (!(res?.data?.adjustment?.extraAmount > 0)) navigate(detailRoute);
    } catch (error) {
      if (errorCode(error) === 'RENTAL_EXTENSION_PRICE_CHANGED') {
        setConsent(false);
        void quote.refetch();
      }
    }
  };

  const currentStep = paying ? 3 : quoteData ? 2 : 1;
  const pendingAdjustment = paying
    ? [...adjustments]
        .filter((a) => parseServerDate(a.newEndAt) > currentEnd)
        .sort((a, b) => parseServerDate(b.createdAt) - parseServerDate(a.createdAt))[0]
    : null;
  const quoteError = quote.isError && settled ? quote.error : null;
  const blockedAssets = quoteError?.errors?.assetCodes || extend.error?.errors?.assetCodes;

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Trang chủ', to: ROUTES.HOME },
          { label: 'Đơn của tôi', to: ROUTES.MY_ORDERS },
          { label: `Đơn thuê ${order.orderCode}`, to: detailRoute },
          { label: 'Gia hạn' },
        ]}
      />
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>GIA HẠN ĐƠN THUÊ · {order.orderCode}</span>
          <h1>Gia hạn thời gian thuê</h1>
          <p>Cần dùng thiết bị lâu hơn? Chọn hạn trả mới, xem phí phát sinh và thanh toán để giữ đồ tiếp.</p>
        </div>
        <Link className={styles.textLink} to={detailRoute}>
          ← Về chi tiết đơn
        </Link>
      </header>

      {!canExtend && !paying ? (
        <section className={`${styles.card} ${ext.blocked}`} aria-label="Không thể gia hạn">
          <h2>Đơn này chưa gia hạn được</h2>
          <p>{blockedReason(order)}</p>
          <div className={styles.actions}>
            <Link className={styles.primary} to={detailRoute}>
              Xem chi tiết đơn
            </Link>
            <Link className={styles.secondary} to={ROUTES.MY_ORDERS}>
              Đơn của tôi
            </Link>
          </div>
        </section>
      ) : (
        <>
          <Steps current={currentStep} />
          <div className={styles.layout}>
            <div className={styles.stack}>
              <section className={styles.card} aria-label="Lịch thuê hiện tại">
                <h2>Lịch thuê hiện tại</h2>
                <dl className={ext.schedule}>
                  <div>
                    <dt>Nhận đồ</dt>
                    <dd>{rentalDateLabel(start)}</dd>
                  </div>
                  <div>
                    <dt>Hạn trả hiện tại</dt>
                    <dd>{rentalDateLabel(currentEnd)}</dd>
                  </div>
                  <div>
                    <dt>Số ngày thuê</dt>
                    <dd>{order.billableDays} ngày</dd>
                  </div>
                </dl>
                {overdue ? (
                  <p role="alert" className={ext.warning}>
                    Đơn đã quá hạn trả. Bạn chỉ gia hạn được trong vòng{' '}
                    {order.rentalPolicy?.extensionMaxDaysLate ?? '—'} ngày sau hạn trả; quá thời gian này sẽ bị tính
                    phạt trả trễ theo chính sách.
                  </p>
                ) : (
                  hoursLeft < 24 && (
                    <p className={ext.warning}>
                      Chỉ còn {Math.max(hoursLeft, 0)} giờ nữa là tới hạn trả. Gia hạn ngay để tránh phí trả trễ.
                    </p>
                  )
                )}
              </section>

              {paying ? (
                <>
                  <section className={styles.card} aria-label="Yêu cầu gia hạn chờ thanh toán">
                    <h2>Yêu cầu gia hạn đang chờ thanh toán</h2>
                    <dl className={ext.schedule}>
                      {pendingAdjustment && (
                        <div>
                          <dt>Hạn trả mới</dt>
                          <dd>{rentalDateLabel(pendingAdjustment.newEndAt)}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Phí gia hạn</dt>
                        <dd className={ext.amount}>{formatCurrency(pending.amount)}</dd>
                      </div>
                    </dl>
                    <p className={styles.hint}>
                      Thiết bị đã được giữ cho bạn tới hạn trả mới. Hạn trả chỉ chính thức đổi khi ngân hàng xác nhận
                      khoản thanh toán; nếu không thanh toán, yêu cầu sẽ tự huỷ và giữ nguyên hạn cũ.
                    </p>
                  </section>
                  <RentalPaymentPanel
                    key={pending.id}
                    orderId={orderId}
                    additional
                    title="Thanh toán tiền gia hạn"
                    onSettled={() => {
                      void onRefetch();
                      navigate(detailRoute);
                    }}
                  />
                </>
              ) : (
                <>
                  <section className={styles.card} aria-label="Chọn hạn trả mới">
                    <h2>Chọn hạn trả mới</h2>
                    <div className={ext.chips} role="group" aria-label="Gia hạn nhanh">
                      {QUICK_DAYS.map((days) => {
                        const value = vietnamDateTime(new Date(currentEnd.getTime() + days * DAY));
                        const target = currentEnd.getTime() + days * DAY;
                        const disabled = target <= now || billableDays(start, target) > MAX_RENTAL_DAYS;
                        return (
                          <button
                            key={days}
                            type="button"
                            className={`${ext.chip} ${newEnd === value ? ext.chipActive : ''}`}
                            aria-pressed={newEnd === value}
                            disabled={disabled}
                            onClick={() => pick(value)}
                          >
                            +{days} ngày
                          </button>
                        );
                      })}
                    </div>
                    <label className={styles.field}>
                      Ngày giờ trả mới
                      <input
                        type="datetime-local"
                        value={newEnd}
                        min={vietnamDateTime(new Date(baseTime))}
                        max={vietnamDateTime(latestEnd)}
                        onChange={(event) => pick(event.target.value)}
                        aria-invalid={Boolean(periodError)}
                        aria-describedby="extension-period-hint"
                      />
                    </label>
                    <small id="extension-period-hint" className={ext.fieldHint}>
                      Giờ Việt Nam. Trả tại cửa hàng như lịch ban đầu. Tổng thời gian thuê tối đa {MAX_RENTAL_DAYS}{' '}
                      ngày (muộn nhất {rentalDateLabel(latestEnd)}).
                    </small>
                    {periodError && (
                      <p role="alert" className={styles.error}>
                        {periodError}
                      </p>
                    )}
                  </section>

                  <section className={styles.card} aria-label="Chi tiết tính lại tiền thuê" aria-busy={quoting}>
                    <h2>Chi tiết tính lại tiền thuê</h2>
                    {quoting && <p className={styles.hint}>Đang tính phí gia hạn...</p>}
                    {quoteError && (
                      <div role="alert" className={styles.error}>
                        {quoteError.message || 'Không báo giá được cho thời điểm này.'}
                        {quoteError.errors?.assetCodes?.length > 0 && (
                          <small className={ext.assetCodes}>
                            Thiết bị đã có người đặt: {quoteError.errors.assetCodes.join(', ')}. Hãy chọn hạn trả sớm
                            hơn.
                          </small>
                        )}
                      </div>
                    )}
                    {!quoting && !quoteError && !quoteData && (
                      <p className={styles.hint}>Chọn hạn trả mới hợp lệ để xem phí gia hạn.</p>
                    )}
                    {quoteData &&
                      quoteData.lines.map((line) => (
                        <div key={line.rentalOrderItemId} className={styles.reviewLine}>
                          <span>
                            {line.displayName} × {line.quantity}
                            <small>
                              {line.oldBillableDays} ngày × {formatCurrency(line.oldDailyPrice)} → {line.newBillableDays}{' '}
                              ngày × {formatCurrency(line.newDailyPrice)}
                              {line.newDailyPrice < line.oldDailyPrice && ' · giá thuê dài ngày rẻ hơn'}
                            </small>
                          </span>
                          <span className={ext.lineAmounts}>
                            <s>{formatCurrency(line.oldLineAmount)}</s>
                            <strong>{formatCurrency(line.newLineAmount)}</strong>
                          </span>
                        </div>
                      ))}
                  </section>
                </>
              )}
            </div>

            <aside className={styles.sidebar}>
              {!paying && (
                <section className={styles.card} aria-label="Tóm tắt gia hạn">
                  <h2>Tóm tắt gia hạn</h2>
                  <dl className={styles.amounts}>
                    <div>
                      <dt>Hạn trả hiện tại</dt>
                      <dd>{rentalDateLabel(currentEnd)}</dd>
                    </div>
                    <div>
                      <dt>Hạn trả mới</dt>
                      <dd>{newEndIso ? rentalDateLabel(newEndDate) : '—'}</dd>
                    </div>
                    <div>
                      <dt>Số ngày thuê</dt>
                      <dd>
                        {quoteData
                          ? `${quoteData.oldBillableDays} → ${quoteData.newBillableDays} ngày (+${
                              quoteData.newBillableDays - quoteData.oldBillableDays
                            })`
                          : '—'}
                      </dd>
                    </div>
                    <div className={styles.total}>
                      <dt>Phí gia hạn</dt>
                      <dd>{quoteData ? formatCurrency(quoteData.extraAmount) : '—'}</dd>
                    </div>
                  </dl>
                  <p className={styles.hint}>
                    Khuyến mãi đã áp dụng giữ nguyên, không tính lại. Tiền cọc không thay đổi.
                  </p>
                  {quoteData?.extraAmount > 0 && (
                    <label className={styles.consent}>
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(event) => setConsent(event.target.checked)}
                      />
                      <span>
                        Tôi đồng ý thanh toán {formatCurrency(quoteData.extraAmount)} phí gia hạn. Hạn trả mới chỉ có
                        hiệu lực sau khi RenTrek nhận được tiền.
                      </span>
                    </label>
                  )}
                  {quoteData?.extraAmount === 0 && (
                    <p className={styles.success}>Không phát sinh thêm phí — hạn trả mới áp dụng ngay.</p>
                  )}
                  <div className={styles.buttonStack}>
                    <button
                      type="button"
                      className={styles.primary}
                      disabled={!quoteData || extend.isPending || (quoteData.extraAmount > 0 && !consent)}
                      onClick={submit}
                    >
                      {extend.isPending
                        ? 'Đang gửi yêu cầu...'
                        : quoteData?.extraAmount > 0
                          ? 'Xác nhận & thanh toán'
                          : 'Xác nhận gia hạn'}
                    </button>
                    <Link className={styles.secondary} to={detailRoute}>
                      Huỷ, quay lại đơn
                    </Link>
                  </div>
                  {extend.isError && (
                    <div role="alert" className={styles.error}>
                      {errorCode(extend.error) === 'RENTAL_EXTENSION_PRICE_CHANGED'
                        ? 'Phí gia hạn vừa thay đổi. Đã cập nhật báo giá mới, vui lòng kiểm tra và xác nhận lại.'
                        : extend.error?.message || 'Không gia hạn được.'}
                      {blockedAssets?.length > 0 && !quoteError && (
                        <small className={ext.assetCodes}>Thiết bị đã có người đặt: {blockedAssets.join(', ')}.</small>
                      )}
                    </div>
                  )}
                </section>
              )}
              <p className={styles.hint}>Cần hỗ trợ? Liên hệ cửa hàng kèm mã {order.orderCode}.</p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

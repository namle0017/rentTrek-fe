import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import {
  ORDER_STATUS_LABEL,
  ORDER_PAYMENT_STATUS_LABEL,
  REFUND_CASE_SOURCE_LABEL,
  REFUND_CASE_STATUS_LABEL,
} from '@/constants/enums';
import { CHARGE_STATUS_LABEL, CHARGE_TYPE_LABEL } from '@/features/rental-ops/constants/rentalOpsLabels';
import HoldCountdown from '@/features/trip-bookings/components/HoldCountdown';
import { formatCurrency } from '@/utils/formatCurrency';
import { parseAdminTransactionWithProof } from '@/features/refunds/utils/refundProofHelper';
import { useConfirmRentalReceipt, useRentalOrder } from '../hooks/useRentals';
import { rentalDateLabel } from '../utils/rentalCheckout';
import RentalPaymentPanel from '../components/RentalPaymentPanel';
import CancelUnpaidRentalPanel from '../components/CancelUnpaidRentalPanel';
import RentalIssueReportModal from '../components/RentalIssueReportModal';
import CancelPaidRentalPanel from '../components/CancelPaidRentalPanel';
import RefundBankInfoPanel from '../components/RefundBankInfoPanel';
import RentalExtensionPanel from '../components/RentalExtensionPanel';
import RentalPolicySummary from '../components/RentalPolicySummary';
import EvidencePhotoGallery from '../components/EvidencePhotoGallery';
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
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  useEffect(() => {
    if (!lightboxUrl) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxUrl]);

  const confirmReceipt = useConfirmRentalReceipt();
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
  const canReportIssue =
    order.paymentStatus === 'Paid' ||
    order.status === 'InFulfillment' ||
    order.status === 'Issued';
  const amounts = order.amounts;
  const actions = order.allowedActions || {};
  const settlement = order.settlement;
  const refundCase = order.refundCase;
  const customerPhotos = (order.evidencePhotos || []).filter((photo) => photo.stage !== 'Damage');
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
      {order.cancellationType === 'NoShow' && (
        <p role="alert" className={styles.error}>
          Đơn đã huỷ do bạn không đến nhận đồ đúng hạn: tiền cọc bị giữ theo chính sách, phần tiền thuê còn lại sẽ được hoàn.
        </p>
      )}
      {order.status === 'AwaitingSettlement' && (
        <p role="alert" className={styles.error}>
          Phí phát sinh vượt tiền cọc. Vui lòng thanh toán phần còn thiếu bên dưới; tài khoản tạm thời chưa đặt thuê mới được.
        </p>
      )}
      <div className={styles.layout}>
        <div className={styles.stack}>
          {canPay && <RentalPaymentPanel orderId={orderId} onSettled={query.refetch} />}
          {actions.canPayAdditional && order.pendingAdditionalPayment && (
            <RentalPaymentPanel
              key={order.pendingAdditionalPayment.id}
              orderId={orderId}
              additional
              title={
                order.pendingAdditionalPayment.purpose === 'RentalExtension'
                  ? 'Thanh toán tiền gia hạn'
                  : 'Thanh toán phí vượt cọc'
              }
              onSettled={query.refetch}
            />
          )}
          {actions.canConfirmReceipt && (
            <section className={styles.card} aria-label="Xác nhận đã nhận đồ">
              <h2>Bạn đã nhận đồ chưa?</h2>
              <p>
                Vui lòng kiểm tra kỹ từng thiết bị (đối chiếu ảnh lúc giao bên dưới) rồi xác nhận. Nếu có lỗi, hãy báo ngay
                kèm ảnh. Không phản hồi sau {order.rentalPolicy?.receiptAutoConfirmHours ?? 24} giờ được coi là đã nhận đúng
                tình trạng.
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={confirmReceipt.isPending}
                  onClick={() => confirmReceipt.mutate({ orderId })}
                >
                  {confirmReceipt.isPending ? 'Đang xác nhận...' : 'Đã nhận & kiểm tra kỹ'}
                </button>
                <button type="button" className={styles.secondary} onClick={() => setIsIssueModalOpen(true)}>
                  Báo lỗi thiết bị
                </button>
              </div>
            </section>
          )}
          {actions.canSubmitBankInfo && refundCase && <RefundBankInfoPanel orderId={orderId} refundCase={refundCase} />}
          {refundCase && !actions.canSubmitBankInfo && (
            <section className={styles.card} aria-label="Hoàn tiền">
              <h2>Hoàn tiền {formatCurrency(refundCase.amount)}</h2>
              <p>
                {REFUND_CASE_SOURCE_LABEL[refundCase.source] || refundCase.source} ·{' '}
                <strong>{REFUND_CASE_STATUS_LABEL[refundCase.status] || refundCase.status}</strong>
                {refundCase.bankAccountLast4 && ` · tài khoản ****${refundCase.bankAccountLast4}`}
              </p>
              {refundCase.rejectionReason && <p className={styles.error}>{refundCase.rejectionReason}</p>}
            </section>
          )}
          {actions.canExtend && (
            <RentalExtensionPanel orderId={orderId} rentalEndAt={order.rentalEndAt} onChanged={query.refetch} />
          )}
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
            {canReportIssue && (
              <button
                type="button"
                className={styles.reportIssueBtn}
                onClick={() => setIsIssueModalOpen(true)}
              >
                ⚠️ Báo cáo đồ lỗi / sự cố (đổi đồ mới hoặc hoàn tiền)
              </button>
            )}
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
            {order.customerReceivedConfirmedAt && (
              <p className={styles.success}>
                Đã xác nhận nhận đồ lúc {rentalDateLabel(order.customerReceivedConfirmedAt)}
                {order.receiptConfirmSource === 'Auto' && ' (tự động sau thời hạn phản hồi)'}.
              </p>
            )}
            <EvidencePhotoGallery
              photos={customerPhotos}
              title="Ảnh tình trạng thiết bị"
              onOpen={setLightboxUrl}
            />
          </section>
          {order.charges?.length > 0 && (
            <section className={styles.card}>
              <h2>Phí phát sinh</h2>
              {order.charges.map((charge) => (
                <p key={charge.id}>
                  {CHARGE_TYPE_LABEL[charge.chargeType] || charge.chargeType} · {formatCurrency(charge.amount)} ·{' '}
                  {CHARGE_STATUS_LABEL[charge.status] || charge.status}
                  {charge.reason && <small style={{ display: 'block' }}>{charge.reason}</small>}
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
              {order.payments.map((payment) => {
                const parsedProof = payment.providerTransactionId
                  ? parseAdminTransactionWithProof(payment.providerTransactionId)
                  : null;
                return (
                  <div className={styles.reviewLine} key={payment.id}>
                    <span>
                      {payment.paymentType === 'Refund' ? 'Hoàn tiền' : 'Thanh toán'} · {payment.status}
                      <small>{rentalDateLabel(payment.createdAt)}</small>
                      {parsedProof?.hasProof && (
                        <button
                          type="button"
                          className={styles.viewProofBtn}
                          onClick={() => setLightboxUrl(parsedProof.proofUrl)}
                          title="Xem biên lai chuyển khoản từ RenTrek"
                        >
                          📷 Xem biên lai hoàn tiền
                        </button>
                      )}
                    </span>
                    <strong>{formatCurrency(payment.amount)}</strong>
                  </div>
                );
              })}
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
            {settlement && (
              <dl className={styles.amounts}>
                <div>
                  <dt>Cọc giữ</dt>
                  <dd>{formatCurrency(settlement.depositHeld)}</dd>
                </div>
                <div>
                  <dt>Phí trừ cọc</dt>
                  <dd>−{formatCurrency(settlement.totalCharges)}</dd>
                </div>
                <div className={styles.total}>
                  <dt>{settlement.amountOwed > 0 ? 'Cần trả thêm' : 'Được hoàn'}</dt>
                  <dd>
                    {formatCurrency(
                      settlement.amountOwed > 0
                        ? settlement.amountOwed
                        : settlement.depositRefund + settlement.rentalFeeRefund,
                    )}
                  </dd>
                </div>
              </dl>
            )}
            <RentalPolicySummary policy={order.rentalPolicy} compact />
          </section>
          {order.allowedActions?.canCancel && (
            <CancelUnpaidRentalPanel orderId={orderId} onCancelled={query.refetch} />
          )}
          {actions.canCancelPaid && <CancelPaidRentalPanel orderId={orderId} onCancelled={query.refetch} />}
          <Link to={ROUTES.PRODUCTS} className={styles.secondary}>
            Tiếp tục chọn thiết bị
          </Link>
          <p className={styles.hint}>
            Cần hỗ trợ khác? Liên hệ cửa hàng kèm mã {order.orderCode}.
          </p>
        </aside>
      </div>

      <RentalIssueReportModal
        order={order}
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={query.refetch}
      />

      {lightboxUrl && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Xem biên lai hoàn tiền"
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxHeader}>
              <span>Biên lai chuyển khoản từ RenTrek</span>
              <div className={styles.lightboxActions}>
                <a
                  href={lightboxUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.lightboxNewTab}
                >
                  Mở ảnh gốc ↗
                </a>
                <button
                  type="button"
                  className={styles.lightboxCloseBtn}
                  onClick={() => setLightboxUrl(null)}
                  aria-label="Đóng"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className={styles.lightboxBody}>
              <img src={lightboxUrl} alt="Biên lai hoàn tiền đầy đủ" className={styles.lightboxImg} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

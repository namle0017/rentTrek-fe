import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import DevClockJumps from '@/components/DevClockJumps';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ORDER_PAYMENT_STATUS_LABEL, ORDER_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useDevClockControls } from '@/hooks/useDevClock';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import RentalAssetsPanel from '../components/RentalAssetsPanel';
import RentalChargesPanel from '../components/RentalChargesPanel';
import {
  useAdminRentalOrder,
  useAssessRentalCharge,
  useCompleteRental,
  useCreateRentalCharge,
  useHandoverRental,
  useReturnRentalAssets,
  useVoidRentalCharge,
} from '../hooks/useRentalOps';
import styles from './RentalOps.module.css';

export default function AdminRentalOrderDetailPage() {
  const { orderId } = useParams();
  const { data: order, isLoading, isError, error, refetch } = useAdminRentalOrder(orderId);
  const devClock = useDevClockControls();
  const handover = useHandoverRental();
  const returnAssets = useReturnRentalAssets();
  const createCharge = useCreateRentalCharge();
  const assessCharge = useAssessRentalCharge();
  const voidCharge = useVoidRentalCharge();
  const complete = useCompleteRental();

  const isPending = [handover, returnAssets, createCharge, assessCharge, voidCharge, complete].some((m) => m.isPending);

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

    const start = dayjs(order.rentalStartAt);
    const end = dayjs(order.rentalEndAt);
    const clockTargets = [
      { label: 'Mở giao đồ (24 giờ trước giờ nhận)', at: start.subtract(24, 'hour').add(1, 'minute').toISOString() },
      { label: 'Giờ nhận đồ', at: start.add(1, 'minute').toISOString() },
      { label: '1 giờ trước hạn trả', at: end.subtract(1, 'hour').toISOString() },
      { label: 'Trễ 1 giờ (trong ân hạn)', at: end.add(1, 'hour').toISOString() },
      { label: 'Trễ 3 giờ', at: end.add(3, 'hour').toISOString() },
      { label: 'Trễ hơn 1 ngày', at: end.add(26, 'hour').toISOString() },
    ];
    const { allowedActions, overdue, settlement } = order;

    return (
      <>
        {devClock.canControl && (
          <DevClockJumps
            targets={clockTargets}
            onJump={devClock.jumpTo}
            onReset={devClock.reset}
            isSimulated={devClock.clock?.isSimulated}
            isPending={devClock.isPending}
          />
        )}

        {overdue.isOverdue && (
          <p className={styles.alert} role="alert">
            Quá hạn trả {overdue.overdueHours} giờ (ân hạn {overdue.graceHours} giờ).
            {overdue.suggestedLateFee > 0
              ? ` Nếu nhận trả bây giờ, hệ thống sẽ đề xuất phí trễ ${overdue.lateDays} ngày: ${formatCurrency(overdue.suggestedLateFee)}.`
              : ' Vẫn trong ân hạn, chưa tính phí trễ.'}
          </p>
        )}

        <div className={styles.summaryGrid}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Đơn thuê</h2>
            <dl className={styles.facts}>
              <div>
                <dt>Trạng thái</dt>
                <dd>{ORDER_STATUS_LABEL[order.status] ?? order.status}</dd>
              </div>
              <div>
                <dt>Thanh toán</dt>
                <dd>{ORDER_PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}</dd>
              </div>
              <div>
                <dt>Nhận đồ</dt>
                <dd>{formatDateTime(order.rentalStartAt)}</dd>
              </div>
              <div>
                <dt>Hạn trả</dt>
                <dd>{formatDateTime(order.rentalEndAt)}</dd>
              </div>
              <div>
                <dt>Giờ hệ thống</dt>
                <dd>{formatDateTime(order.serverNow)}</dd>
              </div>
              <div>
                <dt>Nhân viên xử lý</dt>
                <dd>{order.handledByName ?? 'Chưa có'}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Khách hàng</h2>
            <dl className={styles.facts}>
              <div>
                <dt>Họ tên</dt>
                <dd>{order.customer.fullName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{order.customer.email}</dd>
              </div>
              <div>
                <dt>Điện thoại</dt>
                <dd>{order.customer.phone ?? '—'}</dd>
              </div>
            </dl>
            {order.note && <p className={styles.hint}>Ghi chú: {order.note}</p>}
          </section>
        </div>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Dòng thuê</h2>
          <ul className={styles.lineList}>
            {order.lines.map((line) => (
              <li key={line.rentalOrderItemId}>
                <span>
                  {line.displayName} × {line.quantity}
                </span>
                <span className={styles.muted}>
                  {formatCurrency(line.dailyPrice)}/ngày × {line.billableDays} ngày = <strong>{formatCurrency(line.lineAmount)}</strong>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <RentalAssetsPanel
          assignments={order.assignments}
          allowedActions={allowedActions}
          isPending={isPending}
          onHandover={() => handover.mutate({ orderId, assignmentIds: null })}
          onReturn={(items, onDone) => returnAssets.mutate({ orderId, items }, { onSuccess: onDone })}
        />

        <RentalChargesPanel
          charges={order.charges}
          assignments={order.assignments}
          canAddCharge={allowedActions.canAddCharge}
          isPending={isPending}
          onCreate={(payload, onDone) => createCharge.mutate({ orderId, payload }, { onSuccess: onDone })}
          onAssess={(chargeId) => assessCharge.mutate({ orderId, chargeId })}
          onVoid={(chargeId, reason, onDone) => voidCharge.mutate({ orderId, chargeId, reason }, { onSuccess: onDone })}
        />

        <section className={styles.panel} aria-labelledby="rental-settlement-title">
          <h2 id="rental-settlement-title" className={styles.panelTitle}>
            Quyết toán cọc
          </h2>
          <dl className={styles.settlement}>
            <div>
              <dt>Tiền thuê đã thu</dt>
              <dd>{formatCurrency(order.amounts.paidAmount)}</dd>
            </div>
            <div>
              <dt>Cọc đang giữ</dt>
              <dd>{formatCurrency(settlement.depositHeld)}</dd>
            </div>
            <div>
              <dt>Phí hợp lệ (đã xác định)</dt>
              <dd>{formatCurrency(settlement.validCharges)}</dd>
            </div>
            <div>
              <dt>Cọc cần hoàn khách</dt>
              <dd>{formatCurrency(settlement.depositToRefund)}</dd>
            </div>
            <div>
              <dt>Cần thu thêm</dt>
              <dd className={settlement.additionalAmountDue > 0 ? styles.due : undefined}>
                {formatCurrency(settlement.additionalAmountDue)}
              </dd>
            </div>
          </dl>
          <p className={styles.hint}>
            Số liệu tính theo PRD §8.7 (bù phí từ cọc trước). Hoàn cọc / thu thêm hiện xử lý thủ công ngoài hệ thống.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!allowedActions.canComplete || isPending}
              onClick={() => complete.mutate({ orderId })}
            >
              Đóng đơn thuê
            </button>
            {!allowedActions.canComplete && allowedActions.completeBlockedReason && (
              <span className={styles.hint}>{allowedActions.completeBlockedReason}</span>
            )}
          </div>
        </section>
      </>
    );
  };

  return (
    <section className={styles.page} aria-labelledby="rental-order-title">
      <header>
        <p className={styles.eyebrow}>
          <Link to={ROUTES.ADMIN_RENTAL_ORDERS}>Đơn thuê</Link> / Chi tiết
        </p>
        <h1 id="rental-order-title" className={styles.title}>
          {order?.orderCode ?? 'Chi tiết đơn thuê'}
        </h1>
      </header>
      {renderContent()}
    </section>
  );
}

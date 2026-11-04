import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { participantFields, options, OPS_LABELS } from '@/features/operations/constants/opsOptions';
import OperationDialog from '@/features/operations/components/OperationDialog';
import StatusBadge from '@/features/operations/components/StatusBadge';
import DataTable from '@/components/DataTable';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import styles from '@/features/operations/components/Operations.module.css';

const paymentColumns = [{ key: 'createdAt', label: 'Thời điểm', render: (row) => formatDateTime(row.createdAt) }, { key: 'paymentType', label: 'Giao dịch', render: (row) => <>{OPS_LABELS[row.paymentType]}<small>{OPS_LABELS[row.purpose]}</small></> }, { key: 'amount', label: 'Số tiền', render: (row) => formatCurrency(row.amount) }, { key: 'paymentMethod', label: 'Phương thức', render: (row) => OPS_LABELS[row.paymentMethod] ?? row.paymentMethod }, { key: 'providerTransactionId', label: 'Mã giao dịch / tham chiếu' }, { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }];
const participantColumns = [{ key: 'fullName', label: 'Hành khách' }, { key: 'phone', label: 'Liên hệ' }, { key: 'dateOfBirth', label: 'Ngày sinh' }, { key: 'emergencyContactName', label: 'Liên hệ khẩn cấp', render: (row) => <>{row.emergencyContactName}<small>{row.emergencyContactPhone}</small></> }];
export default function OrderDetailPage() {
  const { orderCode } = useParams(); const { currentUser } = useAuth();
  const query = useOperations(API_ENDPOINTS.ADMIN.DETAIL(API_ENDPOINTS.ADMIN.ORDERS, orderCode));
  const [dialog, setDialog] = useState(null);
  if (query.isPending) return <Spinner />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={query.refetch} />;
  const { order, participants, payments, lines, promotions, auditLogs, rentalPeriod, handlerFullName } = query.data;
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const isOpen = ['PendingPayment', 'Confirmed'].includes(order.status);
  return <div className={styles.page}>
    <Link className={styles.muted} to={ROUTES.ADMIN_ORDERS}>← Danh sách đơn hàng</Link>
    <div className={styles.heading}><div><span className={styles.eyebrow}>{OPS_LABELS[order.orderType]}</span><h1>{order.orderCode}</h1><p>{order.serviceSummary}</p></div><div className={styles.toolbar}><StatusBadge value={order.status} /><StatusBadge value={order.paymentStatus} /></div></div>
    {isAdmin && isOpen && <div className={styles.toolbar}><button className={styles.primary} onClick={() => setDialog({ title: 'Ghi nhận thanh toán thủ công', action: 'manual-payment', fields: [{ name: 'amount', label: 'Số tiền (VND)', type: 'number', min: 1, step: 1, required: true }, { name: 'paymentMethod', label: 'Phương thức thực tế', type: 'select', options: options('Cash', 'BankTransfer'), required: true }, { name: 'manualReference', label: 'Mã tham chiếu duy nhất', required: true, maxLength: 100 }, { name: 'reason', label: 'Lý do xác nhận', type: 'textarea', required: true, maxLength: 500 }] })}>Ghi nhận thanh toán</button><button className={styles.danger} onClick={() => setDialog({ title: 'Hủy đơn & tạo yêu cầu hoàn tiền', action: 'cancel-by-admin', fields: [{ name: 'reason', label: 'Lý do hủy', type: 'textarea', required: true, maxLength: 500 }] })}>Hủy đơn khẩn cấp</button></div>}
    <div className={styles.grid}><section className={styles.card}><h2>Thông tin khách hàng</h2><dl className={styles.details}><dt>Họ tên</dt><dd>{order.customer.fullName}</dd><dt>Mã khách hàng</dt><dd>{order.customer.userCode ?? 'Chưa cập nhật'}</dd><dt>Email</dt><dd>{order.customer.email}</dd><dt>Điện thoại</dt><dd>{order.customer.phone ?? 'Chưa cập nhật'}</dd></dl></section><section className={styles.card}><h2>Thông tin đơn hàng</h2><dl className={styles.details}><dt>Tổng thanh toán</dt><dd><strong>{formatCurrency(order.totalAmount)}</strong></dd><dt>Ngày tạo</dt><dd>{formatDateTime(order.createdAt)}</dd><dt>Hạn giữ chỗ</dt><dd>{formatDateTime(order.holdExpiresAt) || '—'}</dd><dt>Hạn đối soát</dt><dd>{formatDateTime(order.reconciliationDeadlineAt) || '—'}</dd>{rentalPeriod && <><dt>Thời gian thuê</dt><dd>{formatDateTime(rentalPeriod.startAt)} → {formatDateTime(rentalPeriod.endAt)}</dd><dt>Phụ trách</dt><dd>{handlerFullName ?? 'Chưa phân công'}</dd></>}</dl></section></div>
    {participants.length > 0 && <><h2>Hành khách</h2><DataTable columns={participantColumns} rows={participants} rowKey={(row) => row.participantId} actions={isOpen ? (row) => <button className={styles.secondary} onClick={() => setDialog({ title: 'Điều chỉnh thông tin hành khách', action: `participants/${row.participantId}`, method: 'patch', fields: participantFields, values: row })}>Điều chỉnh</button> : undefined} /></>}
    {lines.length > 0 && <section className={styles.card}><h2>Thiết bị & thành phần combo</h2>{lines.map((line) => <article className={styles.card} key={line.rentalOrderItemId}><div className={styles.heading}><h3>{line.name} × {line.quantity}</h3><strong>{formatCurrency(line.lineAmount)}</strong></div><p>{line.billableDays} ngày × {formatCurrency(line.dailyPrice)}</p>{line.components.map((component) => <p key={component.productVariantId}>{component.name} × {component.quantityPerBundle} / combo</p>)}<div className={styles.toolbar}>{line.assets.map((asset) => <span key={asset.assetAssignmentId}>{asset.assetCode} <StatusBadge value={asset.status} /></span>)}</div></article>)}</section>}
    <h2>Lịch sử thanh toán</h2><DataTable columns={paymentColumns} rows={payments} rowKey={(row) => row.paymentId} />
    {promotions.length > 0 && <section className={styles.card}><h2>Khuyến mãi đã áp dụng</h2>{promotions.map((promotion) => <p key={promotion.appliedPromotionId}>{formatCurrency(promotion.discountAmount)} <StatusBadge value={promotion.status} /></p>)}</section>}
    <section className={styles.card}><h2>Nhật ký đơn hàng</h2>{auditLogs.length === 0 ? <p>Chưa có thao tác quản trị</p> : auditLogs.map((log) => <details key={log.auditLogId}><summary>{formatDateTime(log.createdAt)} · {log.actorFullName} · {OPS_LABELS[log.action] ?? log.action}</summary><pre className={styles.json}>{JSON.stringify(log.details, null, 2)}</pre></details>)}</section>
    {dialog && <OperationDialog {...dialog} endpoint={API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.ORDERS, orderCode, dialog.action)} onClose={() => setDialog(null)} />}
  </div>;
}

import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/features/operations/components/StatusBadge';
import styles from '@/features/operations/components/Operations.module.css';

const stats = [
  ['pendingPaymentExpiringCount', 'Sắp hết hạn thanh toán', ROUTES.ADMIN_ORDERS],
  ['tripsDepartingIn7DaysCount', 'Chuyến trong 7 ngày tới', null],
  ['unassignedParticipantsCount', 'Khách chưa xếp nhóm', null],
  ['missingProvidedItemsCount', 'Định mức còn thiếu đồ', null],
  ['underCapacityTripsCount', 'Chuyến chưa đủ khách', null],
  ['overdueRentalAssetsCount', 'Thiết bị quá hạn', ROUTES.ADMIN_RENTALS],
  ['pendingApprovalRefundsCount', 'Hoàn tiền chờ duyệt', ROUTES.ADMIN_ORDERS],
  ['failedRefundsCount', 'Hoàn tiền thất bại', ROUTES.ADMIN_ORDERS],
  ['needsReconciliationOrdersCount', 'Đơn cần đối soát', ROUTES.ADMIN_ORDERS],
  ['draftRentalChargesCount', 'Phí phát sinh chưa chốt', ROUTES.ADMIN_RENTALS],
];

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const counters = useOperations(API_ENDPOINTS.ADMIN.DASHBOARD.STATS);
  const alerts = useOperations(API_ENDPOINTS.ADMIN.DASHBOARD.ALERTS);
  const kpis = useOperations(API_ENDPOINTS.ADMIN.DASHBOARD.KPIS, undefined, isAdmin);
  return <div className={styles.page}>
    <div className={styles.heading}><div><span className={styles.eyebrow}>Trung tâm điều hành</span><h1>Tổng quan vận hành</h1><p>Theo dõi chuyến đi, đơn hàng và những việc cần xử lý.</p></div><Link className={styles.primary} to={ROUTES.ADMIN_ORDERS}>Xem đơn hàng →</Link></div>
    {counters.isPending ? <Spinner /> : counters.isError ? <ErrorState message={counters.error.message} onRetry={counters.refetch} /> : <div className={styles.stats}>{stats.filter(([key]) => isAdmin || !['pendingApprovalRefundsCount', 'failedRefundsCount'].includes(key)).map(([key, label, link]) => <article className={styles.stat} key={key}><small>{label}</small><strong>{counters.data[key]}</strong>{link && <Link to={link}>Xem chi tiết ↗</Link>}</article>)}</div>}
    <section className={styles.card}><div className={styles.heading}><h2>Cần bạn xử lý</h2><span className={styles.muted}>Cảnh báo vận hành hiện tại</span></div>{alerts.isPending ? <Spinner /> : alerts.isError ? <ErrorState message={alerts.error.message} onRetry={alerts.refetch} /> : !alerts.data.length ? <EmptyState message="Hiện chưa có cảnh báo cần xử lý" /> : alerts.data.map((alert, index) => <article key={`${alert.entityId}-${index}`} className={styles.alert}><StatusBadge value={alert.severity} /><div><h3>{alert.title}</h3><p>{alert.message}</p></div><Link to={alert.actionUrl}>Mở →</Link></article>)}</section>
    {isAdmin && <section className={styles.card}><h2>Hiệu quả 7 ngày qua</h2>{kpis.isPending ? <Spinner /> : kpis.isError ? <ErrorState message={kpis.error.message} onRetry={kpis.refetch} /> : <div className={styles.stats}><div className={styles.stat}><small>Booking mới</small><strong>{kpis.data.weeklyBookingsCount}</strong></div><div className={styles.stat}><small>Tỷ lệ lấp chỗ</small><strong>{kpis.data.averageOccupancyRate}%</strong></div><div className={styles.stat}><small>Doanh thu ròng</small><strong style={{ fontSize: 24 }}>{formatCurrency(kpis.data.netRevenueVnd)}</strong></div><div className={styles.stat}><small>Thiết bị đang khai thác / sẵn sàng</small><strong>{kpis.data.activeRentedAssetsCount} / {kpis.data.totalAvailableAssetsCount}</strong></div></div>}</section>}
  </div>;
}

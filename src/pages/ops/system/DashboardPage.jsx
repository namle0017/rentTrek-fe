import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Package, Wallet, CircleCheck, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import StatusBadge from '@/features/operations/components/StatusBadge';
import styles from './DashboardPage.module.css';
import RevenueChart from './RevenueChart.jsx';

const groups = [
  {
    title: 'Tour & chuyến đi',
    icon: CalendarDays,
    items: [
      ['tripsDepartingIn7DaysCount', 'Khởi hành trong 7 ngày', ROUTES.ADMIN_TRIPS, false],
      ['unassignedParticipantsCount', 'Khách chưa xếp nhóm', ROUTES.ADMIN_TRIPS, true],
      ['missingProvidedItemsCount', 'Thiếu đồ cấp chuyến', '/ops/trips/provided-items', true],
      ['underCapacityTripsCount', 'Chuyến chưa đủ khách', ROUTES.ADMIN_TRIPS, true],
    ],
  },
  {
    title: 'Đơn hàng & thiết bị',
    icon: Package,
    items: [
      ['pendingPaymentExpiringCount', 'Sắp hết hạn thanh toán', ROUTES.ADMIN_ORDERS, true],
      ['overdueRentalAssetsCount', 'Thiết bị quá hạn', ROUTES.ADMIN_RENTALS, true],
      ['draftRentalChargesCount', 'Phí phát sinh chưa chốt', ROUTES.ADMIN_RENTALS, true],
    ],
  },
  {
    title: 'Thanh toán & hoàn tiền',
    icon: Wallet,
    items: [
      ['pendingApprovalRefundsCount', 'Hoàn tiền chờ duyệt', ROUTES.ADMIN_REFUNDS, true, true],
      ['failedRefundsCount', 'Hoàn tiền thất bại', ROUTES.ADMIN_REFUNDS, true, true],
      ['needsReconciliationOrdersCount', 'Đơn cần đối soát', ROUTES.ADMIN_ORDERS, true],
    ],
  },
];

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const counters = useOperations(API_ENDPOINTS.ADMIN.DASHBOARD.STATS);
  const alerts = useOperations(API_ENDPOINTS.ADMIN.DASHBOARD.ALERTS);
  const kpis = useOperations(API_ENDPOINTS.ADMIN.DASHBOARD.KPIS, undefined, isAdmin);

  return (
    <div className={styles.page}>
      {isAdmin && (
        <section aria-labelledby="performance-title">
          <div className={styles.sectionHeading}>
            <h2 id="performance-title">Hiệu quả hoạt động</h2>
            <span className={styles.period}>7 ngày qua</span>
          </div>
          {kpis.isPending ? (
            <Spinner />
          ) : kpis.isError ? (
            <ErrorState message={kpis.error.message} onRetry={kpis.refetch} />
          ) : (
            <div className={styles.metrics}>
              <article className={`${styles.metric} ${styles.revenue}`}>
                <span>Doanh thu ròng</span>
                <strong>{formatCurrency(kpis.data.netRevenueVnd)}</strong>
                <small>Trong 7 ngày qua</small>
              </article>
              <article className={styles.metric}>
                <span>Booking mới</span>
                <strong>{kpis.data.weeklyBookingsCount}</strong>
                <small>Trong 7 ngày qua</small>
              </article>
              <article className={styles.metric}>
                <span>Tỷ lệ lấp chỗ</span>
                <strong>{kpis.data.averageOccupancyRate}%</strong>
                <small>Trung bình các chuyến</small>
              </article>
              <article className={styles.metric}>
                <span>Thiết bị đang thuê / sẵn sàng</span>
                <strong>
                  {kpis.data.activeRentedAssetsCount}
                  <em> / {kpis.data.totalAvailableAssetsCount}</em>
                </strong>
                <small>Tình trạng kho hiện tại</small>
              </article>
            </div>
          )}
        </section>
      )}

      {isAdmin && <RevenueChart />}

      <div className={styles.workspace}>
        <section aria-labelledby="operations-title">
          <div className={styles.sectionHeading}>
            <h2 id="operations-title">Theo dõi vận hành</h2>
            <Link to={ROUTES.ADMIN_ORDERS}>
              Đơn hàng <ArrowUpRight size={13} />
            </Link>
          </div>
          {counters.isPending ? (
            <Spinner />
          ) : counters.isError ? (
            <ErrorState message={counters.error.message} onRetry={counters.refetch} />
          ) : (
            <div className={styles.groups}>
              {groups.map(({ title, icon: Icon, items }) => (
                <article key={title} className={styles.group}>
                  <h3>
                    <span className={styles.groupIcon}>
                      <Icon size={16} />
                    </span>
                    {title}
                  </h3>
                  {items
                    .filter(([, , , , adminOnly]) => !adminOnly || isAdmin)
                    .map(([key, label, to, needsAction]) => (
                      <Link className={styles.counterRow} key={key} to={to}>
                        <span>{label}</span>
                        <strong
                          className={needsAction && counters.data[key] > 0 ? styles.attention : styles.count}
                        >
                          {counters.data[key] ?? 0}
                        </strong>
                        <ArrowUpRight size={13} className={styles.rowArrow} />
                      </Link>
                    ))}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.alertSection} aria-labelledby="alerts-title">
          <div className={styles.sectionHeading}>
            <h2 id="alerts-title">Cần xử lý</h2>
            {alerts.data && <span className={styles.alertCount}>{alerts.data.length}</span>}
          </div>
          <div className={styles.alertCard}>
            {alerts.isPending ? (
              <Spinner />
            ) : alerts.isError ? (
              <ErrorState message={alerts.error.message} onRetry={alerts.refetch} />
            ) : !alerts.data.length ? (
              <div className={styles.empty}>
                <CircleCheck size={28} />
                <strong>Đã xử lý xong</strong>
                <p>Chưa có cảnh báo mới.</p>
              </div>
            ) : (
              alerts.data.map((alert, index) => (
                <article key={`${alert.entityId}-${index}`} className={styles.alert}>
                  <div className={styles.alertMeta}>
                    <AlertCircle size={14} />
                    <StatusBadge value={alert.severity} />
                  </div>
                  <h3>{alert.title}</h3>
                  <p>{alert.message}</p>
                  <Link to={alert.actionUrl}>
                    Xem chi tiết <ArrowUpRight size={13} />
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

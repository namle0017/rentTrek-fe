import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  Package,
  Wallet,
  CircleCheck,
  AlertCircle,
  TrendingUp,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import StatusBadge from '@/features/operations/components/StatusBadge';
import RevenueChart from './RevenueChart.jsx';
import styles from './DashboardPage.module.css';

const groups = [
  {
    title: 'Tour & Chuyến đi',
    icon: CalendarDays,
    items: [
      ['tripsDepartingIn7DaysCount', 'Khởi hành trong 7 ngày', ROUTES.ADMIN_TRIPS, false],
      ['unassignedParticipantsCount', 'Khách chưa xếp nhóm', ROUTES.ADMIN_TRIPS, true],
      ['missingProvidedItemsCount', 'Thiếu đồ cấp chuyến', '/ops/trips/provided-items', true],
      ['underCapacityTripsCount', 'Chuyến chưa đủ khách', ROUTES.ADMIN_TRIPS, true],
    ],
  },
  {
    title: 'Đơn hàng & Thiết bị',
    icon: Package,
    items: [
      ['pendingPaymentExpiringCount', 'Sắp hết hạn thanh toán', ROUTES.ADMIN_ORDERS, true],
      ['overdueRentalAssetsCount', 'Thiết bị quá hạn', ROUTES.ADMIN_RENTALS, true],
      ['draftRentalChargesCount', 'Phí phát sinh chưa chốt', ROUTES.ADMIN_RENTALS, true],
    ],
  },
  {
    title: 'Thanh toán & Hoàn tiền',
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

  const pendingAlerts = alerts.data || [];

  return (
    <div className={styles.page}>
      {/* 1. Dashboard Header */}
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.pageTitle}>Tổng quan hoạt động</h1>
          <p className={styles.pageSubtitle}>
            Theo dõi tình hình kinh doanh, tiến độ vận hành tour và xử lý sự vụ theo thời gian thực.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link to={ROUTES.ADMIN_ORDERS} className={styles.headerLink}>
            Quản lý đơn hàng <ArrowUpRight size={14} />
          </Link>
          <Link to={ROUTES.ADMIN_TRIPS} className={styles.headerLink}>
            Quản lý chuyến đi <ArrowUpRight size={14} />
          </Link>
          {isAdmin && (
            <Link to={ROUTES.ADMIN_REPORTS} className={styles.headerLinkPrimary}>
              Báo cáo chi tiết <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </header>

      {/* 2. KPI Overview (4 Card Grid - Desktop) */}
      {isAdmin && (
        <section className={styles.section} aria-labelledby="performance-title">
          <div className={styles.sectionHeading}>
            <div className={styles.headingTitleWithBadge}>
              <h2 id="performance-title" className={styles.sectionTitle}>
                Hiệu quả hoạt động
              </h2>
              <span className={styles.periodBadge}>
                <Clock size={12} /> 7 ngày qua
              </span>
            </div>
          </div>

          {kpis.isPending ? (
            <Spinner />
          ) : kpis.isError ? (
            <ErrorState message={kpis.error.message} onRetry={kpis.refetch} />
          ) : (
            <div className={styles.metricsGrid}>
              <article className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Doanh thu ròng</span>
                  <span className={styles.metricIconWrap}>
                    <TrendingUp size={16} />
                  </span>
                </div>
                <strong className={styles.metricValue}>
                  {formatCurrency(kpis.data.netRevenueVnd)}
                </strong>
                <span className={styles.metricMeta}>Trong 7 ngày qua</span>
              </article>

              <article className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Booking mới</span>
                  <span className={styles.metricIconWrap}>
                    <Package size={16} />
                  </span>
                </div>
                <strong className={styles.metricValue}>
                  {kpis.data.weeklyBookingsCount}
                </strong>
                <span className={styles.metricMeta}>Trong 7 ngày qua</span>
              </article>

              <article className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Tỷ lệ lấp chỗ</span>
                  <span className={styles.metricIconWrap}>
                    <CalendarDays size={16} />
                  </span>
                </div>
                <strong className={styles.metricValue}>
                  {kpis.data.averageOccupancyRate}%
                </strong>
                <span className={styles.metricMeta}>Trung bình các đoàn</span>
              </article>

              <article className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Thiết bị đang thuê / Sẵn sàng</span>
                  <span className={styles.metricIconWrap}>
                    <Package size={16} />
                  </span>
                </div>
                <strong className={styles.metricValue}>
                  {kpis.data.activeRentedAssetsCount}
                  <em className={styles.metricSub}> / {kpis.data.totalAvailableAssetsCount}</em>
                </strong>
                <span className={styles.metricMeta}>Tình trạng kho vật lý</span>
              </article>
            </div>
          )}
        </section>
      )}

      {/* 3. Priority Action Center ("Cần xử lý ưu tiên" - Operations First) */}
      <section className={styles.section} aria-labelledby="priority-alerts-title">
        <div className={styles.sectionHeading}>
          <div className={styles.headingTitleWithBadge}>
            <ShieldAlert size={18} className={styles.alertHeadingIcon} />
            <h2 id="priority-alerts-title" className={styles.sectionTitle}>
              Cần xử lý ưu tiên
            </h2>
            {pendingAlerts.length > 0 && (
              <span className={styles.alertCounterBadge}>{pendingAlerts.length}</span>
            )}
          </div>
          {pendingAlerts.length > 0 && (
            <span className={styles.sectionHint}>
              Các sự vụ nghẽn cần admin/staff can thiệp xử lý ngay
            </span>
          )}
        </div>

        {alerts.isPending ? (
          <Spinner />
        ) : alerts.isError ? (
          <ErrorState message={alerts.error.message} onRetry={alerts.refetch} />
        ) : pendingAlerts.length === 0 ? (
          <div className={styles.positiveEmptyCard}>
            <div className={styles.positiveEmptyIcon}>
              <CircleCheck size={26} />
            </div>
            <div className={styles.positiveEmptyText}>
              <strong>Hệ thống hoạt động ổn định</strong>
              <p>Hiện không có cảnh báo hoặc công việc tồn đọng cần can thiệp khẩn cấp.</p>
            </div>
          </div>
        ) : (
          <div className={styles.alertsGrid}>
            {pendingAlerts.map((alert, index) => (
              <article key={`${alert.entityId}-${index}`} className={styles.alertCard}>
                <div className={styles.alertHeaderRow}>
                  <div className={styles.alertSeverityGroup}>
                    <AlertCircle size={15} />
                    <StatusBadge value={alert.severity} />
                  </div>
                  {alert.actionUrl && (
                    <Link to={alert.actionUrl} className={styles.alertActionLink}>
                      Xử lý ngay <ArrowUpRight size={13} />
                    </Link>
                  )}
                </div>
                <h3 className={styles.alertTitle}>{alert.title}</h3>
                <p className={styles.alertMessage}>{alert.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 4. Operations Overview (Grid 3 Cột Ngang trên Desktop) */}
      <section className={styles.section} aria-labelledby="operations-overview-title">
        <div className={styles.sectionHeading}>
          <h2 id="operations-overview-title" className={styles.sectionTitle}>
            Theo dõi vận hành
          </h2>
          <span className={styles.sectionHint}>
            Trạng thái phân nhóm, tồn kho thiết bị và dòng tiền
          </span>
        </div>

        {counters.isPending ? (
          <Spinner />
        ) : counters.isError ? (
          <ErrorState message={counters.error.message} onRetry={counters.refetch} />
        ) : (
          <div className={styles.operationsGrid}>
            {groups.map(({ title, icon: Icon, items }) => (
              <article key={title} className={styles.operationGroupCard}>
                <div className={styles.groupCardHeader}>
                  <div className={styles.groupCardHeaderTitle}>
                    <span className={styles.groupIconWrapper}>
                      <Icon size={16} />
                    </span>
                    <h3>{title}</h3>
                  </div>
                </div>

                <div className={styles.counterRowsList}>
                  {items
                    .filter(([, , , , adminOnly]) => !adminOnly || isAdmin)
                    .map(([key, label, to, needsAction]) => {
                      const countValue = counters.data?.[key] ?? 0;
                      const hasAttention = needsAction && countValue > 0;
                      return (
                        <Link className={styles.counterItemLink} key={key} to={to}>
                          <span className={styles.counterLabel}>{label}</span>
                          <span
                            className={
                              hasAttention ? styles.attentionBadge : styles.neutralBadge
                            }
                          >
                            {countValue}
                          </span>
                          <ArrowUpRight size={13} className={styles.itemArrow} />
                        </Link>
                      );
                    })}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 5. Revenue Analytics Card (Full-width, chiều cao tối ưu 320px) */}
      {isAdmin && (
        <section className={styles.section} aria-labelledby="revenue-analytics-section">
          <RevenueChart />
        </section>
      )}
    </div>
  );
}

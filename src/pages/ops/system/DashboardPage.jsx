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
      { key: 'tripsDepartingIn7DaysCount', label: 'Khởi hành trong 7 ngày', to: ROUTES.ADMIN_TRIPS, level: 'normal' },
      { key: 'unassignedParticipantsCount', label: 'Khách chưa xếp nhóm', to: ROUTES.ADMIN_TRIPS, level: 'warning' },
      { key: 'missingProvidedItemsCount', label: 'Thiếu đồ cấp chuyến', to: '/ops/trips/provided-items', level: 'urgent' },
      { key: 'underCapacityTripsCount', label: 'Chuyến chưa đủ khách', to: ROUTES.ADMIN_TRIPS, level: 'warning' },
    ],
  },
  {
    title: 'Đơn hàng & Thiết bị',
    icon: Package,
    items: [
      { key: 'pendingPaymentExpiringCount', label: 'Sắp hết hạn thanh toán', to: ROUTES.ADMIN_ORDERS, level: 'warning' },
      { key: 'overdueRentalAssetsCount', label: 'Thiết bị quá hạn', to: ROUTES.ADMIN_RENTALS, level: 'urgent' },
      { key: 'draftRentalChargesCount', label: 'Phí phát sinh chưa chốt', to: ROUTES.ADMIN_RENTALS, level: 'warning' },
    ],
  },
  {
    title: 'Thanh toán & Hoàn tiền',
    icon: Wallet,
    items: [
      { key: 'pendingApprovalRefundsCount', label: 'Hoàn tiền chờ duyệt', to: ROUTES.ADMIN_REFUNDS, level: 'urgent', adminOnly: true },
      { key: 'failedRefundsCount', label: 'Hoàn tiền thất bại', to: ROUTES.ADMIN_REFUNDS, level: 'urgent', adminOnly: true },
      { key: 'needsReconciliationOrdersCount', label: 'Đơn cần đối soát', to: ROUTES.ADMIN_ORDERS, level: 'warning' },
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
      {/* Section 1: Dashboard Top Actions */}
      <div className={styles.header}>
        <div className={styles.headerActions}>
          <Link to={ROUTES.ADMIN_ORDERS} className={styles.headerLink}>
            Quản lý đơn hàng <ArrowUpRight size={13} />
          </Link>
          <Link to={ROUTES.ADMIN_TRIPS} className={styles.headerLink}>
            Quản lý chuyến đi <ArrowUpRight size={13} />
          </Link>
          {isAdmin && (
            <Link to={ROUTES.ADMIN_REPORTS} className={styles.headerLinkPrimary}>
              Báo cáo chi tiết <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Section 2: KPI Overview (4 Card Grid - Desktop) */}
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
            <span className={styles.sectionHint}>
              Các chỉ số kinh doanh chính được cập nhật tự động
            </span>
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

      {/* Section 3: Revenue Analytics & Action Center (CSS Grid 60% / 40%) */}
      <section className={styles.section} aria-labelledby="analytics-action-heading">
        <div className={styles.sectionHeading}>
          <div className={styles.headingTitleWithBadge}>
            <h2 id="analytics-action-heading" className={styles.sectionTitle}>
              Phân tích kinh doanh &amp; Hành động trọng tâm
            </h2>
          </div>
          <span className={styles.sectionHint}>
            Đối chiếu số liệu doanh thu dịch vụ và xử lý tức thời các sự vụ nghẽn
          </span>
        </div>

        <div className={styles.analyticsAndActionGrid}>
          {/* Cột Trái 60%: Biểu đồ Doanh thu (nếu isAdmin) */}
          <div className={styles.analyticsColumn}>
            {isAdmin ? (
              <RevenueChart />
            ) : (
              <div className={styles.staffNoticeCard}>
                <h3>Phân hệ thống kê doanh thu</h3>
                <p>Số liệu dòng tiền và doanh thu dịch vụ dành riêng cho tài khoản Quản trị viên (Admin).</p>
              </div>
            )}
          </div>

          {/* Cột Phải 40%: Action Center (Cần xử lý ưu tiên) */}
          <div className={styles.actionCenterColumn}>
            <section className={styles.actionCenterCard} aria-labelledby="priority-alerts-title">
              <div className={styles.actionCardHeader}>
                <div className={styles.actionCardTitleGroup}>
                  <ShieldAlert size={18} className={styles.alertHeadingIcon} />
                  <h2 id="priority-alerts-title" className={styles.actionCardTitle}>
                    Cần xử lý ưu tiên
                  </h2>
                  {pendingAlerts.length > 0 && (
                    <span className={styles.alertCounterBadge}>{pendingAlerts.length}</span>
                  )}
                </div>
                <span className={styles.actionCardMeta}>Mức độ khẩn cấp</span>
              </div>

              {alerts.isPending ? (
                <div className={styles.actionCardLoading}>
                  <Spinner />
                </div>
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
                <div className={styles.alertsScrollList}>
                  {pendingAlerts.map((alert, index) => (
                    <article key={`${alert.entityId}-${index}`} className={styles.alertItemCard}>
                      <div className={styles.alertHeaderRow}>
                        <div className={styles.alertSeverityGroup}>
                          <AlertCircle size={14} />
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
          </div>
        </div>
      </section>

      {/* Section 4: Operational Monitoring (3 Cột ngang cân bằng trên Desktop) */}
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
                    .filter((item) => !item.adminOnly || isAdmin)
                    .map(({ key, label, to, level }) => {
                      const countValue = counters.data?.[key] ?? 0;
                      let badgeClass = styles.badgeNeutral;
                      if (countValue > 0) {
                        if (level === 'urgent') badgeClass = styles.badgeUrgent;
                        else if (level === 'warning') badgeClass = styles.badgeWarning;
                        else if (level === 'normal') badgeClass = styles.badgeNormal;
                      }

                      return (
                        <Link className={styles.counterItemLink} key={key} to={to}>
                          <span className={styles.counterLabel}>{label}</span>
                          <span className={badgeClass}>{countValue}</span>
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
    </div>
  );
}

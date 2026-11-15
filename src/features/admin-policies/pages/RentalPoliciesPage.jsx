import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatDate';
import { useRentalPolicyList } from '../hooks/useRentalPolicies';
import styles from '../AdminPolicies.module.css';

const RENTAL_STATUS_LABEL = { Active: 'Đang áp dụng', Archived: 'Đã thay thế' };

export default function RentalPoliciesPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useRentalPolicyList();

  const policies = Array.isArray(data) ? data : (data?.items ?? []);
  const active = policies.find((policy) => policy.status === 'Active');

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    if (!policies.length) return <EmptyState message="Chưa có chính sách thuê đồ nào" />;

    return (
      <>
        {active && (
          <div className={styles.highlightCard} aria-label="Chính sách thuê đồ đang áp dụng">
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  {active.name} (v{active.version})
                </h3>
                <span className={styles.muted}>Đang áp dụng từ {formatDate(active.effectiveFrom)}</span>
              </div>
              <Link
                className="btn btn-outline"
                to={ROUTES.ADMIN_RENTAL_POLICY_DETAIL(active.rentalPolicyId)}
              >
                Xem chi tiết
              </Link>
            </div>
            <div className={styles.statGrid}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>% tiền cọc</span>
                <span className={styles.statValue}>{active.depositPercent}%</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Huỷ miễn phí</span>
                <span className={styles.statValue}>
                  {active.freeCancelLimit} lần / {active.freeCancelWindowDays} ngày
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Phí huỷ vượt giới hạn</span>
                <span className={styles.statValue}>{active.overLimitCancelFeePercent}%</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Ân hạn trả đồ</span>
                <span className={styles.statValue}>{active.returnGraceHours} giờ</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.tableCard}>
          <div className={styles.tableScroll} tabIndex="0" aria-label="Bảng các phiên bản chính sách thuê đồ">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Phiên bản</th>
                  <th scope="col">Tên</th>
                  <th scope="col">% cọc</th>
                  <th scope="col">Hiệu lực</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Số đơn</th>
                  <th scope="col">Người tạo</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr
                    key={policy.rentalPolicyId}
                    className={`${styles.clickableRow} ${policy.status === 'Active' ? styles.rowCurrent : ''}`.trim()}
                    onClick={() => navigate(ROUTES.ADMIN_RENTAL_POLICY_DETAIL(policy.rentalPolicyId))}
                  >
                    <td className={styles.numeric}>v{policy.version}</td>
                    <td>
                      <Link
                        className={styles.nameLink}
                        to={ROUTES.ADMIN_RENTAL_POLICY_DETAIL(policy.rentalPolicyId)}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {policy.name}
                      </Link>
                    </td>
                    <td className={styles.numeric}>{policy.depositPercent}%</td>
                    <td className={`${styles.muted} ${styles.nowrap}`}>
                      {formatDate(policy.effectiveFrom)} →{' '}
                      {policy.effectiveUntil ? formatDate(policy.effectiveUntil) : 'Hiện tại'}
                    </td>
                    <td>{RENTAL_STATUS_LABEL[policy.status] ?? policy.status}</td>
                    <td className={styles.numeric}>{policy.ordersCount ?? 0} đơn</td>
                    <td className={styles.muted}>{policy.createdByName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <section className={styles.page} aria-label="Chính sách thuê đồ">
      <header className={styles.header}>
        {isAdmin && (
          <div className={styles.actions}>
            <Link className="btn btn-primary" to={ROUTES.ADMIN_RENTAL_POLICY_CREATE}>
              <Plus size={16} aria-hidden="true" /> Tạo phiên bản mới
            </Link>
          </div>
        )}
      </header>
      {renderContent()}
    </section>
  );
}

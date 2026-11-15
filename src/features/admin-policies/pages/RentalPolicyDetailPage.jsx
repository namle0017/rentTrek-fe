import { Link, useParams } from 'react-router-dom';
import { Copy } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import RentalTierTable from '../components/RentalTierTable';
import { useRentalPolicy } from '../hooks/useRentalPolicies';
import styles from '../AdminPolicies.module.css';

const STATUS_LABEL = { Active: 'Đang áp dụng', Archived: 'Đã thay thế' };

export default function RentalPolicyDetailPage() {
  const params = useParams();
  const policyId = params.policyId ?? params.id;
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const { data: policy, isLoading, isError, error, refetch } = useRentalPolicy(policyId);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
  if (!policy) return <ErrorState message="Không tìm thấy chính sách" />;

  const tiersOf = (scope) => (policy.tiers ?? []).filter((tier) => tier.scope === scope);

  return (
    <section className={styles.page} aria-label="Chi tiết chính sách thuê đồ">
      <Breadcrumb
        items={[
          { label: 'Chính sách thuê đồ', to: ROUTES.ADMIN_RENTAL_POLICIES },
          { label: `${policy.name} (v${policy.version})` },
        ]}
      />

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{policy.name}</h2>
            <span className={styles.typeTag}>{STATUS_LABEL[policy.status] ?? policy.status}</span>
          </div>
          <p className={styles.subtitle}>
            Phiên bản {policy.version} · Hiệu lực {formatDate(policy.effectiveFrom)} →{' '}
            {policy.effectiveUntil ? formatDate(policy.effectiveUntil) : 'hiện tại'}
          </p>
        </div>
        {isAdmin && (
          <div className={styles.actions}>
            <Link
              className="btn btn-primary"
              to={`${ROUTES.ADMIN_RENTAL_POLICY_CREATE}?from=${policy.rentalPolicyId ?? policyId}`}
            >
              <Copy size={16} aria-hidden="true" /> Tạo phiên bản mới từ bản này
            </Link>
          </div>
        )}
      </header>


      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Cọc & huỷ đơn</h3>
        <div className={styles.statGrid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>% tiền cọc</span>
            <span className={styles.statValue}>{policy.depositPercent}%</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Huỷ miễn phí</span>
            <span className={styles.statValue}>
              {policy.freeCancelLimit} lần / {policy.freeCancelWindowDays} ngày
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Phí huỷ vượt giới hạn</span>
            <span className={styles.statValue}>{policy.overLimitCancelFeePercent}%</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Mốc vận hành</h3>
        <div className={styles.statGrid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Ân hạn trả đồ</span>
            <span className={styles.statValue}>{policy.returnGraceHours} giờ</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Gia hạn tối đa khi trễ</span>
            <span className={styles.statValue}>{policy.extensionMaxDaysLate} ngày</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Nghi mất đồ sau</span>
            <span className={styles.statValue}>{policy.suspectedLossAfterDays} ngày</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Tự xác nhận nhận hàng sau</span>
            <span className={styles.statValue}>{policy.receiptAutoConfirmHours} giờ</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Ảnh tối thiểu mỗi thiết bị</span>
            <span className={styles.statValue}>{policy.minPhotosPerAsset} ảnh</span>
          </div>
        </div>
        {(policy.ordersCount !== undefined && policy.ordersCount !== null || policy.createdByName) && (
          <p className={styles.muted}>
            {policy.ordersCount !== undefined && policy.ordersCount !== null && `${policy.ordersCount} đơn đã áp dụng phiên bản này`}
            {policy.createdByName && ` · Tạo bởi ${policy.createdByName}`}
            {policy.createdAt && ` · ${formatDateTime(policy.createdAt)}`}
          </p>
        )}
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Phạt trễ nhận / trễ trả</h3>
        <div className={styles.tierGrid}>
          <RentalTierTable title="Trễ nhận đồ" tiers={tiersOf('PickupLate')} />
          <RentalTierTable title="Trễ trả đồ" tiers={tiersOf('ReturnLate')} />
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import PolicyStatusBadge from './PolicyStatusBadge';
import styles from '../AdminPolicies.module.css';

/** Danh sách các phiên bản cùng một family chính sách hoàn tiền. */
export default function PolicyVersionHistory({ versions, currentPolicyId }) {
  if (!versions?.length) return <p className={styles.muted}>Chưa có phiên bản nào khác.</p>;

  return (
    <ol className={styles.versionList} aria-label="Lịch sử phiên bản">
      {versions.map((item) => {
        const isCurrent = item.policyId === currentPolicyId;
        return (
          <li
            key={item.policyId}
            className={`${styles.versionItem} ${isCurrent ? styles.versionItemCurrent : ''}`.trim()}
          >
            <div className={styles.versionTop}>
              {isCurrent ? (
                <strong>Phiên bản {item.version} (đang xem)</strong>
              ) : (
                <Link className={styles.versionLink} to={ROUTES.ADMIN_REFUND_POLICY_DETAIL(item.policyId)}>
                  Phiên bản {item.version}
                </Link>
              )}
              <PolicyStatusBadge status={item.displayStatus} />
            </div>
            <span className={styles.muted}>
              {formatDate(item.effectiveFrom)} → {item.effectiveUntil ? formatDate(item.effectiveUntil) : 'Không thời hạn'}
              {' · '}
              {item.usageCount ?? 0} lượt sử dụng
            </span>
          </li>
        );
      })}
    </ol>
  );
}

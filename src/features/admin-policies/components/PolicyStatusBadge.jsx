import { REFUND_POLICY_STATUS, REFUND_POLICY_STATUS_LABEL } from '@/constants/enums';
import styles from './PolicyStatusBadge.module.css';

const TONE = {
  [REFUND_POLICY_STATUS.DRAFT]: 'neutral',
  [REFUND_POLICY_STATUS.SCHEDULED]: 'info',
  [REFUND_POLICY_STATUS.ACTIVE]: 'success',
  [REFUND_POLICY_STATUS.EXPIRED]: 'warning',
  [REFUND_POLICY_STATUS.ARCHIVED]: 'danger',
};

export default function PolicyStatusBadge({ status }) {
  const label = REFUND_POLICY_STATUS_LABEL[status] ?? 'Không xác định';
  const tone = TONE[status] ?? 'neutral';
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}

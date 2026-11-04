import { OPS_LABELS } from '@/features/operations/constants/opsOptions';
import styles from './Operations.module.css';

export default function StatusBadge({ value }) {
  return <span className={styles.badge} data-status={value}>{OPS_LABELS[value] ?? value ?? 'Chưa cập nhật'}</span>;
}

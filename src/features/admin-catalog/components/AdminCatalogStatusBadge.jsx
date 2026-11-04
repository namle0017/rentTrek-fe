import { ADMIN_CATALOG_STATUS } from '../constants/adminCatalogStatus';
import styles from './AdminCatalogStatusBadge.module.css';

export default function AdminCatalogStatusBadge({ status }) {
  const display = ADMIN_CATALOG_STATUS[status] ?? { label: 'Không xác định', tone: 'neutral' };

  return <span className={`${styles.badge} ${styles[display.tone]}`}>{display.label}</span>;
}

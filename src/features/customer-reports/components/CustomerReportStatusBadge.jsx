import { CUSTOMER_REPORT_STATUS_LABEL } from '../constants/customerReportLabels';
import styles from './CustomerReports.module.css';

export default function CustomerReportStatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[`status-${status}`] ?? ''}`}>
      {CUSTOMER_REPORT_STATUS_LABEL[status] || status}
    </span>
  );
}

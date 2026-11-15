import { useState } from 'react';
import Modal from '@/components/Modal';
import { formatDateTime } from '@/utils/formatDate';
import {
  CUSTOMER_REPORT_SOURCE_LABEL,
  PREFERRED_ACTION_LABEL,
  categoryLabel,
} from '../constants/customerReportLabels';
import CustomerReportStatusBadge from './CustomerReportStatusBadge';
import styles from './CustomerReports.module.css';

function orderLine(report) {
  const source = CUSTOMER_REPORT_SOURCE_LABEL[report.sourceType] || report.sourceType;
  const tour = report.tourName ? ` – ${report.tourName}` : '';
  return `${source} ${report.orderCode}${tour} · `;
}

/** Báo cáo khách đã gửi kèm trạng thái và phản hồi của RenTrek (dùng ở trang khách). */
export default function CustomerReportList({ reports, showOrder = false }) {
  const [lightboxUrl, setLightboxUrl] = useState(null);
  if (!reports?.length) return null;

  return (
    <>
      <ul className={styles.list}>
        {reports.map((report) => (
          <li key={report.customerReportId} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>
                {categoryLabel(report.sourceType, report.category)}
                {report.subjectLabel ? ` · ${report.subjectLabel}` : ''}
              </span>
              <CustomerReportStatusBadge status={report.status} />
            </div>
            <span className={styles.meta}>
              {showOrder && orderLine(report)}
              Gửi lúc {formatDateTime(report.createdAt)}
              {report.preferredAction &&
                ` · Mong muốn: ${PREFERRED_ACTION_LABEL[report.preferredAction] || report.preferredAction}`}
            </span>
            <p className={styles.description}>{report.description}</p>
            {report.photoUrls?.length > 0 && (
              <div className={styles.photos}>
                {report.photoUrls.map((url, index) => (
                  <button
                    key={url}
                    type="button"
                    className={styles.photo}
                    onClick={() => setLightboxUrl(url)}
                    aria-label={`Xem ảnh ${index + 1}`}
                  >
                    <img src={url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            {report.adminNote && (
              <p className={styles.reply}>
                <strong>Phản hồi từ RenTrek:</strong> {report.adminNote}
              </p>
            )}
          </li>
        ))}
      </ul>
      {lightboxUrl && (
        <Modal title="Ảnh đính kèm" onClose={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Ảnh đính kèm báo cáo" className={styles.lightbox} />
        </Modal>
      )}
    </>
  );
}

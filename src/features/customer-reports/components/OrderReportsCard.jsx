import { useState } from 'react';
import { useMyCustomerReports } from '../hooks/useCustomerReports';
import CustomerReportList from './CustomerReportList';
import TripReportModal from './TripReportModal';
import styles from './CustomerReports.module.css';

/**
 * Thẻ "Báo cáo vấn đề" trên trang chi tiết booking chuyến: nút mở form báo cáo
 * và danh sách báo cáo khách đã gửi cho đơn này kèm phản hồi của RenTrek.
 */
export default function OrderReportsCard({ orderId, tripLabel, canReport }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: reports = [] } = useMyCustomerReports(orderId);
  if (!canReport && reports.length === 0) return null;

  return (
    <section className={styles.reportCard} aria-label="Báo cáo vấn đề chuyến đi">
      <div className={styles.reportCardHead}>
        <span className={styles.kicker}>BÁO CÁO VẤN ĐỀ</span>
        <p>Gặp sự cố với hướng dẫn viên, lịch trình, an toàn hay dịch vụ? Gửi cho RenTrek để được xử lý.</p>
      </div>
      <CustomerReportList reports={reports} />
      {canReport && (
        <button type="button" className="btn btn-outline" onClick={() => setIsOpen(true)}>
          Báo cáo vấn đề
        </button>
      )}
      {isOpen && <TripReportModal orderId={orderId} tripLabel={tripLabel} onClose={() => setIsOpen(false)} />}
    </section>
  );
}

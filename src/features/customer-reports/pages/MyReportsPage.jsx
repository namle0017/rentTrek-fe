import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import CustomerReportList from '../components/CustomerReportList';
import { useMyCustomerReports } from '../hooks/useCustomerReports';
import styles from './MyReportsPage.module.css';

/** Khách xem mọi báo cáo đã gửi (đơn thuê + chuyến đi) cùng trạng thái và phản hồi từ RenTrek. */
export default function MyReportsPage() {
  const { data: reports = [], isLoading, isError, error, refetch } = useMyCustomerReports();

  const renderBody = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    if (!reports.length) {
      return (
        <EmptyState message="Bạn chưa gửi báo cáo nào. Gửi báo cáo từ trang chi tiết đơn thuê hoặc chuyến đi khi gặp sự cố." />
      );
    }
    return <CustomerReportList reports={reports} showOrder />;
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span className={styles.kicker}>TÀI KHOẢN</span>
        <h1>Báo cáo của tôi</h1>
        <p>Theo dõi các báo cáo sự cố bạn đã gửi về đơn thuê thiết bị và chuyến đi.</p>
      </header>
      {renderBody()}
    </main>
  );
}

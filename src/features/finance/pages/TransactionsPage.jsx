import { useState } from 'react';
import Pagination from '@/components/Pagination';
import { usePayments, usePaymentStats } from '../hooks/usePayments';
import TransactionFilterBar from '../components/TransactionFilterBar';
import TransactionSummaryCards from '../components/TransactionSummaryCards';
import TransactionTable from '../components/TransactionTable';
import TransactionDetailDrawer from '../components/TransactionDetailDrawer';
import { financeService } from '../api/financeService';
import { toast } from 'react-toastify';
import styles from '../components/finance.module.css';

export default function TransactionsPage() {
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: '',
    paymentType: 'All',
    purpose: 'All',
    status: 'All',
    fromDate: '',
    toDate: '',
  });

  const [selectedPayment, setSelectedPayment] = useState(null);

  const { data: pagedData, isLoading: isPaymentsLoading } = usePayments(filters);
  const { data: statsData, isLoading: isStatsLoading } = usePaymentStats();

  const handleResetFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 10,
      search: '',
      paymentType: 'All',
      purpose: 'All',
      status: 'All',
      fromDate: '',
      toDate: '',
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handleExportExcel = () => {
    if (!pagedData?.items?.length) {
      toast.info('Không có dữ liệu giao dịch để xuất');
      return;
    }
    const BOM = '\uFEFF';
    const headers =
      '"Mã giao dịch","Mã đơn hàng","Loại dòng tiền","Mục đích","Số tiền (VNĐ)","Thực nhận (VNĐ)","Trạng thái","Mã SePay","Thời gian tạo"\n';
    const rows = pagedData.items
      .map(
        (p) =>
          `"${p.paymentId}","${p.orderCode}","${p.paymentType}","${p.purpose}",${p.amount},${p.receivedAmount ?? ''},"${p.status}","${p.providerTransactionId || ''}","${p.createdAt}"`,
      )
      .join('\n');

    const blob = new Blob([BOM + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Giao_dich_RenTrekk_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải xuống file Excel giao dịch thành công');
  };

  return (
    <div className={styles.container}>

      {/* Thẻ tổng hợp KPI tài chính */}
      <TransactionSummaryCards stats={statsData} isLoading={isStatsLoading} />

      {/* Bộ lọc và tìm kiếm */}
      <TransactionFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        onExportExcel={handleExportExcel}
      />

      {/* Bảng dữ liệu giao dịch */}
      <TransactionTable
        payments={pagedData?.items}
        isLoading={isPaymentsLoading}
        onSelectPayment={setSelectedPayment}
      />

      {/* Phân trang */}
      {pagedData && (
        <Pagination
          pageNumber={pagedData.pageNumber}
          totalPages={pagedData.totalPages}
          hasPrevious={pagedData.hasPrevious}
          hasNext={pagedData.hasNext}
          onPageChange={handlePageChange}
        />
      )}

      {/* Drawer xem chi tiết kiểm toán giao dịch */}
      <TransactionDetailDrawer
        payment={selectedPayment}
        isOpen={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  );
}

import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { API_ENDPOINTS } from '@/api/endpoints';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { useManualRefunds } from '../hooks/useManualRefunds';
import ManualRefundDialog from './ManualRefundDialog';
import ProofGallery from './ProofGallery';
import styles from './RefundQueue.module.css';

const PAGE_SIZE = 10;
const TABS = [
  { value: 'Pending', label: 'Chờ chuyển khoản' },
  { value: 'PendingApproval', label: 'Chờ duyệt' },
  { value: 'Failed', label: 'Thất bại' },
];
const STATUS_LABEL = {
  ...Object.fromEntries(TABS.map((tab) => [tab.value, tab.label])),
  Succeeded: 'Đã hoàn',
};

/** Khoản hoàn (payment) chưa có hồ sơ hoàn tiền, ghi nhận chuyển khoản tay kèm ảnh chứng từ. */
export default function ManualRefundList() {
  const [tab, setTab] = useState('Pending');
  const [pageNumber, setPageNumber] = useState(1);
  const [selected, setSelected] = useState(null);

  const {
    data: list,
    isLoading,
    isError,
    error,
    refetch,
  } = useManualRefunds({ tab, pageNumber, pageSize: PAGE_SIZE });

  const handleTabChange = (event) => {
    setTab(event.target.value);
    setPageNumber(1);
  };

  return (
    <div className={styles.page}>
      <form
        className={styles.filters}
        aria-label="Lọc hoàn tiền thủ công"
        onSubmit={(e) => e.preventDefault()}
      >
        <label>
          Trạng thái
          <select value={tab} onChange={handleTabChange}>
            {TABS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </form>

      {isLoading && <Spinner />}
      {isError && (
        <ErrorState
          message={error?.message || 'Không thể tải danh sách hoàn tiền thủ công.'}
          onRetry={refetch}
        />
      )}
      {list?.items.length === 0 && <EmptyState message="Không có khoản hoàn tiền nào." />}

      {list?.items.length > 0 && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Đơn hàng</th>
                  <th scope="col">Số tiền</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Chứng từ</th>
                  <th scope="col">
                    <span className={styles.srOnly}>Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((payment) => {
                  const canMark = payment.status !== 'Succeeded' && !payment.hasRefundCase;
                  return (
                    <tr key={payment.paymentId}>
                      <td data-label="Đơn hàng">
                        <strong>{payment.orderCode}</strong>
                        <small>{formatDateTime(payment.createdAt)}</small>
                      </td>
                      <td data-label="Số tiền">
                        <strong>{formatCurrency(Math.abs(payment.amount))}</strong>
                        {payment.policyRuleDescription && <small>{payment.policyRuleDescription}</small>}
                      </td>
                      <td data-label="Trạng thái">
                        <span className={styles.status}>
                          {STATUS_LABEL[payment.status] ?? payment.status}
                        </span>
                        {payment.failureReason && <small>Lý do: {payment.failureReason}</small>}
                      </td>
                      <td data-label="Chứng từ">
                        {payment.manualReference && <small>Mã tham chiếu: {payment.manualReference}</small>}
                        {(payment.proofs?.length > 0 || payment.status === 'Succeeded') && (
                          <ProofGallery
                            proofs={payment.proofs}
                            buildUrl={(proofId) => API_ENDPOINTS.REFUNDS.PROOF(payment.paymentId, proofId)}
                          />
                        )}
                      </td>
                      <td className={styles.actions}>
                        {canMark && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setSelected(payment)}
                          >
                            Ghi nhận đã chuyển
                          </button>
                        )}
                        {payment.hasRefundCase && <small>Xử lý ở tab Hồ sơ hoàn tiền</small>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            pageNumber={list.pageNumber}
            totalPages={list.totalPages}
            hasPrevious={list.hasPrevious}
            hasNext={list.hasNext}
            onPageChange={setPageNumber}
          />
        </>
      )}

      {selected && <ManualRefundDialog payment={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

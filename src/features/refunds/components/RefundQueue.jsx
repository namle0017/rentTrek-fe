import { useSearchParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { REFUND_BANKS, REFUND_CASE_STATUS_LABEL } from '@/constants/enums';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime, toIsoString } from '@/utils/formatDate';
import { useRefundQueue } from '../hooks/useRefundCases';
import { formatRefundCode, getBankName } from '../utils/refundDisplay';
import styles from './RefundQueue.module.css';

const PAGE_SIZE = 10;

function formatRule(item) {
  if (item.refundPercentage === null) return 'Không có mốc áp dụng';
  return `Trước ≥ ${item.minHoursBefore} giờ · hoàn ${item.refundPercentage}%`;
}

/** Bộ lọc nằm trên URL để F5 hoặc gửi link không mất trạng thái. */
export default function RefundQueue({ title, description, statuses, renderActions, toolbar }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const fromDate = searchParams.get('fromDate') ?? '';
  const toDate = searchParams.get('toDate') ?? '';
  const pageNumber = Number(searchParams.get('pageNumber')) || 1;

  const {
    data: queue,
    isLoading,
    isError,
    error,
    refetch,
  } = useRefundQueue({
    status,
    fromDate: toIsoString(fromDate),
    toDate: toDate ? toIsoString(`${toDate}T23:59:59`) : null,
    pageNumber,
    pageSize: PAGE_SIZE,
  });

  const updateParams = (changes) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
      return next;
    });
  };

  const handleFilterChange = (event) =>
    updateParams({ [event.target.name]: event.target.value, pageNumber: null });

  return (
    <main className={styles.page}>
      {toolbar && (
        <div className={styles.pageHeader} style={{ justifyContent: 'flex-end', paddingBottom: 12 }}>
          <div className={styles.toolbar}>{toolbar}</div>
        </div>
      )}

      <form className={styles.filters} aria-label="Lọc hồ sơ">
        <label>
          Trạng thái
          <select name="status" value={status} onChange={handleFilterChange}>
            <option value="">Tất cả</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {REFUND_CASE_STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Từ ngày
          <input
            type="date"
            name="fromDate"
            value={fromDate}
            max={toDate || undefined}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Đến ngày
          <input
            type="date"
            name="toDate"
            value={toDate}
            min={fromDate || undefined}
            onChange={handleFilterChange}
          />
        </label>
      </form>

      {isLoading && <Spinner />}
      {isError && (
        <ErrorState message={error?.message || 'Không thể tải hồ sơ hoàn tiền.'} onRetry={refetch} />
      )}
      {queue?.items.length === 0 && <EmptyState message="Không có hồ sơ nào cần xử lý." />}

      {queue?.items.length > 0 && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Hồ sơ</th>
                  <th scope="col">Khách / Tour</th>
                  <th scope="col">Số tiền</th>
                  <th scope="col">Tài khoản</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">
                    <span className={styles.srOnly}>Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {queue.items.map((item) => (
                  <tr key={item.refundCaseId}>
                    <td data-label="Hồ sơ">
                      <strong>{formatRefundCode(item.refundCaseId)}</strong>
                      <small>{item.orderCode}</small>
                      <small>{formatDateTime(item.createdAt)}</small>
                    </td>
                    <td data-label="Khách / Tour">
                      <strong>{item.customerName}</strong>
                      <small>{item.tourName}</small>
                      {item.cancelReason && <small>Lý do hủy: {item.cancelReason}</small>}
                    </td>
                    <td data-label="Số tiền">
                      <strong>{formatCurrency(item.amount)}</strong>
                      <small>
                        {item.policyName} v{item.policyVersion}
                      </small>
                      <small>{formatRule(item)}</small>
                    </td>
                    <td data-label="Tài khoản">
                      <strong>{getBankName(REFUND_BANKS, item.bankCode)}</strong>
                      <small>{item.maskedAccount}</small>
                    </td>
                    <td data-label="Trạng thái">
                      <span className={styles.status}>{REFUND_CASE_STATUS_LABEL[item.status]}</span>
                    </td>
                    <td className={styles.actions}>{renderActions(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            pageNumber={queue.pageNumber}
            totalPages={queue.totalPages}
            hasPrevious={queue.hasPrevious}
            hasNext={queue.hasNext}
            onPageChange={(page) => updateParams({ pageNumber: String(page) })}
          />
        </>
      )}
    </main>
  );
}

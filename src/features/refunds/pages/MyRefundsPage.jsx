import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { ORDER_TYPE, REFUND_CASE_STATUS, REFUND_CASE_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import AccountShell from '@/features/users/components/AccountShell';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { useMyRefunds } from '../hooks/useRefundCases';
import { formatRefundCode, REFUND_ACTION_STATUSES } from '../utils/refundDisplay';
import styles from './MyRefundsPage.module.css';

const TABS = [
  { label: 'Tất cả', status: undefined },
  { label: 'Cần bạn xử lý', status: REFUND_ACTION_STATUSES.join(',') },
  { label: 'Đang xử lý', status: [REFUND_CASE_STATUS.REQUESTED, REFUND_CASE_STATUS.APPROVED].join(',') },
  { label: 'Đã hoàn tiền', status: REFUND_CASE_STATUS.COMPLETED },
];

const SOURCE_LABEL = {
  TripCancellation: 'Huỷ tour',
  RentalCancellation: 'Huỷ đơn thuê',
  RentalNoShow: 'Không đến nhận đồ',
  RentalDepositReturn: 'Hoàn cọc thuê đồ',
};

/** Việc khách cần làm tiếp theo với hồ sơ, hiển thị nổi bật trên thẻ. */
function actionHint(refund) {
  if (refund.canSubmitBankInfo) return 'Cần nhập số tài khoản nhận hoàn tiền';
  if (refund.canResubmit) return 'Có thể nhập lại số tài khoản và gửi lại yêu cầu';
  return null;
}

function RefundCard({ refund }) {
  const hint = actionHint(refund);
  const title =
    refund.tourName || (refund.orderType === ORDER_TYPE.RENTAL ? 'Đơn thuê thiết bị' : 'Đơn đặt tour');
  return (
    <Link className={`${styles.card} ${hint ? styles.cardAction : ''}`} to={ROUTES.MY_REFUND_DETAIL(refund.refundCaseId)}>
      <div className={styles.cardMain}>
        <span className={styles.type}>
          {formatRefundCode(refund.refundCaseId)} · {SOURCE_LABEL[refund.source] || refund.source}
        </span>
        <strong>{title}</strong>
        <small>
          Đơn {refund.orderCode} · cập nhật {formatDateTime(refund.updatedAt)}
        </small>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      <div className={styles.cardSide}>
        <span className={styles.status}>{REFUND_CASE_STATUS_LABEL[refund.status] || refund.status}</span>
        <b>{formatCurrency(refund.amount)}</b>
      </div>
    </Link>
  );
}

export default function MyRefundsPage() {
  const [status, setStatus] = useState(undefined);
  const [pageNumber, setPageNumber] = useState(1);
  const { data, isLoading, isError, error, refetch } = useMyRefunds({ pageNumber, pageSize: 10, status });

  const selectTab = (next) => {
    setStatus(next);
    setPageNumber(1);
  };

  return (
    <AccountShell active="refunds">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Hoàn tiền của tôi</h1>
          <p>Theo dõi các khoản hoàn tiền, nhập số tài khoản nhận tiền và xem biên lai chuyển khoản.</p>
        </header>

        <div className={styles.tabs} role="group" aria-label="Lọc trạng thái hoàn tiền">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              aria-pressed={status === tab.status}
              onClick={() => selectTab(tab.status)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && <Spinner />}
        {isError && <ErrorState message={error?.message || 'Không thể tải danh sách hoàn tiền.'} onRetry={refetch} />}
        {data?.items.length === 0 && <EmptyState message="Chưa có hồ sơ hoàn tiền nào." />}
        {data?.items.length > 0 && (
          <>
            <div className={styles.list}>
              {data.items.map((refund) => (
                <RefundCard key={refund.refundCaseId} refund={refund} />
              ))}
            </div>
            <Pagination {...data} onPageChange={setPageNumber} />
          </>
        )}
      </div>
    </AccountShell>
  );
}

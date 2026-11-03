import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import Spinner from '@/components/Spinner';
import { REFUND_BANKS, REFUND_CASE_STATUS, REFUND_CASE_STATUS_LABEL } from '@/constants/enums';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { useRefundCase } from '../hooks/useRefundCases';
import { formatRefundCode, getBankName } from '../utils/refundDisplay';
import styles from './RefundProgressCard.module.css';

const STEPS = [
  { status: REFUND_CASE_STATUS.REQUESTED, label: 'Đã tạo hồ sơ' },
  { status: REFUND_CASE_STATUS.APPROVED, label: 'Kế toán đang xử lý' },
  { status: REFUND_CASE_STATUS.COMPLETED, label: 'Hoàn tất' },
];

// Trạng thái ngoài luồng chính dừng ở bước đã đi tới
const STEP_OF_SIDE_STATUS = {
  [REFUND_CASE_STATUS.REJECTED]: REFUND_CASE_STATUS.REQUESTED,
  [REFUND_CASE_STATUS.FAILED]: REFUND_CASE_STATUS.APPROVED,
  [REFUND_CASE_STATUS.CANCELLED]: REFUND_CASE_STATUS.REQUESTED,
};

const STATUS_NOTES = {
  [REFUND_CASE_STATUS.COMPLETED]: 'Tiền hoàn đã được chuyển. Nếu chưa nhận được, vui lòng liên hệ hỗ trợ.',
  [REFUND_CASE_STATUS.REJECTED]: 'Hồ sơ bị từ chối. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.',
  [REFUND_CASE_STATUS.FAILED]: 'Chuyển khoản không thành công. Vui lòng liên hệ hỗ trợ.',
};

const STATUS_CHIP_CLASS = {
  [REFUND_CASE_STATUS.REQUESTED]: styles.statusRequested,
  [REFUND_CASE_STATUS.APPROVED]: styles.statusApproved,
  [REFUND_CASE_STATUS.COMPLETED]: styles.statusCompleted,
  [REFUND_CASE_STATUS.REJECTED]: styles.statusRejected,
  [REFUND_CASE_STATUS.FAILED]: styles.statusRejected,
};

function RefundTimeline({ refundCase }) {
  const reachedStatus = STEP_OF_SIDE_STATUS[refundCase.status] ?? refundCase.status;
  const currentIndex = STEPS.findIndex((step) => step.status === reachedStatus);
  const occurredAt = Object.fromEntries(refundCase.timeline.map((event) => [event.status, event.occurredAt]));
  const isFinished = refundCase.status === REFUND_CASE_STATUS.COMPLETED;

  return (
    <ol className={styles.timeline} aria-label="Tiến độ hoàn tiền">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex || (isFinished && index === currentIndex);
        const isCurrent = index === currentIndex && !isFinished;
        return (
          <li
            key={step.status}
            className={isDone ? styles.done : isCurrent ? styles.current : undefined}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span aria-hidden="true">{isDone ? '✓' : index + 1}</span>
            <div>
              <strong>{step.label}</strong>
              {occurredAt[step.status] && <small>{formatDateTime(occurredAt[step.status])}</small>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function RefundProgressCard({ refundCaseId }) {
  const { data: refundCase, isLoading, isError, error, refetch } = useRefundCase(refundCaseId);

  if (isLoading)
    return (
      <section className={styles.card}>
        <Spinner />
      </section>
    );
  if (isError)
    return <ErrorState message={error?.message || 'Không thể tải tiến độ hoàn tiền.'} onRetry={refetch} />;
  if (!refundCase) return null;

  const note = STATUS_NOTES[refundCase.status];

  return (
    <section className={styles.card} aria-labelledby="refund-progress-title">
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>HỒ SƠ {formatRefundCode(refundCase.refundCaseId)}</span>
          <h2 id="refund-progress-title">Tiến độ hoàn tiền</h2>
        </div>
        <span className={`${styles.status} ${STATUS_CHIP_CLASS[refundCase.status] || styles.statusDefault}`}>
          <OutdoorIcon name={refundCase.status === REFUND_CASE_STATUS.COMPLETED ? 'check' : 'shield'} size={14} />
          {REFUND_CASE_STATUS_LABEL[refundCase.status] || 'Đang xử lý'}
        </span>
      </header>

      <dl className={styles.facts}>
        <div>
          <dt>Số tiền hoàn</dt>
          <dd className={styles.amount}>{formatCurrency(refundCase.amount)}</dd>
        </div>
        <div>
          <dt>Tài khoản nhận</dt>
          <dd>
            {getBankName(REFUND_BANKS, refundCase.bankCode)} · {refundCase.maskedAccount}
          </dd>
        </div>
      </dl>

      <RefundTimeline refundCase={refundCase} />

      {note && <p className={styles.note}>{note}</p>}
    </section>
  );
}

import { useEffect, useState } from 'react';
import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import Spinner from '@/components/Spinner';
import { REFUND_BANKS, REFUND_CASE_STATUS, REFUND_CASE_STATUS_LABEL } from '@/constants/enums';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { useRefundCase } from '../hooks/useRefundCases';
import { formatRefundCode, getBankName } from '../utils/refundDisplay';
import { parseAdminTransactionWithProof } from '../utils/refundProofHelper';
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
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!lightboxUrl) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxUrl]);

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
  const parsedTx = parseAdminTransactionWithProof(refundCase.providerTransactionId);

  const handleCopyTx = () => {
    if (!parsedTx.transactionId) return;
    navigator.clipboard?.writeText(parsedTx.transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      {(parsedTx.transactionId || parsedTx.hasProof) && (
        <div className={styles.receiptSection}>
          <div className={styles.receiptHeader}>
            <OutdoorIcon name="receipt" size={16} />
            <strong>Biên lai chuyển khoản hoàn tiền từ RenTrek</strong>
          </div>
          <div className={styles.receiptContent}>
            {parsedTx.transactionId && (
              <div className={styles.txCodeRow}>
                <span className={styles.txLabel}>Mã giao dịch ngân hàng:</span>
                <code className={styles.txCode}>{parsedTx.transactionId}</code>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={handleCopyTx}
                  title="Sao chép mã giao dịch"
                >
                  {copied ? '✓ Đã sao chép' : 'Sao chép'}
                </button>
              </div>
            )}
            {parsedTx.hasProof && (
              <div className={styles.receiptThumbWrapper}>
                <span className={styles.receiptThumbLabel}>Ảnh chụp biên lai chuyển khoản:</span>
                <button
                  type="button"
                  className={styles.receiptThumbBtn}
                  onClick={() => setLightboxUrl(parsedTx.proofUrl)}
                  title="Bấm để phóng to biên lai"
                  aria-label="Phóng to biên lai"
                >
                  <img
                    src={parsedTx.proofUrl}
                    alt="Biên lai chuyển khoản RenTrek"
                    className={styles.receiptThumbImg}
                  />
                  <span className={styles.receiptZoomOverlay}>🔍 Phóng to</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {note && <p className={styles.note}>{note}</p>}

      {lightboxUrl && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Xem biên lai chuyển khoản"
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxHeader}>
              <span>Biên lai chuyển khoản hoàn tiền</span>
              <div className={styles.lightboxActions}>
                <a
                  href={lightboxUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.lightboxNewTab}
                >
                  Mở ảnh gốc ↗
                </a>
                <button
                  type="button"
                  className={styles.lightboxCloseBtn}
                  onClick={() => setLightboxUrl(null)}
                  aria-label="Đóng"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className={styles.lightboxBody}>
              <img src={lightboxUrl} alt="Biên lai ngân hàng đầy đủ" className={styles.lightboxImg} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

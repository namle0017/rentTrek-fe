import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { REFUND_CASE_STATUS } from '@/constants/enums';
import { toIsoString } from '@/utils/formatDate';
import RefundCompleteDialog from '../components/RefundCompleteDialog';
import RefundExportDialog from '../components/RefundExportDialog';
import RefundQueue from '../components/RefundQueue';
import RefundReasonDialog from '../components/RefundReasonDialog';
import { useMarkRefundFailed, useRejectRefund } from '../hooks/useRefundCases';

const ADMIN_STATUSES = [
  REFUND_CASE_STATUS.REQUESTED,
  REFUND_CASE_STATUS.APPROVED,
  REFUND_CASE_STATUS.COMPLETED,
  REFUND_CASE_STATUS.REJECTED,
  REFUND_CASE_STATUS.FAILED,
];

export default function AdminRefundsPage() {
  const [searchParams] = useSearchParams();
  const reject = useRejectRefund();
  const markFailed = useMarkRefundFailed();
  const [dialog, setDialog] = useState(null);
  const closeDialog = () => setDialog(null);

  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  const renderActions = (item) => {
    if (item.status === REFUND_CASE_STATUS.REQUESTED) {
      return (
        <button type="button" className="btn btn-outline" onClick={() => setDialog({ type: 'reject', item })}>
          Từ chối
        </button>
      );
    }
    if (item.status === REFUND_CASE_STATUS.APPROVED) {
      return (
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setDialog({ type: 'complete', item })}
          >
            Đã hoàn tiền
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setDialog({ type: 'failed', item })}
          >
            Báo thất bại
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <RefundQueue
        title="Hoàn tiền"
        description="Xuất các hồ sơ đang chờ ra Excel cho kế toán chuyển khoản, sau đó đánh dấu từng hồ sơ đã hoàn tiền."
        statuses={ADMIN_STATUSES}
        renderActions={renderActions}
        toolbar={
          <>
            <button type="button" className="btn btn-primary" onClick={() => setDialog({ type: 'export' })}>
              Xuất Excel cho kế toán
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setDialog({ type: 'reexport' })}>
              Xuất lại file
            </button>
          </>
        }
      />
      {(dialog?.type === 'export' || dialog?.type === 'reexport') && (
        <RefundExportDialog
          reExport={dialog.type === 'reexport'}
          fromDate={fromDate ? toIsoString(fromDate) : null}
          toDate={toDate ? toIsoString(`${toDate}T23:59:59`) : null}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'complete' && <RefundCompleteDialog item={dialog.item} onClose={closeDialog} />}
      {dialog?.type === 'reject' && (
        <RefundReasonDialog
          item={dialog.item}
          title="Từ chối hồ sơ"
          submitLabel="Từ chối"
          mutation={reject}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'failed' && (
        <RefundReasonDialog
          item={dialog.item}
          title="Báo chuyển khoản thất bại"
          submitLabel="Ghi nhận thất bại"
          mutation={markFailed}
          onClose={closeDialog}
        />
      )}
    </>
  );
}

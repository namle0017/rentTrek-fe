import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { REFUND_CASE_STATUS } from '@/constants/enums';
import { toIsoString } from '@/utils/formatDate';
import RefundCompleteDialog from '../components/RefundCompleteDialog';
import RefundExportDialog from '../components/RefundExportDialog';
import RefundDetailModal from '../components/RefundDetailModal';
import RefundQueue from '../components/RefundQueue';
import RefundReasonDialog from '../components/RefundReasonDialog';
import { useMarkRefundFailed, useRejectRefund } from '../hooks/useRefundCases';

const ADMIN_STATUSES = [
  REFUND_CASE_STATUS.AWAITING_BANK_INFO,
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
    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
          onClick={() => setDialog({ type: 'detail', item })}
          title="Xem chi tiết hồ sơ & minh chứng hình ảnh"
        >
          Xem minh chứng
        </button>

        {item.status === REFUND_CASE_STATUS.REQUESTED && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.8125rem', color: '#dc2626', borderColor: '#fca5a5' }}
            onClick={() => setDialog({ type: 'reject', item })}
          >
            Từ chối
          </button>
        )}

        {item.status === REFUND_CASE_STATUS.APPROVED && (
          <>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
              onClick={() => setDialog({ type: 'complete', item })}
            >
              Đã hoàn tiền
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '6px 10px', fontSize: '0.8125rem', color: '#b45309' }}
              onClick={() => setDialog({ type: 'failed', item })}
            >
              Báo thất bại
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <RefundQueue
        title="Hàng đợi hoàn tiền"
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

      {dialog?.type === 'detail' && (
        <RefundDetailModal
          item={dialog.item}
          onClose={closeDialog}
          onApprove={(item) => {
            closeDialog();
            setDialog({ type: 'export' });
          }}
          onReject={(item) => {
            closeDialog();
            setDialog({ type: 'reject', item });
          }}
          onComplete={(item) => {
            closeDialog();
            setDialog({ type: 'complete', item });
          }}
          onMarkFailed={(item) => {
            closeDialog();
            setDialog({ type: 'failed', item });
          }}
        />
      )}

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

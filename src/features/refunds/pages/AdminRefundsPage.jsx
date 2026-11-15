import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { REFUND_CASE_STATUS } from '@/constants/enums';
import { toIsoString } from '@/utils/formatDate';
import RefundCompleteDialog from '../components/RefundCompleteDialog';
import ManualRefundList from '../components/ManualRefundList';
import RefundExportDialog from '../components/RefundExportDialog';
import RefundDetailModal from '../components/RefundDetailModal';
import RefundImportDialog from '../components/RefundImportDialog';
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

const TABS = [
  { value: 'cases', label: 'Hồ sơ hoàn tiền' },
  { value: 'manual', label: 'Hoàn tiền thủ công (không qua hồ sơ)' },
];

export default function AdminRefundsPage() {
  const [searchParams] = useSearchParams();
  const reject = useRejectRefund();
  const markFailed = useMarkRefundFailed();
  const [dialog, setDialog] = useState(null);
  const [tab, setTab] = useState('cases');
  const closeDialog = () => setDialog(null);

  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  const failButton = (item) => (
    <button type="button" className="btn btn-outline" onClick={() => setDialog({ type: 'failed', item })}>
      Báo thất bại
    </button>
  );

  const renderActions = (item) => {
    const detailButton = (
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => setDialog({ type: 'detail', item })}
        title="Xem chi tiết hồ sơ & minh chứng hình ảnh"
      >
        Xem minh chứng
      </button>
    );
    if (item.status === REFUND_CASE_STATUS.AWAITING_BANK_INFO) {
      return (
        <div>
          {detailButton}
          {failButton(item)}
        </div>
      );
    }
    if (item.status === REFUND_CASE_STATUS.REQUESTED) {
      return (
        <div>
          {detailButton}
          <button type="button" className="btn btn-outline" onClick={() => setDialog({ type: 'reject', item })}>
            Từ chối
          </button>
          {failButton(item)}
        </div>
      );
    }
    if (item.status === REFUND_CASE_STATUS.APPROVED) {
      return (
        <div>
          {detailButton}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setDialog({ type: 'complete', item })}
          >
            Đã hoàn tiền
          </button>
          {failButton(item)}
        </div>
      );
    }
    return <div>{detailButton}</div>;
  };

  return (
    <>
      <div role="tablist" aria-label="Loại hoàn tiền" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            className={`btn ${tab === item.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === 'manual' && <ManualRefundList />}
      {tab === 'cases' && (
        <RefundQueue
          title="Hàng đợi hoàn tiền"
          description="Xuất các hồ sơ đang chờ ra Excel cho kế toán chuyển khoản, sau đó nhập lại file kết quả của kế toán hoặc đánh dấu từng hồ sơ đã hoàn tiền."
          statuses={ADMIN_STATUSES}
          renderActions={renderActions}
          toolbar={
            <>
              <button type="button" className="btn btn-primary" onClick={() => setDialog({ type: 'export' })}>
                Xuất Excel cho kế toán
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setDialog({ type: 'import' })}>
                Nhập kết quả chuyển khoản
              </button>
            </>
          }
        />
      )}
      {dialog?.type === 'detail' && (
        <RefundDetailModal
          item={dialog.item}
          onClose={closeDialog}
          onApprove={() => setDialog({ type: 'export' })}
          onReject={(item) => setDialog({ type: 'reject', item })}
          onComplete={(item) => setDialog({ type: 'complete', item })}
          onMarkFailed={(item) => setDialog({ type: 'failed', item })}
        />
      )}
      {dialog?.type === 'export' && (
        <RefundExportDialog
          fromDate={fromDate ? toIsoString(fromDate) : null}
          toDate={toDate ? toIsoString(`${toDate}T23:59:59`) : null}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'import' && <RefundImportDialog onClose={closeDialog} />}
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
          title="Báo thất bại – yêu cầu khách nhập lại số tài khoản"
          description="Số tài khoản hiện tại sẽ bị xoá, hồ sơ chuyển về 'Chờ khách cung cấp tài khoản' và khách nhận thông báo kèm lý do để nhập lại. Sau khi khách nhập, hồ sơ sẽ có trong lần xuất Excel tiếp theo."
          submitLabel="Gửi yêu cầu cho khách"
          mutation={markFailed}
          onClose={closeDialog}
        />
      )}
    </>
  );
}

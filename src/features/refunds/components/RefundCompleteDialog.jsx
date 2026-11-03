import { useState } from 'react';
import Modal from '@/components/Modal';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCompleteRefund } from '../hooks/useRefundCases';
import { formatRefundCode } from '../utils/refundDisplay';

/** Admin xác nhận kế toán đã chuyển khoản; mã giao dịch không bắt buộc. */
export default function RefundCompleteDialog({ item, onClose }) {
  const complete = useCompleteRefund();
  const [transactionId, setTransactionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    try {
      await complete.mutateAsync({
        refundCaseId: item.refundCaseId,
        payload: {
          providerTransactionId: transactionId.trim() || null,
          expectedRowVersion: item.rowVersion,
        },
      });
      onClose();
    } catch (error) {
      setErrorMessage(error.errors?.providerTransactionId?.[0] || error.message);
    }
  };

  return (
    <Modal title="Xác nhận đã hoàn tiền" onClose={onClose}>
      <form className="form-field" onSubmit={handleSubmit}>
        <p>
          {formatRefundCode(item.refundCaseId)} · <strong>{formatCurrency(item.amount)}</strong> ·{' '}
          {item.customerName}
        </p>
        <label htmlFor="refund-transaction-id">Mã giao dịch ngân hàng (không bắt buộc)</label>
        <input
          id="refund-transaction-id"
          maxLength="255"
          value={transactionId}
          aria-invalid={Boolean(errorMessage)}
          onChange={(event) => setTransactionId(event.target.value)}
        />
        {errorMessage && (
          <p className="text-error" role="alert">
            {errorMessage}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={complete.isPending}>
          {complete.isPending ? 'Đang ghi nhận...' : 'Hoàn tất hồ sơ'}
        </button>
      </form>
    </Modal>
  );
}

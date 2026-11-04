import { useState } from 'react';
import Modal from '@/components/Modal';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatRefundCode } from '../utils/refundDisplay';

/** Admin nhập lý do từ chối hồ sơ hoặc báo chuyển khoản thất bại. */
export default function RefundReasonDialog({ item, title, submitLabel, mutation, onClose }) {
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 5) {
      setErrorMessage('Vui lòng nhập lý do tối thiểu 5 ký tự.');
      return;
    }

    setErrorMessage('');
    try {
      await mutation.mutateAsync({
        refundCaseId: item.refundCaseId,
        payload: { reason: trimmedReason, expectedRowVersion: item.rowVersion },
      });
      onClose();
    } catch (error) {
      setErrorMessage(error.errors?.reason?.[0] || error.message);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form className="form-field" onSubmit={handleSubmit}>
        <p>
          {formatRefundCode(item.refundCaseId)} · {formatCurrency(item.amount)}
        </p>
        <label htmlFor="refund-decision-reason">Lý do</label>
        <textarea
          id="refund-decision-reason"
          rows="3"
          maxLength="1000"
          value={reason}
          aria-invalid={Boolean(errorMessage)}
          onChange={(event) => setReason(event.target.value)}
        />
        {errorMessage && (
          <p className="text-error" role="alert">
            {errorMessage}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={mutation.isPending}>
          {mutation.isPending ? 'Đang gửi...' : submitLabel}
        </button>
      </form>
    </Modal>
  );
}

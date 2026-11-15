import { useState } from 'react';
import Modal from '@/components/Modal';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCompleteRefund } from '../hooks/useRefundCases';
import { formatRefundCode } from '../utils/refundDisplay';
import { validateProofFiles } from '../utils/validateProofFiles';
import ProofUploader from './ProofUploader';

/** Admin xác nhận kế toán đã chuyển khoản: bắt buộc mã giao dịch và 1-3 ảnh chứng từ. */
export default function RefundCompleteDialog({ item, onClose }) {
  const complete = useCompleteRefund();
  const [transactionId, setTransactionId] = useState('');
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFilesChange = (next) => {
    setFiles(next);
    setFileError(next.length === 0 ? '' : (validateProofFiles(next).error ?? ''));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    const trimmed = transactionId.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập mã giao dịch ngân hàng');
      return;
    }
    const validation = validateProofFiles(files);
    if (!validation.isValid) {
      setFileError(validation.error);
      return;
    }

    const formData = new FormData();
    formData.append('providerTransactionId', trimmed);
    formData.append('expectedRowVersion', item.rowVersion);
    files.forEach((file) => formData.append('files', file));

    try {
      await complete.mutateAsync({ refundCaseId: item.refundCaseId, formData });
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
        <label htmlFor="refund-transaction-id">Mã giao dịch ngân hàng *</label>
        <input
          id="refund-transaction-id"
          maxLength="255"
          value={transactionId}
          aria-invalid={Boolean(errorMessage)}
          disabled={complete.isPending}
          onChange={(event) => setTransactionId(event.target.value)}
        />
        <ProofUploader
          files={files}
          onChange={handleFilesChange}
          error={fileError}
          disabled={complete.isPending}
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

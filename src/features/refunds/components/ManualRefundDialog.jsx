import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/Modal';
import { formatCurrency } from '@/utils/formatCurrency';
import { useMarkManualRefund } from '../hooks/useManualRefunds';
import { validateProofFiles } from '../utils/validateProofFiles';
import ProofUploader from './ProofUploader';

/** Ghi nhận đã chuyển khoản tay cho khoản hoàn (payment) không qua hồ sơ hoàn tiền. */
export default function ManualRefundDialog({ payment, onClose }) {
  const markManual = useMarkManualRefund();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { manualReference: '', note: '' } });
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFilesChange = (next) => {
    setFiles(next);
    setFileError(next.length === 0 ? '' : (validateProofFiles(next).error ?? ''));
  };

  const onSubmit = async (values) => {
    setErrorMessage('');
    const validation = validateProofFiles(files);
    if (!validation.isValid) {
      setFileError(validation.error);
      return;
    }

    const formData = new FormData();
    formData.append('manualReference', values.manualReference.trim());
    if (values.note.trim()) formData.append('note', values.note.trim());
    files.forEach((file) => formData.append('files', file));

    try {
      await markManual.mutateAsync({ paymentId: payment.paymentId, formData });
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Modal title="Ghi nhận đã chuyển khoản" onClose={onClose}>
      <form className="form-field" onSubmit={handleSubmit(onSubmit)} noValidate>
        <p>
          {payment.orderCode} · <strong>{formatCurrency(Math.abs(payment.amount))}</strong>
        </p>

        <label htmlFor="manual-reference">Mã tham chiếu chuyển khoản *</label>
        <input
          id="manual-reference"
          maxLength="100"
          aria-invalid={Boolean(errors.manualReference)}
          {...register('manualReference', {
            validate: (value) => value.trim().length > 0 || 'Vui lòng nhập mã tham chiếu chuyển khoản',
            maxLength: { value: 100, message: 'Mã tham chiếu tối đa 100 ký tự' },
          })}
        />
        {errors.manualReference && (
          <p className="text-error" role="alert">
            {errors.manualReference.message}
          </p>
        )}

        <label htmlFor="manual-note">Ghi chú</label>
        <textarea
          id="manual-note"
          rows="3"
          maxLength="500"
          aria-invalid={Boolean(errors.note)}
          {...register('note', { maxLength: { value: 500, message: 'Ghi chú tối đa 500 ký tự' } })}
        />
        {errors.note && (
          <p className="text-error" role="alert">
            {errors.note.message}
          </p>
        )}

        <ProofUploader
          files={files}
          onChange={handleFilesChange}
          error={fileError}
          disabled={markManual.isPending}
        />

        {errorMessage && (
          <p className="text-error" role="alert">
            {errorMessage}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={markManual.isPending}>
          {markManual.isPending ? 'Đang ghi nhận...' : 'Ghi nhận đã chuyển'}
        </button>
      </form>
    </Modal>
  );
}

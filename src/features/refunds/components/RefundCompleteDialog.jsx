import { useState } from 'react';
import Modal from '@/components/Modal';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCompleteRefund } from '../hooks/useRefundCases';
import { formatRefundCode } from '../utils/refundDisplay';
import { packAdminTransactionWithProof } from '../utils/refundProofHelper';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** Admin xác nhận kế toán đã chuyển khoản, tải lên ảnh biên lai chuyển tiền và mã giao dịch. */
export default function RefundCompleteDialog({ item, onClose }) {
  const complete = useCompleteRefund();
  const [transactionId, setTransactionId] = useState('');
  const [receiptProofUrl, setReceiptProofUrl] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Chỉ chấp nhận tệp hình ảnh (JPG, PNG, WebP).');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('Dung lượng tệp không được vượt quá 5MB.');
      return;
    }

    setErrorMessage('');
    setReceiptFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptProofUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => {
    setReceiptProofUrl('');
    setReceiptFileName('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const packedTx = packAdminTransactionWithProof(transactionId, receiptProofUrl);

    try {
      await complete.mutateAsync({
        refundCaseId: item.refundCaseId,
        payload: {
          providerTransactionId: packedTx || null,
          expectedRowVersion: item.rowVersion,
        },
      });
      onClose();
    } catch (error) {
      setErrorMessage(error.errors?.providerTransactionId?.[0] || error.message);
    }
  };

  return (
    <Modal title="Xác nhận đã hoàn tiền & Tải biên lai" onClose={onClose}>
      <form className="form-field" onSubmit={handleSubmit}>
        <p>
          Hồ sơ: <strong>{formatRefundCode(item.refundCaseId)}</strong> · Số tiền:{' '}
          <strong style={{ color: '#059669' }}>{formatCurrency(item.amount)}</strong> ·{' '}
          {item.customerName}
        </p>

        <label htmlFor="refund-transaction-id">Mã giao dịch ngân hàng</label>
        <input
          id="refund-transaction-id"
          maxLength="255"
          placeholder="Ví dụ: FT2611139988 hoặc VCB-20261113"
          value={transactionId}
          aria-invalid={Boolean(errorMessage)}
          onChange={(event) => setTransactionId(event.target.value)}
        />

        {/* Khu vực Tải lên Biên lai chuyển tiền */}
        <label htmlFor="receipt-proof-upload" style={{ marginTop: '8px', display: 'block' }}>
          Ảnh biên lai chuyển tiền / Ủy nhiệm chi ngân hàng
        </label>
        {!receiptProofUrl ? (
          <div
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
            }}
          >
            <input
              id="receipt-proof-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <label
              htmlFor="receipt-proof-upload"
              style={{
                cursor: 'pointer',
                color: '#0284c7',
                fontWeight: 600,
                display: 'block',
                marginBottom: '4px',
              }}
            >
              📁 Bấm vào đây để chọn ảnh biên lai (UNC)
            </label>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Định dạng JPG, PNG, WebP (Tối đa 5MB)
            </span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={receiptProofUrl}
                alt="Ảnh biên lai"
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #86efac',
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#166534',
                    display: 'block',
                  }}
                >
                  ✓ Đã đính kèm biên lai
                </span>
                <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                  {receiptFileName || 'biên_lai_chuyển_khoản.jpg'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveReceipt}
              className="btn btn-outline"
              style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626' }}
            >
              Xóa ảnh
            </button>
          </div>
        )}

        {errorMessage && (
          <p className="text-error" role="alert" style={{ marginTop: '8px' }}>
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          style={{ marginTop: '16px' }}
          disabled={complete.isPending}
        >
          {complete.isPending ? 'Đang ghi nhận...' : 'Xác nhận hoàn tất hồ sơ'}
        </button>
      </form>
    </Modal>
  );
}

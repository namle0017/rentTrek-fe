import { useState } from 'react';
import Modal from '@/components/Modal';
import { useExportRefunds, useRequestExportCode } from '../hooks/useRefundCases';

function saveFile(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hoan-tien-${Date.now()}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Mỗi lần xuất cần một OTP mới; file chứa số tài khoản đầy đủ nên chỉ lưu thẳng xuống máy Admin. */
export default function RefundExportDialog({ fromDate, toDate, onClose }) {
  const requestCode = useRequestExportCode();
  const exportRefunds = useExportRefunds();
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestCode = async () => {
    setErrorMessage('');
    try {
      const response = await requestCode.mutateAsync();
      setChallenge(response.data);
      setCode('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleExport = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    try {
      const blob = await exportRefunds.mutateAsync({
        challengeId: challenge.challengeId,
        verificationCode: code.trim(),
        fromDate,
        toDate,
      });
      saveFile(blob);
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const error = errorMessage && (
    <p className="text-error" role="alert">
      {errorMessage}
    </p>
  );

  return (
    <Modal title="Xuất Excel cho kế toán" onClose={onClose}>
      <div className="form-field">
        <p className="text-error" role="note">
          File chứa số tài khoản đầy đủ của khách. Chỉ gửi cho kế toán qua kênh nội bộ và xóa khi xử lý xong.
        </p>
        <p role="note">
          Kế toán điền 4 cột cuối (Đã chuyển, Mã giao dịch, Lý do chưa chuyển, Hình ảnh minh chứng) rồi gửi
          lại file để nhập kết quả.
        </p>
        <p>
          File gồm mọi hồ sơ đã có số tài khoản và chưa có kết quả (cả hồ sơ đã gửi kế toán trước đó). Hồ sơ
          đang chờ khách nhập số tài khoản không có trong file. Kế toán kiểm tra kỹ để tránh chuyển tiền hai lần.
        </p>
        {challenge ? (
          <form className="form-field" onSubmit={handleExport}>
            <label htmlFor="refund-export-otp">Mã xác thực gửi tới email của bạn</label>
            <input
              id="refund-export-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength="6"
              required
              value={code}
              aria-invalid={Boolean(errorMessage)}
              onChange={(event) => setCode(event.target.value)}
            />
            {error}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={exportRefunds.isPending || code.trim().length !== 6}
            >
              {exportRefunds.isPending ? 'Đang xuất...' : 'Xác thực và tải file'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              disabled={requestCode.isPending}
              onClick={handleRequestCode}
            >
              Gửi lại mã
            </button>
          </form>
        ) : (
          <>
            {error}
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={requestCode.isPending}
              onClick={handleRequestCode}
            >
              {requestCode.isPending ? 'Đang gửi...' : 'Gửi mã tới email'}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

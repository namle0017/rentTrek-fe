import { useId, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Modal from '@/components/Modal';
import { formatCurrency } from '@/utils/formatCurrency';
import { refundKeys } from '../api/refundKeys';
import { refundService } from '../api/refundService';
import styles from './RefundImportDialog.module.css';

const ACTION_LABEL = { Complete: 'Hoàn tất', Fail: 'Thất bại', Skip: 'Bỏ qua' };
const ACTION_CLASS = { Complete: styles.badgeComplete, Fail: styles.badgeFail, Skip: styles.badgeSkip };

/** Bước 1 chọn file → xem trước (dryRun) → áp dụng các dòng hợp lệ. */
export default function RefundImportDialog({ onClose }) {
  const queryClient = useQueryClient();
  const inputId = useId();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const previewMutation = useMutation({
    mutationFn: (selected) => refundService.importResult(selected, true),
  });
  const applyMutation = useMutation({
    mutationFn: (selected) => refundService.importResult(selected, false),
    onSettled: () => queryClient.invalidateQueries({ queryKey: refundKeys.queues() }),
  });
  const isBusy = previewMutation.isPending || applyMutation.isPending;

  const selectFile = async (selected) => {
    if (!selected) return;
    setErrorMessage('');
    setPreview(null);
    setResult(null);
    if (!selected.name.toLowerCase().endsWith('.xlsx')) {
      setFile(null);
      setErrorMessage('Chỉ hỗ trợ file Excel định dạng .xlsx');
      return;
    }
    setFile(selected);
    try {
      const response = await previewMutation.mutateAsync(selected);
      setPreview(response.data);
    } catch (error) {
      setErrorMessage(error.message || 'Không thể đọc file kết quả.');
    }
  };

  const handleApply = async () => {
    setErrorMessage('');
    try {
      const response = await applyMutation.mutateAsync(file);
      setResult(response.data);
      setPreview(response.data);
      toast.success(response.message || 'Đã áp dụng kết quả chuyển khoản');
    } catch (error) {
      setErrorMessage(error.message || 'Không thể áp dụng kết quả.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (!isBusy && !result) selectFile(event.dataTransfer.files?.[0]);
  };

  const rows = preview?.rows ?? [];

  return (
    <Modal title="Nhập kết quả chuyển khoản" onClose={onClose}>
      <div className="form-field">
        {!result && (
          <>
            <p>
              Chọn đúng file Excel đã xuất, kế toán đã điền 4 cột cuối (Đã chuyển, Mã giao dịch, Lý do, Hình
              ảnh).
            </p>
            <label htmlFor={inputId}>Chọn file kết quả từ kế toán</label>
            <div
              className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
              onClick={() => !isBusy && inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept=".xlsx"
                className={styles.hiddenInput}
                disabled={isBusy}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  selectFile(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
              <strong>{file ? file.name : 'Nhấn để chọn file .xlsx hoặc kéo thả vào đây'}</strong>
            </div>
          </>
        )}

        {previewMutation.isPending && <p role="status">Đang kiểm tra file...</p>}

        {errorMessage && (
          <p className="text-error" role="alert">
            {errorMessage}
          </p>
        )}

        {preview && (
          <>
            <p role="status">
              {result ? (
                <strong>
                  Đã hoàn tất {result.completedCount} · Thất bại {result.failedCount} · Lỗi{' '}
                  {result.errorCount}
                </strong>
              ) : (
                <>
                  Tổng {preview.totalRows} dòng · <strong>{preview.validRows} hợp lệ</strong> ·{' '}
                  {preview.errorCount} lỗi
                </>
              )}
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Dòng</th>
                    <th scope="col">Mã hồ sơ</th>
                    <th scope="col">Khách hàng</th>
                    <th scope="col">Số tiền</th>
                    <th scope="col">Hành động</th>
                    <th scope="col">Mã GD</th>
                    <th scope="col">Số ảnh</th>
                    <th scope="col">Lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const hasError = row.errors?.length > 0;
                    return (
                      <tr key={row.rowNumber} className={hasError ? styles.rowError : undefined}>
                        <td>{row.rowNumber}</td>
                        <td>{row.refundCode}</td>
                        <td>{row.customerName}</td>
                        <td>
                          {row.amount === null || row.amount === undefined ? '' : formatCurrency(row.amount)}
                        </td>
                        <td>
                          <span className={`${styles.badge} ${ACTION_CLASS[row.action] ?? ''}`}>
                            {ACTION_LABEL[row.action] ?? row.action}
                          </span>
                        </td>
                        <td>{row.transactionId}</td>
                        <td>{row.imageCount}</td>
                        <td>{hasError ? row.errors.join('; ') : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!result && (
              <button
                type="button"
                className="btn btn-primary btn-block"
                disabled={isBusy || preview.validRows === 0}
                onClick={handleApply}
              >
                {applyMutation.isPending ? 'Đang áp dụng...' : `Áp dụng ${preview.validRows} dòng hợp lệ`}
              </button>
            )}
          </>
        )}

        {result && (
          <button type="button" className="btn btn-outline btn-block" onClick={onClose}>
            Đóng
          </button>
        )}
      </div>
    </Modal>
  );
}

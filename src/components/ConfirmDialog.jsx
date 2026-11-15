import Modal from './Modal';
import styles from './ConfirmDialog.module.css';

/** Hộp thoại xác nhận dùng chung, thay cho window.confirm. */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  tone = 'danger',
  isPending = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <Modal title={title} onClose={onClose}>
      <div className={styles.content}>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={isPending}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn btn-primary ${tone === 'danger' ? styles.danger : ''}`.trim()}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

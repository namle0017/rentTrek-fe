import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

/** Dùng <dialog> gốc để có sẵn focus trap, Esc và backdrop. */
export default function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} app-dialog`}
      aria-labelledby={titleId}
      onCancel={handleCancel}
    >
      <header className={styles.header}>
        <h2 id={titleId}>{title}</h2>
        <button type="button" className={styles.close} aria-label="Đóng" onClick={onClose}>
          ×
        </button>
      </header>
      <div className={styles.body}>{children}</div>
    </dialog>,
    document.body,
  );
}

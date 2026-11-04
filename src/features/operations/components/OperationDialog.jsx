import { useEffect, useRef } from 'react';
import OperationForm from './OperationForm';
import styles from './Operations.module.css';

export default function OperationDialog({ title, onClose, ...formProps }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialogRef.current?.querySelector('input, select, textarea, button')?.focus();
    return () => previous?.focus();
  }, []);
  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      const controls = [...dialogRef.current.querySelectorAll('input, select, textarea, button')].filter((control) => !control.disabled);
      const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  };
  return <div className={styles.overlay}><section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="operation-title" className={styles.dialog} onKeyDown={handleKeyDown}>
    <h2 id="operation-title">{title}</h2><OperationForm {...formProps} onCancel={onClose} onSuccess={(result) => { formProps.onSuccess?.(result); onClose(); }} />
  </section></div>;
}

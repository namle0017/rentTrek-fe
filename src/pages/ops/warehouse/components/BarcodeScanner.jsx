import { useId } from 'react';
import styles from './FulfillmentControls.module.css';

export default function BarcodeScanner({
  title,
  hint,
  label = 'Mã barcode thiết bị',
  placeholder,
  value,
  onChange,
  onSubmit,
  inputRef,
  disabled,
  isPending,
  submitLabel,
  feedback,
}) {
  const id = useId();
  return (
    <section className={styles.card} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.title}>
        {title}
      </h2>
      <p className={styles.hint}>{hint}</p>
      <form onSubmit={onSubmit} className={styles.form}>
        <label className={styles.field} htmlFor={`${id}-barcode`}>
          {label}
          <input
            id={`${id}-barcode`}
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={disabled || !value.trim()}>
          {isPending ? 'Đang kiểm tra…' : submitLabel}
        </button>
      </form>
      <div className={styles.feedback} role="status" aria-live="polite" data-error={feedback?.isError}>
        {feedback?.message}
      </div>
    </section>
  );
}

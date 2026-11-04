import { useId } from 'react';
import styles from './FulfillmentControls.module.css';

export default function FulfillmentProgress({ title, count, total, children }) {
  const id = useId();
  const percent = total ? Math.max(0, Math.min(100, Math.round((count / total) * 100))) : 0;
  return (
    <section className={styles.card} aria-labelledby={id}>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      <div className={styles.count}>
        <strong>{count}</strong>
        <span>/ {total} thiết bị</span>
      </div>
      <div
        className={styles.progressBar}
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.progressMeta}>
        <span>Đã xử lý {percent}%</span>
        <span>Còn {Math.max(0, total - count)} thiết bị</span>
      </div>
      {children && <div className={styles.completion}>{children}</div>}
    </section>
  );
}

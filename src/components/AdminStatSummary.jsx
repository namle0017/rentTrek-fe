import styles from './AdminStatSummary.module.css';

export default function AdminStatSummary({ metrics = [], columns = 4 }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div
      className={styles.container}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="region"
      aria-label="Tóm tắt chỉ số"
    >
      {metrics.map((m, idx) => (
        <div key={idx} className={styles.statCard}>
          <div className={styles.headerRow}>
            <span className={styles.label}>{m.label}</span>
            {m.status && <span className={styles.badge}>{m.status}</span>}
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>{m.value}</span>
            {m.unit && <span className={styles.unit}>{m.unit}</span>}
          </div>
          {m.subtext && <div className={styles.subtext}>{m.subtext}</div>}
        </div>
      ))}
    </div>
  );
}

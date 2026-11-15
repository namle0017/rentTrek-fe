import { formatHours } from '../utils/formatHours';
import styles from '../AdminPolicies.module.css';

/** Tóm tắt dạng câu chữ cho khách: huỷ trước X giờ → hoàn Y%. */
export default function RefundRuleSummary({ rules }) {
  const sorted = (rules ?? [])
    .filter(
      (rule) =>
        rule.minHoursBefore !== '' &&
        rule.refundPercentage !== '' &&
        Number.isFinite(Number(rule.minHoursBefore)) &&
        Number.isFinite(Number(rule.refundPercentage)),
    )
    .map((rule) => ({ hours: Number(rule.minHoursBefore), pct: Number(rule.refundPercentage) }))
    .sort((a, b) => b.hours - a.hours);

  if (sorted.length === 0) {
    return <p className={styles.muted}>Thêm mốc hoàn tiền để xem tóm tắt.</p>;
  }

  const smallest = sorted[sorted.length - 1];

  return (
    <ul className={styles.summaryList} aria-label="Tóm tắt chính sách">
      {sorted.map((rule) => (
        <li key={rule.hours}>
          <span>
            {rule.hours === 0
              ? 'Huỷ bất kỳ lúc nào'
              : `Huỷ trước khởi hành từ ${formatHours(rule.hours)}`}
          </span>
          <strong className={styles.pct}>Hoàn {rule.pct}%</strong>
        </li>
      ))}
      {smallest.hours > 0 && (
        <li>
          <span>Huỷ sát giờ (dưới {formatHours(smallest.hours)})</span>
          <strong className={styles.pct}>Không hoàn</strong>
        </li>
      )}
    </ul>
  );
}

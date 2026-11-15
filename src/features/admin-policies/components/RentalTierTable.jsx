import StepChart from './StepChart';
import styles from '../AdminPolicies.module.css';

/** Bảng + biểu đồ bậc thang nhỏ cho một scope phạt trễ (chỉ đọc). */
export default function RentalTierTable({ title, tiers }) {
  const sorted = [...(tiers ?? [])].sort((a, b) => a.minDaysLate - b.minDaysLate);
  const steps = sorted.map((tier) => ({ label: `≥ ${tier.minDaysLate} ngày`, value: Number(tier.percentOfDeposit) }));

  return (
    <div className={styles.tierBlock}>
      <h4 className={styles.tierBlockHeader}>{title}</h4>
      <StepChart steps={steps} compact ariaLabel={`Biểu đồ ${title}`} />
      <table className={styles.miniTable}>
        <thead>
          <tr>
            <th scope="col">Trễ từ</th>
            <th scope="col">% cọc bị trừ</th>
            <th scope="col">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={3} className={styles.muted}>
                Chưa có bậc phạt.
              </td>
            </tr>
          ) : (
            sorted.map((tier) => (
              <tr key={tier.minDaysLate}>
                <td>{tier.minDaysLate} ngày</td>
                <td>
                  <span className={styles.pct}>{tier.percentOfDeposit}%</span>
                </td>
                <td className={styles.muted}>{tier.isTerminal ? 'Mất cọc' : ''}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

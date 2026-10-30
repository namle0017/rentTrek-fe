import styles from './PasswordStrengthMeter.module.css';

/**
 * Component hiển thị thước đo độ mạnh mật khẩu và danh sách tiêu chuẩn bảo mật trực quan.
 * @param {{ password?: string }} props
 */
export default function PasswordStrengthMeter({ password = '' }) {
  const criteria = [
    {
      id: 'length',
      label: 'Tối thiểu 8 ký tự',
      passed: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'Có chữ hoa (A-Z)',
      passed: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'Có chữ thường (a-z)',
      passed: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'Có chữ số (0-9)',
      passed: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'Ký tự đặc biệt (!@#$...)',
      passed: /[\W_]/.test(password),
    },
  ];

  // Tính điểm độ mạnh từ 0 -> 4
  const passedCount = criteria.filter((c) => c.passed).length;
  let level = 0;
  let label = 'Chưa nhập';

  if (password.length > 0) {
    if (passedCount <= 2) {
      level = 1;
      label = 'Yếu';
    } else if (passedCount === 3) {
      level = 2;
      label = 'Trung bình';
    } else if (passedCount === 4) {
      level = 3;
      label = 'Khá mạnh';
    } else if (passedCount === 5) {
      level = 4;
      label = 'Rất mạnh';
    }
  }

  return (
    <div className={`${styles.meterContainer} ${styles[`level${level}`]}`}>
      <div className={styles.scoreHeader}>
        <span className={styles.scoreTitle}>Độ an toàn mật khẩu:</span>
        <span className={styles.scoreBadge}>{label}</span>
      </div>

      <div className={styles.barsWrapper} aria-hidden="true">
        <div className={styles.barSegment} />
        <div className={styles.barSegment} />
        <div className={styles.barSegment} />
        <div className={styles.barSegment} />
      </div>

      <ul className={styles.criteriaList}>
        {criteria.map((item) => (
          <li
            key={item.id}
            className={`${styles.criteriaItem} ${item.passed ? styles.criteriaItemPassed : ''}`}
          >
            <span className={styles.criteriaIcon} aria-hidden="true">
              {item.passed ? '✓' : '○'}
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import styles from './finance.module.css';

/**
 * Định dạng số giờ sang dạng mô tả ngắn gọn (ngày / giờ)
 */
function formatHoursToLabel(hours) {
  if (hours >= 24) {
    const days = Math.round((hours / 24) * 10) / 10;
    return `≥ ${days} ngày (${hours}h)`;
  }
  if (hours > 0) {
    return `≥ ${hours} giờ`;
  }
  return 'Dưới mốc trước (0h)';
}

function getPctClass(pct) {
  if (pct === 100) return styles.pct100;
  if (pct >= 70) return styles.pctHigh;
  if (pct >= 40) return styles.pctMid;
  return styles.pctLow;
}

export default function PolicyCompactTimeline({ rules = [], policyName }) {
  if (!rules?.length) return null;

  // Sắp xếp các mốc thời gian từ xa đến gần khởi hành (giờ giảm dần)
  const sortedRules = [...rules].sort((a, b) => b.minHoursBefore - a.minHoursBefore);

  return (
    <div className={styles.compactTimelineCard}>
      <div className={styles.compactTimelineHeader}>
        <h4 className={styles.compactTimelineTitle}>Tiến Trình Hoàn Tiền Theo Mốc Giờ: {policyName}</h4>
        <span style={{ fontSize: "var(--font-size-meta)", color: '#64748b' }}>
          Tự động áp dụng theo thời điểm khách hàng gửi yêu cầu hủy
        </span>
      </div>

      <div className={styles.compactTimelineTrack}>
        {sortedRules.map((rule, idx) => {
          const hours = Number(rule.minHoursBefore);
          const pct = Number(rule.refundPercentage);

          return (
            <div key={rule.ruleId || idx} className={styles.timelineStepNode}>
              <div className={styles.timelineStepTop}>
                <span className={styles.timelineHoursBadge}>{formatHoursToLabel(hours)}</span>
                <span className={`${styles.timelinePctPill} ${getPctClass(pct)}`}>{pct}%</span>
              </div>

              <div className={styles.timelineStepDesc}>
                {rule.description || `Hoàn ${pct}% giá trị dịch vụ`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

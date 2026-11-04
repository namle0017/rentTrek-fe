import { useState } from 'react';
import styles from './finance.module.css';

export default function PolicyRuleStepChart({ policyName, rules = [] }) {
  const [hoveredRule, setHoveredRule] = useState(null);

  if (!rules.length) {
    return (
      <div className={styles.stepChartContainer}>
        <div className={styles.stepChartHeader}>
          <div className={styles.stepChartTitle}>Biểu đồ bậc thang hoàn tiền — {policyName}</div>
        </div>
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: "var(--font-size-meta)" }}>
          Chưa có mốc quy tắc hoàn tiền nào. Hãy thêm mốc quy tắc để hiển thị biểu đồ bậc thang.
        </div>
      </div>
    );
  }

  // Sắp xếp theo số giờ từ lớn đến bé (từ xa ngày đi đến sát giờ khởi hành)
  const sortedRules = [...rules].sort((a, b) => b.minHoursBefore - a.minHoursBefore);

  return (
    <div className={styles.stepChartContainer}>
      <div className={styles.stepChartHeader}>
        <div>
          <div className={styles.stepChartTitle}>Biểu đồ bậc thang hoàn tiền — {policyName}</div>
          <span className={styles.statSubtext}>
            Quy tắc tỷ lệ % hoàn tiền theo khoảng thời gian báo hủy trước giờ khởi hành
          </span>
        </div>

        {hoveredRule && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: "var(--font-size-meta)",
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <strong style={{ color: '#0369a1' }}>≥ {hoveredRule.minHoursBefore}h</strong>: Hoàn{' '}
            <strong style={{ color: hoveredRule.refundPercentage > 0 ? '#16a34a' : '#dc2626' }}>
              {hoveredRule.refundPercentage}%
            </strong>{' '}
            — <span style={{ color: '#64748b' }}>{hoveredRule.description}</span>
          </div>
        )}
      </div>

      <div className={styles.stepBarWrapper}>
        {sortedRules.map((rule, idx) => {
          // Chiều cao cột tương ứng với % hoàn tiền (min 28px nếu 0%)
          const heightPct = Math.max(rule.refundPercentage, 12);
          const isZero = rule.refundPercentage === 0;
          const isHovered = hoveredRule?.ruleId === rule.ruleId;

          return (
            <div
              key={rule.ruleId || idx}
              className={styles.stepColumn}
              onMouseEnter={() => setHoveredRule(rule)}
              onMouseLeave={() => setHoveredRule(null)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className={styles.stepPillar}
                style={{
                  height: `${heightPct * 1.3}px`,
                  background: isZero
                    ? '#94a3b8'
                    : isHovered
                      ? 'linear-gradient(180deg, #166534 0%, #22c55e 100%)'
                      : 'linear-gradient(180deg, #204b39 0%, #16a34a 100%)',
                  transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                  boxShadow: isHovered ? '0 4px 12px rgba(22, 163, 74, 0.3)' : 'none',
                }}
              >
                {rule.refundPercentage}%
              </div>
              <div className={styles.stepLabel}>
                {rule.minHoursBefore >= 168
                  ? `≥ ${Math.floor(rule.minHoursBefore / 24)} ngày`
                  : rule.minHoursBefore >= 24
                    ? `≥ ${Math.floor(rule.minHoursBefore / 24)} ngày`
                    : rule.minHoursBefore > 0
                      ? `≥ ${rule.minHoursBefore} giờ`
                      : '< 24 giờ'}
              </div>
              <div className={styles.stepSublabel}>({rule.minHoursBefore}h trước)</div>
            </div>
          );
        })}
      </div>

      {/* Chân biểu đồ hiển thị hướng dòng thời gian */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px dashed #cbd5e1',
          paddingTop: 8,
          fontSize: "var(--font-size-meta)",
          color: '#64748b',
        }}
      >
        <span>← Báo hủy sớm (Xa ngày khởi hành)</span>
        <span>Sát giờ khởi hành / Sau giờ đi →</span>
      </div>
    </div>
  );
}

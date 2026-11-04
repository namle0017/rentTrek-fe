import styles from './finance.module.css';

function getPctBadgeStyle(pct) {
  const num = Number(pct);
  if (num === 100) return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
  if (num >= 70) return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
  if (num >= 40) return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
  return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
}

export default function DynamicRuleBuilder({ rules = [], onChangeRule, onAddRule, onRemoveRule }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: "var(--font-size-subheading)", fontWeight: "var(--font-weight-bold)", color: 'var(--color-text)' }}>
          Các Mốc Quy Tắc Hoàn Tiền ({rules.length})
        </h3>
        <span style={{ fontSize: "var(--font-size-meta)", color: '#64748b' }}>
          Tự động áp dụng theo thời điểm khách gửi yêu cầu hủy
        </span>
      </div>

      <div className={styles.ruleCardList}>
        {rules.map((rule, index) => {
          const hours = Number(rule.minHoursBefore);
          const days = hours >= 24 ? Math.round((hours / 24) * 10) / 10 : 0;
          const pct = Number(rule.refundPercentage);
          const pctStyle = getPctBadgeStyle(pct);

          const isHoursInvalid = isNaN(hours) || hours < 0;
          const isPctInvalid = isNaN(pct) || pct < 0 || pct > 100;

          return (
            <div key={rule.ruleId || index} className={styles.dynamicRuleCard}>
              <div className={styles.ruleCardHeader}>
                <div className={styles.ruleCardIndex}>
                  <span>Mốc #{index + 1}</span>
                  <span
                    className={styles.badge}
                    style={{
                      background: pctStyle.bg,
                      color: pctStyle.color,
                      border: `1px solid ${pctStyle.border}`,
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    Hoàn {pct}%
                  </span>
                </div>

                {rules.length > 1 && (
                  <button
                    type="button"
                    className={styles.btnDeleteRule}
                    onClick={() => onRemoveRule(index)}
                    title="Xóa mốc quy tắc này"
                  >
                    Xóa mốc
                  </button>
                )}
              </div>

              <div className={styles.ruleFieldRow}>
                {/* Trường 1: Số giờ trước khởi hành */}
                <div>
                  <label className={styles.filterLabel} style={{ marginBottom: 4 }}>
                    Số giờ tối thiểu (h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={styles.filterInput}
                    value={rule.minHoursBefore}
                    onChange={(e) => onChangeRule(index, 'minHoursBefore', e.target.value)}
                    placeholder="Ví dụ: 168"
                    style={{
                      borderColor: isHoursInvalid ? '#dc2626' : undefined,
                    }}
                  />
                  {days > 0 ? (
                    <div className={styles.hoursHintText}>~ {days} ngày trước giờ đi</div>
                  ) : hours === 0 ? (
                    <div className={styles.hoursHintText} style={{ color: '#64748b' }}>
                      Mốc sát giờ khởi hành
                    </div>
                  ) : null}
                  {isHoursInvalid && (
                    <div style={{ fontSize: "var(--font-size-meta)", color: '#dc2626', marginTop: 2 }}>Giờ phải ≥ 0</div>
                  )}
                </div>

                {/* Trường 2: Tỷ lệ hoàn tiền */}
                <div>
                  <label className={styles.filterLabel} style={{ marginBottom: 4 }}>
                    Tỷ lệ hoàn (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    className={styles.filterInput}
                    value={rule.refundPercentage}
                    onChange={(e) => onChangeRule(index, 'refundPercentage', e.target.value)}
                    placeholder="0 - 100"
                    style={{
                      fontWeight: "var(--font-weight-bold)",
                      borderColor: isPctInvalid ? '#dc2626' : undefined,
                    }}
                  />
                  {isPctInvalid && (
                    <div style={{ fontSize: "var(--font-size-meta)", color: '#dc2626', marginTop: 2 }}>0% đến 100%</div>
                  )}
                </div>

                {/* Trường 3: Mô tả hiển thị cho khách hàng */}
                <div>
                  <label className={styles.filterLabel} style={{ marginBottom: 4 }}>
                    Mô tả quy tắc cho khách hàng
                  </label>
                  <input
                    type="text"
                    className={styles.filterInput}
                    value={rule.description || ''}
                    onChange={(e) => onChangeRule(index, 'description', e.target.value)}
                    placeholder="Ví dụ: Trước 7 ngày: Hoàn 100% tiền dịch vụ"
                    style={{
                      borderColor: !rule.description?.trim() ? '#f59e0b' : undefined,
                    }}
                  />
                  {!rule.description?.trim() && (
                    <div style={{ fontSize: "var(--font-size-meta)", color: '#f59e0b', marginTop: 2 }}>
                      Cần nhập mô tả hiển thị
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn btn-outline"
        onClick={onAddRule}
        style={{
          borderColor: '#16a34a',
          color: '#16a34a',
          padding: '10px 16px',
          fontWeight: "var(--font-weight-semibold)",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <span>+ Thêm mốc quy tắc mới</span>
      </button>
    </div>
  );
}

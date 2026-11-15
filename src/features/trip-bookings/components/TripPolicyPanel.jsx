import OutdoorIcon from '@/components/OutdoorIcon';
import { formatHours } from '@/features/admin-policies/utils/formatHours';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTripRefundPolicy } from '../hooks/useTripBookings';
import styles from './TripPolicyPanel.module.css';

/** Chính sách huỷ, hoàn tiền, đổi lịch của một chuyến — dữ liệu từ GET /trips/{tripId}/refund-policy. */
export default function TripPolicyPanel({ tripId }) {
  const { data: policy, isLoading, isError, error } = useTripRefundPolicy(tripId);

  if (isLoading) return <p className={styles.muted}>Đang tải chính sách...</p>;
  if (isError) return <p role="alert">{error?.message || 'Không tải được chính sách hoàn tiền.'}</p>;
  if (!policy) return null;

  const sortedRules = (policy.rules ?? [])
    .filter(
      (rule) =>
        rule.minHoursBefore !== '' &&
        rule.refundPercentage !== '' &&
        Number.isFinite(Number(rule.minHoursBefore)) &&
        Number.isFinite(Number(rule.refundPercentage)),
    )
    .map((rule) => ({ hours: Number(rule.minHoursBefore), pct: Number(rule.refundPercentage) }))
    .sort((a, b) => b.hours - a.hours);

  const smallest = sortedRules.length > 0 ? sortedRules[sortedRules.length - 1] : null;

  const getBadgeClass = (pct) => {
    if (pct >= 80) return styles.pctFull;
    if (pct > 0) return styles.pctPartial;
    return styles.pctZero;
  };

  return (
    <div className={styles.panel}>
      {/* 1. Header meta chính sách */}
      <div className={styles.metaRow}>
        <div className={styles.metaTitle}>
          <OutdoorIcon name="shield" size={16} />
          <strong>{policy.name}</strong>
        </div>
        <span className={styles.versionBadge}>Phiên bản {policy.version}</span>
      </div>

      {/* 2. Bảng mốc thời gian và tỷ lệ hoàn tiền */}
      <div className={styles.rulesContainer}>
        <div className={styles.rulesHeader}>
          <span>Thời điểm gửi yêu cầu huỷ</span>
          <span>Mức hoàn tiền</span>
        </div>
        <ul className={styles.rulesList} aria-label="Tóm tắt chính sách">
          {sortedRules.map((rule) => (
            <li key={rule.hours} className={styles.ruleItem}>
              <div className={styles.ruleCondition}>
                <span className={styles.bulletDot} aria-hidden="true" />
                <span>
                  {rule.hours === 0
                    ? 'Huỷ bất kỳ lúc nào'
                    : `Huỷ trước khởi hành từ ${formatHours(rule.hours)}`}
                </span>
              </div>
              <strong className={`${styles.pctBadge} ${getBadgeClass(rule.pct)}`}>
                Hoàn {rule.pct}%
              </strong>
            </li>
          ))}
          {smallest && smallest.hours > 0 && (
            <li className={styles.ruleItem}>
              <div className={styles.ruleCondition}>
                <span className={`${styles.bulletDot} ${styles.bulletDotMuted}`} aria-hidden="true" />
                <span>Huỷ sát giờ (dưới {formatHours(smallest.hours)})</span>
              </div>
              <strong className={`${styles.pctBadge} ${styles.pctZero}`}>
                Không hoàn
              </strong>
            </li>
          )}
        </ul>
      </div>

      {/* 3. Điều khoản quan trọng (đổi lịch & vắng mặt) */}
      <div className={styles.termsBox}>
        <div className={styles.termsTitle}>
          <OutdoorIcon name="info" size={15} />
          <span>Điều khoản quan trọng</span>
        </div>
        <ul className={styles.termsList}>
          <li>
            {policy.reschedule
              ? `Đổi lịch trước khởi hành từ ${formatHours(policy.reschedule.minHoursBefore)}, tối đa ${policy.reschedule.maxTimes} lần${
                  policy.reschedule.fee > 0 ? `, phí ${formatCurrency(policy.reschedule.fee)}` : ', miễn phí'
                }.`
              : 'Chuyến này không hỗ trợ đổi lịch.'}
          </li>
          <li>
            Không có mặt sau {policy.noShowGraceMinutes} phút kể từ giờ tập trung được tính là vắng mặt và không được hoàn tiền.
          </li>
        </ul>
      </div>

      {/* 4. Mô tả / Lưu ý bổ sung nếu có */}
      {policy.description && (
        <div className={styles.descriptionBox}>
          <p className={styles.description}>{policy.description}</p>
        </div>
      )}
    </div>
  );
}

import RefundRuleSummary from '@/features/admin-policies/components/RefundRuleSummary';
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

  return (
    <div className={styles.panel}>
      <p className={styles.version}>
        {policy.name} · phiên bản {policy.version}
      </p>
      <RefundRuleSummary rules={policy.rules} />
      <ul className={styles.terms}>
        <li>
          {policy.reschedule
            ? `Đổi lịch trước khởi hành từ ${formatHours(policy.reschedule.minHoursBefore)}, tối đa ${policy.reschedule.maxTimes} lần${
                policy.reschedule.fee > 0 ? `, phí ${formatCurrency(policy.reschedule.fee)}` : ', miễn phí'
              }.`
            : 'Chuyến này không hỗ trợ đổi lịch.'}
        </li>
        <li>
          Không có mặt sau {policy.noShowGraceMinutes} phút kể từ giờ tập trung được tính là vắng mặt và không
          được hoàn tiền.
        </li>
      </ul>
      {policy.description && <p className={styles.description}>{policy.description}</p>}
    </div>
  );
}

import styles from '../pages/RentalCustomer.module.css';

const tierText = (tier) =>
  tier.isTerminal ? `trễ ${tier.minDaysLate} ngày: mất toàn bộ cọc` : `trễ ${tier.minDaysLate} ngày: ${tier.percentOfDeposit}% cọc`;

/** Tóm tắt chính sách cọc / huỷ / phạt trễ cho khách (dùng ở checkout và chi tiết đơn). */
export default function RentalPolicySummary({ policy, compact = false }) {
  if (!policy) return null;
  const pickup = policy.tiers.filter((t) => t.scope === 'PickupLate');
  const returning = policy.tiers.filter((t) => t.scope === 'ReturnLate');
  return (
    <details className={styles.hint} open={!compact}>
      <summary>
        <strong>Chính sách cọc {policy.depositPercent}%</strong> (tiền thuê + cọc trả một lần)
      </summary>
      <ul>
        <li>
          Cọc = {policy.depositPercent}% tiền thuê (trước giảm giá). Sau khi trả đồ, cọc trừ phí phát sinh (nếu có) và được
          hoàn qua chuyển khoản.
        </li>
        <li>
          Huỷ trước giờ nhận + 24 giờ: hoàn 100%, tối đa {policy.freeCancelLimit} lần / {policy.freeCancelWindowDays} ngày; từ
          lần tiếp theo mất {policy.overLimitCancelFeePercent}% cọc.
        </li>
        <li>Không đến nhận đúng hẹn: {pickup.map(tierText).join(' · ')}. Hết thời gian thuê mà chưa nhận cũng mất cọc.</li>
        <li>
          Trả trễ (sau {policy.returnGraceHours} giờ ân hạn): tính tiền thuê mỗi ngày trễ, cộng {returning.map(tierText).join(' · ')}.
          Được gia hạn tới hết {policy.extensionMaxDaysLate} ngày sau hạn trả.
        </li>
        <li>
          Quá {policy.suspectedLossAfterDays} ngày chưa trả: coi như mất, bồi thường giá trị thiết bị. Hư hỏng tính theo tình
          trạng thực tế; phí vượt cọc phải thanh toán thêm.
        </li>
      </ul>
    </details>
  );
}

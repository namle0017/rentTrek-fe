import { useMemo } from 'react';
import StepChart from './StepChart';

/** Biểu đồ bậc thang hoàn tiền: trái = huỷ sớm (nhiều giờ), phải = huỷ sát giờ đi. */
export default function RefundStepChart({ rules }) {
  const steps = useMemo(
    () =>
      (rules ?? [])
        .filter(
          (rule) =>
            rule.minHoursBefore !== '' &&
            rule.refundPercentage !== '' &&
            Number.isFinite(Number(rule.minHoursBefore)) &&
            Number.isFinite(Number(rule.refundPercentage)),
        )
        .map((rule) => ({ hours: Number(rule.minHoursBefore), value: Number(rule.refundPercentage) }))
        .sort((a, b) => b.hours - a.hours)
        .map((rule) => ({ label: `≥ ${rule.hours}h`, value: rule.value })),
    [rules],
  );

  return <StepChart steps={steps} ariaLabel="Biểu đồ tỷ lệ hoàn tiền theo thời điểm huỷ" />;
}

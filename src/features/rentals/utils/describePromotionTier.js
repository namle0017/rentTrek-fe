import { formatCurrency } from '@/utils/formatCurrency';

const normalize = (value) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

// ponytail: đoán theo từ khoá, BE nhận nhiều cách viết (PromotionRules); thêm từ khoá nếu admin dùng tên lạ
export function describePromotionTier(tier) {
  const discountType = normalize(tier.discountType);
  const discount = discountType.includes('percent') || discountType === 'pct'
    ? `${tier.discountValue}%`
    : formatCurrency(tier.discountValue);
  if (!tier.minThreshold) return `Giảm ${discount}`;

  const metric = normalize(tier.qualificationMetric);
  let threshold = `đơn từ ${formatCurrency(tier.minThreshold)}`;
  if (/day|duration/.test(metric)) threshold = `thuê từ ${tier.minThreshold} ngày`;
  else if (/quant|item|unit/.test(metric)) threshold = `từ ${tier.minThreshold} thiết bị`;
  return `Giảm ${discount} cho ${threshold}`;
}

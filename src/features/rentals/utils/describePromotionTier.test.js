import { describe, expect, it } from 'vitest';
import { describePromotionTier } from './describePromotionTier';

describe('describePromotionTier', () => {
  it('mô tả theo loại giảm và ngưỡng', () => {
    expect(describePromotionTier({ discountType: 'Percentage', discountValue: 10, qualificationMetric: 'RentalDays', minThreshold: 3 }))
      .toBe('Giảm 10% cho thuê từ 3 ngày');
    expect(describePromotionTier({ discountType: 'Percent', discountValue: 5, qualificationMetric: 'Quantity', minThreshold: 2 }))
      .toBe('Giảm 5% cho từ 2 thiết bị');
    expect(describePromotionTier({ discountType: 'Percent', discountValue: 5, qualificationMetric: 'Subtotal', minThreshold: 0 }))
      .toBe('Giảm 5%');
  });
});

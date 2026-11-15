import { describe, expect, it } from 'vitest';
import { validatePriceTiers } from './validatePriceTiers';

describe('product price tiers', () => {
  it('converts form values and preserves the unlimited last tier', () => {
    expect(
      validatePriceTiers([
        { minDays: '1', maxDays: '3', dailyPrice: '50000' },
        { minDays: '4', maxDays: '', dailyPrice: '40000' },
      ]),
    ).toEqual([
      { minDays: 1, maxDays: 3, dailyPrice: 50000 },
      { minDays: 4, maxDays: null, dailyPrice: 40000 },
    ]);
  });
  it.each([
    [{ minDays: 2, maxDays: null, dailyPrice: 100 }],
    [
      { minDays: 1, maxDays: 3, dailyPrice: 100 },
      { minDays: 3, maxDays: null, dailyPrice: 100 },
    ],
    [
      { minDays: 1, maxDays: null, dailyPrice: 100 },
      { minDays: 2, maxDays: null, dailyPrice: 100 },
    ],
    [{ minDays: 1, maxDays: null, dailyPrice: -1 }],
    [{ minDays: 1, maxDays: null, dailyPrice: '' }],
  ])('rejects invalid ranges and prices: %j', (...rows) => {
    expect(() => validatePriceTiers(rows)).toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import { formatHours } from './formatHours';

describe('formatHours', () => {
  it.each([
    [72, '3 ngày (72 giờ)'],
    [168, '7 ngày (168 giờ)'],
    [24, '1 ngày (24 giờ)'],
    [36, '1,5 ngày (36 giờ)'],
    [0, '0 giờ'],
    [5, '5 giờ'],
    [23, '23 giờ'],
  ])('formats %s hours', (hours, expected) => {
    expect(formatHours(hours)).toBe(expected);
  });

  it('accepts numeric strings', () => {
    expect(formatHours('72')).toBe('3 ngày (72 giờ)');
  });
});

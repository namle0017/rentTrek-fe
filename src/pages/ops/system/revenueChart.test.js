import { describe, expect, it } from 'vitest';
import { buildRevenuePeriods, revenueRange } from './revenueChartData';

describe('dashboard revenue aggregation', () => {
  it('uses exactly 30 calendar days in Vietnam even near a UTC date boundary', () => {
    const range = revenueRange('2026-11-09T18:00:00Z', 30);
    expect(range).toEqual({
      from: '2026-10-11T17:00:00.000Z',
      to: '2026-11-10T16:59:59.999Z',
      groupBy: 'week',
    });
  });

  it('matches UTC report periods to Vietnamese Mondays and fills missing weeks', () => {
    const range = revenueRange('2026-11-10T00:00:00Z', 30);
    const periods = buildRevenuePeriods(
      [
        {
          period: '2026-11-08T17:00:00Z',
        orderType: 'TripBooking',
          collections: 1200,
          refunds: 200,
          netRevenueVnd: 1000,
        },
        {
          period: '2026-11-08T17:00:00Z',
          orderType: 'Rental',
          collections: 300,
          refunds: 500,
          netRevenueVnd: -200,
        },
      ],
      range,
    );
    expect(periods).toHaveLength(5);
    expect(periods[0].key).toBe('2026-10-12');
    expect(periods[0].Tour.netRevenueVnd).toBe(0);
    expect(periods[4].label).toBe('09/11');
    expect(periods[4].Tour.netRevenueVnd).toBe(1000);
    expect(periods[4].Rental.netRevenueVnd).toBe(-200);
  });

  it('combines duplicate service rows without mixing service totals or other periods', () => {
    const range = revenueRange('2026-11-10T00:00:00Z', 30);
    const rows = [100, 200].map((amount) => ({
      period: '2026-11-08T17:00:00Z',
      orderType: 'Tour',
      collections: amount,
      refunds: 0,
      netRevenueVnd: amount,
    }));
    rows.push({
      period: '2025-11-08T17:00:00Z',
      orderType: 'Rental',
      collections: 10000,
      netRevenueVnd: 10000,
    });
    const periods = buildRevenuePeriods(rows, range);
    expect(periods.reduce((sum, period) => sum + period.Tour.collections, 0)).toBe(300);
    expect(periods.reduce((sum, period) => sum + period.Rental.collections, 0)).toBe(0);
  });

  it('groups a longer date range by month across year boundaries', () => {
    const range = revenueRange('2027-01-10T00:00:00Z', 180);
    expect(range.groupBy).toBe('month');
    const periods = buildRevenuePeriods([], range);
    expect(periods.at(-1).key).toBe('2027-01-01');
    expect(periods.at(-2).label).toBe('12/2026');
    expect(periods.every((period) => period.Tour.netRevenueVnd === 0)).toBe(true);
  });
});

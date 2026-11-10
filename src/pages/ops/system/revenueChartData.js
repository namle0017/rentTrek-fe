import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const revenueServices = [
  { key: 'Tour', label: 'Đặt tour', color: '#377b59' },
  { key: 'Rental', label: 'Thuê thiết bị', color: '#d39b54' },
];

// The report API groups periods by Monday/month at midnight in Vietnam (UTC+7).
const vietnamDate = (value) => dayjs(value).utcOffset(7);
const periodStart = (date, groupBy) =>
  groupBy === 'month' ? date.startOf('month') : date.startOf('day').subtract((date.day() + 6) % 7, 'day');

export function revenueRange(now, days) {
  const to = vietnamDate(now).endOf('day');
  return {
    from: to
      .subtract(days - 1, 'day')
      .startOf('day')
      .toISOString(),
    to: to.toISOString(),
    groupBy: days <= 90 ? 'week' : 'month',
  };
}

export function buildRevenuePeriods(rows, range) {
  const buckets = new Map();
  let date = periodStart(vietnamDate(range.from), range.groupBy);
  const last = vietnamDate(range.to);
  while (date.valueOf() <= last.valueOf()) {
    const key = date.format('YYYY-MM-DD');
    buckets.set(key, {
      key,
      label: date.format(range.groupBy === 'month' ? 'MM/YYYY' : 'DD/MM'),
      title: `${range.groupBy === 'month' ? 'Tháng' : 'Tuần từ'} ${date.format(range.groupBy === 'month' ? 'MM/YYYY' : 'DD/MM/YYYY')}`,
      Tour: { collections: 0, refunds: 0, netRevenueVnd: 0 },
      Rental: { collections: 0, refunds: 0, netRevenueVnd: 0 },
    });
    date = date.add(1, range.groupBy);
  }
  for (const row of rows) {
    const bucket = buckets.get(vietnamDate(row.period).format('YYYY-MM-DD'));
    const service = row.orderType === 'TripBooking' ? 'Tour' : row.orderType;
    if (!bucket || !revenueServices.some(({ key }) => key === service)) continue;
    for (const metric of ['collections', 'refunds', 'netRevenueVnd']) {
      bucket[service][metric] += Number(row[metric]) || 0;
    }
  }
  return [...buckets.values()];
}

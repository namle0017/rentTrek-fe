import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const revenueServices = [
  { key: 'Tour', label: 'Đặt tour', color: '#377b59' },
  { key: 'Rental', label: 'Thuê thiết bị', color: '#d39b54' },
];

// The report API groups periods by Monday/month at midnight in Vietnam (UTC+7).
export const vietnamDate = (value) => {
  if (!value) return dayjs().utcOffset(7);
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return dayjs.utc(`${str}T00:00:00Z`).utcOffset(7);
  }
  if (!str.endsWith('Z') && !str.includes('+') && !str.includes('-0') && !str.includes('-1')) {
    return dayjs.utc(`${str}Z`).utcOffset(7);
  }
  return dayjs(str).utcOffset(7);
};

export const periodStart = (date, groupBy) =>
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
  const buckets = [];
  let cur = periodStart(vietnamDate(range.from), range.groupBy);
  const last = vietnamDate(range.to);

  while (cur.valueOf() <= last.valueOf()) {
    const next = cur.add(1, range.groupBy);
    const key = cur.format('YYYY-MM-DD');
    buckets.push({
      key,
      startDate: cur,
      endDate: next,
      label: cur.format(range.groupBy === 'month' ? 'MM/YYYY' : 'DD/MM'),
      title: `${range.groupBy === 'month' ? 'Tháng' : 'Tuần từ'} ${cur.format(range.groupBy === 'month' ? 'MM/YYYY' : 'DD/MM/YYYY')}`,
      Tour: { collections: 0, refunds: 0, netRevenueVnd: 0 },
      Rental: { collections: 0, refunds: 0, netRevenueVnd: 0 },
    });
    cur = next;
  }

  for (const row of rows ?? []) {
    if (!row) continue;
    const rawPeriod = row.period ?? row.Period;
    if (!rawPeriod) continue;
    const rowDate = vietnamDate(rawPeriod);
    const rowKey = rowDate.format('YYYY-MM-DD');

    // 1. Exact match by period start key
    let bucket = buckets.find((b) => b.key === rowKey);

    // 2. Interval match: row falls inside [startDate, endDate)
    if (!bucket) {
      bucket = buckets.find((b) => !rowDate.isBefore(b.startDate) && rowDate.isBefore(b.endDate));
    }

    // 3. Fallback edge: row falls at end boundary
    if (!bucket && buckets.length > 0) {
      const lastBucket = buckets[buckets.length - 1];
      if (!rowDate.isBefore(lastBucket.startDate)) {
        bucket = lastBucket;
      }
    }

    const rawType = String(row.orderType ?? row.OrderType ?? '').trim();
    let service = null;
    if (/tour|trip/i.test(rawType)) service = 'Tour';
    else if (/rent/i.test(rawType)) service = 'Rental';

    if (!bucket || !service) continue;

    const collections = Number(row.collections ?? row.Collections) || 0;
    const refunds = Number(row.refunds ?? row.Refunds) || 0;
    const net = Number(row.netRevenueVnd ?? row.NetRevenueVnd);
    const netRevenueVnd =
      !Number.isNaN(net) && (row.netRevenueVnd !== undefined || row.NetRevenueVnd !== undefined)
        ? net
        : collections - refunds;

    bucket[service].collections += collections;
    bucket[service].refunds += refunds;
    bucket[service].netRevenueVnd += netRevenueVnd;
  }

  return buckets;
}

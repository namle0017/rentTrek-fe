import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const revenueServices = [
  { key: 'Tour', label: 'Đặt tour', color: '#377b59' },
  { key: 'Rental', label: 'Thuê thiết bị', color: '#d39b54' },
];

// The report API groups periods at midnight in Vietnam (UTC+7).
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

export const periodStart = (date, groupBy) => {
  if (groupBy === 'month') return date.startOf('month');
  if (groupBy === 'week') return date.startOf('day').subtract((date.day() + 6) % 7, 'day');
  return date.startOf('day');
};

export function revenueRange(now, days, customGroupBy) {
  const to = vietnamDate(now).endOf('day');
  const defaultGroupBy = days <= 14 ? 'day' : days <= 90 ? 'week' : 'month';
  const groupBy = customGroupBy || defaultGroupBy;
  return {
    from: to
      .subtract(days - 1, 'day')
      .startOf('day')
      .toISOString(),
    to: to.toISOString(),
    groupBy,
  };
}

export function buildRevenuePeriods(rows, range, now) {
  const buckets = [];
  let cur = periodStart(vietnamDate(range.from), range.groupBy);
  const last = vietnamDate(range.to);
  const vnNow = vietnamDate(now ?? range.to);

  while (cur.valueOf() <= last.valueOf()) {
    const next = cur.add(1, range.groupBy);
    const key = cur.format('YYYY-MM-DD');
    const isToday = cur.isSame(vnNow, 'day');

    let label;
    let title;

    if (range.groupBy === 'day') {
      label = isToday ? 'Hôm nay' : cur.format('DD/MM');
      title = isToday
        ? `Hôm nay (${cur.format('DD/MM/YYYY')})`
        : `Ngày ${cur.format('DD/MM/YYYY')}`;
    } else if (range.groupBy === 'week') {
      label = cur.format('DD/MM');
      title = `Tuần từ ${cur.format('DD/MM/YYYY')}`;
    } else {
      label = cur.format('MM/YYYY');
      title = `Tháng ${cur.format('MM/YYYY')}`;
    }

    buckets.push({
      key,
      startDate: cur,
      endDate: next,
      label,
      title,
      isToday: range.groupBy === 'day' && isToday,
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

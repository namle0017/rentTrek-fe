const DAY = 86400000;
export const MAX_RENTAL_QUANTITY = 20;
export const vietnamDateTime = (date = new Date()) =>
  new Date(date.getTime() + 7 * 3600000).toISOString().slice(0, 16);
export function defaultRentalPeriod(now = new Date()) {
  const date = vietnamDateTime(new Date(now.getTime() + DAY)).slice(0, 10);
  return {
    start: `${date}T09:00`,
    end: `${vietnamDateTime(new Date(now.getTime() + 2 * DAY)).slice(0, 10)}T09:00`,
  };
}
export function rentalPeriodError(period, now = Date.now()) {
  const start = Date.parse(`${period.start}:00+07:00`);
  const end = Date.parse(`${period.end}:00+07:00`);
  if (!Number.isFinite(start) || !Number.isFinite(end))
    return 'Vui lòng chọn thời điểm nhận và trả thiết bị.';
  if (start < now - 5 * 60000) return 'Thời điểm nhận không được ở quá khứ.';
  if (end <= start) return 'Thời điểm trả phải sau thời điểm nhận.';
  if (Math.ceil((end - start) / DAY) > 60) return 'Thời gian thuê tối đa 60 ngày.';
  return '';
}
export function rentalQuotePayload(cart) {
  if (!cart.items.length) throw new Error('Giỏ thuê đang trống.');
  const error = rentalPeriodError(cart.period);
  if (error) throw new Error(error);
  return {
    rentalStartAt: new Date(`${cart.period.start}:00+07:00`).toISOString(),
    rentalEndAt: new Date(`${cart.period.end}:00+07:00`).toISOString(),
    items: cart.items.map((item) => ({
      ...(item.bundleId ? { bundleId: item.bundleId } : { productVariantId: item.productVariantId }),
      quantity: item.quantity,
    })),
    ...(cart.promotionCode?.trim() ? { promotionCode: cart.promotionCode.trim() } : {}),
  };
}
export function quoteConsentSignature(payload, quote) {
  return quote
    ? JSON.stringify({ payload, policy: quote.refundPolicy, lines: quote.lines, total: quote.totalPayable })
    : '';
}
export function rentalSubmission(userId, payload, storage = sessionStorage) {
  const key = `rentrek.rental-submission.${userId}`;
  const fingerprint = JSON.stringify(payload);
  try {
    const previous = JSON.parse(storage.getItem(key) || 'null');
    if (previous?.fingerprint === fingerprint && previous?.idempotencyKey) return previous;
  } catch {
    /* A corrupt local entry must not block checkout. */
  }
  const submission = { fingerprint, idempotencyKey: crypto.randomUUID() };
  try {
    storage.setItem(key, JSON.stringify(submission));
  } catch {
    /* Private browsing may disable storage. */
  }
  return submission;
}
export const rentalDateLabel = (value) =>
  new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value.endsWith('Z') || /[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`));

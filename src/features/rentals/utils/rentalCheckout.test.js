import { describe, expect, it } from 'vitest';
import { defaultRentalPeriod, quoteConsentSignature, rentalPeriodError, rentalQuotePayload, rentalSubmission } from './rentalCheckout';

const cart = () => ({ period: { start: '2099-01-01T09:00', end: '2099-01-02T09:01' }, items: [{ productVariantId: 'variant-1', name: 'Tent', quantity: 2, dailyPrice: 1 }], promotionCode: ' SALE ' });
describe('rental checkout contract', () => {
  it('sends Vietnam input times as UTC, quantities and promotion without trusting local prices', () => {
    expect(rentalQuotePayload(cart())).toEqual({ rentalStartAt: '2099-01-01T02:00:00.000Z', rentalEndAt: '2099-01-02T02:01:00.000Z', items: [{ productVariantId: 'variant-1', quantity: 2 }], promotionCode: 'SALE' });
  });
  it('rejects past, reversed and over-60-day periods', () => {
    expect(rentalPeriodError({ start: '2020-01-01T09:00', end: '2020-01-02T09:00' })).toContain('quá khứ');
    expect(rentalPeriodError({ start: '2099-01-02T09:00', end: '2099-01-01T09:00' })).toContain('sau thời điểm nhận');
    expect(rentalPeriodError({ start: '2099-01-01T09:00', end: '2099-04-01T09:00' })).toContain('60 ngày');
  });
  it('chooses tomorrow at 09:00 Vietnam time, even across UTC midnight', () => {
    expect(defaultRentalPeriod(new Date('2026-11-08T19:00:00Z'))).toEqual({ start: '2026-11-10T09:00', end: '2026-11-11T09:00' });
  });
  it('keeps the idempotency key across a reload for the same request', () => {
    sessionStorage.clear();
    const payload = rentalQuotePayload(cart());
    const first = rentalSubmission('user-1', payload);
    expect(rentalSubmission('user-1', JSON.parse(JSON.stringify(payload))).idempotencyKey).toBe(first.idempotencyKey);
    expect(rentalSubmission('user-1', { ...payload, promotionCode: 'NEW' }).idempotencyKey).not.toBe(first.idempotencyKey);
    expect(rentalSubmission('user-2', payload).idempotencyKey).not.toBe(first.idempotencyKey);
  });
  it('requires new consent if price or policy changes', () => {
    const payload = rentalQuotePayload(cart());
    const quote = { refundPolicy: { version: 1 }, totalPayable: 100, lines: [] };
    expect(quoteConsentSignature(payload, quote)).not.toBe(quoteConsentSignature(payload, { ...quote, totalPayable: 200 }));
    expect(quoteConsentSignature(payload, quote)).not.toBe(quoteConsentSignature(payload, { ...quote, refundPolicy: { version: 2 } }));
  });
});

import { describe, expect, it } from 'vitest';
import {
  canCancelBooking,
  canEditParticipants,
  canShareTripLink,
  getHoldSeconds,
  splitHoldSeconds,
} from './bookingStatus';

const now = Date.parse('2026-11-01T00:00:00Z');
const paid = {
  canManage: true,
  status: 'Confirmed',
  paymentStatus: 'Paid',
  tripStartAt: '2026-11-02T00:00:00Z',
  tripEndAt: '2026-11-04T00:00:00Z',
};

describe('booking status helpers', () => {
  it('never returns a negative hold duration', () => {
    expect(getHoldSeconds('2026-10-26T01:00:00Z', Date.parse('2026-10-26T02:00:00Z'))).toBe(0);
  });

  it('splits remaining seconds for display', () => {
    expect(splitHoldSeconds(3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
  });

  it('shares the trip link only for a paid booking until the trip ends', () => {
    expect(canShareTripLink(paid, now)).toBe(true);
    expect(canShareTripLink(paid, Date.parse('2026-11-03T00:00:00Z'))).toBe(true);
    expect(canShareTripLink(paid, Date.parse('2026-11-04T00:00:00Z'))).toBe(false);
    expect(canShareTripLink({ ...paid, canManage: false }, now)).toBe(false);
    expect(canShareTripLink({ ...paid, status: 'PendingPayment', paymentStatus: 'Unpaid' }, now)).toBe(false);
  });

  it('allows editing only before departure on an open booking', () => {
    expect(canEditParticipants(paid, now)).toBe(true);
    expect(canEditParticipants(paid, Date.parse('2026-11-02T00:00:00Z'))).toBe(false);
    expect(canEditParticipants({ ...paid, status: 'Cancelled' }, now)).toBe(false);
    expect(canEditParticipants({ ...paid, canManage: false }, now)).toBe(false);
  });

  it('blocks cancelling while the payment needs reconciliation', () => {
    expect(canCancelBooking(paid, now)).toBe(true);
    expect(canCancelBooking({ ...paid, paymentStatus: 'NeedsReconciliation' }, now)).toBe(false);
  });
});

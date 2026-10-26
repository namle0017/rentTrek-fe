import { describe, expect, it } from 'vitest';
import { canGenerateInvitations, getHoldSeconds, splitHoldSeconds } from './bookingStatus';

describe('booking status helpers', () => {
  it('never returns a negative hold duration', () => {
    expect(getHoldSeconds('2026-10-26T01:00:00Z', Date.parse('2026-10-26T02:00:00Z'))).toBe(0);
  });

  it('splits remaining seconds for display', () => {
    expect(splitHoldSeconds(3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
  });

  it('allows invitations only for a manageable, confirmed, paid booking', () => {
    expect(canGenerateInvitations({ canManage: true, status: 'Confirmed', paymentStatus: 'Paid' })).toBe(true);
    expect(canGenerateInvitations({ canManage: false, status: 'Confirmed', paymentStatus: 'Paid' })).toBe(false);
    expect(canGenerateInvitations({ canManage: true, status: 'PendingPayment', paymentStatus: 'Unpaid' })).toBe(false);
  });
});

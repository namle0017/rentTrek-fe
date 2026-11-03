import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '@/api/axiosClient';
import { tripBookingService } from './tripBookingService';

vi.mock('@/api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('tripBookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a booking with the idempotency header', async () => {
    const payload = { tripId: 'trip-1', additionalParticipants: [] };
    axiosClient.post.mockResolvedValue({ data: { orderId: 'order-1' } });

    await tripBookingService.create(payload, 'booking-key');

    expect(axiosClient.post).toHaveBeenCalledWith('/trip-bookings', payload, {
      headers: { 'Idempotency-Key': 'booking-key' },
    });
  });

  it('gets a booking by order id', async () => {
    await tripBookingService.getById('order-1');

    expect(axiosClient.get).toHaveBeenCalledWith('/trip-bookings/order-1');
  });

  it('gets the customer-visible grouping for a booking', async () => {
    await tripBookingService.getGrouping('order-1');

    expect(axiosClient.get).toHaveBeenCalledWith('/trip-bookings/order-1/grouping');
  });

  it('updates a participant', async () => {
    const payload = { fullName: 'An', email: null, phone: null };
    await tripBookingService.updateParticipant({ orderId: 'order-1', participantId: 'p-1', payload });

    expect(axiosClient.put).toHaveBeenCalledWith('/trip-bookings/order-1/participants/p-1', payload);
  });

  it('loads the cancellation preview and sends the confirmed refund payload', async () => {
    const payload = {
      reason: 'Bận',
      expectedRefundAmount: 1600000,
      bankAccount: { bankCode: 'VCB', accountNumber: '0123456789', accountHolder: 'NGUYEN VAN A' },
      consentVersion: 'refund-bank-data-v1',
      consentAccepted: true,
    };

    await tripBookingService.getCancellationPreview('order-1');
    await tripBookingService.cancel({ orderId: 'order-1', payload });

    expect(axiosClient.get).toHaveBeenCalledWith('/trip-bookings/order-1/cancellation-preview');
    expect(axiosClient.post).toHaveBeenCalledWith('/trip-bookings/order-1/cancel', payload);
  });

  it('reads and rotates the invite link', async () => {
    await tripBookingService.getInviteLink('order-1');
    await tripBookingService.rotateInviteLink('order-1');

    expect(axiosClient.get).toHaveBeenCalledWith('/trip-bookings/order-1/invite-link');
    expect(axiosClient.post).toHaveBeenCalledWith('/trip-bookings/order-1/invite-link/rotate');
  });

  it('previews with the token in the body, never the URL', async () => {
    await tripBookingService.getInvitationPreview({ orderId: 'order-1', token: 'abc' });

    expect(axiosClient.post).toHaveBeenCalledWith('/trip-bookings/participant-invitations/preview', {
      orderId: 'order-1',
      token: 'abc',
    });
  });
});

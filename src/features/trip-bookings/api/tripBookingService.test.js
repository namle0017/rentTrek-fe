import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '@/api/axiosClient';
import { tripBookingService } from './tripBookingService';

vi.mock('@/api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
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

  it('generates participant invitations', async () => {
    await tripBookingService.generateInvitations('order-1');

    expect(axiosClient.post).toHaveBeenCalledWith(
      '/trip-bookings/order-1/participant-invitations',
    );
  });

  it('claims an invitation token through a request body', async () => {
    await tripBookingService.claimInvitation('raw-token');

    expect(axiosClient.post).toHaveBeenCalledWith(
      '/trip-bookings/participant-invitations/claim',
      { token: 'raw-token' },
    );
  });
});

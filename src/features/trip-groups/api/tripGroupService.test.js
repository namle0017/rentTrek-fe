import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '@/api/axiosClient';
import { tripGroupService } from './tripGroupService';

vi.mock('@/api/axiosClient', () => ({
  default: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));

describe('tripGroupService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('gets the grouping snapshot for a trip', async () => {
    await tripGroupService.getSnapshot('trip-1');
    expect(axiosClient.get).toHaveBeenCalledWith('/trips/trip-1/grouping');
  });

  it('assigns a guide with optimistic concurrency', async () => {
    await tripGroupService.assignGuide({
      tripId: 'trip-1',
      groupId: 'group-1',
      guideUserId: 'guide-1',
      expectedTripRowVersion: 7,
    });
    expect(axiosClient.put).toHaveBeenCalledWith('/trips/trip-1/groups/group-1/guide', {
      guideUserId: 'guide-1',
      expectedTripRowVersion: 7,
    });
  });

  it('moves a whole booking to one group', async () => {
    await tripGroupService.moveBooking({
      tripId: 'trip-1',
      bookingOrderId: 'order-1',
      targetGroupId: 'group-1',
      expectedTripRowVersion: 8,
    });
    expect(axiosClient.put).toHaveBeenCalledWith('/trips/trip-1/bookings/order-1/group', {
      targetGroupId: 'group-1',
      expectedTripRowVersion: 8,
    });
  });

  it('splits a booking and publishes grouping through dedicated endpoints', async () => {
    const split = {
      tripId: 'trip-1',
      bookingOrderId: 'order-1',
      reason: 'Không đủ chỗ',
      expectedTripRowVersion: 9,
      assignments: [{ tripGroupId: 'group-1', participantIds: ['p-1'] }],
    };
    await tripGroupService.splitBooking(split);
    await tripGroupService.publish({ tripId: 'trip-1', expectedTripRowVersion: 10 });

    expect(axiosClient.post).toHaveBeenCalledWith('/trips/trip-1/bookings/order-1/split', {
      reason: split.reason,
      expectedTripRowVersion: 9,
      assignments: split.assignments,
    });
    expect(axiosClient.post).toHaveBeenCalledWith('/trips/trip-1/grouping/publish', {
      expectedTripRowVersion: 10,
    });
  });
});

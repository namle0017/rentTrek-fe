import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tripBookingService } from '../api/tripBookingService';
import { tripBookingKeys } from '../api/tripBookingKeys';
import {
  useClaimParticipantInvitation,
  useCreateTripBooking,
  useGenerateParticipantInvitations,
  useTripBooking,
} from './useTripBookings';

vi.mock('../api/tripBookingService', () => ({
  tripBookingService: {
    create: vi.fn(),
    getById: vi.fn(),
    generateInvitations: vi.fn(),
    claimInvitation: vi.fn(),
  },
}));

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn() },
}));

const createHarness = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe('trip booking hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads detail through the detail query key', async () => {
    const response = { data: { orderId: 'order-1', status: 'PendingPayment' } };
    tripBookingService.getById.mockResolvedValue(response);
    const { queryClient, wrapper } = createHarness();

    const { result } = renderHook(() => useTripBooking('order-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(response.data);
    expect(queryClient.getQueryData(tripBookingKeys.detail('order-1'))).toEqual(response);
  });

  it('returns create response and caches the created booking detail', async () => {
    const response = { data: { orderId: 'order-1', status: 'PendingPayment' } };
    tripBookingService.create.mockResolvedValue(response);
    const { queryClient, wrapper } = createHarness();
    const { result } = renderHook(useCreateTripBooking, { wrapper });

    let returned;
    await act(async () => {
      returned = await result.current.mutateAsync({
        payload: { tripId: 'trip-1', additionalParticipants: [] },
        idempotencyKey: 'key-1',
      });
    });

    expect(returned).toBe(response);
    expect(queryClient.getQueryData(tripBookingKeys.detail('order-1'))).toBe(response);
    expect(toast.success).toHaveBeenCalled();
  });

  it('invalidates booking detail without caching generated invitation tokens', async () => {
    const response = {
      data: { orderId: 'order-1', invitations: [{ token: 'raw-token' }] },
    };
    tripBookingService.generateInvitations.mockResolvedValue(response);
    const { queryClient, wrapper } = createHarness();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(useGenerateParticipantInvitations, { wrapper });

    await act(async () => {
      await result.current.mutateAsync('order-1');
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: tripBookingKeys.detail('order-1') });
    expect(queryClient.getQueriesData({ queryKey: tripBookingKeys.all })).toEqual([]);
  });

  it('invalidates the claimed booking without persisting the raw token', async () => {
    const response = { data: { orderId: 'order-1', participantId: 'participant-1' } };
    tripBookingService.claimInvitation.mockResolvedValue(response);
    const { queryClient, wrapper } = createHarness();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(useClaimParticipantInvitation, { wrapper });

    await act(async () => {
      await result.current.mutateAsync('raw-token');
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: tripBookingKeys.detail('order-1') });
    expect(queryClient.getQueriesData({ queryKey: tripBookingKeys.all })).toEqual([]);
  });
});

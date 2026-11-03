import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { orderKeys } from '@/features/orders/api/orderKeys';
import { tripBookingService } from '../api/tripBookingService';
import { tripBookingKeys } from '../api/tripBookingKeys';
import {
  useCancelTripBooking,
  useCancellationPreview,
  useCreateTripBooking,
  useCustomerTripGrouping,
  useTripBooking,
  useUpdateParticipant,
} from './useTripBookings';

vi.mock('../api/tripBookingService', () => ({
  tripBookingService: {
    create: vi.fn(),
    getById: vi.fn(),
    getGrouping: vi.fn(),
    getCancellationPreview: vi.fn(),
    updateParticipant: vi.fn(),
    cancel: vi.fn(),
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

  it('loads the customer-visible grouping with a separate query key', async () => {
    const response = { data: { groupingStatus: 'Published', groups: [] } };
    tripBookingService.getGrouping.mockResolvedValue(response);
    const { queryClient, wrapper } = createHarness();

    const { result } = renderHook(() => useCustomerTripGrouping('order-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(response.data);
    expect(queryClient.getQueryData(tripBookingKeys.grouping('order-1'))).toEqual(response);
  });

  it('loads cancellation preview only when enabled with its own query key', async () => {
    const response = { data: { canCancel: true, estimatedRefundAmount: 1600000 } };
    tripBookingService.getCancellationPreview.mockResolvedValue(response);
    const { queryClient, wrapper } = createHarness();

    const { result, rerender } = renderHook(({ enabled }) => useCancellationPreview('order-1', { enabled }), {
      wrapper,
      initialProps: { enabled: false },
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(tripBookingService.getCancellationPreview).not.toHaveBeenCalled();

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(response.data);
    expect(queryClient.getQueryData(tripBookingKeys.cancellationPreview('order-1'))).toEqual(response);
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

  it.each([
    ['useUpdateParticipant', useUpdateParticipant, 'updateParticipant'],
    ['useCancelTripBooking', useCancelTripBooking, 'cancel'],
  ])('%s replaces the cached detail and refreshes dependent lists', async (_name, useHook, method) => {
    const response = { data: { orderId: 'order-1', status: 'Cancelled' } };
    tripBookingService[method].mockResolvedValue(response);
    const { queryClient, wrapper } = createHarness();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(useHook, { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ orderId: 'order-1' });
    });

    expect(queryClient.getQueryData(tripBookingKeys.detail('order-1'))).toBe(response);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: tripBookingKeys.grouping('order-1') });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: orderKeys.myLists() });
  });
});

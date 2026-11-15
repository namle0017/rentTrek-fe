import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userService } from '@/features/users/api/userService';
import { tripGroupService } from '../api/tripGroupService';
import { tripGroupKeys } from '../api/tripGroupKeys';
import {
  useAssignTripGroupGuide,
  useMoveBookingToGroup,
  usePublishTripGrouping,
  useSplitTripBooking,
  useGuideOptions,
  useTripGrouping,
} from './useTripGroups';

vi.mock('../api/tripGroupService', () => ({
  tripGroupService: {
    getSnapshot: vi.fn(),
    assignGuide: vi.fn(),
    moveBooking: vi.fn(),
    splitBooking: vi.fn(),
    publish: vi.fn(),
  },
}));

vi.mock('@/features/users/api/userService', () => ({
  userService: { getGuides: vi.fn() },
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

describe('trip group hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads a grouping snapshot with its trip-specific key', async () => {
    const response = { data: { tripId: 'trip-1', rowVersion: 7 } };
    tripGroupService.getSnapshot.mockResolvedValue(response);
    const { queryClient, wrapper } = createHarness();

    const { result } = renderHook(() => useTripGrouping('trip-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(response.data);
    expect(queryClient.getQueryData(tripGroupKeys.detail('trip-1'))).toEqual(response);
  });

  it.each([
    ['guide', useAssignTripGroupGuide, 'assignGuide'],
    ['move', useMoveBookingToGroup, 'moveBooking'],
    ['split', useSplitTripBooking, 'splitBooking'],
    ['publish', usePublishTripGrouping, 'publish'],
  ])('stores the newest snapshot after %s mutation', async (_label, useMutationHook, serviceMethod) => {
    const variables = { tripId: 'trip-1', expectedTripRowVersion: 7 };
    const response = { data: { tripId: 'trip-1', rowVersion: 8 } };
    tripGroupService[serviceMethod].mockResolvedValue(response);
    const { queryClient, wrapper } = createHarness();
    const { result } = renderHook(useMutationHook, { wrapper });

    await act(async () => {
      await result.current.mutateAsync(variables);
    });

    expect(tripGroupService[serviceMethod]).toHaveBeenCalledWith(variables);
    expect(queryClient.getQueryData(tripGroupKeys.detail('trip-1'))).toEqual(response);
  });

  it('loads guide accounts from the guides endpoint', async () => {
    userService.getGuides.mockResolvedValue({
      data: [{ userId: 'guide-1', fullName: 'Đinh Văn Toàn', role: 'Guide' }],
    });
    const { wrapper } = createHarness();

    const { result } = renderHook(() => useGuideOptions(true), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(userService.getGuides).toHaveBeenCalled();
    expect(result.current.data).toEqual([{ userId: 'guide-1', fullName: 'Đinh Văn Toàn', role: 'Guide' }]);
  });
});

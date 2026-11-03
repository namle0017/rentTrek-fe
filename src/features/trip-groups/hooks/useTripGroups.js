import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userService } from '@/features/users/api/userService';
import { tripGroupKeys } from '../api/tripGroupKeys';
import { tripGroupService } from '../api/tripGroupService';

export function useTripGrouping(tripId) {
  return useQuery({
    queryKey: tripGroupKeys.detail(tripId),
    queryFn: () => tripGroupService.getSnapshot(tripId),
    select: (response) => response.data,
    enabled: Boolean(tripId),
  });
}

export function useAdminTrip(tripId) {
  return useQuery({
    queryKey: tripGroupKeys.trip(tripId),
    queryFn: () => tripGroupService.getTrip(tripId),
    select: (response) => response.data,
    enabled: Boolean(tripId),
  });
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripGroupService.updateStatus,
    onSuccess: (response, { tripId }) => {
      toast.success('Đã cập nhật trạng thái chuyến');
      queryClient.setQueryData(tripGroupKeys.trip(tripId), response);
      queryClient.invalidateQueries({ queryKey: tripGroupKeys.detail(tripId) });
    },
  });
}

function useSnapshotMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables) => mutationFn(variables),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(tripGroupKeys.detail(variables.tripId), response);
    },
  });
}

export function useAssignTripGroupGuide() {
  return useSnapshotMutation(tripGroupService.assignGuide);
}

export function useMoveBookingToGroup() {
  return useSnapshotMutation(tripGroupService.moveBooking);
}

export function usePublishTripGrouping() {
  return useSnapshotMutation(tripGroupService.publish);
}

export function useSplitTripBooking() {
  return useSnapshotMutation(tripGroupService.splitBooking);
}

export function useTourGuideOptions(enabled = true) {
  return useQuery({
    queryKey: tripGroupKeys.guides(),
    queryFn: () => userService.getAll({ role: 'TourGuide', pageSize: 100 }),
    select: (response) => response.data?.items ?? response.data ?? [],
    enabled,
  });
}

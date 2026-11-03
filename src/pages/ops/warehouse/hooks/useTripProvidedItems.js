import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { tripProvidedItemService } from '../api/tripProvidedItemService';
import { assetKeys } from '../api/assetKeys';

export const tripItemKeys = {
  all: ['admin', 'trips', 'providedItems'],
  byTrip: (tripId) => [...tripItemKeys.all, tripId],
  available: (tripId, itemId) => [...tripItemKeys.all, tripId, 'available', itemId],
};

export function useTripProvidedItems(tripId) {
  return useQuery({
    queryKey: tripItemKeys.byTrip(tripId),
    queryFn: () => tripProvidedItemService.getByTrip(tripId),
    select: (res) => res.data,
    enabled: Boolean(tripId),
  });
}

export function useAvailableAssetsForTripItem(tripId, itemId, enabled = true) {
  return useQuery({
    queryKey: tripItemKeys.available(tripId, itemId),
    queryFn: () => tripProvidedItemService.getAvailableAssets(tripId, itemId),
    select: (res) => res.data,
    enabled: Boolean(tripId && itemId && enabled),
  });
}

export function useAssignAssetsToTripItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, itemId, payload }) =>
      tripProvidedItemService.assignAssets(tripId, itemId, payload),
    onSuccess: (res, { tripId, itemId }) => {
      toast.success(res?.message || 'Gán thiết bị thành công');
      queryClient.invalidateQueries({ queryKey: tripItemKeys.byTrip(tripId) });
      queryClient.invalidateQueries({ queryKey: tripItemKeys.available(tripId, itemId) });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi khi gán thiết bị vào chuyến';
      toast.error(msg);
    },
  });
}

export function useUnassignAssetFromTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, assignmentId }) =>
      tripProvidedItemService.unassignAsset(tripId, assignmentId),
    onSuccess: (res, { tripId }) => {
      toast.success(res?.message || 'Đã gỡ thiết bị khỏi chuyến');
      queryClient.invalidateQueries({ queryKey: tripItemKeys.byTrip(tripId) });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi khi hủy gán thiết bị';
      toast.error(msg);
    },
  });
}

export function useIssueTripGear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, payload }) =>
      tripProvidedItemService.issueGear(tripId, payload),
    onSuccess: (res, { tripId }) => {
      toast.success(res?.message || 'Xuất kho bàn giao thiết bị thành công');
      queryClient.invalidateQueries({ queryKey: tripItemKeys.byTrip(tripId) });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi xuất kho bàn giao';
      toast.error(msg);
    },
  });
}

export function useReturnTripGear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, payload }) =>
      tripProvidedItemService.returnGear(tripId, payload),
    onSuccess: (res, { tripId }) => {
      toast.success(res?.message || 'Thu hồi thiết bị thành công');
      queryClient.invalidateQueries({ queryKey: tripItemKeys.byTrip(tripId) });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Lỗi khi thu hồi thiết bị';
      toast.error(msg);
    },
  });
}

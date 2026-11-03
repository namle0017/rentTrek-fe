import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { guideKeys } from '../api/guideKeys';
import { guideService } from '../api/guideService';

export function useGuideTrips(tab = 'today') {
  return useQuery({
    queryKey: guideKeys.trips(tab),
    queryFn: () => guideService.getMyTrips(tab),
    select: (res) => res.data ?? [],
  });
}

export function useGuideGroupRoster(tripId, search = '') {
  return useQuery({
    queryKey: guideKeys.groupRoster(tripId, search),
    queryFn: () => guideService.getGroupRoster(tripId, search),
    select: (res) => res.data,
    enabled: Boolean(tripId),
  });
}

export function useGuideParticipantDetail(participantId) {
  return useQuery({
    queryKey: guideKeys.participant(participantId),
    queryFn: () => guideService.getParticipantDetail(participantId),
    select: (res) => res.data,
    enabled: Boolean(participantId),
  });
}

export function useGuideBatchAttendance(tripId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => guideService.submitBatchAttendance(tripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guideKeys.all });
    },
  });
}

export function useGuideItinerary(tripId) {
  return useQuery({
    queryKey: guideKeys.itinerary(tripId),
    queryFn: () => guideService.getTripItinerary(tripId),
    select: (res) => res.data,
    enabled: Boolean(tripId),
  });
}

export function useGuideProvidedItems(tripId) {
  return useQuery({
    queryKey: guideKeys.providedItems(tripId),
    queryFn: () => guideService.getProvidedItems(tripId),
    select: (res) => res.data,
    enabled: Boolean(tripId),
  });
}

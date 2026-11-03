import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminTripKeys } from '../api/adminTripKeys';
import { adminTripService } from '../api/adminTripService';

export function useRecurrenceRules(tourId) {
  return useQuery({
    queryKey: adminTripKeys.recurrenceRules(tourId),
    queryFn: () => adminTripService.getRecurrenceRules(tourId),
    select: (res) => res.data ?? [],
    enabled: Boolean(tourId),
  });
}

export function useCreateRecurrenceRule(tourId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminTripService.createRecurrenceRule(tourId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTripKeys.recurrenceRules(tourId) });
    },
  });
}

export function useUpdateRecurrenceRule(tourId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, payload }) => adminTripService.updateRecurrenceRule(ruleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTripKeys.recurrenceRules(tourId) });
    },
  });
}

export function useDeleteRecurrenceRule(tourId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId) => adminTripService.deleteRecurrenceRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTripKeys.recurrenceRules(tourId) });
    },
  });
}

export function usePreviewRecurrenceTrips() {
  return useMutation({
    mutationFn: ({ ruleId, payload }) => adminTripService.previewRecurrenceTrips(ruleId, payload),
  });
}

export function useGenerateRecurrenceTrips(tourId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, payload }) => adminTripService.generateRecurrenceTrips(ruleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTripKeys.recurrenceRules(tourId) });
      queryClient.invalidateQueries({ queryKey: adminTripKeys.lists() });
    },
  });
}

export function useAdminTrips(params) {
  return useQuery({
    queryKey: adminTripKeys.list(params),
    queryFn: () => adminTripService.getTrips(params),
    select: (res) => res.data,
  });
}

export function useCreateAdminTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminTripService.createTrip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTripKeys.lists() });
    },
  });
}

export function useAdminTripDetail(tripId) {
  return useQuery({
    queryKey: adminTripKeys.detail(tripId),
    queryFn: () => adminTripService.getTripById(tripId),
    select: (res) => res.data,
    enabled: Boolean(tripId),
  });
}

export function useUpdateAdminTrip(tripId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminTripService.updateTrip(tripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTripKeys.detail(tripId) });
      queryClient.invalidateQueries({ queryKey: adminTripKeys.lists() });
    },
  });
}

export function useTripReadinessChecklist(tripId) {
  return useQuery({
    queryKey: adminTripKeys.readiness(tripId),
    queryFn: () => adminTripService.getReadinessChecklist(tripId),
    select: (res) => res.data,
    enabled: Boolean(tripId),
  });
}

export function useTripLifecycleActions(tripId) {
  const queryClient = useQueryClient();
  const invalidateTrip = () => {
    queryClient.invalidateQueries({ queryKey: adminTripKeys.detail(tripId) });
    queryClient.invalidateQueries({ queryKey: adminTripKeys.lists() });
  };

  const openBooking = useMutation({
    mutationFn: () => adminTripService.openBooking(tripId),
    onSuccess: invalidateTrip,
  });

  const closeBooking = useMutation({
    mutationFn: () => adminTripService.closeBooking(tripId),
    onSuccess: invalidateTrip,
  });

  const startTrip = useMutation({
    mutationFn: () => adminTripService.startTrip(tripId),
    onSuccess: invalidateTrip,
  });

  const completeTrip = useMutation({
    mutationFn: () => adminTripService.completeTrip(tripId),
    onSuccess: invalidateTrip,
  });

  const cancelTrip = useMutation({
    mutationFn: (payload) => adminTripService.cancelTrip(tripId, payload),
    onSuccess: invalidateTrip,
  });

  return { openBooking, closeBooking, startTrip, completeTrip, cancelTrip };
}

export function useTripBookings(tripId) {
  return useQuery({
    queryKey: adminTripKeys.bookings(tripId),
    queryFn: () => adminTripService.getTripBookings(tripId),
    select: (res) => res.data ?? [],
    enabled: Boolean(tripId),
  });
}

export function useKanbanGroupsBoard(tripId) {
  return useQuery({
    queryKey: adminTripKeys.groupsBoard(tripId),
    queryFn: () => adminTripService.getGroupsBoard(tripId),
    select: (res) => res.data,
    enabled: Boolean(tripId),
  });
}

export function useKanbanGroupMutations(tripId) {
  const queryClient = useQueryClient();
  const invalidateBoard = () => {
    queryClient.invalidateQueries({ queryKey: adminTripKeys.groupsBoard(tripId) });
    queryClient.invalidateQueries({ queryKey: adminTripKeys.readiness(tripId) });
    queryClient.invalidateQueries({ queryKey: adminTripKeys.bookings(tripId) });
  };

  const createGroup = useMutation({
    mutationFn: (payload) => adminTripService.createGroup(tripId, payload),
    onSuccess: invalidateBoard,
  });

  const updateGroup = useMutation({
    mutationFn: ({ groupId, payload }) => adminTripService.updateGroup(tripId, groupId, payload),
    onSuccess: invalidateBoard,
  });

  const deleteGroup = useMutation({
    mutationFn: (groupId) => adminTripService.deleteGroup(tripId, groupId),
    onSuccess: invalidateBoard,
  });

  const assignParticipantGroup = useMutation({
    mutationFn: (payload) => adminTripService.assignParticipantGroup(tripId, payload),
    onSuccess: invalidateBoard,
  });

  const autoGroup = useMutation({
    mutationFn: () => adminTripService.autoGroup(tripId),
    onSuccess: invalidateBoard,
  });

  const approveSplit = useMutation({
    mutationFn: ({ bookingId, reason }) =>
      adminTripService.approveBookingSplit(tripId, bookingId, { reason }),
    onSuccess: invalidateBoard,
  });

  return {
    createGroup,
    updateGroup,
    deleteGroup,
    assignParticipantGroup,
    autoGroup,
    approveSplit,
  };
}

export function useTripAttendanceMatrix(tripId, groupId) {
  return useQuery({
    queryKey: adminTripKeys.attendanceMatrix(tripId, groupId),
    queryFn: () => adminTripService.getAttendanceMatrix(tripId, groupId),
    select: (res) => res.data,
    enabled: Boolean(tripId),
  });
}

export function useTripAttendanceHistory(tripId) {
  return useQuery({
    queryKey: adminTripKeys.attendanceHistory(tripId),
    queryFn: () => adminTripService.getAttendanceHistory(tripId),
    select: (res) => res.data ?? [],
    enabled: Boolean(tripId),
  });
}

export function useUpdateTripAttendances(tripId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminTripService.updateAttendances(tripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTripKeys.detail(tripId) });
    },
  });
}

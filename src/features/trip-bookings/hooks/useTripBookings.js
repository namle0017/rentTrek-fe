import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { tripBookingKeys } from '../api/tripBookingKeys';
import { tripBookingService } from '../api/tripBookingService';

export function useTripBooking(orderId) {
  return useQuery({
    queryKey: tripBookingKeys.detail(orderId),
    queryFn: () => tripBookingService.getById(orderId),
    select: (response) => response.data,
    enabled: Boolean(orderId),
  });
}

export function useCreateTripBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, idempotencyKey }) =>
      tripBookingService.create(payload, idempotencyKey),
    onSuccess: (response) => {
      const orderId = response.data?.orderId;
      if (orderId) queryClient.setQueryData(tripBookingKeys.detail(orderId), response);
      toast.success(response.message || 'Đã giữ chỗ cho chuyến đi.');
    },
  });
}

export function useGenerateParticipantInvitations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tripBookingService.generateInvitations,
    onSuccess: (response, orderId) => {
      queryClient.invalidateQueries({ queryKey: tripBookingKeys.detail(orderId) });
      toast.success(response.message || 'Đã tạo lời mời cho người tham gia.');
    },
  });
}

export function useClaimParticipantInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tripBookingService.claimInvitation,
    onSuccess: (response) => {
      const orderId = response.data?.orderId;
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: tripBookingKeys.detail(orderId) });
      }
      toast.success(response.message || 'Đã tham gia chuyến đi.');
    },
  });
}

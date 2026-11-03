import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { orderKeys } from '@/features/orders/api/orderKeys';
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

export function useCustomerTripGrouping(orderId) {
  return useQuery({
    queryKey: tripBookingKeys.grouping(orderId),
    queryFn: () => tripBookingService.getGrouping(orderId),
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
      queryClient.invalidateQueries({ queryKey: orderKeys.myLists() });
      toast.success(response.message || 'Đã giữ chỗ cho chuyến đi.');
    },
  });
}

/** BE trả TripBookingResponse mới nhất: thay luôn cache chi tiết, không cần tải lại. */
function useBookingMutation(mutationFn, fallbackMessage) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (response, { orderId }) => {
      queryClient.setQueryData(tripBookingKeys.detail(orderId), response);
      queryClient.invalidateQueries({ queryKey: tripBookingKeys.grouping(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.myLists() });
      toast.success(response.message || fallbackMessage);
    },
  });
}

export function useUpdateParticipant() {
  return useBookingMutation(tripBookingService.updateParticipant, 'Đã cập nhật người tham gia.');
}

export function useCancelTripBooking() {
  return useBookingMutation(tripBookingService.cancel, 'Đã hủy booking.');
}

export function useInviteLink(orderId) {
  return useQuery({
    queryKey: tripBookingKeys.inviteLink(orderId),
    queryFn: () => tripBookingService.getInviteLink(orderId),
    select: (response) => response.data,
    enabled: Boolean(orderId),
  });
}

export function useRotateInviteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tripBookingService.rotateInviteLink,
    onSuccess: (response, orderId) => {
      queryClient.invalidateQueries({ queryKey: tripBookingKeys.inviteLink(orderId) });
      toast.success(response.message || 'Đã đổi link xem chuyến.');
    },
  });
}

export function useInvitationPreview(orderId, token) {
  return useQuery({
    queryKey: tripBookingKeys.invitationPreview(orderId),
    queryFn: () => tripBookingService.getInvitationPreview({ orderId, token }),
    select: (response) => response.data,
    enabled: Boolean(orderId && token),
    retry: false,
  });
}

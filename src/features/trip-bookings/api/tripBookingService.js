import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';

export const tripBookingService = {
  create: (payload, idempotencyKey) =>
    axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.ROOT, payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  getById: (orderId) => axiosClient.get(API_ENDPOINTS.TRIP_BOOKINGS.BY_ID(orderId)),
  getGrouping: (orderId) => axiosClient.get(API_ENDPOINTS.TRIP_BOOKINGS.GROUPING(orderId)),
  updateParticipant: ({ orderId, participantId, payload }) =>
    axiosClient.put(API_ENDPOINTS.TRIP_BOOKINGS.PARTICIPANT(orderId, participantId), payload),
  cancel: ({ orderId, reason }) => axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.CANCEL(orderId), { reason }),
  getInviteLink: (orderId) => axiosClient.get(API_ENDPOINTS.TRIP_BOOKINGS.INVITE_LINK(orderId)),
  rotateInviteLink: (orderId) => axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.ROTATE_INVITE_LINK(orderId)),
  // Công khai nhưng cần token; token đi trong body, không nằm trên URL
  getInvitationPreview: ({ orderId, token }) =>
    axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.PREVIEW_INVITATION, { orderId, token }),
};

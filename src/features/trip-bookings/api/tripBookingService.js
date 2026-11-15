import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';

export const tripBookingService = {
  create: (payload, idempotencyKey) =>
    axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.ROOT, payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  getTripRefundPolicy: (tripId) => axiosClient.get(API_ENDPOINTS.TRIPS.REFUND_POLICY(tripId)),
  getTripSuggestedBundles: (tripId) => axiosClient.get(API_ENDPOINTS.TRIPS.SUGGESTED_BUNDLES(tripId)),
  getById: (orderId) => axiosClient.get(API_ENDPOINTS.TRIP_BOOKINGS.BY_ID(orderId)),
  getGrouping: (orderId) => axiosClient.get(API_ENDPOINTS.TRIP_BOOKINGS.GROUPING(orderId)),
  updateParticipant: ({ orderId, participantId, payload }) =>
    axiosClient.put(API_ENDPOINTS.TRIP_BOOKINGS.PARTICIPANT(orderId, participantId), payload),
  getCancellationPreview: (orderId) =>
    axiosClient.get(API_ENDPOINTS.TRIP_BOOKINGS.CANCELLATION_PREVIEW(orderId)),
  cancel: ({ orderId, payload }) => axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.CANCEL(orderId), payload),
  // participantIds=a&participantIds=b (ASP.NET bind List<Guid>)
  getParticipantCancellationPreview: (orderId, participantIds) =>
    axiosClient.get(API_ENDPOINTS.TRIP_BOOKINGS.PARTICIPANTS_CANCELLATION_PREVIEW(orderId), {
      params: { participantIds },
      paramsSerializer: { indexes: null },
    }),
  cancelParticipants: ({ orderId, payload }) =>
    axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.PARTICIPANTS_CANCEL(orderId), payload),
  getInviteLink: (orderId) => axiosClient.get(API_ENDPOINTS.TRIP_BOOKINGS.INVITE_LINK(orderId)),
  rotateInviteLink: (orderId) => axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.ROTATE_INVITE_LINK(orderId)),
  // Công khai nhưng cần token; token đi trong body, không nằm trên URL
  getInvitationPreview: ({ orderId, token }) =>
    axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.PREVIEW_INVITATION, { orderId, token }),
  getRescheduleOptions: (orderId) => axiosClient.get(API_ENDPOINTS.TRIP_BOOKINGS.RESCHEDULE_OPTIONS(orderId)),
  reschedule: ({ orderId, toTripId }) =>
    axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.RESCHEDULE(orderId), { toTripId }),
};

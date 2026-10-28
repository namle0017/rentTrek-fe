import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';

export const tripBookingService = {
  create: (payload, idempotencyKey) =>
    axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.ROOT, payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  getById: (orderId) => axiosClient.get(API_ENDPOINTS.TRIP_BOOKINGS.BY_ID(orderId)),
  generateInvitations: (orderId) =>
    axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.INVITATIONS(orderId)),
  claimInvitation: (token) =>
    axiosClient.post(API_ENDPOINTS.TRIP_BOOKINGS.CLAIM_INVITATION, { token }),
};

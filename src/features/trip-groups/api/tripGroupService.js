import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';

export const tripGroupService = {
  getTrip: (tripId) => axiosClient.get(API_ENDPOINTS.TRIPS.BY_ID(tripId)),
  updateStatus: ({ tripId, status }) => axiosClient.patch(API_ENDPOINTS.TRIPS.STATUS(tripId), { status }),
  getSnapshot: (tripId) => axiosClient.get(API_ENDPOINTS.TRIPS.GROUPING(tripId)),
  assignGuide: ({ tripId, groupId, guideUserId, expectedTripRowVersion }) =>
    axiosClient.put(API_ENDPOINTS.TRIPS.GROUP_GUIDE(tripId, groupId), {
      guideUserId,
      expectedTripRowVersion,
    }),
  moveBooking: ({ tripId, bookingOrderId, targetGroupId, expectedTripRowVersion }) =>
    axiosClient.put(API_ENDPOINTS.TRIPS.BOOKING_GROUP(tripId, bookingOrderId), {
      targetGroupId,
      expectedTripRowVersion,
    }),
  splitBooking: ({ tripId, bookingOrderId, reason, expectedTripRowVersion, assignments }) =>
    axiosClient.post(API_ENDPOINTS.TRIPS.SPLIT_BOOKING(tripId, bookingOrderId), {
      reason,
      expectedTripRowVersion,
      assignments,
    }),
  publish: ({ tripId, expectedTripRowVersion }) =>
    axiosClient.post(API_ENDPOINTS.TRIPS.PUBLISH_GROUPING(tripId), {
      expectedTripRowVersion,
    }),
};

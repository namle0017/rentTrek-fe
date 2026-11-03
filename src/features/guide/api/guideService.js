import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const guideService = {
  getMyTrips: (tab = 'today') => axiosClient.get(API_ENDPOINTS.GUIDE.TRIPS, { params: cleanParams({ tab }) }),
  getGroupRoster: (tripId, search) =>
    axiosClient.get(API_ENDPOINTS.GUIDE.GROUP_ROSTER(tripId), { params: cleanParams({ search }) }),
  getParticipantDetail: (participantId) =>
    axiosClient.get(API_ENDPOINTS.GUIDE.PARTICIPANT_DETAIL(participantId)),
  submitBatchAttendance: (tripId, payload) =>
    axiosClient.post(API_ENDPOINTS.GUIDE.BATCH_ATTENDANCE(tripId), payload),
  getTripItinerary: (tripId) => axiosClient.get(API_ENDPOINTS.GUIDE.ITINERARY(tripId)),
  getProvidedItems: (tripId) => axiosClient.get(API_ENDPOINTS.GUIDE.PROVIDED_ITEMS(tripId)),
};

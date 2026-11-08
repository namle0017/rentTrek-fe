import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';

export const tripProvidedItemService = {
  getByTrip: (tripId) => axiosClient.get(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.BY_TRIP(tripId)),

  getAvailableAssets: (tripId, itemId) =>
    axiosClient.get(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.AVAILABLE_ASSETS(tripId, itemId)),

  assignAssets: (tripId, itemId, payload) =>
    axiosClient.post(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.ASSIGN(tripId, itemId), payload),

  unassignAsset: (tripId, assignmentId) =>
    axiosClient.delete(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.UNASSIGN(tripId, assignmentId)),

  issueGear: (tripId, payload) =>
    axiosClient.post(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.ISSUE(tripId), payload),

  returnGear: (tripId, payload) =>
    axiosClient.post(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.RETURN(tripId), payload),
};

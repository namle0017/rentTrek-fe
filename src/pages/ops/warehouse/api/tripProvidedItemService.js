import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import {
  getPersistentTrip,
  assignPersistentTripAssets,
  unassignPersistentTripAsset,
  issuePersistentTripGear,
  returnPersistentTripGear,
  MOCK_TRIPS,
} from '../constants/mockFulfillmentData';

const MOCK_TRIP_IDS = new Set(MOCK_TRIPS.map((t) => t.tripId));
const isMockTrip = (tripId) => !tripId || MOCK_TRIP_IDS.has(tripId) || tripId.startsWith('mock-');

export const tripProvidedItemService = {
  getByTrip: async (tripId) => {
    if (isMockTrip(tripId)) {
      return getPersistentTrip(tripId);
    }
    try {
      const res = await axiosClient.get(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.BY_TRIP(tripId));
      if (res?.data && res.data.items?.length > 0) return res;
      return getPersistentTrip(tripId);
    } catch {
      return getPersistentTrip(tripId);
    }
  },

  getAvailableAssets: async (tripId, itemId) => {
    if (isMockTrip(tripId)) {
      return { data: [] };
    }
    try {
      return await axiosClient.get(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.AVAILABLE_ASSETS(tripId, itemId));
    } catch {
      return { data: [] };
    }
  },

  assignAssets: async (tripId, itemId, payload) => {
    if (isMockTrip(tripId)) {
      return assignPersistentTripAssets(tripId, itemId, payload.assetCodes || []);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.ASSIGN(tripId, itemId), payload);
    } catch {
      return assignPersistentTripAssets(tripId, itemId, payload.assetCodes || []);
    }
  },

  unassignAsset: async (tripId, assignmentId) => {
    if (isMockTrip(tripId)) {
      return unassignPersistentTripAsset(tripId, assignmentId);
    }
    try {
      return await axiosClient.delete(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.UNASSIGN(tripId, assignmentId));
    } catch {
      return unassignPersistentTripAsset(tripId, assignmentId);
    }
  },

  issueGear: async (tripId, payload) => {
    if (isMockTrip(tripId)) {
      return issuePersistentTripGear(tripId);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.ISSUE(tripId), payload);
    } catch {
      return issuePersistentTripGear(tripId);
    }
  },

  returnGear: async (tripId, payload) => {
    if (isMockTrip(tripId)) {
      return returnPersistentTripGear(tripId);
    }
    try {
      return await axiosClient.post(API_ENDPOINTS.TRIP_PROVIDED_ITEMS.RETURN(tripId), payload);
    } catch {
      return returnPersistentTripGear(tripId);
    }
  },
};

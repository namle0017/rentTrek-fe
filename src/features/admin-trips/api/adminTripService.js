import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { API_BASE_URL } from '@/constants/config';
import { cleanParams } from '@/utils/cleanParams';
import { tokenStorage } from '@/utils/tokenStorage';

export const adminTripService = {
  // 7. Recurrence Rules (Màn O08)
  getRecurrenceRules: (tourId) => axiosClient.get(API_ENDPOINTS.ADMIN_RECURRENCE.BY_TOUR(tourId)),
  createRecurrenceRule: (tourId, payload) =>
    axiosClient.post(API_ENDPOINTS.ADMIN_RECURRENCE.BY_TOUR(tourId), payload),
  updateRecurrenceRule: (ruleId, payload) =>
    axiosClient.put(API_ENDPOINTS.ADMIN_RECURRENCE.BY_ID(ruleId), payload),
  deleteRecurrenceRule: (ruleId) =>
    axiosClient.delete(API_ENDPOINTS.ADMIN_RECURRENCE.BY_ID(ruleId)),
  previewRecurrenceTrips: (ruleId, payload = {}) =>
    axiosClient.post(API_ENDPOINTS.ADMIN_RECURRENCE.PREVIEW(ruleId), payload),
  generateRecurrenceTrips: (ruleId, payload = {}) =>
    axiosClient.post(API_ENDPOINTS.ADMIN_RECURRENCE.GENERATE(ruleId), payload),

  // 8. Trip Operations & Readiness (Màn O09, O10, O11)
  getTrips: (params) =>
    axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.ROOT, { params: cleanParams(params) }),
  createTrip: (payload) => axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.ROOT, payload),
  getTripById: (tripId) => axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.BY_ID(tripId)),
  updateTrip: (tripId, payload) =>
    axiosClient.put(API_ENDPOINTS.ADMIN_TRIPS.BY_ID(tripId), payload),
  getReadinessChecklist: (tripId) =>
    axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.READINESS_CHECKLIST(tripId)),
  openBooking: (tripId) => axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.OPEN_BOOKING(tripId)),
  closeBooking: (tripId) => axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.CLOSE_BOOKING(tripId)),
  startTrip: (tripId) => axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.START(tripId)),
  completeTrip: (tripId) => axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.COMPLETE(tripId)),
  cancelTrip: (tripId, payload) =>
    axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.CANCEL(tripId), payload),
  getTripBookings: (tripId) => axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.BOOKINGS(tripId)),
  getManifest: (tripId) => axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.MANIFEST(tripId)),
  downloadManifestCsv: async (tripId) => {
    const token = tokenStorage.getAccessToken();
    const res = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN_TRIPS.MANIFEST(tripId)}?format=csv`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (!res.ok) throw new Error('Không thể tải file CSV Manifest');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manifest-${tripId}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  // 9. Kanban Group Assignment (Màn O12)
  getGroupsBoard: (tripId) => axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.GROUPS_BOARD(tripId)),
  createGroup: (tripId, payload) =>
    axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.GROUPS(tripId), payload),
  updateGroup: (tripId, groupId, payload) =>
    axiosClient.put(API_ENDPOINTS.ADMIN_TRIPS.GROUP_BY_ID(tripId, groupId), payload),
  deleteGroup: (tripId, groupId) =>
    axiosClient.delete(API_ENDPOINTS.ADMIN_TRIPS.GROUP_BY_ID(tripId, groupId)),
  assignParticipantGroup: (tripId, payload) =>
    axiosClient.patch(API_ENDPOINTS.ADMIN_TRIPS.ASSIGN_PARTICIPANT_GROUP(tripId), payload),
  autoGroup: (tripId) => axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.AUTO_GROUP(tripId)),
  approveBookingSplit: (tripId, bookingId, payload) =>
    axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.SPLIT_APPROVE(tripId, bookingId), payload),

  // 11. Activity Attendance Matrix (Màn O14)
  getAttendanceMatrix: (tripId, groupId) =>
    axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.ATTENDANCE_MATRIX(tripId), {
      params: cleanParams({ groupId }),
    }),
  updateAttendances: (tripId, payload) =>
    axiosClient.put(API_ENDPOINTS.ADMIN_TRIPS.ATTENDANCES(tripId), payload),
  getAttendanceHistory: (tripId) =>
    axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.ATTENDANCES_HISTORY(tripId)),
};

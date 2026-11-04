import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { API_BASE_URL } from '@/constants/config';
import { cleanParams } from '@/utils/cleanParams';
import { tokenStorage } from '@/utils/tokenStorage';
import { MOCK_PUBLISHED_TOURS, MOCK_ACTIVE_REFUND_POLICIES, MOCK_COORDINATORS } from './mockTripCreateData';
import {
  getMockTripDetail,
  getMockReadinessChecklist,
  getMockTripBookings,
  getMockGroupsBoard,
  getMockAttendanceMatrix,
  getMockAttendanceHistory,
} from './mockTripDetailData';

export const adminTripService = {
  // 7. Recurrence Rules (Màn O08)
  getRecurrenceRules: (tourId) => axiosClient.get(API_ENDPOINTS.ADMIN_RECURRENCE.BY_TOUR(tourId)),
  createRecurrenceRule: (tourId, payload) =>
    axiosClient.post(API_ENDPOINTS.ADMIN_RECURRENCE.BY_TOUR(tourId), payload),
  updateRecurrenceRule: (ruleId, payload) =>
    axiosClient.put(API_ENDPOINTS.ADMIN_RECURRENCE.BY_ID(ruleId), payload),
  deleteRecurrenceRule: (ruleId) => axiosClient.delete(API_ENDPOINTS.ADMIN_RECURRENCE.BY_ID(ruleId)),
  previewRecurrenceTrips: (ruleId, payload = {}) =>
    axiosClient.post(API_ENDPOINTS.ADMIN_RECURRENCE.PREVIEW(ruleId), payload),
  generateRecurrenceTrips: (ruleId, payload = {}) =>
    axiosClient.post(API_ENDPOINTS.ADMIN_RECURRENCE.GENERATE(ruleId), payload),

  // 8. Trip Operations & Readiness (Màn O09, O10, O11)
  getTrips: (params) => axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.ROOT, { params: cleanParams(params) }),
  createTrip: (payload) => axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.ROOT, payload),

  getTripById: async (tripId) => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.BY_ID(tripId));
      return res.data ? res : { data: getMockTripDetail(tripId) };
    } catch {
      return { data: getMockTripDetail(tripId) };
    }
  },

  updateTrip: async (tripId, payload) => {
    try {
      return await axiosClient.put(API_ENDPOINTS.ADMIN_TRIPS.BY_ID(tripId), payload);
    } catch {
      return { data: { ...getMockTripDetail(tripId), ...payload } };
    }
  },

  getReadinessChecklist: async (tripId) => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.READINESS_CHECKLIST(tripId));
      return res.data ? res : { data: getMockReadinessChecklist(tripId) };
    } catch {
      return { data: getMockReadinessChecklist(tripId) };
    }
  },

  openBooking: async (tripId) => {
    try {
      return await axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.OPEN_BOOKING(tripId));
    } catch {
      return { data: { success: true, message: 'Đã mở nhận khách (Mock)' } };
    }
  },

  closeBooking: async (tripId) => {
    try {
      return await axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.CLOSE_BOOKING(tripId));
    } catch {
      return { data: { success: true, message: 'Đã chốt danh sách nhận khách (Mock)' } };
    }
  },

  startTrip: async (tripId) => {
    try {
      return await axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.START(tripId));
    } catch {
      return { data: { success: true, message: 'Đoàn đã bắt đầu xuất phát (Mock)' } };
    }
  },

  completeTrip: async (tripId) => {
    try {
      return await axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.COMPLETE(tripId));
    } catch {
      return { data: { success: true, message: 'Đã hoàn tất chuyến đi (Mock)' } };
    }
  },

  cancelTrip: async (tripId, payload) => {
    try {
      return await axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.CANCEL(tripId), payload);
    } catch {
      return {
        data: {
          affectedBookingsCount: 3,
          affectedParticipantsCount: 9,
          totalRefundAmount: 34650000,
          releasedAssetsCount: 12,
        },
      };
    }
  },

  getTripBookings: async (tripId) => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.BOOKINGS(tripId));
      return res.data ? res : { data: getMockTripBookings(tripId) };
    } catch {
      return { data: getMockTripBookings(tripId) };
    }
  },

  getManifest: async (tripId) => {
    try {
      return await axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.MANIFEST(tripId));
    } catch {
      return { data: getMockTripBookings(tripId) };
    }
  },

  downloadManifestCsv: async (tripId) => {
    try {
      const token = tokenStorage.getAccessToken();
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_TRIPS.MANIFEST(tripId)}?format=csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
    } catch {
      // Mock CSV download fallback khi Backend offline
      const csvContent =
        'data:text/csv;charset=utf-8,Mã Đơn,Họ Tên Khách,Số Điện Thoại,Giới Tính,Trạng Thái Thanh Toán\n' +
        'RT-BK-001,Nguyễn Văn An,0912345678,Nam,Đã thanh toán\n' +
        'RT-BK-001,Trần Thị Mai,0912345679,Nữ,Đã thanh toán\n' +
        'RT-BK-002,Vũ Đức Thịnh,0988776655,Nam,Đã thanh toán\n';
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `manifest-${tripId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  },

  // 9. Kanban Group Assignment (Màn O12)
  getGroupsBoard: async (tripId) => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.GROUPS_BOARD(tripId));
      return res.data ? res : { data: getMockGroupsBoard(tripId) };
    } catch {
      return { data: getMockGroupsBoard(tripId) };
    }
  },

  createGroup: async (tripId, payload) => {
    try {
      return await axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.GROUPS(tripId), payload);
    } catch {
      return { data: { success: true } };
    }
  },

  updateGroup: async (tripId, groupId, payload) => {
    try {
      return await axiosClient.put(API_ENDPOINTS.ADMIN_TRIPS.GROUP_BY_ID(tripId, groupId), payload);
    } catch {
      return { data: { success: true } };
    }
  },

  deleteGroup: async (tripId, groupId) => {
    try {
      return await axiosClient.delete(API_ENDPOINTS.ADMIN_TRIPS.GROUP_BY_ID(tripId, groupId));
    } catch {
      return { data: { success: true } };
    }
  },

  assignParticipantGroup: async (tripId, payload) => {
    try {
      return await axiosClient.patch(API_ENDPOINTS.ADMIN_TRIPS.ASSIGN_PARTICIPANT_GROUP(tripId), payload);
    } catch {
      return { data: { success: true } };
    }
  },

  autoGroup: async (tripId) => {
    try {
      return await axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.AUTO_GROUP(tripId));
    } catch {
      return { data: { assignedCount: 4, remainingUnassignedCount: 0 } };
    }
  },

  approveBookingSplit: async (tripId, bookingId, payload) => {
    try {
      return await axiosClient.post(API_ENDPOINTS.ADMIN_TRIPS.SPLIT_APPROVE(tripId, bookingId), payload);
    } catch {
      return { data: { success: true } };
    }
  },

  // 11. Activity Attendance Matrix (Màn O14)
  getAttendanceMatrix: async (tripId, groupId) => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.ATTENDANCE_MATRIX(tripId), {
        params: cleanParams({ groupId }),
      });
      return res.data ? res : { data: getMockAttendanceMatrix(tripId, groupId) };
    } catch {
      return { data: getMockAttendanceMatrix(tripId, groupId) };
    }
  },

  updateAttendances: async (tripId, payload) => {
    try {
      return await axiosClient.put(API_ENDPOINTS.ADMIN_TRIPS.ATTENDANCES(tripId), payload);
    } catch {
      return { data: { success: true } };
    }
  },

  getAttendanceHistory: async (tripId) => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.ADMIN_TRIPS.ATTENDANCES_HISTORY(tripId));
      return res.data ? res : { data: getMockAttendanceHistory(tripId) };
    } catch {
      return { data: getMockAttendanceHistory(tripId) };
    }
  },

  // 12. Helper API / Mock Fallback phục vụ Tạo Chuyến Đi Thủ Công
  getPublishedTours: async () => {
    try {
      const res = await axiosClient.get(`${API_ENDPOINTS.ADMIN_TRIPS.ROOT}/published-tours`);
      return res.data?.length ? res.data : MOCK_PUBLISHED_TOURS;
    } catch {
      return MOCK_PUBLISHED_TOURS;
    }
  },

  getActiveRefundPolicies: async () => {
    try {
      const res = await axiosClient.get(
        API_ENDPOINTS.ADMIN_REFUND_POLICIES?.ROOT || '/api/v1/admin/refund-policies',
      );
      return res.data?.length ? res.data : MOCK_ACTIVE_REFUND_POLICIES;
    } catch {
      return MOCK_ACTIVE_REFUND_POLICIES;
    }
  },

  getCoordinators: async () => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.USERS?.ROOT || '/api/v1/users', {
        params: { role: 'Staff,TourGuide,Admin' },
      });
      return res.data?.length ? res.data : MOCK_COORDINATORS;
    } catch {
      return MOCK_COORDINATORS;
    }
  },
};

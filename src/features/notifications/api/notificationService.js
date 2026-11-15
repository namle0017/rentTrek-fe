import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const notificationKeys = {
  all: ['notifications'],
  list: (params) => [...notificationKeys.all, 'list', params],
  unreadCount: () => [...notificationKeys.all, 'unread-count'],
};

// BE: NotificationsController — query dùng `page` + `pageSize` (không phải pageNumber)
export const notificationService = {
  getList: (params) => axiosClient.get(API_ENDPOINTS.USERS.NOTIFICATIONS, { params: cleanParams(params) }),
  getUnreadCount: () => axiosClient.get(API_ENDPOINTS.USERS.NOTIFICATIONS_UNREAD_COUNT),
  markRead: (id) => axiosClient.post(API_ENDPOINTS.USERS.NOTIFICATION_READ(id)),
  markAllRead: () => axiosClient.post(API_ENDPOINTS.USERS.NOTIFICATIONS_READ_ALL),
};

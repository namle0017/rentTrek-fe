import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { notificationKeys, notificationService } from '../api/notificationService';

export function useNotifications(params) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.getList(params),
    select: (res) => res.data, // PagedResponse<NotificationItemResponse>
    placeholderData: keepPreviousData,
  });
}

export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    select: (res) => res.data?.unreadCount ?? 0,
    enabled,
    refetchInterval: 60_000,
  });
}

function useNotificationMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
    onError: (error) => toast.error(error.message || 'Không cập nhật được thông báo.'),
  });
}

export const useMarkNotificationRead = () => useNotificationMutation(notificationService.markRead);
export const useMarkAllNotificationsRead = () => useNotificationMutation(notificationService.markAllRead);

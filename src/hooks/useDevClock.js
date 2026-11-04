import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from './useAuth';

const devClockKey = ['dev-clock'];

/**
 * Đồng hồ giả lập của BE (chỉ có ở Development). Ngoài Development API trả 404 → `isSuccess` = false.
 */
export function useDevClock() {
  return useQuery({
    queryKey: devClockKey,
    queryFn: () => axiosClient.get(API_ENDPOINTS.DEV_CLOCK),
    select: (res) => res.data,
    retry: false,
    staleTime: 60 * 1000,
  });
}

/** `mutate(isoString)` để tua tới thời điểm đó, `mutate(null)` để về giờ thật. */
export function useSetDevClock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (now) =>
      now ? axiosClient.put(API_ENDPOINTS.DEV_CLOCK, { now }) : axiosClient.delete(API_ENDPOINTS.DEV_CLOCK),
    onSuccess: (res) => {
      toast.success(res.message);
      // Hầu hết dữ liệu (trạng thái được phép, quá hạn, giữ chỗ...) phụ thuộc giờ server → tải lại tất cả
      queryClient.invalidateQueries();
    },
  });
}

/** Gộp sẵn cho trang vận hành: chỉ Admin/Staff ở môi trường Development mới điều khiển được. */
export function useDevClockControls() {
  const { currentUser } = useAuth();
  const { data: clock, isSuccess } = useDevClock();
  const setClock = useSetDevClock();
  const canControl = isSuccess && [USER_ROLE.ADMIN, USER_ROLE.STAFF].includes(currentUser?.role);

  return {
    clock,
    isAvailable: isSuccess,
    canControl,
    isPending: setClock.isPending,
    jumpTo: (isoString) => setClock.mutate(isoString),
    reset: () => setClock.mutate(null),
  };
}

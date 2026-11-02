import { useQuery } from '@tanstack/react-query';
import { tokenStorage } from '@/utils/tokenStorage';
import { userKeys } from '../api/userKeys';
import { userService } from '../api/userService';

export function useProfile() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      try {
        const res = await userService.getMe();
        return res?.data;
      } catch (err) {
        // Nếu API /users/me chưa hoàn thiện ở BE (TODO trong contract),
        // fallback về thông tin user đã lưu trong session đăng nhập
        console.warn('GET /users/me failed, falling back to local user profile', err);
        const fallback = tokenStorage.getUser();
        if (fallback) return fallback;
        throw err;
      }
    },
    initialData: () => tokenStorage.getUser() || undefined,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

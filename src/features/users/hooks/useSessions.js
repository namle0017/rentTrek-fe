import { useQuery } from '@tanstack/react-query';
import { userKeys } from '../api/userKeys';
import { userService } from '../api/userService';

export function useSessions() {
  return useQuery({
    queryKey: userKeys.sessions(),
    queryFn: async () => {
      const response = await userService.getSessions();
      return response.data || [];
    },
    staleTime: 30 * 1000,
  });
}

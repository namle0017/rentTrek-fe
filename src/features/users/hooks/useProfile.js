import { useQuery } from '@tanstack/react-query';
import { userKeys } from '../api/userKeys';
import { userService } from '../api/userService';

export function useProfile() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: userService.getMe,
    select: (res) => res.data,
  });
}

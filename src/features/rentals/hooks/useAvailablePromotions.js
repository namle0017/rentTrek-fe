import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { promotionService } from '../api/promotionService';

// BE yêu cầu đăng nhập; khách vãng lai không gọi để tránh 401
export function useAvailablePromotions() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['rentals', 'promotions', 'available'],
    enabled: !!isAuthenticated,
    queryFn: async () => (await promotionService.getAvailable()).data,
    staleTime: 5 * 60 * 1000,
  });
}

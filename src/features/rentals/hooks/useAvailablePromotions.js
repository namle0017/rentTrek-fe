import { useQuery } from '@tanstack/react-query';
import { promotionService } from '../api/promotionService';

export function useAvailablePromotions() {
  return useQuery({
    queryKey: ['rentals', 'promotions', 'available'],
    queryFn: async () => (await promotionService.getAvailable()).data,
    staleTime: 5 * 60 * 1000,
  });
}

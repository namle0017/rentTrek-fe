import { useQuery } from '@tanstack/react-query';
import { rentalService } from '../api/rentalService';

export function useRentalQuoteQuery(payload, enabled) {
  return useQuery({
    queryKey: ['rentals', 'quote', payload],
    queryFn: async () => (await rentalService.quote(payload)).data,
    enabled: Boolean(enabled && payload),
    staleTime: 0,
    retry: false,
  });
}
export function useRentalAvailabilityQuery(payload, enabled = true) {
  return useQuery({
    queryKey: ['rentals', 'availability', payload],
    queryFn: async () => (await rentalService.checkAvailability(payload)).data,
    enabled: Boolean(enabled && payload),
    staleTime: 15000,
    retry: false,
  });
}

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { tourKeys } from '../api/tourKeys';
import { tourService } from '../api/tourService';

export function useTours(params) {
  return useQuery({
    queryKey: tourKeys.list(params),
    queryFn: () => tourService.getAll(params),
    select: (res) => res.data, // PagedResult<TourResponse>
    placeholderData: keepPreviousData,
  });
}

export function useTour(id) {
  return useQuery({
    queryKey: tourKeys.detail(id),
    queryFn: () => tourService.getById(id),
    select: (res) => res.data, // TourDetailResponse
    enabled: Boolean(id),
  });
}

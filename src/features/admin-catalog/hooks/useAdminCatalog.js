import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminCatalogKeys } from '../api/adminCatalogKeys';
import { adminCatalogService } from '../api/adminCatalogService';

export function useAdminTours(params) {
  return useQuery({
    queryKey: adminCatalogKeys.tours(params),
    queryFn: () => adminCatalogService.getTours(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  });
}

export function useAdminTour(tourId) {
  return useQuery({
    queryKey: adminCatalogKeys.tourDetail(tourId),
    queryFn: () => adminCatalogService.getTourById(tourId),
    select: (response) => response.data,
    enabled: Boolean(tourId),
  });
}

export function useAdminProducts(params) {
  return useQuery({
    queryKey: adminCatalogKeys.products(params),
    queryFn: () => adminCatalogService.getProducts(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  });
}

export function useAdminProduct(productId) {
  return useQuery({
    queryKey: adminCatalogKeys.productDetail(productId),
    queryFn: () => adminCatalogService.getProductById(productId),
    select: (response) => response.data,
    enabled: Boolean(productId),
  });
}


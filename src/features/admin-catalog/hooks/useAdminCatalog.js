import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
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

export function useAdminBundles(params) {
  return useQuery({
    queryKey: adminCatalogKeys.bundles(params),
    queryFn: () => adminCatalogService.getBundles(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  });
}

export function useAdminBundle(bundleId) {
  return useQuery({
    queryKey: adminCatalogKeys.bundleDetail(bundleId),
    queryFn: () => adminCatalogService.getBundleById(bundleId),
    select: (response) => response.data,
    enabled: Boolean(bundleId),
  });
}

// Mọi thao tác ghi catalog: toast thông điệp (BE hoặc truyền vào) rồi làm mới toàn bộ cache danh mục.
// Form ở đây không gắn lỗi theo field → bật toast lỗi validation.
export function useCatalogMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { toastFieldErrors: true },
    onSuccess: (res) => {
      toast.success(successMessage ?? res.message);
      queryClient.invalidateQueries({ queryKey: adminCatalogKeys.all });
    },
  });
}

export const useCreateBundle = () => useCatalogMutation(adminCatalogService.createBundle, 'Đã tạo combo');
export const useUpdateBundle = () =>
  useCatalogMutation(adminCatalogService.updateBundle, 'Đã lưu thông tin combo');
export const useDeleteBundle = () => useCatalogMutation(adminCatalogService.deleteBundle, 'Đã xóa combo');
export const useSetBundleItems = () =>
  useCatalogMutation(adminCatalogService.setBundleItems, 'Đã lưu thành phần combo');
export const useSetBundlePriceTiers = () =>
  useCatalogMutation(adminCatalogService.setBundlePriceTiers, 'Đã lưu bảng giá combo');

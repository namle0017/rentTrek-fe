import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { assetKeys } from '../api/assetKeys';
import { assetService } from '../api/assetService';

export function useAssets(params) {
  return useQuery({
    queryKey: assetKeys.list(params),
    queryFn: () => assetService.getAll(params),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  });
}

export function useAsset(code) {
  return useQuery({
    queryKey: assetKeys.detail(code),
    queryFn: () => assetService.getByCode(code),
    select: (res) => res.data,
    enabled: Boolean(code),
  });
}

export function useAssetHistory(code) {
  return useQuery({
    queryKey: assetKeys.history(code),
    queryFn: () => assetService.getHistory(code),
    select: (res) => res.data,
    enabled: Boolean(code),
  });
}

export function useAssetGantt(params) {
  return useQuery({
    queryKey: assetKeys.gantt(params),
    queryFn: () => assetService.getGantt(params),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  });
}

export function useBulkCreateAssets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => assetService.bulkCreate(payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Tạo thiết bị hàng loạt thành công');
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo thiết bị';
      toast.error(msg);
    },
  });
}

export function useUpdateAssetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, payload }) => assetService.updateStatus(code, payload),
    onSuccess: (res, { code }) => {
      toast.success(res?.message || 'Cập nhật trạng thái thiết bị thành công');
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(code) });
      queryClient.invalidateQueries({ queryKey: assetKeys.history(code) });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Không thể cập nhật trạng thái';
      toast.error(msg);
    },
  });
}

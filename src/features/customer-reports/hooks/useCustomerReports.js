import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { customerReportKeys, customerReportService } from '../api/customerReportService';

/** Báo cáo của khách đang đăng nhập; truyền orderId để chỉ lấy báo cáo của một đơn. */
export function useMyCustomerReports(orderId, { enabled = true } = {}) {
  return useQuery({
    queryKey: customerReportKeys.mine(orderId),
    queryFn: () => customerReportService.getMine(orderId),
    select: (res) => res.data ?? [],
    enabled,
  });
}

/** Tải ảnh (nếu có) rồi gửi báo cáo. files: File[] chưa tải. */
export function useCreateCustomerReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ files = [], photoUrls = [], ...payload }) => {
      const uploaded = [];
      for (const file of files) {
        const res = await customerReportService.uploadImage(file);
        uploaded.push(res.data.url);
      }
      return customerReportService.create({ ...payload, photoUrls: [...photoUrls, ...uploaded] });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: customerReportKeys.all });
      toast.success(res?.message || 'Đã gửi báo cáo tới RenTrek.');
    },
    onError: (err) => {
      toast.error(err?.message || 'Không thể gửi báo cáo.');
    },
  });
}

export function useAdminCustomerReports(params) {
  return useQuery({
    queryKey: customerReportKeys.adminList(params),
    queryFn: () => customerReportService.adminGetAll(params),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  });
}

export function useAdminCustomerReport(id) {
  return useQuery({
    queryKey: customerReportKeys.adminDetail(id),
    queryFn: () => customerReportService.adminGetById(id),
    select: (res) => res.data,
    enabled: Boolean(id),
  });
}

export function useCustomerReportSummary() {
  return useQuery({
    queryKey: customerReportKeys.summary,
    queryFn: customerReportService.adminGetSummary,
    select: (res) => res.data,
  });
}

export function useUpdateCustomerReportStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerReportService.adminUpdateStatus,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: customerReportKeys.all });
      toast.success(res?.message || 'Đã cập nhật báo cáo.');
    },
  });
}

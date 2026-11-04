import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { postKeys } from '../api/postKeys';
import { postService } from '../api/postService';

export function usePosts(params) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => postService.getAll(params),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  });
}

export function usePost(slug) {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () => postService.getBySlug(slug),
    select: (res) => res.data,
    enabled: Boolean(slug),
  });
}

export function usePostTaxonomy() {
  return useQuery({
    queryKey: postKeys.taxonomy(),
    queryFn: postService.getTaxonomy,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminPosts(params) {
  return useQuery({
    queryKey: postKeys.adminList(params),
    queryFn: () => postService.getAdminAll(params),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  });
}

export function useAdminPost(postId) {
  return useQuery({
    queryKey: postKeys.adminDetail(postId),
    queryFn: () => postService.getAdminById(postId),
    select: (res) => res.data,
    enabled: Boolean(postId),
  });
}

export function usePostTourOptions() {
  return useQuery({
    queryKey: postKeys.tourOptions(),
    queryFn: postService.getTourOptions,
    select: (res) => res.data.items,
    staleTime: 5 * 60 * 1000,
  });
}

// Bài, tag mới tạo nhanh và danh sách công khai đều có thể đổi sau khi lưu → làm mới toàn bộ cache bài viết
function useInvalidatePosts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: postKeys.all });
}

export function useSavePost() {
  const invalidatePosts = useInvalidatePosts();
  return useMutation({
    mutationFn: ({ postId, payload }) => (postId ? postService.update(postId, payload) : postService.create(payload)),
    onSuccess: (res) => {
      toast.success(res.message);
      invalidatePosts();
    },
  });
}

export function useDeletePost() {
  const invalidatePosts = useInvalidatePosts();
  return useMutation({
    mutationFn: postService.remove,
    onSuccess: (res) => {
      toast.success(res.message);
      invalidatePosts();
    },
  });
}

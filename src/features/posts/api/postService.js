import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const postService = {
  // Công khai
  getAll: (params) => axiosClient.get(API_ENDPOINTS.POSTS.ROOT, { params: cleanParams(params) }),
  getBySlug: (slug) => axiosClient.get(API_ENDPOINTS.POSTS.BY_SLUG(slug)),
  getTaxonomy: () => axiosClient.get(API_ENDPOINTS.POSTS.TAXONOMY),

  // Vận hành
  getAdminAll: (params) => axiosClient.get(API_ENDPOINTS.ADMIN_POSTS.ROOT, { params: cleanParams(params) }),
  getAdminById: (postId) => axiosClient.get(API_ENDPOINTS.ADMIN_POSTS.BY_ID(postId)),
  create: (payload) => axiosClient.post(API_ENDPOINTS.ADMIN_POSTS.ROOT, payload),
  update: (postId, payload) => axiosClient.put(API_ENDPOINTS.ADMIN_POSTS.BY_ID(postId), payload),
  remove: (postId) => axiosClient.delete(API_ENDPOINTS.ADMIN_POSTS.BY_ID(postId)),
  publish: (postId) => axiosClient.post(API_ENDPOINTS.ADMIN_POSTS.PUBLISH(postId)),
  getReadAnalytics: (postId) => axiosClient.get(API_ENDPOINTS.ADMIN_POSTS.READ_ANALYTICS(postId)),
  archive: (postId) => axiosClient.post(API_ENDPOINTS.ADMIN_POSTS.ARCHIVE(postId)),
  /** Upload ảnh minh hoạ cho bài (multipart `file`), trả về { url } để chèn vào nội dung. */
  uploadImage: (file) => {
    const form = new FormData();
    form.append('file', file);
    return axiosClient.post(API_ENDPOINTS.ADMIN_POSTS.IMAGES, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },

  // Danh sách tour để gắn bài (API vận hành, Admin/Staff)
  getTourOptions: () => axiosClient.get(API_ENDPOINTS.ADMIN_CATALOG.TOURS, { params: { pageSize: 100 } }),
};

import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

export const adminCatalogService = {
  getTours: (params) => axiosClient.get(API_ENDPOINTS.ADMIN_CATALOG.TOURS, { params: cleanParams(params) }),
  // Chi tiết tour dùng API công khai: không lọc trạng thái nên xem được cả tour nháp / lưu trữ
  getTourById: (tourId) => axiosClient.get(API_ENDPOINTS.TOURS.BY_ID(tourId)),
  getProducts: (params) => axiosClient.get(API_ENDPOINTS.ADMIN_CATALOG.PRODUCTS, { params: cleanParams(params) }),
  getProductById: (productId) => axiosClient.get(API_ENDPOINTS.ADMIN_CATALOG.PRODUCT_BY_ID(productId)),
};

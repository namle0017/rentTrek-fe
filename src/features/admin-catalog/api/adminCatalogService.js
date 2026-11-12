import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { cleanParams } from '@/utils/cleanParams';

const { ADMIN_CATALOG } = API_ENDPOINTS;

export const adminCatalogService = {
  getTours: (params) => axiosClient.get(ADMIN_CATALOG.TOURS, { params: cleanParams(params) }),
  // Chi tiết tour dùng API công khai: không lọc trạng thái nên xem được cả tour nháp / lưu trữ
  getTourById: (tourId) => axiosClient.get(API_ENDPOINTS.TOURS.BY_ID(tourId)),

  // Soạn tour — AdminToursController. Ghi chỉ Admin.
  getTourForEdit: (tourId) => axiosClient.get(ADMIN_CATALOG.TOUR_BY_ID(tourId)),
  // body SaveTourRequest { name, categoryId, mainLocationId, description?, durationDays, durationNights, durationMinutes, basePrice } → data = tourId
  createTour: (payload) => axiosClient.post(ADMIN_CATALOG.TOURS, payload),
  updateTour: ({ tourId, ...payload }) => axiosClient.put(ADMIN_CATALOG.TOUR_BY_ID(tourId), payload),
  deleteTour: (tourId) => axiosClient.delete(ADMIN_CATALOG.TOUR_BY_ID(tourId)),
  publishTour: (tourId) => axiosClient.post(ADMIN_CATALOG.TOUR_PUBLISH(tourId)),
  archiveTour: (tourId) => axiosClient.post(ADMIN_CATALOG.TOUR_ARCHIVE(tourId)),

  getTourImages: (tourId) => axiosClient.get(ADMIN_CATALOG.TOUR_IMAGES(tourId)),
  // FormData có field `file` → data = { imageUrl }
  uploadImage: (formData) => axiosClient.post(ADMIN_CATALOG.IMAGE_UPLOAD, formData),
  addTourImage: ({ tourId, ...payload }) => axiosClient.post(ADMIN_CATALOG.TOUR_IMAGES(tourId), payload),
  reorderTourImages: ({ tourId, imageIdsInOrder, primaryImageId }) =>
    axiosClient.put(ADMIN_CATALOG.TOUR_IMAGES_REORDER(tourId), { imageIdsInOrder, primaryImageId }),
  deleteTourImage: ({ tourId, imageId }) =>
    axiosClient.delete(ADMIN_CATALOG.TOUR_IMAGE_BY_ID(tourId, imageId)),

  getTourActivities: (tourId) => axiosClient.get(ADMIN_CATALOG.TOUR_ACTIVITIES(tourId)),
  // startTime dạng "HH:mm:ss"
  createTourActivity: ({ tourId, ...payload }) =>
    axiosClient.post(ADMIN_CATALOG.TOUR_ACTIVITIES(tourId), payload),
  updateTourActivity: ({ tourId, activityId, ...payload }) =>
    axiosClient.put(ADMIN_CATALOG.TOUR_ACTIVITY_BY_ID(tourId, activityId), payload),
  deleteTourActivity: ({ tourId, activityId }) =>
    axiosClient.delete(ADMIN_CATALOG.TOUR_ACTIVITY_BY_ID(tourId, activityId)),
  reorderTourActivities: ({ tourId, dayNumber, activityIdsInOrder }) =>
    axiosClient.put(ADMIN_CATALOG.TOUR_ACTIVITIES_REORDER(tourId), { dayNumber, activityIdsInOrder }),

  getTourPreparationItems: (tourId) => axiosClient.get(ADMIN_CATALOG.TOUR_PREPARATION_ITEMS(tourId)),
  // items: [{ itemName, note }] — thay toàn bộ
  setTourPreparationItems: ({ tourId, items }) =>
    axiosClient.put(ADMIN_CATALOG.TOUR_PREPARATION_ITEMS(tourId), { items }),

  getTourProvidedItems: (tourId) => axiosClient.get(ADMIN_CATALOG.TOUR_PROVIDED_ITEMS(tourId)),
  // body { productVariantId, quantity, quantityBasis: PerPerson|PerGroup|PerTrip, note? }
  createTourProvidedItem: ({ tourId, ...payload }) =>
    axiosClient.post(ADMIN_CATALOG.TOUR_PROVIDED_ITEMS(tourId), payload),
  updateTourProvidedItem: ({ tourId, itemId, ...payload }) =>
    axiosClient.put(ADMIN_CATALOG.TOUR_PROVIDED_ITEM_BY_ID(tourId, itemId), payload),
  deleteTourProvidedItem: ({ tourId, itemId }) =>
    axiosClient.delete(ADMIN_CATALOG.TOUR_PROVIDED_ITEM_BY_ID(tourId, itemId)),

  getTourPosts: (tourId) => axiosClient.get(ADMIN_CATALOG.TOUR_POSTS(tourId)),
  // items: [{ postId, displayOrder }] — thay toàn bộ
  setTourPosts: ({ tourId, items }) => axiosClient.put(ADMIN_CATALOG.TOUR_POSTS(tourId), { items }),
  getPostOptions: () =>
    axiosClient.get(API_ENDPOINTS.ADMIN.POSTS, { params: { pageNumber: 1, pageSize: 100 } }),

  getTourVersions: (tourId) => axiosClient.get(ADMIN_CATALOG.TOUR_VERSIONS(tourId)),
  cloneTourVersion: (tourId) => axiosClient.post(ADMIN_CATALOG.TOUR_VERSION_CLONE(tourId)),
  diffTourVersions: (tourId, compareWithVersionId) =>
    axiosClient.get(ADMIN_CATALOG.TOUR_VERSION_DIFF(tourId), { params: { compareWithVersionId } }),

  // Danh mục loại Tour + địa điểm cho form tour (trả mảng, không phân trang)
  getTourCategories: () =>
    axiosClient.get(API_ENDPOINTS.ADMIN.CATEGORIES, {
      params: { categoryType: 'Tour', pageNumber: 1, pageSize: 100 },
    }),
  getLocations: () =>
    axiosClient.get(API_ENDPOINTS.ADMIN.LOCATIONS, { params: { pageNumber: 1, pageSize: 100 } }),

  getProducts: (params) => axiosClient.get(ADMIN_CATALOG.PRODUCTS, { params: cleanParams(params) }),
  getProductById: (productId) => axiosClient.get(ADMIN_CATALOG.PRODUCT_BY_ID(productId)),

  // Combo (§13.14–13.21). Ghi chỉ Admin; Staff chỉ xem.
  getBundles: (params) => axiosClient.get(ADMIN_CATALOG.BUNDLES, { params: cleanParams(params) }),
  getBundleById: (bundleId) => axiosClient.get(ADMIN_CATALOG.BUNDLE_BY_ID(bundleId)),
  // body { name, categoryId, description?, status } → data = bundleId
  createBundle: (payload) => axiosClient.post(ADMIN_CATALOG.BUNDLES, payload),
  updateBundle: ({ bundleId, ...payload }) => axiosClient.put(ADMIN_CATALOG.BUNDLE_BY_ID(bundleId), payload),
  deleteBundle: (bundleId) => axiosClient.delete(ADMIN_CATALOG.BUNDLE_BY_ID(bundleId)),
  // items: [{ productVariantId, quantity }] — thay toàn bộ
  setBundleItems: ({ bundleId, items }) => axiosClient.put(ADMIN_CATALOG.BUNDLE_ITEMS(bundleId), { items }),
  // tiers: [{ minDays, maxDays, dailyPrice }] — thay toàn bộ
  setBundlePriceTiers: ({ bundleId, tiers }) =>
    axiosClient.put(ADMIN_CATALOG.BUNDLE_PRICE_TIERS(bundleId), { tiers }),
};

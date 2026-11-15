import { useMutation, useQuery } from '@tanstack/react-query';
import { adminCatalogKeys } from '../api/adminCatalogKeys';
import { adminCatalogService as service } from '../api/adminCatalogService';
import { useCatalogMutation } from './useAdminCatalog';

function useTourPart(tourId, part, queryFn) {
  return useQuery({
    queryKey: adminCatalogKeys.tourAuthoring(tourId, part),
    queryFn: () => queryFn(tourId),
    select: (res) => res.data,
    enabled: Boolean(tourId),
  });
}

export const useTourForEdit = (tourId) => useTourPart(tourId, 'info', service.getTourForEdit);
export const useTourImages = (tourId) => useTourPart(tourId, 'images', service.getTourImages);
export const useTourActivities = (tourId) => useTourPart(tourId, 'activities', service.getTourActivities);
export const useTourPreparationItems = (tourId) =>
  useTourPart(tourId, 'preparation-items', service.getTourPreparationItems);
export const useTourProvidedItems = (tourId) =>
  useTourPart(tourId, 'provided-items', service.getTourProvidedItems);
export const useTourPosts = (tourId) => useTourPart(tourId, 'posts', service.getTourPosts);
export const useTourVersions = (tourId) => useTourPart(tourId, 'versions', service.getTourVersions);

export function useTourVersionDiff(tourId, compareWithVersionId) {
  return useQuery({
    queryKey: [...adminCatalogKeys.tourAuthoring(tourId, 'diff'), compareWithVersionId],
    queryFn: () => service.diffTourVersions(tourId, compareWithVersionId),
    select: (res) => res.data,
    enabled: Boolean(tourId && compareWithVersionId),
  });
}

// Danh sách chọn cho form: ít thay đổi → cache 5 phút
const lookup = (key, queryFn, select = (res) => res.data) => ({
  queryKey: [...adminCatalogKeys.all, key],
  queryFn,
  select,
  staleTime: 5 * 60 * 1000,
});
export const useTourCategoryOptions = () => useQuery(lookup('tour-categories', service.getTourCategories));
export const useLocationOptions = () => useQuery(lookup('locations', service.getLocations));
export const usePostOptions = () =>
  useQuery(lookup('post-options', service.getPostOptions, (res) => res.data.items));

const useTourMutation = (mutationFn) => useCatalogMutation(mutationFn);

export const useCreateTour = () => useTourMutation(service.createTour);
export const useUpdateTour = () => useTourMutation(service.updateTour);
export const useDeleteTour = () => useTourMutation(service.deleteTour);
export const usePublishTour = () => useTourMutation(service.publishTour);
export const useArchiveTour = () => useTourMutation(service.archiveTour);
export const useUpdateTourGroupSettings = () => useTourMutation(service.updateTourGroupSettings);
export const useCloneTourVersion = () => useTourMutation(service.cloneTourVersion);

export const useAddTourImage = () => useTourMutation(service.addTourImage);
export const useReorderTourImages = () => useTourMutation(service.reorderTourImages);
export const useDeleteTourImage = () => useTourMutation(service.deleteTourImage);
// Upload chỉ trả URL, chưa gắn vào tour → không cần làm mới cache
export const useUploadImage = () => useMutation({ mutationFn: service.uploadImage });

export const useCreateTourActivity = () => useTourMutation(service.createTourActivity);
export const useUpdateTourActivity = () => useTourMutation(service.updateTourActivity);
export const useDeleteTourActivity = () => useTourMutation(service.deleteTourActivity);
export const useReorderTourActivities = () => useTourMutation(service.reorderTourActivities);

export const useSetTourPreparationItems = () => useTourMutation(service.setTourPreparationItems);
export const useCreateTourProvidedItem = () => useTourMutation(service.createTourProvidedItem);
export const useUpdateTourProvidedItem = () => useTourMutation(service.updateTourProvidedItem);
export const useDeleteTourProvidedItem = () => useTourMutation(service.deleteTourProvidedItem);
export const useSetTourPosts = () => useTourMutation(service.setTourPosts);

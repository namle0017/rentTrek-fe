export const tourKeys = {
  all: ['tours'],
  lists: () => [...tourKeys.all, 'list'],
  list: (params) => [...tourKeys.lists(), params],
  details: () => [...tourKeys.all, 'detail'],
  detail: (id) => [...tourKeys.details(), id],
  reviews: (id, params) => [...tourKeys.detail(id), 'reviews', params],
};

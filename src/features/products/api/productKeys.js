export const productKeys = {
  all: ['products'],
  categories: () => [...productKeys.all, 'categories'],
  lists: () => [...productKeys.all, 'list'],
  list: (params) => [...productKeys.lists(), params],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
};

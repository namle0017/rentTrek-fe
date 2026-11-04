export const rentalOpsKeys = {
  all: ['rental-ops'],
  lists: () => [...rentalOpsKeys.all, 'list'],
  list: (params) => [...rentalOpsKeys.lists(), params],
  detail: (orderId) => [...rentalOpsKeys.all, 'detail', orderId],
};

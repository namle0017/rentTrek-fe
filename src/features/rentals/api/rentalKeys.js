export const rentalKeys = {
  all: ['rentals'],
  bundleLists: () => [...rentalKeys.all, 'bundles', 'list'],
  bundleList: (params) => [...rentalKeys.bundleLists(), params],
  bundleDetail: (id) => [...rentalKeys.all, 'bundles', 'detail', id],
  orderDetail: (orderId) => [...rentalKeys.all, 'orders', orderId],
};

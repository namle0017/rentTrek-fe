export const policyKeys = {
  all: ['admin-policies'],
  refund: () => [...policyKeys.all, 'refund'],
  refundLists: () => [...policyKeys.refund(), 'list'],
  refundList: (params) => [...policyKeys.refundLists(), params],
  refundDetail: (id) => [...policyKeys.refund(), 'detail', id],
  rental: () => [...policyKeys.all, 'rental'],
  rentalList: () => [...policyKeys.rental(), 'list'],
  rentalDetail: (id) => [...policyKeys.rental(), 'detail', id],
  rentalActive: () => [...policyKeys.rental(), 'active'],
};

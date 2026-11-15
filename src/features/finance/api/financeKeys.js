export const financeKeys = {
  all: ['finance'],

  // Payments (Màn O27)
  payments: () => [...financeKeys.all, 'payments'],
  paymentLists: () => [...financeKeys.payments(), 'list'],
  paymentList: (params) => [...financeKeys.paymentLists(), params],
  paymentStats: (params) => [...financeKeys.payments(), 'stats', params],

  // Refunds & Reconcile (Màn O28)
  refunds: () => [...financeKeys.all, 'refunds'],
  refundQueues: () => [...financeKeys.refunds(), 'queue'],
  refundQueue: (tab, params) => [...financeKeys.refundQueues(), tab, params],
  refundDetail: (id) => [...financeKeys.refunds(), 'detail', id],
};

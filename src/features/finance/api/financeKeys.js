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

  // Refund Policies (Màn O34)
  policies: () => [...financeKeys.all, 'policies'],
  policyLists: () => [...financeKeys.policies(), 'list'],
  policyList: (params) => [...financeKeys.policyLists(), params],
  policyDetail: (id) => [...financeKeys.policies(), 'detail', id],
};


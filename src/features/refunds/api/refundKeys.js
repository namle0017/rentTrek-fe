export const refundKeys = {
  all: ['refund-cases'],
  detail: (refundCaseId) => [...refundKeys.all, 'detail', refundCaseId],
  queues: () => [...refundKeys.all, 'queue'],
  queue: (params) => [...refundKeys.queues(), params],
};

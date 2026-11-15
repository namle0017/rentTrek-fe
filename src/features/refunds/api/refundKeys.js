export const refundKeys = {
  all: ['refund-cases'],
  detail: (refundCaseId) => [...refundKeys.all, 'detail', refundCaseId],
  mine: () => [...refundKeys.all, 'mine'],
  mineList: (params) => [...refundKeys.mine(), params],
  queues: () => [...refundKeys.all, 'queue'],
  queue: (params) => [...refundKeys.queues(), params],
  manuals: () => [...refundKeys.all, 'manual'],
  manual: (params) => [...refundKeys.manuals(), params],
};

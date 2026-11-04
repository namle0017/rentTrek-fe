export const assetKeys = {
  all: ['admin', 'assets'],
  lists: () => [...assetKeys.all, 'list'],
  list: (params) => [...assetKeys.lists(), params],
  details: () => [...assetKeys.all, 'detail'],
  detail: (code) => [...assetKeys.details(), code],
  history: (code) => [...assetKeys.all, 'history', code],
  variants: () => [...assetKeys.all, 'variants'],
  gantt: (params) => [...assetKeys.all, 'gantt', params],
};

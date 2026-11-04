export const postKeys = {
  all: ['posts'],
  lists: () => [...postKeys.all, 'list'],
  list: (params) => [...postKeys.lists(), params],
  detail: (slug) => [...postKeys.all, 'detail', slug],
  taxonomy: () => [...postKeys.all, 'taxonomy'],
  adminLists: () => [...postKeys.all, 'admin-list'],
  adminList: (params) => [...postKeys.adminLists(), params],
  adminDetail: (postId) => [...postKeys.all, 'admin-detail', postId],
  tourOptions: () => [...postKeys.all, 'tour-options'],
};

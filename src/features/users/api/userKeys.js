export const userKeys = {
  all: ['users'],
  me: () => [...userKeys.all, 'me'],
  lists: () => [...userKeys.all, 'list'],
  list: (params) => [...userKeys.lists(), params],
};

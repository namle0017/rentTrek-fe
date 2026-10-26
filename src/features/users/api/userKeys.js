export const userKeys = {
  all: ['users'],
  me: () => [...userKeys.all, 'me'],
  sessions: () => [...userKeys.all, 'sessions'],
  lists: () => [...userKeys.all, 'list'],
  list: (params) => [...userKeys.lists(), params],
};

export const opsKeys = {
  all: ['operations'],
  resource: (endpoint, params) => ['operations', endpoint, params ?? {}],
};

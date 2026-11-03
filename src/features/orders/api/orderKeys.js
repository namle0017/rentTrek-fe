export const orderKeys = {
  all: ['orders'],
  myLists: () => [...orderKeys.all, 'me'],
  myList: (params) => [...orderKeys.myLists(), params],
  payment: (orderId, paymentId) => [...orderKeys.all, orderId, 'payments', paymentId],
};

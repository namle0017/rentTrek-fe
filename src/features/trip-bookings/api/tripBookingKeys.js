export const tripBookingKeys = {
  all: ['trip-bookings'],
  details: () => [...tripBookingKeys.all, 'detail'],
  detail: (orderId) => [...tripBookingKeys.details(), orderId],
};

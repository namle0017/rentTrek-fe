export const tripBookingKeys = {
  all: ['trip-bookings'],
  details: () => [...tripBookingKeys.all, 'detail'],
  detail: (orderId) => [...tripBookingKeys.details(), orderId],
  grouping: (orderId) => [...tripBookingKeys.all, 'grouping', orderId],
  inviteLink: (orderId) => [...tripBookingKeys.all, 'invite-link', orderId],
  invitationPreview: (orderId) => [...tripBookingKeys.all, 'invitation-preview', orderId],
};

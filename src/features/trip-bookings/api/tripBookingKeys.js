export const tripBookingKeys = {
  all: ['trip-bookings'],
  details: () => [...tripBookingKeys.all, 'detail'],
  detail: (orderId) => [...tripBookingKeys.details(), orderId],
  grouping: (orderId) => [...tripBookingKeys.all, 'grouping', orderId],
  cancellationPreview: (orderId, participantIds) => [
    ...tripBookingKeys.all,
    'cancellation-preview',
    orderId,
    ...(participantIds ? [participantIds] : []),
  ],
  inviteLink: (orderId) => [...tripBookingKeys.all, 'invite-link', orderId],
  tripRefundPolicy: (tripId) => [...tripBookingKeys.all, 'trip-refund-policy', tripId],
  tripSuggestedBundles: (tripId) => [...tripBookingKeys.all, 'trip-suggested-bundles', tripId],
  invitationPreview: (orderId) => [...tripBookingKeys.all, 'invitation-preview', orderId],
  rescheduleOptions: (orderId) => [...tripBookingKeys.all, 'reschedule-options', orderId],
};

export const adminTripKeys = {
  all: ['admin-trips'],
  lists: () => [...adminTripKeys.all, 'list'],
  list: (filters) => [...adminTripKeys.lists(), filters],
  details: () => [...adminTripKeys.all, 'detail'],
  detail: (tripId) => [...adminTripKeys.details(), tripId],
  readiness: (tripId) => [...adminTripKeys.detail(tripId), 'readiness'],
  bookings: (tripId) => [...adminTripKeys.detail(tripId), 'bookings'],
  manifest: (tripId) => [...adminTripKeys.detail(tripId), 'manifest'],
  groupsBoard: (tripId) => [...adminTripKeys.detail(tripId), 'groups-board'],
  attendanceMatrix: (tripId, groupId) => [
    ...adminTripKeys.detail(tripId),
    'attendance-matrix',
    groupId ?? 'all',
  ],
  attendanceHistory: (tripId) => [...adminTripKeys.detail(tripId), 'attendance-history'],
  recurrenceRules: (tourId) => ['admin-recurrence-rules', tourId],
};

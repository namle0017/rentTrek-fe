export const tripGroupKeys = {
  all: ['trip-groups'],
  details: () => [...tripGroupKeys.all, 'detail'],
  detail: (tripId) => [...tripGroupKeys.details(), tripId],
  guides: () => [...tripGroupKeys.all, 'guide-options'],
  trip: (tripId) => [...tripGroupKeys.all, 'trip', tripId],
};

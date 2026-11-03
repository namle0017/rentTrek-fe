export const guideKeys = {
  all: ['guide-portal'],
  trips: (tab) => [...guideKeys.all, 'trips', tab ?? 'today'],
  groupRoster: (tripId, search) => [...guideKeys.all, 'group', tripId, search ?? ''],
  participant: (participantId) => [...guideKeys.all, 'participant', participantId],
  itinerary: (tripId) => [...guideKeys.all, 'itinerary', tripId],
  providedItems: (tripId) => [...guideKeys.all, 'provided-items', tripId],
};

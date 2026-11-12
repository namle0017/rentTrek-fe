import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';

export const participationKeys = {
  all: ['participations'],
  mine: () => [...participationKeys.all, 'me'],
  posts: (participantId) => [...participationKeys.all, participantId, 'posts'],
};

// BE: UsersController (me/participations) + ParticipantsController
export const participationService = {
  getMine: () => axiosClient.get(API_ENDPOINTS.USERS.MY_PARTICIPATIONS),
  getPosts: (participantId) => axiosClient.get(API_ENDPOINTS.PARTICIPANTS.POSTS(participantId)),
  markPostRead: (participantId, postId) =>
    axiosClient.post(API_ENDPOINTS.PARTICIPANTS.POST_READ(participantId, postId)),
  createReview: (participantId, payload) =>
    axiosClient.post(API_ENDPOINTS.PARTICIPANTS.REVIEW(participantId), payload),
  updateReview: (participantId, payload) =>
    axiosClient.put(API_ENDPOINTS.PARTICIPANTS.REVIEW(participantId), payload),
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { participationKeys, participationService } from '../api/participationService';

export function useMyParticipations() {
  return useQuery({
    queryKey: participationKeys.mine(),
    queryFn: participationService.getMine,
    select: (res) => res.data, // MyParticipationResponse[]
  });
}

export function useParticipantPosts(participantId) {
  return useQuery({
    queryKey: participationKeys.posts(participantId),
    queryFn: () => participationService.getPosts(participantId),
    select: (res) => res.data, // ParticipantPostResponse[]
    enabled: Boolean(participantId),
  });
}

export function useMarkParticipantPostRead(participantId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId) => participationService.markPostRead(participantId, postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: participationKeys.all }),
  });
}

export function useSaveParticipantReview(participantId, isUpdate) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      isUpdate
        ? participationService.updateReview(participantId, payload)
        : participationService.createReview(participantId, payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã lưu đánh giá.');
      queryClient.invalidateQueries({ queryKey: participationKeys.mine() });
    },
    onError: (error) => toast.error(error.message || 'Không lưu được đánh giá.'),
  });
}

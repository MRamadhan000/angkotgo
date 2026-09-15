import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createReview,
  getReviewsByVehicleAssignmentId,
} from '@/services/review.service';

import { CreateReviewPayload } from '@/types/review.type';

export const useReviewsByVehicleAssignmentId = (
  vehicleAssignmentId?: number,
) => {
  return useQuery({
    queryKey: [
      'reviews',
      'assignment',
      vehicleAssignmentId,
    ],
    queryFn: () =>
      getReviewsByVehicleAssignmentId(
        vehicleAssignmentId!,
      ),
    enabled: !!vehicleAssignmentId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateReviewPayload,
    ) => createReview(payload),

    onSuccess: (response) => {
      // Refresh review berdasarkan user
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'user'],
      });

      // Refresh review berdasarkan assignment
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'assignment'],
      });
    },
  });
};
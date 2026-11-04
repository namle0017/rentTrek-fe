import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { rentalOpsKeys } from '../api/rentalOpsKeys';
import { rentalOpsService } from '../api/rentalOpsService';

export function useAdminRentalOrders(params) {
  return useQuery({
    queryKey: rentalOpsKeys.list(params),
    queryFn: () => rentalOpsService.getAll(params),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  });
}

export function useAdminRentalOrder(orderId) {
  return useQuery({
    queryKey: rentalOpsKeys.detail(orderId),
    queryFn: () => rentalOpsService.getById(orderId),
    select: (res) => res.data,
    enabled: Boolean(orderId),
  });
}

// Mọi thao tác trả về chi tiết đơn mới → ghi thẳng vào cache, làm mới danh sách
function useDetailMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (res, { orderId }) => {
      toast.success(res.message);
      queryClient.setQueryData(rentalOpsKeys.detail(orderId), res);
      queryClient.invalidateQueries({ queryKey: rentalOpsKeys.lists() });
    },
  });
}

export const useHandoverRental = () => useDetailMutation(rentalOpsService.handover);
export const useReturnRentalAssets = () => useDetailMutation(rentalOpsService.returnAssets);
export const useCreateRentalCharge = () => useDetailMutation(rentalOpsService.createCharge);
export const useAssessRentalCharge = () => useDetailMutation(rentalOpsService.assessCharge);
export const useVoidRentalCharge = () => useDetailMutation(rentalOpsService.voidCharge);
export const useCompleteRental = () => useDetailMutation(rentalOpsService.complete);

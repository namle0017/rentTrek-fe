import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => error?.statusCode >= 500 && failureCount < 2, // không retry lỗi 4xx
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipGlobalErrorToast) return;
      if (error?.errors) return; // lỗi validation để form tự hiển thị theo field
      toast.error(error.message);
    },
  }),
});

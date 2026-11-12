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
      // Lỗi validation: form RHF tự hiển thị theo field; form không gắn field thì bật meta.toastFieldErrors
      if (error?.errors && !mutation.meta?.toastFieldErrors) return;
      toast.error(error?.errors ? Object.values(error.errors).flat().join(' · ') : error.message);
    },
  }),
});

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AuthProvider from '@/contexts/AuthProvider';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes/router';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

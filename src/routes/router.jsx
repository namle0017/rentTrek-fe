import { createBrowserRouter } from 'react-router-dom';
import Spinner from '@/components/Spinner';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import LoginPage from '@/features/auth/pages/LoginPage';
import AdminLayout from '@/layouts/AdminLayout';
import MainLayout from '@/layouts/MainLayout';
import ForbiddenPage from '@/pages/ForbiddenPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import RouteErrorPage from '@/pages/RouteErrorPage';
import ProtectedRoute from './ProtectedRoute';

// Page lớn → lazy load để giảm bundle ban đầu (React Router tự chờ tải xong mới chuyển trang).
const lazyPage = (importPage) => async () => ({ Component: (await importPage()).default });

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <Spinner fullScreen />, // hiển thị khi F5 vào đúng trang lazy
    children: [
      // Public — layout chính
      {
        element: <MainLayout />,
        children: [
          { path: ROUTES.HOME, element: <HomePage /> },
          {
            path: ROUTES.PRODUCTS,
            lazy: lazyPage(() => import('@/features/products/pages/ProductListPage')),
          },
          {
            path: ROUTES.PRODUCT_DETAIL(),
            lazy: lazyPage(() => import('@/features/products/pages/ProductDetailPage')),
          },
          {
            path: ROUTES.TOURS,
            lazy: lazyPage(() => import('@/features/tours/pages/TourListPage')),
          },
          {
            path: ROUTES.TOUR_DETAIL(),
            lazy: lazyPage(() => import('@/features/tours/pages/TourDetailPage')),
          },
          { path: ROUTES.FORBIDDEN, element: <ForbiddenPage /> },
        ],
      },

      // Trang không có layout
      { path: ROUTES.LOGIN, element: <LoginPage /> },

      // Admin — cần đăng nhập + role Admin
      {
        element: <ProtectedRoute roles={[USER_ROLE.ADMIN]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: ROUTES.ADMIN, lazy: lazyPage(() => import('@/pages/AdminDashboardPage')) },
              {
                path: ROUTES.ADMIN_PRODUCT_CREATE,
                lazy: lazyPage(() => import('@/features/products/pages/ProductCreatePage')),
              },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

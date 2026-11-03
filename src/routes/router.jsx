import { createBrowserRouter } from 'react-router-dom';
import Spinner from '@/components/Spinner';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
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

          // Yêu cầu đăng nhập (Customer, Staff, Admin, TourGuide)
          {
            element: <ProtectedRoute />,
            children: [
              {
                path: ROUTES.PROFILE,
                lazy: lazyPage(() => import('@/features/users/pages/ProfilePage')),
              },
            ],
          },
        ],
      },

      // Trang không có layout (Auth split-screen)
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },

      // Admin / Staff — cần đăng nhập + role Admin hoặc Staff
      {
        element: <ProtectedRoute roles={[USER_ROLE.ADMIN, USER_ROLE.STAFF]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: ROUTES.ADMIN, lazy: lazyPage(() => import('@/pages/AdminDashboardPage')) },
              {
                path: ROUTES.ADMIN_PRODUCT_CREATE,
                lazy: lazyPage(() => import('@/features/products/pages/ProductCreatePage')),
              },
              {
                path: ROUTES.OPS_ASSETS,
                lazy: lazyPage(() => import('@/pages/ops/warehouse/AssetListPage')),
              },
              {
                path: ROUTES.OPS_ASSETS_SCHEDULE,
                lazy: lazyPage(() => import('@/pages/ops/warehouse/AssetGanttPage')),
              },
              {
                path: ROUTES.OPS_TRIP_PROVIDED_ITEMS(),
                lazy: lazyPage(() => import('@/pages/ops/warehouse/TripProvidedItemsPage')),
              },
              {
                path: '/ops/trips/provided-items',
                lazy: lazyPage(() => import('@/pages/ops/warehouse/TripProvidedItemsPage')),
              },
              {
                path: ROUTES.OPS_HANDOVER(),
                lazy: lazyPage(() => import('@/pages/ops/warehouse/HandoverChecklistPage')),
              },
              {
                path: '/ops/rentals/handover',
                lazy: lazyPage(() => import('@/pages/ops/warehouse/HandoverChecklistPage')),
              },
              {
                path: ROUTES.OPS_RETURN(),
                lazy: lazyPage(() => import('@/pages/ops/warehouse/ReturnChecklistPage')),
              },
              {
                path: '/ops/rentals/return',
                lazy: lazyPage(() => import('@/pages/ops/warehouse/ReturnChecklistPage')),
              },
              {
                path: ROUTES.OPS_SETTLEMENT(),
                lazy: lazyPage(() => import('@/pages/ops/warehouse/SettlementPage')),
              },
              {
                path: '/ops/rentals/settlement',
                lazy: lazyPage(() => import('@/pages/ops/warehouse/SettlementPage')),
              },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

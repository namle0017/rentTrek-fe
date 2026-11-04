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

      // Admin — cần đăng nhập + role Admin
      {
        element: <ProtectedRoute roles={[USER_ROLE.ADMIN, USER_ROLE.STAFF]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: ROUTES.ADMIN, lazy: lazyPage(() => import('@/pages/ops/system/DashboardPage')) },
              ...[
                [ROUTES.ADMIN_ORDERS, () => import('@/pages/ops/orders/OrdersPage')],
                [ROUTES.ADMIN_ORDER(), () => import('@/pages/ops/orders/OrderDetailPage')],
                [ROUTES.ADMIN_RENTALS, () => import('@/pages/ops/orders/RentalsPage')],
                [ROUTES.ADMIN_RENTAL(), () => import('@/pages/ops/orders/OrderDetailPage')],
                [ROUTES.ADMIN_MASTER, () => import('@/pages/ops/system/MasterDataPage')],
                [ROUTES.ADMIN_PROMOTIONS, () => import('@/pages/ops/system/PromotionsPage')],
                [ROUTES.ADMIN_PROMOTION(), () => import('@/pages/ops/system/PromotionDetailPage')],
                [ROUTES.ADMIN_POSTS, () => import('@/pages/ops/system/PostsPage')],
                [ROUTES.ADMIN_POST(), () => import('@/pages/ops/system/PostEditorPage')],
                [ROUTES.ADMIN_REVIEWS, () => import('@/pages/ops/system/ReviewsPage')],
              ].map(([path, importPage]) => ({ path, lazy: lazyPage(importPage) })),
              { element: <ProtectedRoute roles={[USER_ROLE.ADMIN]} />, children: [
                ...[
                  [ROUTES.ADMIN_USERS, () => import('@/pages/ops/system/UsersPage')],
                  [ROUTES.ADMIN_USER(), () => import('@/pages/ops/system/UserDetailPage')],
                  [ROUTES.ADMIN_SETTINGS, () => import('@/pages/ops/system/SettingsPage')],
                  [ROUTES.ADMIN_AUDIT, () => import('@/pages/ops/system/AuditPage')],
                  [ROUTES.ADMIN_REPORTS, () => import('@/pages/ops/system/ReportsPage')],
                ].map(([path, importPage]) => ({ path, lazy: lazyPage(importPage) })),
              ] },
              {
                element: <ProtectedRoute roles={[USER_ROLE.ADMIN]} />,
                children: [{ path: ROUTES.ADMIN_PRODUCT_CREATE, lazy: lazyPage(() => import('@/features/products/pages/ProductCreatePage')) }],
              },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

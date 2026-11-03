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
          {
            path: ROUTES.GUIDES,
            lazy: lazyPage(() => import('@/features/posts/pages/PostListPage')),
          },
          {
            path: ROUTES.GUIDE_DETAIL(),
            lazy: lazyPage(() => import('@/features/posts/pages/PostDetailPage')),
          },
          { path: ROUTES.FORBIDDEN, element: <ForbiddenPage /> },
          {
            path: ROUTES.VERIFY_EMAIL,
            lazy: lazyPage(() => import('@/features/auth/pages/VerifyEmailPage')),
          },
          // Công khai, chỉ đọc: ai có link đều xem được đoàn và lịch hoạt động
          {
            path: ROUTES.TRIP_BOOKING_JOIN(),
            lazy: lazyPage(() => import('@/features/trip-bookings/pages/ParticipantInvitationClaimPage')),
          },

          // Yêu cầu đăng nhập (Customer, Staff, Admin, TourGuide)
          {
            element: <ProtectedRoute />,
            children: [
              {
                path: ROUTES.PROFILE,
                lazy: lazyPage(() => import('@/features/users/pages/ProfilePage')),
              },
              {
                path: ROUTES.MY_ORDERS,
                lazy: lazyPage(() => import('@/features/orders/pages/MyOrdersPage')),
              },
              {
                path: ROUTES.TRIP_BOOKING_CREATE,
                lazy: lazyPage(() => import('@/features/trip-bookings/pages/TripBookingCreatePage')),
              },
              {
                path: ROUTES.TRIP_BOOKING_DETAIL(),
                lazy: lazyPage(() => import('@/features/trip-bookings/pages/TripBookingDetailPage')),
              },
              {
                element: <ProtectedRoute roles={[USER_ROLE.ADMIN, USER_ROLE.STAFF, USER_ROLE.TOUR_GUIDE]} />,
                children: [
                  {
                    path: ROUTES.TRIP_GROUPING(),
                    lazy: lazyPage(() => import('@/features/trip-groups/pages/TripGroupingPage')),
                  },
                ],
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
        element: <ProtectedRoute roles={[USER_ROLE.ADMIN]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: ROUTES.ADMIN, lazy: lazyPage(() => import('@/pages/AdminDashboardPage')) },
              {
                path: ROUTES.ADMIN_TOURS,
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminToursPage')),
              },
              {
                path: ROUTES.ADMIN_PRODUCTS,
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminProductsPage')),
              },
              {
                path: ROUTES.ADMIN_TOUR_DETAIL(),
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminTourDetailPage')),
              },
              {
                path: ROUTES.ADMIN_PRODUCT_DETAIL(),
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminProductDetailPage')),
              },
              {
                path: ROUTES.ADMIN_PRODUCT_CREATE,
                lazy: lazyPage(() => import('@/features/products/pages/ProductCreatePage')),
              },
              {
                path: ROUTES.ADMIN_REFUNDS,
                lazy: lazyPage(() => import('@/features/refunds/pages/AdminRefundsPage')),
              },
            ],
          },
        ],
      },

      // Bài viết — Admin và Staff (Staff chỉ sửa bài mình tạo, BE chặn)
      {
        element: <ProtectedRoute roles={[USER_ROLE.ADMIN, USER_ROLE.STAFF]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: ROUTES.ADMIN_TRIP_DETAIL(),
                lazy: lazyPage(() => import('@/features/trip-groups/pages/TripOpsPage')),
              },
              {
                path: ROUTES.ADMIN_RENTAL_ORDERS,
                lazy: lazyPage(() => import('@/features/rental-ops/pages/AdminRentalOrdersPage')),
              },
              {
                path: ROUTES.ADMIN_RENTAL_ORDER_DETAIL(),
                lazy: lazyPage(() => import('@/features/rental-ops/pages/AdminRentalOrderDetailPage')),
              },
              {
                path: ROUTES.ADMIN_POSTS,
                lazy: lazyPage(() => import('@/features/posts/pages/AdminPostsPage')),
              },
              {
                path: ROUTES.ADMIN_POST_CREATE,
                lazy: lazyPage(() => import('@/features/posts/pages/AdminPostEditorPage')),
              },
              {
                path: ROUTES.ADMIN_POST_EDIT(),
                lazy: lazyPage(() => import('@/features/posts/pages/AdminPostEditorPage')),
              },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

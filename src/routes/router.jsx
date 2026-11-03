import { createBrowserRouter } from 'react-router-dom';
import Spinner from '@/components/Spinner';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import AdminLayout from '@/layouts/AdminLayout';
import GuideLayout from '@/layouts/GuideLayout';
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

      // Admin & Staff — cần đăng nhập + role Admin hoặc Staff
      // Admin & Staff — Vận hành hệ thống & chuyến đi
      {
        element: <ProtectedRoute roles={[USER_ROLE.ADMIN, USER_ROLE.STAFF]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: ROUTES.ADMIN, lazy: lazyPage(() => import('@/pages/AdminDashboardPage')) },
              {
                path: ROUTES.ADMIN_PROFILE,
                lazy: lazyPage(() => import('@/features/users/pages/ProfilePage')),
              },
              {
                path: ROUTES.ADMIN_PRODUCT_CREATE,
                lazy: lazyPage(() => import('@/features/products/pages/ProductCreatePage')),
              },
              // Phân hệ Tài chính & Hoàn tiền (Namle)
              {
                path: ROUTES.OPS_TRANSACTIONS,
                lazy: lazyPage(() => import('@/pages/ops/finance/TransactionsPage')),
              },
              {
                path: ROUTES.OPS_REFUNDS,
                lazy: lazyPage(() => import('@/pages/ops/finance/RefundsReconcilePage')),
              },
              {
                path: ROUTES.OPS_REFUND_POLICIES,
                lazy: lazyPage(() => import('@/pages/ops/finance/RefundPoliciesPage')),
              },
              {
                path: ROUTES.OPS_REFUND_POLICY_CREATE,
                lazy: lazyPage(() => import('@/pages/ops/finance/RefundPolicyCreatePage')),
              },
              {
                path: ROUTES.ADMIN_RECURRENCE_RULES(),
                lazy: lazyPage(() => import('@/features/admin-trips/pages/AdminRecurrenceRulesPage')),
              },
              {
                path: ROUTES.ADMIN_TRIP_CREATE,
                lazy: lazyPage(() => import('@/features/admin-trips/pages/AdminTripCreatePage')),
              },
              {
                path: ROUTES.ADMIN_TRIPS,
                lazy: lazyPage(() => import('@/features/admin-trips/pages/AdminTripListPage')),
              },
              {
                path: ROUTES.ADMIN_TRIP_DETAIL(),
                lazy: lazyPage(() => import('@/features/admin-trips/pages/AdminTripDetailPage')),
              },
            ],
          },
        ],
      },

      // Khu vực Hướng dẫn viên Thực địa (Guide Portal — Mobile-First G01–G06)
      {
        element: (
          <ProtectedRoute roles={[USER_ROLE.GUIDE, USER_ROLE.TOUR_GUIDE, USER_ROLE.ADMIN, USER_ROLE.STAFF]} />
        ),
        children: [
          {
            element: <GuideLayout />,
            children: [
              {
                path: ROUTES.GUIDE,
                lazy: lazyPage(() => import('@/features/guide/pages/GuideTripsPage')),
              },
              {
                path: ROUTES.GUIDE_TRIPS,
                lazy: lazyPage(() => import('@/features/guide/pages/GuideTripsPage')),
              },
              {
                path: ROUTES.GUIDE_TRIP_GROUP(),
                lazy: lazyPage(() => import('@/features/guide/pages/GuideGroupRosterPage')),
              },
              {
                path: ROUTES.GUIDE_PARTICIPANT_DETAIL(),
                lazy: lazyPage(() => import('@/features/guide/pages/GuideParticipantDetailPage')),
              },
              {
                path: ROUTES.GUIDE_ATTENDANCE(),
                lazy: lazyPage(() => import('@/features/guide/pages/GuideBatchAttendancePage')),
              },
              {
                path: ROUTES.GUIDE_ITINERARY(),
                lazy: lazyPage(() => import('@/features/guide/pages/GuideItineraryPage')),
              },
              {
                path: ROUTES.GUIDE_PROVIDED_ITEMS(),
                lazy: lazyPage(() => import('@/features/guide/pages/GuideProvidedItemsPage')),
              },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

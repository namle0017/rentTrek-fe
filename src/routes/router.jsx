import { createBrowserRouter, Navigate } from 'react-router-dom';
import Spinner from '@/components/Spinner';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import BackofficeLayout from '@/layouts/BackofficeLayout';
import RentalFulfillmentLayout from '@/layouts/RentalFulfillmentLayout';
import GuideLayout from '@/layouts/GuideLayout';
import MainLayout from '@/layouts/MainLayout';
import ForbiddenPage from '@/pages/ForbiddenPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import RouteErrorPage from '@/pages/RouteErrorPage';
import LegacyTripRedirect from './LegacyTripRedirect';
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
            path: ROUTES.RENTAL_CART,
            lazy: lazyPage(() => import('@/features/rentals/pages/RentalCartPage')),
          },
          {
            path: ROUTES.PRODUCTS,
            lazy: lazyPage(() => import('@/features/products/pages/ProductListPage')),
          },
          {
            path: ROUTES.PRODUCT_DETAIL(),
            lazy: lazyPage(() => import('@/features/products/pages/ProductDetailPage')),
          },
          {
            path: ROUTES.BUNDLES,
            lazy: lazyPage(() => import('@/features/rentals/pages/BundleListPage')),
          },
          {
            path: ROUTES.BUNDLE_DETAIL(),
            lazy: lazyPage(() => import('@/features/rentals/pages/BundleDetailPage')),
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

          // Hồ sơ và thông báo dùng chung cho mọi tài khoản đã đăng nhập.
          {
            element: <ProtectedRoute />,
            children: [
              {
                path: ROUTES.PROFILE,
                lazy: lazyPage(() => import('@/features/users/pages/ProfilePage')),
              },
              {
                path: ROUTES.NOTIFICATIONS,
                lazy: lazyPage(() => import('@/features/notifications/pages/NotificationsPage')),
              },
              {
                element: <ProtectedRoute roles={[USER_ROLE.CUSTOMER]} />,
                children: [
                  {
                    path: ROUTES.MY_ORDERS,
                    lazy: lazyPage(() => import('@/features/orders/pages/MyOrdersPage')),
                  },
                  {
                    path: ROUTES.MY_TRIPS,
                    lazy: lazyPage(() => import('@/features/participations/pages/MyTripsPage')),
                  },
                  {
                    path: ROUTES.MY_REFUNDS,
                    lazy: lazyPage(() => import('@/features/refunds/pages/MyRefundsPage')),
                  },
                  {
                    path: ROUTES.MY_REPORTS,
                    lazy: lazyPage(() => import('@/features/customer-reports/pages/MyReportsPage')),
                  },
                  {
                    path: ROUTES.MY_REFUND_DETAIL(),
                    lazy: lazyPage(() => import('@/features/refunds/pages/MyRefundDetailPage')),
                  },
                  {
                    path: ROUTES.RENTAL_CHECKOUT,
                    lazy: lazyPage(() => import('@/features/rentals/pages/RentalCheckoutPage')),
                  },
                  {
                    path: ROUTES.RENTAL_ORDER_DETAIL(),
                    lazy: lazyPage(() => import('@/features/rentals/pages/RentalOrderDetailPage')),
                  },
                  {
                    path: ROUTES.RENTAL_ORDER_EXTEND(),
                    lazy: lazyPage(() => import('@/features/rentals/pages/RentalExtensionPage')),
                  },
                  {
                    path: ROUTES.TRIP_BOOKING_CREATE,
                    lazy: lazyPage(() => import('@/features/trip-bookings/pages/TripBookingCreatePage')),
                  },
                  {
                    path: ROUTES.TRIP_BOOKING_DETAIL(),
                    lazy: lazyPage(() => import('@/features/trip-bookings/pages/TripBookingDetailPage')),
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
      // Admin / Staff — cần đăng nhập + role Admin hoặc Staff
      {
        element: <ProtectedRoute roles={[USER_ROLE.ADMIN, USER_ROLE.STAFF]} />,
        children: [
          {
            element: <BackofficeLayout />,
            children: [
              {
                path: ROUTES.ADMIN,
                lazy: lazyPage(() => import('@/pages/ops/system/DashboardPage')),
              },
              {
                path: ROUTES.ADMIN_PROFILE,
                lazy: lazyPage(() => import('@/features/users/pages/ProfilePage')),
              },
              {
                path: ROUTES.ADMIN_NOTIFICATIONS,
                lazy: lazyPage(() => import('@/features/notifications/pages/NotificationsPage')),
              },
              // Đơn hàng & Đơn thuê
              {
                path: ROUTES.ADMIN_ORDERS,
                lazy: lazyPage(() => import('@/pages/ops/orders/OrdersPage')),
              },
              {
                path: ROUTES.ADMIN_ORDER(),
                lazy: lazyPage(() => import('@/pages/ops/orders/OrderDetailPage')),
              },
              {
                path: ROUTES.ADMIN_RENTAL_ORDERS,
                lazy: lazyPage(() => import('@/features/rental-ops/pages/AdminRentalOrdersPage')),
              },
              {
                path: ROUTES.ADMIN_RENTAL_ORDER_DETAIL(),
                lazy: lazyPage(() => import('@/features/rental-ops/pages/AdminRentalOrderDetailPage')),
              },
              // Nội dung, Đánh giá, Khuyến mãi & Danh mục
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
              {
                path: ROUTES.ADMIN_REVIEWS,
                lazy: lazyPage(() => import('@/pages/ops/system/ReviewsPage')),
              },
              {
                path: ROUTES.ADMIN_MASTER,
                lazy: lazyPage(() => import('@/pages/ops/system/MasterDataPage')),
              },
              {
                path: ROUTES.ADMIN_PROMOTIONS,
                lazy: lazyPage(() => import('@/pages/ops/system/PromotionsPage')),
              },
              {
                path: ROUTES.ADMIN_PROMOTION(),
                lazy: lazyPage(() => import('@/pages/ops/system/PromotionDetailPage')),
              },
              // Danh mục Tour & Sản phẩm (Admin & Staff)
              {
                path: ROUTES.ADMIN_TOURS,
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminToursPage')),
              },
              {
                path: ROUTES.ADMIN_TOUR_DETAIL(),
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminTourDetailPage')),
              },
              {
                path: ROUTES.ADMIN_PRODUCTS,
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminProductsPage')),
              },
              {
                path: ROUTES.ADMIN_PRODUCT_DETAIL(),
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminProductDetailPage')),
              },
              {
                path: ROUTES.ADMIN_BUNDLES,
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminBundlesPage')),
              },
              {
                path: ROUTES.ADMIN_BUNDLE_DETAIL(),
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminBundleDetailPage')),
              },
              // Tạo / sửa sản phẩm: Admin và Staff (Staff trực tiếp quản lý kho)
              {
                path: ROUTES.ADMIN_PRODUCT_CREATE,
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminProductEditorPage')),
              },
              {
                path: ROUTES.ADMIN_PRODUCT_EDIT(),
                lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminProductEditorPage')),
              },
              // Phân hệ Quản trị / Governance tối cao (Admin Only)
              {
                element: <ProtectedRoute roles={[USER_ROLE.ADMIN]} />,
                children: [
                  {
                    path: ROUTES.ADMIN_TOUR_NEW,
                    lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminTourEditorPage')),
                  },
                  {
                    path: ROUTES.ADMIN_TOUR_EDIT(),
                    lazy: lazyPage(() => import('@/features/admin-catalog/pages/AdminTourEditorPage')),
                  },
                  {
                    path: ROUTES.ADMIN_USERS,
                    lazy: lazyPage(() => import('@/pages/ops/system/UsersPage')),
                  },
                  {
                    path: ROUTES.ADMIN_USER(),
                    lazy: lazyPage(() => import('@/pages/ops/system/UserDetailPage')),
                  },
                  {
                    path: ROUTES.ADMIN_SETTINGS,
                    lazy: lazyPage(() => import('@/pages/ops/system/SettingsPage')),
                  },
                  {
                    path: ROUTES.ADMIN_AUDIT,
                    lazy: lazyPage(() => import('@/pages/ops/system/AuditPage')),
                  },
                  {
                    path: ROUTES.ADMIN_REPORTS,
                    lazy: lazyPage(() => import('@/pages/ops/system/ReportsPage')),
                  },
                ],
              },
              // Quản lý chuyến đi (Trips Ops & Lifecycle)
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
              // Trang điều phối / chia nhóm cũ đã gộp vào tab Kanban của chi tiết chuyến
              {
                path: ROUTES.ADMIN_TRIP_OPS(),
                element: <LegacyTripRedirect />,
              },
              {
                path: ROUTES.TRIP_GROUPING(),
                element: <LegacyTripRedirect />,
              },
              // Phân hệ Tài chính & Hoàn tiền (Namle)
              {
                path: ROUTES.OPS_TRANSACTIONS,
                lazy: lazyPage(() => import('@/pages/ops/finance/TransactionsPage')),
              },
              // Hàng đợi hoàn tiền: Staff duyệt / từ chối; xuất, nhập, hoàn tất chỉ Admin (trang tự ẩn nút)
              {
                element: <ProtectedRoute roles={[USER_ROLE.ADMIN, USER_ROLE.STAFF]} />,
                children: [
                  {
                    path: ROUTES.OPS_REFUNDS,
                    element: <Navigate to={ROUTES.ADMIN_REFUNDS} replace />,
                  },
                  {
                    path: ROUTES.ADMIN_REFUNDS,
                    lazy: lazyPage(() => import('@/features/refunds/pages/AdminRefundsPage')),
                  },
                ],
              },
              {
                path: ROUTES.OPS_REFUND_POLICIES,
                element: <Navigate to={ROUTES.ADMIN_REFUND_POLICIES} replace />,
              },
              {
                path: ROUTES.ADMIN_RENTAL_REPORTS,
                lazy: lazyPage(() => import('@/features/rental-ops/pages/AdminRentalReportsPage')),
              },
              {
                path: ROUTES.ADMIN_CUSTOMER_REPORTS,
                lazy: lazyPage(() => import('@/features/customer-reports/pages/AdminCustomerReportsPage')),
              },
              {
                // Trang chính sách thuê cũ: chuyển sang trang quản lý phiên bản mới
                path: ROUTES.ADMIN_RENTAL_POLICY,
                element: <Navigate to={ROUTES.ADMIN_RENTAL_POLICIES} replace />,
              },
              {
                path: ROUTES.OPS_REFUND_POLICY_CREATE,
                element: <Navigate to={ROUTES.ADMIN_REFUND_POLICY_CREATE} replace />,
              },
              // Phân hệ Chính sách (hoàn tiền + thuê đồ)
              {
                path: ROUTES.ADMIN_REFUND_POLICIES,
                lazy: lazyPage(() => import('@/features/admin-policies/pages/RefundPoliciesPage')),
              },
              {
                path: ROUTES.ADMIN_RENTAL_POLICIES,
                lazy: lazyPage(() => import('@/features/admin-policies/pages/RentalPoliciesPage')),
              },
              {
                element: <ProtectedRoute roles={[USER_ROLE.ADMIN]} />,
                children: [
                  {
                    path: ROUTES.ADMIN_REFUND_POLICY_CREATE,
                    lazy: lazyPage(() => import('@/features/admin-policies/pages/RefundPolicyEditorPage')),
                  },
                  {
                    path: ROUTES.ADMIN_REFUND_POLICY_EDIT(),
                    lazy: lazyPage(() => import('@/features/admin-policies/pages/RefundPolicyEditorPage')),
                  },
                  {
                    path: ROUTES.ADMIN_RENTAL_POLICY_CREATE,
                    lazy: lazyPage(() => import('@/features/admin-policies/pages/RentalPolicyCreatePage')),
                  },
                ],
              },
              {
                path: ROUTES.ADMIN_REFUND_POLICY_DETAIL(),
                lazy: lazyPage(() => import('@/features/admin-policies/pages/RefundPolicyDetailPage')),
              },
              {
                path: ROUTES.ADMIN_RENTAL_POLICY_DETAIL(),
                lazy: lazyPage(() => import('@/features/admin-policies/pages/RentalPolicyDetailPage')),
              },
              // Phân hệ Kho & Thiết bị (Ops / Warehouse)
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
                element: <RentalFulfillmentLayout />,
                children: [
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
        ],
      },

      // Khu vực Hướng dẫn viên Thực địa (Guide Portal — Mobile-First G01–G06)
      {
        element: (
          <ProtectedRoute roles={[USER_ROLE.GUIDE, USER_ROLE.ADMIN]} />
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
                path: ROUTES.GUIDE_PROFILE,
                lazy: lazyPage(() => import('@/features/users/pages/ProfilePage')),
              },
              {
                path: ROUTES.GUIDE_NOTIFICATIONS,
                lazy: lazyPage(() => import('@/features/notifications/pages/NotificationsPage')),
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

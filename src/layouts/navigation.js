import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Map,
  Package,
  ScrollText,
  Settings,
  Tags,
  UserRound,
  Wallet,
  Warehouse,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

/**
 * Cấu hình menu cho từng khu vực (Admin / Staff / Guide), render bằng PortalSidebar.
 * Mỗi nhóm: { title, icon, expanded?, items: [[route, label, { end }?]] }.
 */

const tourGroup = {
  title: 'Tour & chuyến đi',
  icon: Map,
  items: [
    [ROUTES.ADMIN_TRIPS, 'Chuyến đi'],
    [ROUTES.ADMIN_TOURS, 'Danh mục tour'],
  ],
};

const warehouseGroup = {
  title: 'Kho & thiết bị',
  icon: Warehouse,
  items: [
    [ROUTES.OPS_ASSETS, 'Kho thiết bị', { end: true }],
    [ROUTES.OPS_ASSETS_SCHEDULE, 'Lịch thiết bị'],
    ['/ops/trips/provided-items', 'Đồ cấp chuyến'],
    ['/ops/rentals/handover', 'Giao thiết bị'],
    ['/ops/rentals/return', 'Thu hồi thiết bị'],
    ['/ops/rentals/settlement', 'Quyết toán & phí'],
  ],
};

const policyGroup = {
  title: 'Chính sách',
  icon: ScrollText,
  items: [
    [ROUTES.ADMIN_REFUND_POLICIES, 'Chính sách hoàn tiền'],
    [ROUTES.ADMIN_RENTAL_POLICIES, 'Chính sách thuê đồ'],
  ],
};

const productItems = [
  [ROUTES.ADMIN_PRODUCTS, 'Sản phẩm'],
  [ROUTES.ADMIN_BUNDLES, 'Combo thiết bị'],
  [ROUTES.ADMIN_RENTAL_ORDERS, 'Đơn thuê thiết bị'],
  [ROUTES.ADMIN_RENTAL_REPORTS, 'Báo cáo đơn thuê'],
  [ROUTES.ADMIN_CUSTOMER_REPORTS, 'Báo cáo từ khách hàng'],
  [ROUTES.ADMIN_ORDERS, 'Tất cả đơn hàng'],
];

const backofficeOverview = { to: ROUTES.ADMIN, label: 'Tổng quan', icon: LayoutDashboard, end: true };

export const ADMIN_NAV = {
  brandSuffix: 'Admin',
  brandTo: ROUTES.ADMIN,
  overview: backofficeOverview,
  caption: 'QUẢN LÝ',
  groups: [
    { ...tourGroup, expanded: true },
    { title: 'Sản phẩm & đơn hàng', icon: Package, expanded: true, items: productItems },
    warehouseGroup,
    {
      title: 'Nội dung',
      icon: FileText,
      items: [
        [ROUTES.ADMIN_POSTS, 'Bài viết & cẩm nang'],
        [ROUTES.ADMIN_REVIEWS, 'Đánh giá'],
      ],
    },
    {
      title: 'Khuyến mãi & danh mục',
      icon: Tags,
      items: [
        [ROUTES.ADMIN_PROMOTIONS, 'Khuyến mãi'],
        [ROUTES.ADMIN_MASTER, 'Danh mục & địa điểm'],
      ],
    },
    {
      title: 'Tài chính',
      icon: Wallet,
      items: [
        [ROUTES.OPS_TRANSACTIONS, 'Giao dịch'],
        [ROUTES.ADMIN_REFUNDS, 'Hoàn tiền'],
      ],
    },
    policyGroup,
    {
      title: 'Hệ thống',
      icon: Settings,
      items: [
        [ROUTES.ADMIN_USERS, 'Người dùng & nhân sự'],
        [ROUTES.ADMIN_REPORTS, 'Báo cáo'],
        [ROUTES.ADMIN_SETTINGS, 'Cấu hình'],
        [ROUTES.ADMIN_AUDIT, 'Nhật ký kiểm toán'],
      ],
    },
  ],
};

/** Staff trực tiếp quản lý kho → nhóm Kho lên đầu, không có Nội dung / Tài chính / Hệ thống. */
export const STAFF_NAV = {
  brandSuffix: 'Vận hành',
  brandTo: ROUTES.ADMIN,
  overview: backofficeOverview,
  caption: 'VẬN HÀNH',
  groups: [
    { ...warehouseGroup, expanded: true },
    { title: 'Sản phẩm & đơn thuê', icon: Package, expanded: true, items: productItems },
    tourGroup,
    { title: 'Tài chính', icon: Wallet, items: [[ROUTES.ADMIN_REFUNDS, 'Hoàn tiền']] },
    policyGroup,
  ],
};

export const GUIDE_NAV = {
  brandSuffix: 'Field Guide',
  brandTo: ROUTES.GUIDE_TRIPS,
  overview: { to: ROUTES.GUIDE_TRIPS, label: 'Lịch dẫn đoàn', icon: CalendarDays },
  caption: 'CÁ NHÂN',
  groups: [
    {
      title: 'Tài khoản',
      icon: UserRound,
      expanded: true,
      items: [
        [ROUTES.GUIDE_NOTIFICATIONS, 'Thông báo'],
        [ROUTES.GUIDE_PROFILE, 'Hồ sơ cá nhân'],
      ],
    },
  ],
};

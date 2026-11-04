import { ROUTES } from '@/constants/routes';

export const opsNavigation = [
  { label: 'Tổng quan', to: ROUTES.ADMIN, icon: '◫' },
  { label: 'Đơn hàng tổng hợp', to: ROUTES.ADMIN_ORDERS, icon: '▤' },
  { label: 'Đơn thuê thiết bị', to: ROUTES.ADMIN_RENTALS, icon: '▣' },
  { label: 'Người dùng', to: ROUTES.ADMIN_USERS, icon: '♙', adminOnly: true },
  { label: 'Danh mục & địa điểm', to: ROUTES.ADMIN_MASTER, icon: '⌖' },
  { label: 'Khuyến mãi', to: ROUTES.ADMIN_PROMOTIONS, icon: '◇' },
  { label: 'Bài viết & cẩm nang', to: ROUTES.ADMIN_POSTS, icon: '▧' },
  { label: 'Kiểm duyệt đánh giá', to: ROUTES.ADMIN_REVIEWS, icon: '☆' },
  { label: 'Báo cáo vận hành', to: ROUTES.ADMIN_REPORTS, icon: '▥', adminOnly: true },
  { label: 'Cấu hình hệ thống', to: ROUTES.ADMIN_SETTINGS, icon: '⚙', adminOnly: true },
  { label: 'Nhật ký kiểm toán', to: ROUTES.ADMIN_AUDIT, icon: '◷', adminOnly: true },
];

/**
 * Mock Data phục vụ tạo chuyến đi thủ công & chọn mã từ hệ thống:
 * 1. Danh sách Tour đã Phát hành (Published Tours) - quyết định giá vé cơ sở
 * 2. Danh sách Chính sách Hoàn tiền đang kích hoạt (Active Refund Policies)
 * 3. Danh sách Người điều phối chuyến đi (Trip Coordinators - Staff/Guide/Admin)
 */

export const MOCK_PUBLISHED_TOURS = [
  {
    tourId: 'tour-fansipan-3d2n',
    tourCode: 'TOUR-FAN-001',
    title: 'Trekking Fansipan - Nóc Nhà Đông Dương (3N2Đ)',
    durationDays: 3,
    durationNights: 2,
    difficulty: 'Challenging',
    basePrice: 3850000,
    currency: 'VND',
    minParticipants: 10,
    maxParticipants: 20,
    location: 'Sa Pa, Lào Cai',
    status: 'Published',
  },
  {
    tourId: 'tour-taxua-2d1n',
    tourCode: 'TOUR-TX-002',
    title: 'Săn mây Tà Xùa - Sống Lưng Khủng Long (2N1Đ)',
    durationDays: 2,
    durationNights: 1,
    difficulty: 'Moderate',
    basePrice: 2750000,
    currency: 'VND',
    minParticipants: 8,
    maxParticipants: 16,
    location: 'Bắc Yên, Sơn La',
    status: 'Published',
  },
  {
    tourId: 'tour-putaleng-4d3n',
    tourCode: 'TOUR-PTL-003',
    title: 'Chinh phục Đỉnh Pú Tả Lèng Hùng Vĩ (4N3Đ)',
    durationDays: 4,
    durationNights: 3,
    difficulty: 'Extreme',
    basePrice: 4200000,
    currency: 'VND',
    minParticipants: 6,
    maxParticipants: 12,
    location: 'Tam Đường, Lai Châu',
    status: 'Published',
  },
  {
    tourId: 'tour-bidoup-2d1n',
    tourCode: 'TOUR-BDP-004',
    title: 'Trekking Rừng Nguyên Sinh Bidoup Núi Bà (2N1Đ)',
    durationDays: 2,
    durationNights: 1,
    difficulty: 'Moderate',
    basePrice: 2950000,
    currency: 'VND',
    minParticipants: 8,
    maxParticipants: 15,
    location: 'Lạc Dương, Lâm Đồng',
    status: 'Published',
  },
  {
    tourId: 'tour-lungcung-2d1n',
    tourCode: 'TOUR-LC-005',
    title: 'Khám phá Đỉnh Lùng Cúng - Mù Cang Chải (2N1Đ)',
    durationDays: 2,
    durationNights: 1,
    difficulty: 'Moderate',
    basePrice: 2600000,
    currency: 'VND',
    minParticipants: 8,
    maxParticipants: 16,
    location: 'Mù Cang Chải, Yên Bái',
    status: 'Published',
  },
];

export const MOCK_ACTIVE_REFUND_POLICIES = [
  {
    refundPolicyId: 'pol-standard-trek',
    policyCode: 'POL-STD-01',
    policyName: 'Chính sách hoàn tiền tiêu chuẩn Trekking',
    description: 'Hoàn 100% trước 7 ngày khởi hành, 50% trước 3 ngày, 0% trong vòng 72 giờ.',
    rulesCount: 3,
    isActive: true,
  },
  {
    refundPolicyId: 'pol-flexible-trek',
    policyCode: 'POL-FLX-02',
    policyName: 'Chính sách hoàn tiền linh hoạt (Dành cho thành viên VIP)',
    description: 'Hoàn 100% trước 3 ngày khởi hành, 70% trước 24 giờ.',
    rulesCount: 2,
    isActive: true,
  },
  {
    refundPolicyId: 'pol-strict-extreme',
    policyCode: 'POL-STR-03',
    policyName: 'Chính sách bảo lưu tour đặc biệt (Extreme / Khắc nghiệt)',
    description: 'Hoàn 80% trước 14 ngày, không hoàn tiền sau mốc 7 ngày trước khởi hành.',
    rulesCount: 2,
    isActive: true,
  },
];

export const MOCK_COORDINATORS = [
  {
    userId: 'usr-namle-admin',
    fullName: 'Lê Nhật Nam',
    email: 'namle@rentrek.vn',
    role: 'Admin',
    phone: '0901234567',
  },
  {
    userId: 'usr-huy-staff',
    fullName: 'Nguyễn Văn Huy',
    email: 'huy.nguyen@rentrek.vn',
    role: 'Staff',
    phone: '0912345678',
  },
  {
    userId: 'usr-guide-huong',
    fullName: 'Trần Văn Hướng',
    email: 'huong.guide@rentrek.vn',
    role: 'TourGuide',
    phone: '0987654321',
  },
  {
    userId: 'usr-guide-thao',
    fullName: 'Nguyễn Thị Thảo',
    email: 'thao.guide@rentrek.vn',
    role: 'TourGuide',
    phone: '0934567890',
  },
];

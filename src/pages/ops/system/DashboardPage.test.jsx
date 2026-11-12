import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { USER_ROLE } from '@/constants/enums';
import { API_ENDPOINTS } from '@/api/endpoints';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/features/operations/hooks/useOperations';
import DashboardPage from './DashboardPage';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/operations/hooks/useOperations', () => ({
  useOperations: vi.fn(),
}));

vi.mock('./RevenueChart.jsx', () => ({
  default: () => <div data-testid="mock-revenue-chart">Revenue Chart Mock</div>,
}));

describe('DashboardPage - Redesigned UI/UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard header, 4 KPI cards, priority action center, and 3-column operations grid', () => {
    useAuth.mockReturnValue({
      currentUser: { role: USER_ROLE.ADMIN },
    });

    useOperations.mockImplementation((endpoint) => {
      if (endpoint === API_ENDPOINTS.ADMIN.DASHBOARD.STATS) {
        return {
          data: {
            tripsDepartingIn7DaysCount: 3,
            unassignedParticipantsCount: 5,
            missingProvidedItemsCount: 1,
            underCapacityTripsCount: 2,
            pendingPaymentExpiringCount: 4,
            overdueRentalAssetsCount: 2,
            draftRentalChargesCount: 1,
            pendingApprovalRefundsCount: 3,
            failedRefundsCount: 1,
            needsReconciliationOrdersCount: 2,
          },
          isPending: false,
          isError: false,
        };
      }
      if (endpoint === API_ENDPOINTS.ADMIN.DASHBOARD.ALERTS) {
        return {
          data: [
            {
              entityId: 'alert-1',
              severity: 'Critical',
              title: '2 thiết bị quá hạn trả',
              message: 'Đơn thuê #ORD-001 có 2 gậy trekking quá hạn 3 ngày.',
              actionUrl: '/ops/warehouse/returns',
            },
          ],
          isPending: false,
          isError: false,
        };
      }
      if (endpoint === API_ENDPOINTS.ADMIN.DASHBOARD.KPIS) {
        return {
          data: {
            netRevenueVnd: 45000000,
            weeklyBookingsCount: 18,
            averageOccupancyRate: 85,
            activeRentedAssetsCount: 42,
            totalAvailableAssetsCount: 60,
          },
          isPending: false,
          isError: false,
        };
      }
      return { data: null, isPending: false, isError: false };
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    // 1. Dashboard Header
    expect(screen.getByRole('heading', { level: 1, name: 'Tổng quan hoạt động' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Quản lý đơn hàng/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Quản lý chuyến đi/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Báo cáo chi tiết/ })).toBeInTheDocument();

    // 2. 4 KPI cards
    expect(screen.getByText('Doanh thu ròng')).toBeInTheDocument();
    expect(screen.getByText('45.000.000 ₫')).toBeInTheDocument();
    expect(screen.getByText('Booking mới')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('Tỷ lệ lấp chỗ')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Thiết bị đang thuê / Sẵn sàng')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    // 3. Priority Action Center
    expect(screen.getByRole('heading', { level: 2, name: 'Cần xử lý ưu tiên' })).toBeInTheDocument();
    expect(screen.getByText('2 thiết bị quá hạn trả')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xử lý ngay/ })).toHaveAttribute('href', '/ops/warehouse/returns');

    // 4. Operations Overview (3 group headers)
    expect(screen.getByRole('heading', { level: 3, name: 'Tour & Chuyến đi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Đơn hàng & Thiết bị' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Thanh toán & Hoàn tiền' })).toBeInTheDocument();

    // Counter attention highlights
    expect(screen.getByText('Khách chưa xếp nhóm')).toBeInTheDocument();
    expect(screen.getByText('Đơn cần đối soát')).toBeInTheDocument();

    // 5. Revenue chart mock
    expect(screen.getByTestId('mock-revenue-chart')).toBeInTheDocument();
  });

  it('renders positive empty state when there are no alerts', () => {
    useAuth.mockReturnValue({
      currentUser: { role: USER_ROLE.STAFF },
    });

    useOperations.mockImplementation((endpoint) => {
      if (endpoint === API_ENDPOINTS.ADMIN.DASHBOARD.ALERTS) {
        return { data: [], isPending: false, isError: false };
      }
      return { data: {}, isPending: false, isError: false };
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Hệ thống hoạt động ổn định')).toBeInTheDocument();
    expect(
      screen.getByText('Hiện không có cảnh báo hoặc công việc tồn đọng cần can thiệp khẩn cấp.'),
    ).toBeInTheDocument();
  });
});

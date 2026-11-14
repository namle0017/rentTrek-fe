import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/api/endpoints';
import { formatCurrency } from '@/utils/formatCurrency';
import { useOperations } from '@/features/operations/hooks/useOperations';
import RevenueChart from './RevenueChart.jsx';

vi.mock('@/hooks/useDevClock', () => ({ useDevClock: () => ({ data: { now: '2026-11-10T00:00:00Z' } }) }));
vi.mock('@/features/operations/hooks/useOperations', () => ({ useOperations: vi.fn() }));

function renderChart() {
  return render(
    <MemoryRouter>
      <RevenueChart />
    </MemoryRouter>,
  );
}

describe('RevenueChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOperations.mockReturnValue({
      data: [
        {
          period: '2026-11-08T17:00:00Z',
          orderType: 'TripBooking',
          collections: 1200000,
          refunds: 200000,
          netRevenueVnd: 1000000,
        },
        {
          period: '2026-11-08T17:00:00Z',
          orderType: 'Rental',
          collections: 300000,
          refunds: 500000,
          netRevenueVnd: -200000,
        },
      ],
      isPending: false,
      isError: false,
    });
  });

  it('renders real service totals and keeps negative revenue visible below zero', () => {
    renderChart();
    expect(
      screen.getByText(
        (_, element) => element.tagName === 'STRONG' && element.textContent === formatCurrency(800000),
      ),
    ).toBeInTheDocument();
    const negativeBar = screen.getByRole('img', {
      name: /Tuần từ 09\/11\/2026, Thuê thiết bị: -200\.000/,
    });
    expect(Number(negativeBar.getAttribute('height'))).toBeGreaterThan(2);
    const positiveBar = screen.getByRole('img', {
      name: /Tuần từ 09\/11\/2026, Đặt tour: 1\.000\.000/,
    });
    expect(Number(negativeBar.getAttribute('y'))).toBeGreaterThan(Number(positiveBar.getAttribute('y')));
    expect(screen.getByRole('link', { name: 'Báo cáo chi tiết' })).toHaveAttribute(
      'href',
      '/admin/reports?report=revenue&from=2026-10-12&to=2026-11-10&groupBy=week',
    );
  });

  it('switches metrics and requests monthly aggregation for a longer period', async () => {
    const user = userEvent.setup();
    renderChart();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Chỉ số biểu đồ' }), 'refunds');
    expect(
      screen.getByText(
        (_, element) => element.tagName === 'STRONG' && element.textContent === formatCurrency(700000),
      ),
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Khoảng thời gian biểu đồ' }), '180');
    expect(useOperations).toHaveBeenLastCalledWith(
      API_ENDPOINTS.ADMIN.REPORTS.REVENUE,
      expect.objectContaining({ groupBy: 'month' }),
    );
  });

  it('shows an empty state instead of fabricated columns when there are no payments', () => {
    useOperations.mockReturnValue({ data: [], isPending: false, isError: false });
    renderChart();
    expect(screen.getByText('Chưa có giao dịch thành công trong khoảng thời gian này.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('offers a retry when the report request fails', async () => {
    const refetch = vi.fn();
    useOperations.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error('Không tải được báo cáo'),
      refetch,
    });
    renderChart();
    expect(screen.getByText('Không tải được báo cáo')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /thử lại/i }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('switches between chart view and table view', async () => {
    const user = userEvent.setup();
    renderChart();

    // Default is chart view
    expect(screen.getByRole('button', { name: /Biểu đồ/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('img', { name: /Tuần từ 09\/11\/2026, Đặt tour/i })).toBeInTheDocument();

    // Switch to table view
    await user.click(screen.getByRole('button', { name: /Bảng số liệu/i }));
    expect(screen.getByRole('button', { name: /Bảng số liệu/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Kỳ báo cáo')).toBeInTheDocument();
    expect(screen.getByText('Đặt tour (Doanh thu ròng)')).toBeInTheDocument();
    expect(screen.getByText('Thuê thiết bị (Doanh thu ròng)')).toBeInTheDocument();
  });

  it('triggers refetch when the refresh button is clicked', async () => {
    const refetch = vi.fn();
    useOperations.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      isFetching: false,
      refetch,
    });
    const user = userEvent.setup();
    renderChart();

    const refreshBtn = screen.getByRole('button', { name: 'Làm mới dữ liệu' });
    await user.click(refreshBtn);
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('handles PascalCase API properties and non-Monday dates gracefully', () => {
    useOperations.mockReturnValue({
      data: [
        {
          Period: '2026-11-09',
          OrderType: 'TripBooking',
          Collections: 2000000,
          Refunds: 0,
          NetRevenueVnd: 2000000,
        },
        {
          Period: '2026-11-10T08:00:00Z', // Tuesday mid-week date
          OrderType: 'Rental',
          Collections: 1500000,
          Refunds: 300000,
          NetRevenueVnd: 1200000,
        },
      ],
      isPending: false,
      isError: false,
    });
    renderChart();

    // 2,000,000 + 1,200,000 = 3,200,000
    expect(
      screen.getByText(
        (_, element) => element.tagName === 'STRONG' && element.textContent === formatCurrency(3200000),
      ),
    ).toBeInTheDocument();
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import policyService from '../api/policyService';
import RefundPoliciesPage from './RefundPoliciesPage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api/policyService', () => {
  const service = { getRefundPolicies: vi.fn() };
  return { default: service, policyService: service };
});

const paged = (items) => ({
  data: {
    items,
    pageNumber: 1,
    pageSize: 10,
    totalItems: items.length,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  },
});

const POLICY = {
  policyId: 'policy-1',
  policyFamilyId: 'family-1',
  name: 'Chính sách Tour Trekking Tiêu chuẩn',
  description: null,
  policyType: 'Tour',
  version: 2,
  versionsCount: 2,
  effectiveFrom: '2026-01-01',
  effectiveUntil: null,
  status: 'Active',
  displayStatus: 'Active',
  rulesCount: 4,
  tripsCount: 3,
  ordersCount: 5,
  usageCount: 8,
  createdByName: 'Admin Test',
  createdAt: '2026-10-01T03:00:00Z',
};

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <RefundPoliciesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const lastParams = () => policyService.getRefundPolicies.mock.calls.at(-1)[0];

describe('RefundPoliciesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { role: 'Admin' } });
    policyService.getRefundPolicies.mockResolvedValue(paged([POLICY]));
  });

  it('renders rows with rules count, usage and display status', async () => {
    renderPage();
    const row = await screen.findByRole('row', { name: /Chính sách Tour Trekking Tiêu chuẩn/ });
    expect(within(row).getByText('4 mốc')).toBeInTheDocument();
    expect(within(row).getByText(/3 chuyến · 5 đơn/)).toBeInTheDocument();
    expect(within(row).getByText('Đang áp dụng')).toBeInTheDocument();
    expect(within(row).getByText('Admin Test')).toBeInTheDocument();
  });

  it('requests the first page with latestOnly enabled by default', async () => {
    renderPage();
    await screen.findByText('Chính sách Tour Trekking Tiêu chuẩn');
    expect(lastParams()).toMatchObject({ pageNumber: 1, latestOnly: true });
  });

  it('shows the create link to admins', async () => {
    renderPage();
    await screen.findByText('Chính sách Tour Trekking Tiêu chuẩn');
    expect(screen.getByRole('link', { name: /Tạo chính sách/ })).toHaveAttribute('href', '/admin/refund-policies/new');
  });

  it('hides the create link from staff', async () => {
    useAuth.mockReturnValue({ currentUser: { role: 'Staff' } });
    renderPage();
    await screen.findByText('Chính sách Tour Trekking Tiêu chuẩn');
    expect(screen.queryByRole('link', { name: /Tạo chính sách/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tạo chính sách/ })).not.toBeInTheDocument();
  });

  it('sends type, status, search and latestOnly filters to the API', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Chính sách Tour Trekking Tiêu chuẩn');

    await user.type(screen.getByLabelText('Tìm chính sách'), '  Tết ');
    await user.selectOptions(screen.getByLabelText('Loại chính sách'), 'Rental');
    await user.selectOptions(screen.getByLabelText('Trạng thái'), 'Draft');
    await user.click(screen.getByLabelText('Chỉ hiện phiên bản mới nhất'));
    await user.click(screen.getByRole('button', { name: 'Lọc danh sách' }));

    await waitFor(() =>
      expect(lastParams()).toMatchObject({
        search: 'Tết',
        policyType: 'Rental',
        status: 'Draft',
        latestOnly: false,
        pageNumber: 1,
      }),
    );
  });

  it('resets filters back to defaults', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Chính sách Tour Trekking Tiêu chuẩn');
    await user.selectOptions(screen.getByLabelText('Trạng thái'), 'Archived');
    await user.click(screen.getByRole('button', { name: 'Lọc danh sách' }));
    await waitFor(() => expect(lastParams()).toMatchObject({ status: 'Archived' }));
    await user.click(screen.getByRole('button', { name: 'Đặt lại' }));
    await waitFor(() => expect(lastParams().status ?? '').toBe(''));
    expect(lastParams().latestOnly).toBe(true);
  });

  it('shows an empty state when nothing matches', async () => {
    policyService.getRefundPolicies.mockResolvedValue(paged([]));
    renderPage();
    expect(await screen.findByText(/Chưa có chính sách hoàn tiền phù hợp/)).toBeInTheDocument();
  });

  it('shows an error state when the request fails', async () => {
    policyService.getRefundPolicies.mockRejectedValue(new Error('Lỗi máy chủ'));
    renderPage();
    expect(await screen.findByText(/Lỗi máy chủ/)).toBeInTheDocument();
  });
});

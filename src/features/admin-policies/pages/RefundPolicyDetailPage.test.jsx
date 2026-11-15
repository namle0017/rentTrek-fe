import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import policyService from '../api/policyService';
import RefundPolicyDetailPage from './RefundPolicyDetailPage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api/policyService', () => {
  const service = {
    getRefundPolicy: vi.fn(),
    cloneRefundPolicy: vi.fn(),
    activateRefundPolicy: vi.fn(),
    archiveRefundPolicy: vi.fn(),
    deleteRefundPolicy: vi.fn(),
  };
  return { default: service, policyService: service };
});

const FLAGS_OFF = { canEdit: false, canDelete: false, canArchive: false, canActivate: false, canClone: false };

const policy = (overrides = {}) => ({
  policyId: 'policy-1',
  policyFamilyId: 'family-1',
  name: 'Chính sách Tour Tiêu chuẩn',
  description: 'Áp dụng cho tour trekking',
  policyType: 'Tour',
  version: 1,
  versionsCount: 1,
  effectiveFrom: '2026-01-01',
  effectiveUntil: null,
  status: 'Active',
  displayStatus: 'Active',
  tripsCount: 0,
  ordersCount: 0,
  usageCount: 0,
  createdByName: 'Admin Test',
  createdAt: '2026-10-01T03:00:00Z',
  isLocked: false,
  ...FLAGS_OFF,
  rules: [
    { ruleId: 'r1', minHoursBefore: 168, refundPercentage: 100, description: 'Trước 7 ngày' },
    { ruleId: 'r2', minHoursBefore: 24, refundPercentage: 50, description: 'Từ 1 đến 7 ngày' },
    { ruleId: 'r3', minHoursBefore: 0, refundPercentage: 0, description: 'Dưới 24h' },
  ],
  versions: [
    { policyId: 'policy-1', version: 1, displayStatus: 'Active', effectiveFrom: '2026-01-01', effectiveUntil: null, usageCount: 0 },
  ],
  ...overrides,
});

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <MemoryRouter initialEntries={['/admin/refund-policies/policy-1']}>
        <Routes>
          <Route path="/admin/refund-policies" element={<h2>Danh sách chính sách</h2>} />
          <Route path="/admin/refund-policies/:policyId" element={<RefundPolicyDetailPage />} />
          <Route path="/admin/refund-policies/:policyId/edit" element={<h2>Trang chỉnh sửa</h2>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const load = (overrides) => policyService.getRefundPolicy.mockResolvedValue({ data: policy(overrides) });
const button = (name) => screen.queryByRole('button', { name });
const link = (name) => screen.queryByRole('link', { name });

describe('RefundPolicyDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { role: 'Admin' } });
  });

  it('renders header, badge, description, rules and version history', async () => {
    load();
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Chính sách Tour Tiêu chuẩn' })).toBeInTheDocument();
    expect(screen.getByText('Áp dụng cho tour trekking')).toBeInTheDocument();
    expect(screen.getAllByText('Đang áp dụng').length).toBeGreaterThan(0);
    expect(screen.getByText('7 ngày (168 giờ)')).toBeInTheDocument();
    expect(screen.getAllByText('100%').length).toBeGreaterThan(0);
    expect(screen.getByRole('list', { name: 'Lịch sử phiên bản' })).toBeInTheDocument();
    expect(policyService.getRefundPolicy).toHaveBeenCalledWith('policy-1');
  });

  it('shows no action buttons when every can* flag is false', async () => {
    load();
    renderPage();
    await screen.findByRole('heading', { name: 'Chính sách Tour Tiêu chuẩn' });
    expect(link(/Chỉnh sửa/)).not.toBeInTheDocument();
    ['Tạo phiên bản mới', 'Kích hoạt', 'Ngừng áp dụng', 'Xoá'].forEach((name) =>
      expect(button(new RegExp(name))).not.toBeInTheDocument(),
    );
  });

  it.each([
    ['canEdit', 'link', /Chỉnh sửa/],
    ['canClone', 'button', /Tạo phiên bản mới/],
    ['canActivate', 'button', /Kích hoạt/],
    ['canArchive', 'button', /Ngừng áp dụng/],
    ['canDelete', 'button', /^Xoá$/],
  ])('shows only the action for %s', async (flag, role, name) => {
    load({ [flag]: true });
    renderPage();
    await screen.findByRole('heading', { name: 'Chính sách Tour Tiêu chuẩn' });
    expect(screen.getByRole(role, { name })).toBeInTheDocument();
    const total = screen.queryAllByRole('button', { name: /Tạo phiên bản mới|Kích hoạt|Ngừng áp dụng|^Xoá$/ }).length
      + screen.queryAllByRole('link', { name: /Chỉnh sửa/ }).length;
    expect(total).toBe(1);
  });

  it('shows all actions when every flag is true', async () => {
    load({ canEdit: true, canClone: true, canActivate: true, canArchive: true, canDelete: true });
    renderPage();
    await screen.findByRole('heading', { name: 'Chính sách Tour Tiêu chuẩn' });
    expect(link(/Chỉnh sửa/)).toBeInTheDocument();
    expect(button(/Tạo phiên bản mới/)).toBeInTheDocument();
    expect(button(/Kích hoạt/)).toBeInTheDocument();
    expect(button(/Ngừng áp dụng/)).toBeInTheDocument();
    expect(button(/^Xoá$/)).toBeInTheDocument();
  });

  it('shows the lock banner with usage counts when the policy is in use', async () => {
    load({ isLocked: true, tripsCount: 3, ordersCount: 4, canClone: true });
    renderPage();
    const banner = (await screen.findByText(/không thể sửa hoặc xoá/)).closest('[role="status"]');
    expect(banner).toHaveTextContent('3 chuyến đi');
    expect(banner).toHaveTextContent('4 đơn hàng');
    expect(banner).toHaveTextContent(/không thể sửa hoặc xoá/);
  });

  it('hides the lock banner when the policy is not locked', async () => {
    load({ isLocked: false });
    renderPage();
    await screen.findByRole('heading', { name: 'Chính sách Tour Tiêu chuẩn' });
    expect(screen.queryByText(/không thể sửa hoặc xoá/)).not.toBeInTheDocument();
  });

  it('is read-only for staff even when the flags are true', async () => {
    useAuth.mockReturnValue({ currentUser: { role: 'Staff' } });
    load({ canEdit: true, canClone: true, canActivate: true, canArchive: true, canDelete: true });
    renderPage();
    await screen.findByRole('heading', { name: 'Chính sách Tour Tiêu chuẩn' });
    expect(link(/Chỉnh sửa/)).not.toBeInTheDocument();
    ['Tạo phiên bản mới', 'Kích hoạt', 'Ngừng áp dụng', 'Xoá'].forEach((name) =>
      expect(button(new RegExp(name))).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/chế độ chỉ đọc/)).toBeInTheDocument();
  });

  it('deletes only after the confirm dialog is accepted', async () => {
    const user = userEvent.setup();
    load({ canDelete: true });
    policyService.deleteRefundPolicy.mockResolvedValue({ data: null, message: 'ok' });
    renderPage();
    await user.click(await screen.findByRole('button', { name: /^Xoá$/ }));
    expect(policyService.deleteRefundPolicy).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => expect(policyService.deleteRefundPolicy).toHaveBeenCalledWith('policy-1'));
    expect(await screen.findByRole('heading', { name: 'Danh sách chính sách' })).toBeInTheDocument();
  });

  it('does not delete when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    load({ canDelete: true });
    renderPage();
    await user.click(await screen.findByRole('button', { name: /^Xoá$/ }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Hủy' }));
    expect(policyService.deleteRefundPolicy).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('archives after confirmation', async () => {
    const user = userEvent.setup();
    load({ canArchive: true });
    policyService.archiveRefundPolicy.mockResolvedValue({ data: null });
    renderPage();
    await user.click(await screen.findByRole('button', { name: /Ngừng áp dụng/ }));
    expect(policyService.archiveRefundPolicy).not.toHaveBeenCalled();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Ngừng áp dụng' }));
    await waitFor(() => expect(policyService.archiveRefundPolicy).toHaveBeenCalledWith('policy-1'));
  });

  it('activates after confirmation', async () => {
    const user = userEvent.setup();
    load({ canActivate: true, status: 'Draft', displayStatus: 'Draft' });
    policyService.activateRefundPolicy.mockResolvedValue({ data: null });
    renderPage();
    await user.click(await screen.findByRole('button', { name: /Kích hoạt/ }));
    expect(policyService.activateRefundPolicy).not.toHaveBeenCalled();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Áp dụng' }));
    await waitFor(() => expect(policyService.activateRefundPolicy).toHaveBeenCalledWith('policy-1'));
  });

  it('clones and navigates using the GUID returned in the response body', async () => {
    const user = userEvent.setup();
    load({ canClone: true });
    policyService.cloneRefundPolicy.mockResolvedValue({ data: 'new-policy-id', message: 'ok' });
    renderPage();
    await user.click(await screen.findByRole('button', { name: /Tạo phiên bản mới/ }));
    await waitFor(() => expect(policyService.cloneRefundPolicy).toHaveBeenCalledWith('policy-1'));
    expect(await screen.findByRole('heading', { name: 'Trang chỉnh sửa' })).toBeInTheDocument();
  });

  it('shows an error state when the policy cannot be loaded', async () => {
    policyService.getRefundPolicy.mockRejectedValue(new Error('Không tìm thấy chính sách hoàn tiền'));
    renderPage();
    expect(await screen.findByText(/Không tìm thấy chính sách hoàn tiền/)).toBeInTheDocument();
  });
});

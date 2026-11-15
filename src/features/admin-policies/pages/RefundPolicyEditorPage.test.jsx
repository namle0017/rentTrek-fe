import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import policyService from '../api/policyService';
import RefundPolicyEditorPage from './RefundPolicyEditorPage';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api/policyService', () => {
  const service = { getRefundPolicy: vi.fn(), createRefundPolicy: vi.fn(), updateRefundPolicy: vi.fn() };
  return { default: service, policyService: service };
});

const DEFAULT_RULES = [
  { minHoursBefore: 168, refundPercentage: 100 },
  { minHoursBefore: 72, refundPercentage: 70 },
  { minHoursBefore: 24, refundPercentage: 50 },
  { minHoursBefore: 0, refundPercentage: 0 },
];

function renderEditor(path = '/admin/refund-policies/new') {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin/refund-policies" element={<h2>Danh sách chính sách</h2>} />
          <Route path="/admin/refund-policies/new" element={<RefundPolicyEditorPage />} />
          <Route path="/admin/refund-policies/:policyId/edit" element={<RefundPolicyEditorPage />} />
          <Route path="/admin/refund-policies/:policyId" element={<h2>Trang chi tiết chính sách</h2>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const hoursInputs = () => screen.getAllByLabelText(/Huỷ trước khởi hành tối thiểu/);
const percentInputs = () => screen.getAllByLabelText('% hoàn tiền');

async function setValue(user, input, value) {
  await user.clear(input);
  await user.type(input, String(value));
}

const existing = (overrides = {}) => ({
  policyId: 'policy-1',
  name: 'Chính sách cũ',
  description: 'Mô tả cũ',
  policyType: 'Rental',
  version: 1,
  status: 'Draft',
  displayStatus: 'Draft',
  effectiveFrom: '2026-12-01',
  effectiveUntil: '2027-03-01',
  canEdit: true,
  rules: [
    { ruleId: 'r1', minHoursBefore: 48, refundPercentage: 80 },
    { ruleId: 'r2', minHoursBefore: 0, refundPercentage: 0 },
  ],
  ...overrides,
});

describe('RefundPolicyEditorPage (create)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    policyService.createRefundPolicy.mockResolvedValue({ data: 'new-policy-id', message: 'ok' });
  });

  it('submits name, type, description, dates and numeric rules when saving and applying', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.type(screen.getByLabelText(/Tên chính sách/), '  Chính sách mùa lễ  ');
    await user.type(screen.getByLabelText('Mô tả'), 'Mô tả mới');
    await user.click(screen.getByRole('button', { name: 'Lưu & áp dụng' }));

    await waitFor(() => expect(policyService.createRefundPolicy).toHaveBeenCalledTimes(1));
    const payload = policyService.createRefundPolicy.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: 'Chính sách mùa lễ',
      policyType: 'Tour',
      description: 'Mô tả mới',
      effectiveUntil: null,
      saveAsDraft: false,
    });
    expect(payload.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(payload.rules).toEqual(DEFAULT_RULES);
    payload.rules.forEach((rule) => {
      expect(typeof rule.minHoursBefore).toBe('number');
      expect(typeof rule.refundPercentage).toBe('number');
    });
    expect(await screen.findByRole('heading', { name: 'Trang chi tiết chính sách' })).toBeInTheDocument();
  });

  it('saves as draft with saveAsDraft=true', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.type(screen.getByLabelText(/Tên chính sách/), 'Bản nháp');
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));
    await waitFor(() => expect(policyService.createRefundPolicy).toHaveBeenCalledTimes(1));
    expect(policyService.createRefundPolicy.mock.calls[0][0]).toMatchObject({ saveAsDraft: true });
  });

  it('sends effectiveUntil when provided and allows the rental type', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.type(screen.getByLabelText(/Tên chính sách/), 'Thuê đồ');
    await user.selectOptions(screen.getByLabelText(/Loại chính sách/), 'Rental');
    await user.type(screen.getByLabelText(/Ngày kết thúc/), '2099-12-31');
    await user.click(screen.getByRole('button', { name: 'Lưu & áp dụng' }));
    await waitFor(() => expect(policyService.createRefundPolicy).toHaveBeenCalledTimes(1));
    expect(policyService.createRefundPolicy.mock.calls[0][0]).toMatchObject({ policyType: 'Rental', effectiveUntil: '2099-12-31' });
  });

  it('blocks submit and shows an error when the percentage increases toward departure', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.type(screen.getByLabelText(/Tên chính sách/), 'Sai mốc');
    await setValue(user, percentInputs()[2], 90); // 24h = 90% > 72h = 70%
    await user.click(screen.getByRole('button', { name: 'Lưu & áp dụng' }));
    expect(await screen.findByText(/không được cao hơn/)).toBeInTheDocument();
    expect(policyService.createRefundPolicy).not.toHaveBeenCalled();
  });

  it('blocks submit when two rules share the same hours', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.type(screen.getByLabelText(/Tên chính sách/), 'Trùng giờ');
    await setValue(user, hoursInputs()[1], 168);
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));
    expect(await screen.findByText(/bị trùng/)).toBeInTheDocument();
    expect(policyService.createRefundPolicy).not.toHaveBeenCalled();
  });

  it('blocks submit when hours or percentage are out of range', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.type(screen.getByLabelText(/Tên chính sách/), 'Ngoài khoảng');
    await setValue(user, hoursInputs()[3], 9000);
    await setValue(user, percentInputs()[0], 150);
    await user.click(screen.getByRole('button', { name: 'Lưu & áp dụng' }));
    expect(await screen.findByText(/từ 0 đến 8760/)).toBeInTheDocument();
    expect(screen.getByText(/từ 0 đến 100/)).toBeInTheDocument();
    expect(policyService.createRefundPolicy).not.toHaveBeenCalled();
  });

  it('requires a policy name', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByRole('button', { name: 'Lưu & áp dụng' }));
    expect(await screen.findByText('Vui lòng nhập tên chính sách')).toBeInTheDocument();
    expect(policyService.createRefundPolicy).not.toHaveBeenCalled();
  });

  it('requires at least one rule', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.type(screen.getByLabelText(/Tên chính sách/), 'Không mốc');
    // Xoá lần lượt tới khi nút xoá bị khoá (tối thiểu 1 mốc); luôn còn >= 1 mốc nên không thể gửi rỗng.
    for (let i = 0; i < 3; i += 1) {
      await user.click(screen.getAllByRole('button', { name: /Xoá mốc/ })[0]);
    }
    expect(screen.getAllByRole('button', { name: /Xoá mốc/ })[0]).toBeDisabled();
    expect(hoursInputs()).toHaveLength(1);
  });

  it('adds and removes rules', async () => {
    const user = userEvent.setup();
    renderEditor();
    expect(hoursInputs()).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: /Thêm mốc/ }));
    expect(hoursInputs()).toHaveLength(5);
    await user.click(screen.getByRole('button', { name: 'Xoá mốc 5' }));
    expect(hoursInputs()).toHaveLength(4);
  });
});

describe('RefundPolicyEditorPage (edit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    policyService.updateRefundPolicy.mockResolvedValue({ data: null, message: 'ok' });
  });

  it('prefills the form and locks the policy type', async () => {
    policyService.getRefundPolicy.mockResolvedValue({ data: existing() });
    renderEditor('/admin/refund-policies/policy-1/edit');
    expect(await screen.findByDisplayValue('Chính sách cũ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mô tả cũ')).toBeInTheDocument();
    expect(screen.getByLabelText(/Loại chính sách/)).toBeDisabled();
    expect(hoursInputs()).toHaveLength(2);
    expect(policyService.getRefundPolicy).toHaveBeenCalledWith('policy-1');
  });

  it('redirects to the detail page when the policy cannot be edited', async () => {
    policyService.getRefundPolicy.mockResolvedValue({ data: existing({ canEdit: false, isLocked: true }) });
    renderEditor('/admin/refund-policies/policy-1/edit');
    expect(await screen.findByRole('heading', { name: 'Trang chi tiết chính sách' })).toBeInTheDocument();
  });

  it('updates with the description and rules in the payload', async () => {
    const user = userEvent.setup();
    policyService.getRefundPolicy.mockResolvedValue({ data: existing() });
    renderEditor('/admin/refund-policies/policy-1/edit');
    const description = await screen.findByDisplayValue('Mô tả cũ');
    await user.clear(description);
    await user.type(description, 'Mô tả đã sửa');
    await setValue(user, percentInputs()[0], 60);
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(policyService.updateRefundPolicy).toHaveBeenCalledTimes(1));
    const [id, payload] = policyService.updateRefundPolicy.mock.calls[0];
    expect(id).toBe('policy-1');
    expect(payload).toMatchObject({ name: 'Chính sách cũ', policyType: 'Rental', description: 'Mô tả đã sửa', effectiveUntil: '2027-03-01' });
    expect(payload.rules).toEqual([
      { minHoursBefore: 48, refundPercentage: 60 },
      { minHoursBefore: 0, refundPercentage: 0 },
    ]);
    expect(await screen.findByRole('heading', { name: 'Trang chi tiết chính sách' })).toBeInTheDocument();
  });

  it('rejects an end date that is not after the start date', async () => {
    const user = userEvent.setup();
    policyService.getRefundPolicy.mockResolvedValue({ data: existing() });
    renderEditor('/admin/refund-policies/policy-1/edit');
    const until = await screen.findByLabelText(/Ngày kết thúc/);
    await user.clear(until);
    await user.type(until, '2026-12-01');
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByText('Ngày kết thúc phải sau ngày bắt đầu')).toBeInTheDocument();
    expect(policyService.updateRefundPolicy).not.toHaveBeenCalled();
  });
});

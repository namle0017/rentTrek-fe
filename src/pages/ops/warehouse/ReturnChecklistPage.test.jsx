import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fulfillmentService } from './api/fulfillmentService';
import ReturnChecklistPage from './ReturnChecklistPage';

vi.mock('./api/fulfillmentService', () => ({
  fulfillmentService: {
    getReturnChecklist: vi.fn(),
    scanReturn: vi.fn(),
    reportLostAsset: vi.fn(),
    completeReturn: vi.fn(),
  },
}));
vi.mock('./utils/soundHelper', () => ({ playSuccessBeep: vi.fn(), playErrorBuzz: vi.fn() }));

const checklist = {
  orderCode: 'RT-202611-001',
  customerName: 'Khách nhận lại',
  orderStatus: 'InFulfillment',
  rentalEndAt: '2026-11-10T10:00:00Z',
  totalIssuedCount: 2,
  returnedCount: 1,
  items: [
    {
      assignmentId: 'a-1',
      equipmentAssetId: 'e-1',
      assetCode: 'TENT-001',
      productName: 'Lều cắm trại',
      variantName: '2 người',
      status: 'Returned',
      returnCondition: 'Normal',
    },
    {
      assignmentId: 'a-2',
      equipmentAssetId: 'e-2',
      assetCode: 'TENT-002',
      productName: 'Lều cắm trại',
      variantName: '2 người',
      status: 'Issued',
    },
  ],
};
function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <ReturnChecklistPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
describe('ReturnChecklistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fulfillmentService.getReturnChecklist.mockResolvedValue({ data: checklist });
  });
  it('identifies the return table and keeps each asset and its actions in the same row', async () => {
    renderPage();
    await screen.findByText('Khách nhận lại');
    const table = screen.getByRole('table', { name: 'Thiết bị cần thu hồi' });
    const row = within(table)
      .getByRole('rowheader', { name: /TENT-002/ })
      .closest('tr');
    expect(within(row).getByRole('button', { name: 'Nhận lại' })).toBeInTheDocument();
    expect(within(row).getByText('Chờ nhận lại')).toBeInTheDocument();
  });
  it('does not complete a return with outstanding assets', async () => {
    renderPage();
    await screen.findByText('Khách nhận lại');
    expect(screen.getByRole('button', { name: /Hoàn tất thu hồi|hoàn tất thu hồi/ })).toBeDisabled();
  });
  it('does not reopen inspection for a device that has already been returned', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Khách nhận lại');
    await user.type(screen.getByPlaceholderText(/Quét mã barcode thiết bị cần nhận lại/), 'TENT-001');
    await user.click(screen.getByRole('button', { name: /Kiểm tra/ }));
    expect(screen.queryByText('Kiểm tra tình trạng thiết bị nhận lại')).not.toBeInTheDocument();
    expect(screen.getByText(/TENT-001 đã được xử lý/)).toBeInTheDocument();
  });
  it('opens an accessible inspection form for the selected outstanding asset', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Khách nhận lại');
    await user.click(screen.getByRole('button', { name: 'Nhận lại' }));
    const dialog = screen.getByRole('dialog', { name: 'Kiểm tra tình trạng thiết bị nhận lại' });
    expect(within(dialog).getByText('TENT-002')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Tình trạng thiết bị')).toHaveValue('Normal');
  });

  it('requires valid damage fee details and submits the selected device and inspection result', async () => {
    const user = userEvent.setup();
    fulfillmentService.scanReturn.mockResolvedValue({ data: {} });
    renderPage();
    await screen.findByText('Khách nhận lại');
    await user.click(screen.getByRole('button', { name: 'Nhận lại' }));
    await user.selectOptions(screen.getByLabelText('Tình trạng thiết bị'), 'Damaged');
    await user.click(screen.getByRole('checkbox', { name: /Tạo phụ phí/ }));
    const confirm = screen.getByRole('button', { name: 'Xác nhận nhận đồ' });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText('Số tiền (VNĐ)'), '150000');
    await user.type(screen.getByLabelText('Lý do phụ phí'), 'Rách vải lều');
    await user.click(confirm);
    await waitFor(() =>
      expect(fulfillmentService.scanReturn).toHaveBeenCalledWith('RT-202611-001', {
        assetCode: 'TENT-002',
        returnCondition: 'Damaged',
        conditionNote: null,
        createDamageCharge: true,
        damageChargeAmount: 150000,
        damageReason: 'Rách vải lều',
      }),
    );
  });
});

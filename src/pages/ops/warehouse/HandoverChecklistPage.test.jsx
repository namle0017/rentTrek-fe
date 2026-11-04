import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fulfillmentService } from './api/fulfillmentService';
import HandoverChecklistPage from './HandoverChecklistPage';

vi.mock('./api/fulfillmentService', () => ({
  fulfillmentService: {
    getHandoverChecklist: vi.fn(),
    scanHandover: vi.fn(),
    completeHandover: vi.fn(),
  },
}));

vi.mock('./utils/soundHelper', () => ({ playSuccessBeep: vi.fn(), playErrorBuzz: vi.fn() }));

const checklist = {
  orderCode: 'RT-202611-001',
  customerName: 'Khách kiểm thử',
  rentalStartAt: '2026-11-08T06:00:00Z',
  rentalEndAt: '2026-11-09T18:00:00Z',
  orderStatus: 'Confirmed',
  totalRequiredCount: 2,
  scannedCount: 1,
  items: [
    {
      rentalOrderItemId: 'item-1',
      productName: 'Lều',
      variantName: '2 người',
      variantSku: 'TENT-2',
      quantityRequired: 2,
      scannedCount: 1,
      scannedAssets: [],
    },
  ],
};

function CurrentPath() {
  return <output aria-label="Đường dẫn hiện tại">{useLocation().pathname}</output>;
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/ops/rentals/handover']}>
        <CurrentPath />
        <Routes>
          <Route path="/ops/rentals/handover" element={<HandoverChecklistPage />} />
          <Route path="/ops/rentals/:orderCode/handover" element={<HandoverChecklistPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('HandoverChecklistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fulfillmentService.getHandoverChecklist.mockResolvedValue({ data: checklist });
    fulfillmentService.completeHandover.mockResolvedValue({ data: {} });
  });

  it('keeps the current order while entering a different code and looks it up on submit', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Khách kiểm thử');
    const lookup = screen.getByPlaceholderText(/Nhập mã đơn/);
    await user.clear(lookup);
    await user.type(lookup, 'RT-202611-002');
    expect(
      fulfillmentService.getHandoverChecklist.mock.calls.every(([code]) => code === 'RT-202611-001'),
    ).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Tìm đơn' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Đường dẫn hiện tại')).toHaveTextContent(
        '/ops/rentals/RT-202611-002/handover',
      ),
    );
  });

  it('disables scanning and completion after the order has already been handed over', async () => {
    fulfillmentService.getHandoverChecklist.mockResolvedValue({
      data: { ...checklist, orderStatus: 'InFulfillment' },
    });
    renderPage();
    await screen.findByText('Khách kiểm thử');
    expect(screen.getByPlaceholderText(/Quét mã barcode thiết bị/)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Đã bàn giao|Đơn đã bàn giao/ })).toBeDisabled();
  });

  it('updates progress and returns focus to the barcode field after a successful scan', async () => {
    const user = userEvent.setup();
    fulfillmentService.scanHandover.mockImplementation(async () => {
      fulfillmentService.getHandoverChecklist.mockResolvedValue({ data: { ...checklist, scannedCount: 2 } });
      return { data: {} };
    });
    renderPage();
    await screen.findByText('Khách kiểm thử');
    const barcode = screen.getByLabelText('Mã barcode thiết bị');
    await user.type(barcode, 'TENT-002');
    await user.click(screen.getByRole('button', { name: 'Xác nhận quét' }));
    await waitFor(() => expect(screen.getByRole('progressbar', { name: 'Tiến độ bàn giao' })).toHaveAttribute('aria-valuenow', '100'));
    expect(barcode).toHaveValue('');
    expect(barcode).toHaveFocus();
    expect(screen.getByText('Đã ghi nhận thiết bị TENT-002.')).toBeInTheDocument();
  });

  it('requires a reason in an accessible dialog before handing over an incomplete order', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Khách kiểm thử');
    await user.click(screen.getByRole('button', { name: /Hoàn tất bàn giao/ }));
    expect(screen.getByRole('dialog', { name: 'Xác nhận bàn giao thiếu thiết bị' })).toBeInTheDocument();
    const confirm = screen.getByRole('button', { name: 'Xác nhận giao thiếu' });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText('Lý do bàn giao thiếu'), 'Khách không cần thiết bị còn lại');
    await user.click(confirm);
    await waitFor(() =>
      expect(fulfillmentService.completeHandover).toHaveBeenCalledWith('RT-202611-001', {
        incompleteReason: 'Khách không cần thiết bị còn lại',
      }),
    );
  });
});

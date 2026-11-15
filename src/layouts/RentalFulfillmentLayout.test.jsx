import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import axiosClient from '@/api/axiosClient';
import RentalFulfillmentLayout from './RentalFulfillmentLayout';

vi.mock('@/api/axiosClient', () => ({ default: { get: vi.fn() } }));

const listItem = (overrides) => ({
  orderId: overrides.orderCode,
  customerName: 'Nguyễn A',
  status: 'InFulfillment',
  rentalStartAt: '2026-11-10T02:00:00Z',
  rentalEndAt: '2026-11-12T02:00:00Z',
  assetsCount: 2,
  issuedCount: 0,
  returnedCount: 0,
  draftChargesCount: 0,
  isOverdue: false,
  ...overrides,
});

function Step({ label }) {
  const { orderCode } = useParams();
  return (
    <h1>
      {label}: {orderCode || 'RT-202611-001'}
    </h1>
  );
}
function renderLayout(path) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<RentalFulfillmentLayout />}>
            <Route path="/ops/rentals/:orderCode/handover" element={<Step label="Giao" />} />
            <Route path="/ops/rentals/:orderCode/return" element={<Step label="Nhận" />} />
            <Route path="/ops/rentals/return" element={<Step label="Nhận" />} />
            <Route path="/ops/rentals/:orderCode/settlement" element={<Step label="Quyết toán" />} />
            <Route path="/ops/rentals/settlement" element={<Step label="Quyết toán" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
describe('RentalFulfillmentLayout', () => {
  it('lists orders still holding equipment on the return step and opens one', async () => {
    axiosClient.get.mockResolvedValue({
      data: {
        items: [
          listItem({ orderCode: 'RT-LATE', issuedCount: 2, isOverdue: true }),
          listItem({ orderCode: 'RT-DONE', issuedCount: 0, returnedCount: 2 }),
        ],
      },
    });
    const user = userEvent.setup();
    renderLayout('/ops/rentals/return');

    expect(await screen.findByText('RT-LATE')).toBeInTheDocument();
    expect(screen.queryByText('RT-DONE')).not.toBeInTheDocument();
    expect(screen.getByText('Quá hạn trả')).toBeInTheDocument();
    expect(axiosClient.get).toHaveBeenCalledWith('/admin/rental-orders', {
      params: { status: 'InFulfillment', pageSize: 100, pageNumber: 1 },
    });

    await user.click(screen.getByText('RT-LATE'));
    expect(screen.getByRole('heading', { name: 'Nhận: RT-LATE' })).toBeInTheDocument();
  });

  it('shows fully returned and awaiting-settlement orders on the settlement step', async () => {
    axiosClient.get.mockImplementation((_url, { params }) =>
      Promise.resolve({
        data: {
          items:
            params.status === 'AwaitingSettlement'
              ? [listItem({ orderCode: 'RT-OWES', status: 'AwaitingSettlement', returnedCount: 2 })]
              : [
                  listItem({ orderCode: 'RT-RETURNED', returnedCount: 2, draftChargesCount: 1 }),
                  listItem({ orderCode: 'RT-OUT', issuedCount: 1, returnedCount: 1 }),
                ],
        },
      }),
    );
    renderLayout('/ops/rentals/settlement');

    expect(await screen.findByText('RT-RETURNED')).toBeInTheDocument();
    expect(screen.getByText('RT-OWES')).toBeInTheDocument();
    expect(screen.queryByText('RT-OUT')).not.toBeInTheDocument();
    expect(screen.getByText('1 phí nháp')).toBeInTheDocument();
  });

  it('preserves the selected order when navigating between all three operations', async () => {
    const user = userEvent.setup();
    renderLayout('/ops/rentals/ORDER-42/handover');
    await user.click(screen.getByRole('link', { name: 'Nhận lại thiết bị' }));
    expect(screen.getByRole('heading', { name: 'Nhận: ORDER-42' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nhận lại thiết bị' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('link', { name: 'Phí & hoàn cọc' }));
    expect(screen.getByRole('heading', { name: 'Quyết toán: ORDER-42' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Tìm đơn' })).toHaveLength(1);
  });
  it('looks up another order without leaving the current operation', async () => {
    const user = userEvent.setup();
    axiosClient.get.mockResolvedValue({ data: { items: [] } });
    renderLayout('/ops/rentals/return');
    const input = screen.getByLabelText('Mã đơn thuê');
    await user.clear(input);
    await user.type(input, 'ORDER-67');
    await user.click(screen.getByRole('button', { name: 'Tìm đơn' }));
    expect(screen.getByRole('heading', { name: 'Nhận: ORDER-67' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Giao thiết bị' })).toHaveAttribute(
      'href',
      '/ops/rentals/ORDER-67/handover',
    );
    expect(screen.getByLabelText('Mã đơn thuê')).toHaveValue('ORDER-67');
  });
});

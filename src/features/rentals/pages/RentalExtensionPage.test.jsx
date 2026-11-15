import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RentalExtensionPage from './RentalExtensionPage';
import {
  useExtendRentalOrder,
  useRentalAdjustments,
  useRentalExtensionQuote,
  useRentalOrder,
} from '../hooks/useRentals';

vi.mock('../hooks/useRentals', () => ({
  useRentalOrder: vi.fn(),
  useRentalExtensionQuote: vi.fn(),
  useExtendRentalOrder: vi.fn(),
  useRentalAdjustments: vi.fn(),
}));

vi.mock('../components/RentalPaymentPanel', () => ({
  default: ({ title }) => <section aria-label="payment-panel">{title}</section>,
}));

const DAY = 86400000;
const now = Date.now();
const baseOrder = {
  id: 'rent-ord-001',
  orderCode: 'RT-ORD-202611-001',
  status: 'InFulfillment',
  paymentStatus: 'Paid',
  rentalStartAt: new Date(now - DAY).toISOString(),
  rentalEndAt: new Date(now + 2 * DAY).toISOString(),
  billableDays: 3,
  rentalPolicy: { extensionMaxDaysLate: 2 },
  allowedActions: { canExtend: true, canPayAdditional: false },
  pendingAdditionalPayment: null,
};

const quote = {
  orderId: 'rent-ord-001',
  oldBillableDays: 3,
  newBillableDays: 4,
  extraAmount: 150000,
  lines: [
    {
      rentalOrderItemId: 'item-1',
      displayName: 'Lều cắm trại 4 người',
      quantity: 1,
      oldBillableDays: 3,
      newBillableDays: 4,
      oldDailyPrice: 150000,
      newDailyPrice: 150000,
      oldLineAmount: 450000,
      newLineAmount: 600000,
    },
  ],
};

describe('RentalExtensionPage', () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useRentalOrder.mockReturnValue({ data: baseOrder, isLoading: false, isError: false, refetch: vi.fn() });
    useRentalExtensionQuote.mockReturnValue({ data: quote, isFetching: false, isError: false, refetch: vi.fn() });
    useExtendRentalOrder.mockReturnValue({ mutateAsync, isPending: false, isError: false, reset: vi.fn() });
    useRentalAdjustments.mockReturnValue({ data: [] });
    mutateAsync.mockResolvedValue({ data: { adjustment: { extraAmount: 150000 } } });
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/rental-orders/rent-ord-001/extend']}>
        <Routes>
          <Route path="/rental-orders/:orderId/extend" element={<RentalExtensionPage />} />
          <Route path="/rental-orders/:orderId" element={<p>detail page</p>} />
        </Routes>
      </MemoryRouter>,
    );

  it('shows the recalculated lines and requires consent before confirming a paid extension', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole('heading', { name: 'Gia hạn thời gian thuê' })).toBeInTheDocument();
    expect(screen.getByText(/Lều cắm trại 4 người/)).toBeInTheDocument();
    expect(screen.getByText('3 → 4 ngày (+1)')).toBeInTheDocument();

    const confirm = screen.getByRole('button', { name: 'Xác nhận & thanh toán' });
    expect(confirm).toBeDisabled();

    await user.click(screen.getByRole('checkbox'));
    await user.click(confirm);

    expect(mutateAsync).toHaveBeenCalledWith({
      orderId: 'rent-ord-001',
      payload: { newEndAt: expect.any(String), acceptedExtraAmount: 150000 },
    });
  });

  it('confirms a free extension without consent and returns to the order', async () => {
    const user = userEvent.setup();
    useRentalExtensionQuote.mockReturnValue({
      data: { ...quote, extraAmount: 0 },
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });
    mutateAsync.mockResolvedValue({ data: { adjustment: { extraAmount: 0 } } });
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Xác nhận gia hạn' }));

    expect(await screen.findByText('detail page')).toBeInTheDocument();
  });

  it('explains why the order cannot be extended', () => {
    useRentalOrder.mockReturnValue({
      data: { ...baseOrder, status: 'Completed', allowedActions: { canExtend: false } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    renderPage();

    expect(screen.getByRole('heading', { name: 'Đơn này chưa gia hạn được' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Xác nhận/ })).not.toBeInTheDocument();
  });

  it('resumes at the payment step when an extension payment is pending', () => {
    useRentalOrder.mockReturnValue({
      data: {
        ...baseOrder,
        allowedActions: { canExtend: false, canPayAdditional: true },
        pendingAdditionalPayment: { id: 'pay-ext', amount: 150000, purpose: 'RentalExtension' },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    renderPage();

    expect(screen.getByRole('region', { name: 'payment-panel' })).toHaveTextContent('Thanh toán tiền gia hạn');
    expect(screen.getByRole('heading', { name: 'Yêu cầu gia hạn đang chờ thanh toán' })).toBeInTheDocument();
  });
});

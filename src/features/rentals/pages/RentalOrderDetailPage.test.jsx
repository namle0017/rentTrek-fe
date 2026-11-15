import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RentalOrderDetailPage from './RentalOrderDetailPage';
import { useRentalAdjustments, useRentalOrder } from '../hooks/useRentals';

vi.mock('../hooks/useRentals', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRentalOrder: vi.fn(),
    useRentalAdjustments: vi.fn(),
    useReportRentalIssue: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
    useConfirmRentalReceipt: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  };
});

vi.mock('@/features/customer-reports/hooks/useCustomerReports', () => ({
  useMyCustomerReports: vi.fn().mockReturnValue({ data: [] }),
}));

const mockPaidOrder = {
  id: 'rent-ord-001',
  orderCode: 'RT-ORD-202611-001',
  status: 'InFulfillment',
  paymentStatus: 'Paid',
  rentalStartAt: '2026-11-20T08:00:00Z',
  rentalEndAt: '2026-11-22T18:00:00Z',
  billableDays: 2,
  lines: [
    {
      id: 'item-1',
      displayName: 'Lều cắm trại 4 người Eureka',
      quantity: 1,
      dailyPrice: 150000,
      billableDays: 2,
      lineAmount: 300000,
    },
  ],
  amounts: {
    subtotalAmount: 300000,
    discountAmount: 0,
    depositAmount: 0,
    totalPayable: 300000,
    paidAmount: 300000,
    refundedAmount: 300000,
  },
  refundPolicy: { name: 'Chính sách hoàn tiền tiêu chuẩn', version: 'v1.0' },
  payments: [
    {
      id: 'pay-1',
      paymentType: 'Refund',
      status: 'Succeeded',
      amount: 300000,
      createdAt: '2026-11-14T09:00:00Z',
      providerTransactionId: 'FT261114009#proof=https://storage.vn/receipt-rent.jpg',
    },
  ],
  allowedActions: { canPay: false, canCancel: false },
};

describe('RentalOrderDetailPage', () => {
  const refetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useRentalAdjustments.mockReturnValue({ data: [] });
    useRentalOrder.mockReturnValue({
      data: mockPaidOrder,
      isLoading: false,
      isError: false,
      refetch,
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={['/rentals/orders/rent-ord-001']}>
        <Routes>
          <Route path="/rentals/orders/:orderId" element={<RentalOrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders order code, equipment items and issue report button when paid', () => {
    renderComponent();

    expect(screen.getAllByText(/RT-ORD-202611-001/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Lều cắm trại 4 người Eureka/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Báo cáo đồ lỗi \/ sự cố/i })
    ).toBeInTheDocument();
  });

  it('opens issue report modal when clicking issue report button', async () => {
    const user = userEvent.setup();
    renderComponent();

    const reportBtn = screen.getByRole('button', { name: /Báo cáo đồ lỗi \/ sự cố/i });
    await user.click(reportBtn);

    expect(
      screen.getByRole('dialog', { name: /Báo cáo đồ thuê bị lỗi \/ hư hại/i })
    ).toBeInTheDocument();
  });

  it('no longer parses receipts out of the transaction id (proofs live in the refund progress card)', () => {
    renderComponent();
    expect(screen.queryByRole('button', { name: /Xem biên lai hoàn tiền/i })).not.toBeInTheDocument();
  });

  it('hides the extension history when there are no adjustments', () => {
    renderComponent();
    expect(screen.queryByText('Lịch sử gia hạn')).not.toBeInTheDocument();
  });

  it('shows a read-only extension history when adjustments exist', () => {
    useRentalAdjustments.mockReturnValue({
      data: [
        {
          id: 'adj-1',
          oldEndAt: '2026-11-10T02:00:00Z',
          newEndAt: '2026-11-12T02:00:00Z',
          extraAmount: 150000,
          requestedByName: 'Nguyễn Văn A',
        },
      ],
    });
    renderComponent();
    expect(screen.getByRole('heading', { name: 'Lịch sử gia hạn' })).toBeInTheDocument();
    expect(screen.getByText(/Nguyễn Văn A/)).toBeInTheDocument();
  });
});

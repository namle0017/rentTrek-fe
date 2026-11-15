import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RentalOrderDetailPage from './RentalOrderDetailPage';
import { useRentalOrder } from '../hooks/useRentals';

vi.mock('../hooks/useRentals', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRentalOrder: vi.fn(),
    useReportRentalIssue: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
    useConfirmRentalReceipt: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  };
});

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

  it('renders refund receipt button and opens lightbox zoom on click', async () => {
    const user = userEvent.setup();
    renderComponent();

    const proofBtn = screen.getByRole('button', { name: /Xem biên lai hoàn tiền/i });
    expect(proofBtn).toBeInTheDocument();

    await user.click(proofBtn);

    expect(screen.getByRole('dialog', { name: /Xem biên lai hoàn tiền/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mở ảnh gốc/i })).toHaveAttribute(
      'href',
      'https://storage.vn/receipt-rent.jpg'
    );
  });
});

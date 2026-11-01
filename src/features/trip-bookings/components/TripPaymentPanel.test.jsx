import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreatePayment, usePaymentStatus } from '@/features/orders/hooks/useOrders';
import TripPaymentPanel from './TripPaymentPanel';

vi.mock('@/features/orders/hooks/useOrders', () => ({
  useCreatePayment: vi.fn(),
  usePaymentStatus: vi.fn(),
}));

const payment = {
  paymentId: 'pay-1',
  orderCode: 'RT-001',
  amount: 3000000,
  bankTransfer: {
    bankName: 'MBBank',
    accountNumber: '0123456789',
    accountName: 'RENTREK',
    transferContent: 'RTPABCDEF0123456789',
    qrImageUrl: 'https://qr.sepay.vn/img?acc=0123456789',
  },
};

describe('TripPaymentPanel', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCreatePayment.mockReturnValue({ mutate, isPending: false, isError: false });
    usePaymentStatus.mockReturnValue({ data: undefined });
  });

  it('creates the bank-transfer payment as soon as it mounts', () => {
    render(<TripPaymentPanel orderId="order-1" />);

    expect(mutate).toHaveBeenCalledWith('order-1');
    expect(screen.getByText('Đang tạo mã QR...')).toBeInTheDocument();
  });

  it('lets the user retry when creating the payment fails', async () => {
    useCreatePayment.mockReturnValue({ mutate, isPending: false, isError: true, error: { message: 'Lỗi' } });
    render(<TripPaymentPanel orderId="order-1" />);
    mutate.mockClear();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(mutate).toHaveBeenCalledWith('order-1');
  });

  it('shows the QR from the backend and keeps waiting while pending', () => {
    const onSettled = vi.fn();
    useCreatePayment.mockReturnValue({ mutate, data: { data: payment }, isPending: false });
    usePaymentStatus.mockReturnValue({ data: { status: 'Pending', orderPaymentStatus: 'Unpaid' } });

    render(<TripPaymentPanel orderId="order-1" onSettled={onSettled} />);

    expect(screen.getByRole('img')).toHaveAttribute('src', payment.bankTransfer.qrImageUrl);
    expect(screen.getAllByText('RTPABCDEF0123456789').length).toBeGreaterThan(0);
    expect(usePaymentStatus).toHaveBeenCalledWith('order-1', 'pay-1');
    expect(onSettled).not.toHaveBeenCalled();
  });

  it('shows the failure reason and lets the user create a new QR', async () => {
    useCreatePayment.mockReturnValue({ mutate, data: { data: payment }, isPending: false });
    usePaymentStatus.mockReturnValue({
      data: { status: 'Failed', orderPaymentStatus: 'Unpaid', failureReason: 'Sai số tiền.' },
    });

    render(<TripPaymentPanel orderId="order-1" />);
    mutate.mockClear();

    expect(screen.getByRole('alert')).toHaveTextContent('Sai số tiền.');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tạo lại mã QR' }));
    expect(mutate).toHaveBeenCalledWith('order-1');
  });

  it.each([
    [{ status: 'Succeeded', orderPaymentStatus: 'Paid' }],
    [{ status: 'Pending', orderPaymentStatus: 'NeedsReconciliation' }],
  ])('reloads the booking once the payment settles: %o', (status) => {
    const onSettled = vi.fn();
    useCreatePayment.mockReturnValue({ mutate, data: { data: payment }, isPending: false });
    usePaymentStatus.mockReturnValue({ data: status });

    render(<TripPaymentPanel orderId="order-1" onSettled={onSettled} />);

    expect(onSettled).toHaveBeenCalled();
  });
});

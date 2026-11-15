import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rentalService } from '../api/rentalService';
import RentalPaymentPanel from './RentalPaymentPanel';

vi.mock('../api/rentalService', () => ({ rentalService: { createPayment: vi.fn(), getPaymentStatus: vi.fn() } }));
const payment = { paymentId: 'payment-1', orderCode: 'RT-1', status: 'Pending', amount: 200000, bankTransfer: { bankName: 'Test Bank', accountNumber: '0000000000', accountName: 'DEMO', transferContent: 'RTP123', qrImageUrl: '/test-qr.png' } };
const renderPanel = (onSettled = vi.fn()) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><RentalPaymentPanel orderId="order-1" onSettled={onSettled} /></QueryClientProvider>);
describe('rental payment API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rentalService.createPayment.mockResolvedValue({ data: payment });
    rentalService.getPaymentStatus.mockResolvedValue({ data: { paymentId: 'payment-1', status: 'Pending', orderPaymentStatus: 'Unpaid' } });
  });
  it('creates a bank transfer and displays only the API-provided amount, reference and QR', async () => {
    renderPanel();
    expect(await screen.findByAltText('VietQR thanh toán đơn RT-1')).toHaveAttribute('src', '/test-qr.png');
    expect(rentalService.createPayment).toHaveBeenCalledWith('order-1', undefined);
    expect(await screen.findByText('RTP123')).toBeInTheDocument();
    expect(screen.queryByText('Đã thanh toán')).not.toBeInTheDocument();
  });
  it('refreshes the order only after the status API confirms payment', async () => {
    rentalService.getPaymentStatus.mockResolvedValue({ data: { paymentId: 'payment-1', status: 'Succeeded', orderPaymentStatus: 'Paid' } });
    const settled = vi.fn(); renderPanel(settled);
    expect(await screen.findByText('Đã thanh toán')).toBeInTheDocument();
    await waitFor(() => expect(settled).toHaveBeenCalledTimes(1));
  });
  it('clearly marks demo mode and never renders a transferable QR or paid outcome', async () => {
    rentalService.createPayment.mockResolvedValue({ data: { ...payment, isDemo: true, bankTransfer: { ...payment.bankTransfer, qrImageUrl: null } } });
    const settled = vi.fn(); renderPanel(settled);
    expect(await screen.findByText('DEMO — KHÔNG CHUYỂN TIỀN THẬT')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText('Đã thanh toán')).not.toBeInTheDocument();
    expect(settled).not.toHaveBeenCalled();
  });
});

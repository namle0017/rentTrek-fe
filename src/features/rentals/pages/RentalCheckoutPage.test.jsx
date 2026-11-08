import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rentalService } from '../api/rentalService';
import { rentalCartActions } from '../hooks/useRentalCart';
import RentalCheckoutPage from './RentalCheckoutPage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true, currentUser: { userId: 'user-1', fullName: 'Nguyễn An', phone: '0901234567' } }) }));
vi.mock('../api/rentalService', () => ({ rentalService: { quote: vi.fn(), create: vi.fn() } }));
const quote = { billableDays: 2, lines: [{ index: 0, displayName: 'Lều 2 người', quantity: 1, dailyPrice: 100000, lineAmount: 200000, isAvailable: true }], subtotalAmount: 200000, discountAmount: 0, depositAmount: 0, totalPayable: 200000, totalAmount: 200000, isAllAvailable: true, holdMinutes: 15, refundPolicy: { name: 'Chính sách thuê', version: 2, rules: [{ minHoursBefore: 24, refundPercentage: 100 }] } };
const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><MemoryRouter initialEntries={['/rental-checkout']}><Routes><Route path="/rental-checkout" element={<RentalCheckoutPage />} /><Route path="/rental-orders/:orderId" element={<output>Đã đến trang thanh toán</output>} /></Routes></MemoryRouter></QueryClientProvider>);
describe('rental checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks(); sessionStorage.clear(); rentalCartActions.clear();
    rentalCartActions.setPeriod({ start: '2099-01-01T09:00', end: '2099-01-03T09:00' });
    rentalCartActions.add({ key: 'variant-1', productVariantId: 'variant-1', productId: 'product-1', name: 'Lều 2 người', quantity: 1 });
    rentalService.quote.mockResolvedValue({ data: structuredClone(quote) });
    rentalService.create.mockResolvedValue({ data: { id: 'order-1' } });
  });
  it('requires policy consent, sends the server policy version and opens payment after creating the order', async () => {
    const user = userEvent.setup(); renderPage();
    const submit = screen.getByRole('button', { name: 'Xác nhận đơn & thanh toán VietQR' });
    expect(submit).toBeDisabled();
    await user.click(await screen.findByRole('checkbox'));
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);
    expect(await screen.findByText('Đã đến trang thanh toán')).toBeInTheDocument();
    const [payload, key] = rentalService.create.mock.calls[0];
    expect(payload).toMatchObject({ acceptedRefundPolicyVersion: 2, pickup: { method: 'Store', receiverName: 'Nguyễn An', receiverPhone: '0901234567' }, items: [{ productVariantId: 'variant-1', quantity: 1 }] });
    expect(payload).not.toHaveProperty('totalAmount');
    expect(key).toMatch(/^[a-f0-9-]{36}$/i);
  });
  it('blocks checkout for unavailable inventory', async () => {
    rentalService.quote.mockResolvedValue({ data: { ...quote, isAllAvailable: false } });
    const user = userEvent.setup(); renderPage();
    await user.click(await screen.findByRole('checkbox'));
    expect(screen.getByRole('button', { name: 'Xác nhận đơn & thanh toán VietQR' })).toBeDisabled();
    expect(rentalService.create).not.toHaveBeenCalled();
  });
  it('invalidates consent when the cart changes while checkout is open', async () => {
    const user = userEvent.setup(); renderPage();
    await user.click(await screen.findByRole('checkbox'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Xác nhận đơn & thanh toán VietQR' })).toBeEnabled());
    act(() => rentalCartActions.setQuantity('variant-1', 2));
    await waitFor(() => expect(rentalService.quote).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('checkbox')).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Xác nhận đơn & thanh toán VietQR' })).toBeDisabled();
  });
  it('retries an uncertain network result with the same idempotency key', async () => {
    rentalService.create.mockRejectedValueOnce({ message: 'Mất kết nối', statusCode: 500 }).mockResolvedValueOnce({ data: { id: 'order-retry' } });
    const user = userEvent.setup(); renderPage();
    await user.click(await screen.findByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Xác nhận đơn & thanh toán VietQR' }));
    await screen.findByText('Mất kết nối');
    await user.click(screen.getByRole('button', { name: 'Xác nhận đơn & thanh toán VietQR' }));
    await screen.findByText('Đã đến trang thanh toán');
    expect(rentalService.create.mock.calls[1][1]).toBe(rentalService.create.mock.calls[0][1]);
  });
  it('does not create an order with an invalid receiver phone', async () => {
    const user = userEvent.setup(); renderPage();
    await user.clear(screen.getByLabelText(/Số điện thoại người nhận/));
    await user.type(screen.getByLabelText(/Số điện thoại người nhận/), '123');
    await user.click(await screen.findByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Xác nhận đơn & thanh toán VietQR' }));
    expect(await screen.findByText('Số điện thoại Việt Nam không hợp lệ.')).toBeInTheDocument();
    expect(rentalService.create).not.toHaveBeenCalled();
  });
});

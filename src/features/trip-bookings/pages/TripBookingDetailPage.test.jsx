import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useGenerateParticipantInvitations,
  useTripBooking,
} from '../hooks/useTripBookings';
import TripBookingDetailPage from './TripBookingDetailPage';

vi.mock('../hooks/useTripBookings', () => ({
  useTripBooking: vi.fn(),
  useGenerateParticipantInvitations: vi.fn(),
}));

const booking = {
  orderId: 'order-1',
  orderCode: 'RT-001',
  tripId: 'trip-1',
  tripStartAt: '2026-11-02T00:00:00Z',
  tripEndAt: '2026-11-04T00:00:00Z',
  tripStatus: 'Open',
  participantCount: 2,
  unitPrice: 1500000,
  subtotalAmount: 3000000,
  totalAmount: 3000000,
  status: 'PendingPayment',
  paymentStatus: 'Unpaid',
  holdExpiresAt: '2099-11-01T00:00:00Z',
  canManage: true,
  participants: [
    { participantId: 'p-1', fullName: 'Buyer', email: 'buyer@example.com', status: 'Linked' },
    { participantId: 'p-2', fullName: 'Nguyễn An', email: 'an@example.com', status: 'Pending' },
  ],
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/trip-bookings/order-1']}>
      <Routes><Route path="/trip-bookings/:orderId" element={<TripBookingDetailPage />} /></Routes>
    </MemoryRouter>,
  );

describe('TripBookingDetailPage', () => {
  const refetch = vi.fn();
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTripBooking.mockReturnValue({ data: booking, isLoading: false, isError: false, refetch });
    useGenerateParticipantInvitations.mockReturnValue({ mutateAsync, isPending: false });
  });

  it('shows buyer totals and a clear pending-payment notice', () => {
    renderPage();

    expect(screen.getByText('RT-001')).toBeInTheDocument();
    expect(screen.getByText('Tổng tiền')).toBeInTheDocument();
    expect(screen.getByText(/chưa tích hợp cổng thanh toán/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tạo lời mời' })).not.toBeInTheDocument();
  });

  it('hides buyer-only money fields from participant scope', () => {
    useTripBooking.mockReturnValue({
      data: { ...booking, canManage: false, totalAmount: 0, subtotalAmount: 0, paymentStatus: '' },
      isLoading: false,
      isError: false,
      refetch,
    });

    renderPage();

    expect(screen.queryByText('Tổng tiền')).not.toBeInTheDocument();
    expect(screen.getByText('Thông tin tham gia của bạn')).toBeInTheDocument();
  });

  it('creates invitation tokens only after an eligible buyer clicks', async () => {
    const user = userEvent.setup();
    useTripBooking.mockReturnValue({
      data: { ...booking, status: 'Confirmed', paymentStatus: 'Paid', holdExpiresAt: null },
      isLoading: false,
      isError: false,
      refetch,
    });
    mutateAsync.mockResolvedValue({
      data: [{ participantId: 'p-2', fullName: 'Nguyễn An', email: 'an@example.com', token: 'one-time-token', expiresAt: '2026-11-01T00:00:00Z' }],
    });

    renderPage();
    await user.click(screen.getByRole('button', { name: 'Tạo lời mời' }));

    expect(mutateAsync).toHaveBeenCalledWith('order-1');
    expect(await screen.findByText('one-time-token')).toBeInTheDocument();
    expect(screen.getByText(/chỉ hiển thị trong phiên này/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo lại lời mời' })).toBeInTheDocument();
    expect(screen.getByText(/thu hồi token đang chờ/)).toBeInTheDocument();
  });

  it('refetches once when the hold countdown reaches zero', async () => {
    vi.useFakeTimers();
    useTripBooking.mockReturnValue({
      data: { ...booking, holdExpiresAt: new Date(Date.now() + 1000).toISOString() },
      isLoading: false,
      isError: false,
      refetch,
    });
    renderPage();

    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    expect(refetch).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

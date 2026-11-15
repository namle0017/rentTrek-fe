import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRescheduleOptions, useRescheduleTripBooking } from '../hooks/useTripBookings';
import ReschedulePanel from './ReschedulePanel';

vi.mock('../hooks/useTripBookings', () => ({
  useRescheduleOptions: vi.fn(),
  useRescheduleTripBooking: vi.fn(),
}));
vi.mock('./TripPaymentPanel', () => ({ default: ({ orderId }) => <div>payment-panel-{orderId}</div> }));
vi.mock('./HoldCountdown', () => ({ default: () => null }));

const options = {
  canReschedule: true,
  fee: 50000,
  remainingTimes: 1,
  deadline: null,
  pending: null,
  trips: [
    {
      tripId: 't-cheap',
      startAt: '2099-12-01T00:00:00Z',
      endAt: '2099-12-03T00:00:00Z',
      pricePerPerson: 800000,
      availableSlots: 5,
      priceDiff: -350000,
    },
    {
      tripId: 't-dear',
      startAt: '2099-12-10T00:00:00Z',
      endAt: '2099-12-12T00:00:00Z',
      pricePerPerson: 1200000,
      availableSlots: 5,
      priceDiff: 450000,
    },
  ],
};

const mutate = vi.fn();
const mockOptions = (data) =>
  useRescheduleOptions.mockReturnValue({ data, isLoading: false, isError: false, refetch: vi.fn() });

describe('ReschedulePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRescheduleTripBooking.mockReturnValue({ mutate, isPending: false, isError: false });
  });

  it('lists trips with the price difference and submits the chosen one', async () => {
    mockOptions(options);
    render(<ReschedulePanel orderId="order-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Đổi lịch sang chuyến khác' }));
    expect(screen.getByText(/Hoàn lại 350\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Trả thêm 450\.000/)).toBeInTheDocument();

    const confirm = screen.getByRole('button', { name: 'Xác nhận đổi lịch' });
    expect(confirm).toBeDisabled();
    await userEvent.click(screen.getAllByRole('radio')[1]);
    await userEvent.click(confirm);

    expect(mutate).toHaveBeenCalledWith({ orderId: 'order-1', toTripId: 't-dear' }, expect.any(Object));
  });

  it('shows the payment panel while a pricier switch awaits payment', () => {
    mockOptions({
      ...options,
      pending: { status: 'PendingPayment', priceDiff: 450000, holdExpiresAt: '2099-01-01T00:00:00Z' },
    });
    render(<ReschedulePanel orderId="order-1" />);

    expect(screen.getByText('payment-panel-order-1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đổi lịch sang chuyến khác' })).not.toBeInTheDocument();
  });

  it('offers a free move when the company cancelled the trip', async () => {
    mockOptions({ ...options, companyCancelled: true, fee: 0 });
    render(<ReschedulePanel orderId="order-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Chuyển miễn phí sang chuyến khác' }));
    expect(screen.getByText(/chuyển miễn phí, không thu thêm/)).toBeInTheDocument();
  });

  it('shows why rescheduling is blocked', () => {
    mockOptions({ ...options, canReschedule: false, blockedReason: 'Đã hết số lần đổi lịch.', trips: [] });
    render(<ReschedulePanel orderId="order-1" />);

    expect(screen.getByText('Đã hết số lần đổi lịch.')).toBeInTheDocument();
  });
});

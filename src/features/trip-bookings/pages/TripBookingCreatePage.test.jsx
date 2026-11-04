import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTour } from '@/features/tours/hooks/useTours';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTripBooking } from '../hooks/useTripBookings';
import TripBookingCreatePage from './TripBookingCreatePage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/tours/hooks/useTours', () => ({ useTour: vi.fn() }));
vi.mock('../hooks/useTripBookings', () => ({ useCreateTripBooking: vi.fn() }));

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current location">{`${location.pathname}${location.search}`}</output>;
}

const renderPage = (search = '?tripId=trip-1&tourId=tour-1&partySize=1') =>
  render(
    <MemoryRouter initialEntries={[`/trip-bookings/new${search}`]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <TripBookingCreatePage />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

const next = (user) => user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

describe('TripBookingCreatePage', () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      currentUser: { email: 'buyer@example.com', fullName: 'Buyer', phone: '0901234567' },
    });
    useCreateTripBooking.mockReturnValue({ mutateAsync, isPending: false });
    useTour.mockReturnValue({
      data: {
        name: 'Tà Năng 2N1Đ',
        basePrice: 1000000,
        availableTrips: [
          {
            id: 'trip-1',
            availableSlots: 3,
            pricePerPerson: 1500000,
            dateRangeFormatted: '02/11 - 04/11/2026',
          },
        ],
      },
    });
  });

  it('blocks submission when tripId is missing', () => {
    renderPage('?tourId=tour-1');

    expect(screen.getByRole('heading', { name: 'Thiếu chuyến đi' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tiếp tục' })).not.toBeInTheDocument();
  });

  it('walks through the steps and submits a solo booking', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({ data: { orderId: 'order-1' } });
    renderPage();

    expect(screen.getByRole('heading', { name: 'Bạn đang đặt 1 chỗ' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Số điện thoại liên hệ/)).toHaveValue('0901234567');
    await next(user);
    expect(await screen.findByText(/Không có người đi cùng/)).toBeInTheDocument();
    await next(user);
    await user.type(await screen.findByLabelText('Ghi chú cho ban tổ chức'), '  Ăn chay  ');
    await user.click(screen.getByRole('button', { name: 'Xác nhận giữ chỗ' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync.mock.calls[0][0].payload).toEqual({
      tripId: 'trip-1',
      contactPhone: '0901234567',
      buyerParticipates: true,
      note: 'Ăn chay',
      additionalParticipants: [],
    });
    expect(screen.getByLabelText('current location')).toHaveTextContent('/trip-bookings/order-1');
  });

  it('requires the contact phone before leaving the first step', async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({ currentUser: { email: 'buyer@example.com', fullName: 'Buyer' } });
    renderPage();

    await next(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Vui lòng nhập số điện thoại liên hệ.');
    expect(screen.getByLabelText(/Số điện thoại liên hệ/)).toBeInTheDocument();
  });

  it('adds one participant when switching to booking for someone else', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({ data: { orderId: 'order-1' } });
    renderPage();

    await user.click(screen.getByRole('radio', { name: /Đặt giùm người khác/ }));
    expect(screen.getByRole('button', { name: 'Bớt một người' })).toBeDisabled();
    await next(user);
    await user.type(await screen.findByLabelText(/Họ và tên người 1/), 'Nguyễn An');
    await user.type(screen.getByLabelText(/Email người 1/), 'BUYER@example.com');
    await next(user);
    expect(await screen.findByText(/đặt giùm, không đi cùng/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Xác nhận giữ chỗ' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync.mock.calls[0][0].payload).toMatchObject({
      buyerParticipates: false,
      additionalParticipants: [{ fullName: 'Nguyễn An', email: 'buyer@example.com' }],
    });
  });

  it('caps seats at the slots left on the trip', async () => {
    const user = userEvent.setup();
    renderPage('?tripId=trip-1&tourId=tour-1&partySize=2');

    const add = screen.getByRole('button', { name: 'Thêm một người' });
    await user.click(add);
    expect(screen.getByRole('status', { name: 'Số người tham gia' })).toHaveTextContent('3');
    expect(add).toBeDisabled();
  });

  it('connects buyer-email validation to the participant email field', async () => {
    const user = userEvent.setup();
    renderPage('?tripId=trip-1&partySize=2');

    await next(user);
    await user.type(await screen.findByLabelText(/Họ và tên người 1/), 'Nguyễn An');
    await user.type(screen.getByLabelText(/Email người 1/), 'BUYER@example.com');
    await next(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('không được trùng email người đặt');
    expect(screen.getByLabelText(/Email người 1/)).toHaveAttribute('aria-invalid', 'true');
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('adds and removes participants but caps the list at 20', async () => {
    const user = userEvent.setup();
    useTour.mockReturnValue({ data: undefined });
    renderPage('?tripId=trip-1&partySize=21');

    await next(user);
    const addButton = await screen.findByRole('button', { name: /Thêm người tham gia/ });
    expect(screen.getByRole('heading', { name: 'Người tham gia 20' })).toBeInTheDocument();
    expect(addButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Xóa người tham gia 20' }));
    expect(screen.queryByRole('heading', { name: 'Người tham gia 20' })).not.toBeInTheDocument();
    expect(addButton).toBeEnabled();
  });

  it('returns to the failing step with values kept on a server validation error', async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue({
      message: 'Dữ liệu chưa hợp lệ',
      statusCode: 400,
      errors: { 'additionalParticipants.0.email': ['Email đã được sử dụng'] },
    });
    renderPage('?tripId=trip-1&partySize=2');

    await next(user);
    await user.type(await screen.findByLabelText(/Họ và tên người 1/), 'Nguyễn An');
    await user.type(screen.getByLabelText(/Email người 1/), 'an@example.com');
    await next(user);
    await user.click(await screen.findByRole('button', { name: 'Xác nhận giữ chỗ' }));

    expect(await screen.findByText('Dữ liệu chưa hợp lệ')).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent('Email đã được sử dụng');
    expect(screen.getByLabelText(/Họ và tên người 1/)).toHaveValue('Nguyễn An');
  });

  it('disables submission while the create request is pending', async () => {
    const user = userEvent.setup();
    useCreateTripBooking.mockReturnValue({ mutateAsync, isPending: true });
    renderPage();

    await next(user);
    await next(user);

    expect(await screen.findByRole('button', { name: 'Đang giữ chỗ...' })).toBeDisabled();
  });
});

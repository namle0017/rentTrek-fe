import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTripBooking } from '../hooks/useTripBookings';
import TripBookingCreatePage from './TripBookingCreatePage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../hooks/useTripBookings', () => ({ useCreateTripBooking: vi.fn() }));

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current location">{`${location.pathname}${location.search}`}</output>;
}

const renderPage = (search = '?tripId=trip-1&tourId=tour-1&partySize=1') =>
  render(
    <MemoryRouter initialEntries={[`/trip-bookings/new${search}`]}>
      <Routes>
        <Route path="*" element={<><TripBookingCreatePage /><LocationProbe /></>} />
      </Routes>
    </MemoryRouter>,
  );

describe('TripBookingCreatePage', () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { email: 'buyer@example.com', fullName: 'Buyer' } });
    useCreateTripBooking.mockReturnValue({ mutateAsync, isPending: false });
  });

  it('blocks submission when tripId is missing', () => {
    renderPage('?tourId=tour-1');

    expect(screen.getByRole('heading', { name: 'Thiếu chuyến đi' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xác nhận giữ chỗ' })).not.toBeInTheDocument();
  });

  it('submits zero additional participants and navigates by returned orderId', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({ data: { orderId: 'order-1' } });
    renderPage();

    expect(screen.getByText('Bạn đang đặt 1 chỗ')).toBeInTheDocument();
    expect(screen.queryByText(/Người tham gia 1/)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Ghi chú cho ban tổ chức'), '  Ăn chay  ');
    await user.click(screen.getByRole('button', { name: 'Xác nhận giữ chỗ' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync.mock.calls[0][0].payload).toEqual({
      tripId: 'trip-1',
      note: 'Ăn chay',
      additionalParticipants: [],
    });
    expect(screen.getByLabelText('current location')).toHaveTextContent('/trip-bookings/order-1');
  });

  it('connects buyer-email validation to the participant email field', async () => {
    const user = userEvent.setup();
    renderPage('?tripId=trip-1&partySize=2');

    await user.type(screen.getByLabelText(/Họ và tên người 1/), 'Nguyễn An');
    await user.type(screen.getByLabelText(/Email người 1/), 'BUYER@example.com');
    await user.click(screen.getByRole('button', { name: 'Xác nhận giữ chỗ' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('không được trùng email người đặt');
    expect(screen.getByLabelText(/Email người 1/)).toHaveAttribute('aria-invalid', 'true');
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('adds and removes participants but caps the list at 20', async () => {
    const user = userEvent.setup();
    renderPage('?tripId=trip-1&partySize=21');

    const addButton = screen.getByRole('button', { name: /Thêm người tham gia/ });
    expect(screen.getByRole('heading', { name: 'Người tham gia 20' })).toBeInTheDocument();
    expect(addButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Xóa người tham gia 20' }));
    expect(screen.queryByRole('heading', { name: 'Người tham gia 20' })).not.toBeInTheDocument();
    expect(addButton).toBeEnabled();
  });

  it('retains values and shows connected server validation errors', async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue({
      message: 'Dữ liệu chưa hợp lệ',
      statusCode: 400,
      errors: { 'additionalParticipants.0.email': ['Email đã được sử dụng'] },
    });
    renderPage('?tripId=trip-1&partySize=2');

    await user.type(screen.getByLabelText(/Họ và tên người 1/), 'Nguyễn An');
    await user.type(screen.getByLabelText(/Email người 1/), 'an@example.com');
    await user.click(screen.getByRole('button', { name: 'Xác nhận giữ chỗ' }));

    expect(await screen.findByText('Dữ liệu chưa hợp lệ')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Email đã được sử dụng');
    expect(screen.getByLabelText(/Họ và tên người 1/)).toHaveValue('Nguyễn An');
  });

  it('disables submission while the create request is pending', () => {
    useCreateTripBooking.mockReturnValue({ mutateAsync, isPending: true });
    renderPage();

    expect(screen.getByRole('button', { name: 'Đang giữ chỗ...' })).toBeDisabled();
  });
});

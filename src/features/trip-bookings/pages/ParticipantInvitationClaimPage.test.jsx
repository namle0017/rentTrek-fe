import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useClaimParticipantInvitation } from '../hooks/useTripBookings';
import ParticipantInvitationClaimPage from './ParticipantInvitationClaimPage';

vi.mock('../hooks/useTripBookings', () => ({ useClaimParticipantInvitation: vi.fn() }));

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current location">{`${location.pathname}${location.search}`}</output>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/trip-bookings/invitations/claim']}>
      <Routes>
        <Route path="*" element={<><ParticipantInvitationClaimPage /><LocationProbe /></>} />
      </Routes>
    </MemoryRouter>,
  );

describe('ParticipantInvitationClaimPage', () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useClaimParticipantInvitation.mockReturnValue({ mutateAsync, isPending: false });
  });

  it('requires a token and connects the error to the masked input', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Xác nhận lời mời' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Vui lòng nhập token');
    expect(screen.getByLabelText('Token lời mời')).toHaveAttribute('aria-invalid', 'true');
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('trims the token, clears it, and exposes only a safe booking link', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({ data: { orderId: 'order-1', orderCode: 'RT-001' } });
    renderPage();
    const input = screen.getByLabelText('Token lời mời');

    await user.type(input, '  one-time-token  ');
    await user.click(screen.getByRole('button', { name: 'Xác nhận lời mời' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith('one-time-token'));
    expect(input).toHaveValue('');
    expect(screen.getByRole('link', { name: 'Xem booking RT-001' })).toHaveAttribute('href', '/trip-bookings/order-1');
    expect(screen.getByLabelText('current location')).toHaveTextContent('/trip-bookings/invitations/claim');
    expect(screen.getByLabelText('current location')).not.toHaveTextContent('one-time-token');
  });

  it('keeps server errors visible without putting the token in the URL', async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue({ message: 'Token đã hết hạn', statusCode: 409 });
    renderPage();

    await user.type(screen.getByLabelText('Token lời mời'), 'expired-token');
    await user.click(screen.getByRole('button', { name: 'Xác nhận lời mời' }));

    expect(await screen.findByText('Token đã hết hạn')).toBeInTheDocument();
    expect(screen.getByLabelText('current location')).not.toHaveTextContent('expired-token');
  });

  it('disables submission while claiming', () => {
    useClaimParticipantInvitation.mockReturnValue({ mutateAsync, isPending: true });
    renderPage();

    expect(screen.getByRole('button', { name: 'Đang xác nhận...' })).toBeDisabled();
  });
});

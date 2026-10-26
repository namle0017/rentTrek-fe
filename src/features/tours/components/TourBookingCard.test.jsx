import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import TourBookingCard from './TourBookingCard';

const tour = {
  id: 'tour-1',
  inspectionRate: 96,
  availableTrips: [
    {
      id: 'trip-1',
      tripOptionTitle: 'Cuối tuần tháng 11',
      dateRangeFormatted: '02/11 - 04/11/2026',
      availableSlots: 2,
      pricePerPerson: 1500000,
      status: 'Open',
    },
    {
      id: 'trip-2',
      tripOptionTitle: 'Đầu tháng 12',
      dateRangeFormatted: '05/12 - 07/12/2026',
      availableSlots: 4,
      pricePerPerson: 2000000,
      status: 'Open',
    },
  ],
};

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current location">{`${location.pathname}${location.search}`}</output>;
}

const renderCard = (value = tour) =>
  render(
    <MemoryRouter initialEntries={['/tours/tour-1']}>
      <Routes>
        <Route path="*" element={<><TourBookingCard tour={value} /><LocationProbe /></>} />
      </Routes>
    </MemoryRouter>,
  );

describe('TourBookingCard', () => {
  it('renders availableTrips and updates price for the selected trip', async () => {
    const user = userEvent.setup();
    renderCard();

    expect(screen.getByRole('option', { name: /Cuối tuần tháng 11/ })).toBeInTheDocument();
    expect(screen.getByText((_, element) => element.id === 'booking-card-title' && element.textContent.includes('1.500.000'))).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Lịch khởi hành'), 'trip-2');

    expect(screen.getByText((_, element) => element.id === 'booking-card-title' && element.textContent.includes('2.000.000'))).toBeInTheDocument();
  });

  it('does not let party size exceed available slots and opens checkout', async () => {
    const user = userEvent.setup();
    renderCard();
    const increase = screen.getByRole('button', { name: 'Tăng số người' });

    await user.click(increase);
    await user.click(increase);
    expect(screen.getByLabelText('Số người')).toHaveTextContent('2');
    expect(increase).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Tiếp tục đặt tour' }));

    expect(screen.getByLabelText('current location')).toHaveTextContent(
      '/trip-bookings/new?tripId=trip-1&tourId=tour-1&partySize=2',
    );
  });

  it('disables checkout when no open trip has available slots', () => {
    renderCard({
      ...tour,
      availableTrips: [{ ...tour.availableTrips[0], status: 'Closed', availableSlots: 0 }],
    });

    expect(screen.getByRole('button', { name: 'Tiếp tục đặt tour' })).toBeDisabled();
    expect(screen.getByText(/chưa có lịch mở/)).toBeInTheDocument();
  });
});

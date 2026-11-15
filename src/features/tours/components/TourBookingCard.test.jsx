import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import axiosClient from '@/api/axiosClient';
import TourBookingCard from './TourBookingCard';

const tour = {
  id: 'tour-1',
  availableTrips: [
    {
      id: 'trip-1',
      startAt: '2026-11-02T01:00:00Z',
      endAt: '2026-11-04T10:00:00Z',
      tripOptionTitle: 'Cuối tuần tháng 11',
      dateRangeFormatted: '02/11 - 04/11/2026',
      availableSlots: 2,
      pricePerPerson: 1500000,
      status: 'Open',
    },
    {
      id: 'trip-2',
      startAt: '2026-12-05T01:00:00Z',
      endAt: '2026-12-07T10:00:00Z',
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
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/tours/tour-1']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <TourBookingCard tour={value} />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe('TourBookingCard', () => {
  it('renders availableTrips and updates price for the selected trip', async () => {
    const user = userEvent.setup();
    renderCard();

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Ngày khởi hành/ }));
    expect(screen.getByRole('radio', { name: /02\/11 - 04\/11\/2026/ })).toBeChecked();
    expect(screen.getByText('Tháng 11 2026')).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) => element.id === 'booking-card-title' && element.textContent.includes('1.500.000'),
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tháng sau' }));
    await user.click(screen.getByRole('radio', { name: /05\/12 - 07\/12\/2026/ }));

    expect(
      screen.getByText(
        (_, element) => element.id === 'booking-card-title' && element.textContent.includes('2.000.000'),
      ),
    ).toBeInTheDocument();
  });

  it('does not let party size exceed available slots and opens checkout', async () => {
    const user = userEvent.setup();
    renderCard();
    const increase = screen.getByRole('button', { name: 'Tăng số người' });

    await user.click(increase);
    await user.click(increase);
    expect(screen.getByLabelText('Số người')).toHaveTextContent('2');
    expect(increase).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Đặt Tour & Giữ Chỗ Ngay' }));

    expect(screen.getByLabelText('current location')).toHaveTextContent(
      '/trip-bookings/new?tripId=trip-1&tourId=tour-1&partySize=2',
    );
  });

  it('disables checkout when no open trip has available slots', () => {
    renderCard({
      ...tour,
      availableTrips: [{ ...tour.availableTrips[0], status: 'Closed', availableSlots: 0 }],
    });

    expect(screen.getByRole('button', { name: 'Đặt Tour & Giữ Chỗ Ngay' })).toBeDisabled();
    expect(screen.getByText(/chưa có lịch mở/)).toBeInTheDocument();
  });

  it('opens the refund policy for the selected departure', async () => {
    const user = userEvent.setup();
    const get = vi.spyOn(axiosClient, 'get').mockResolvedValue({
      data: {
        refundPolicyId: 'policy-2',
        name: 'Chính sách cuối năm',
        version: 2,
        description: 'Điều khoản đợt tháng 12',
        rules: [{ minHoursBefore: 0, refundPercentage: 0 }],
        reschedule: { minHoursBefore: 24, fee: 50000, maxTimes: 1 },
        noShowGraceMinutes: 25,
      },
    });
    renderCard();

    try {
      await user.click(screen.getByRole('button', { name: /Ngày khởi hành/ }));
      await user.click(screen.getByRole('button', { name: 'Tháng sau' }));
      await user.click(screen.getByRole('radio', { name: /05\/12 - 07\/12\/2026/ }));
      await user.click(screen.getByRole('button', { name: 'Chính sách huỷ & hoàn tiền' }));

      expect(await screen.findByRole('dialog', { name: /05\/12 - 07\/12\/2026/ })).toBeInTheDocument();
      expect(await screen.findByText('Điều khoản đợt tháng 12')).toBeInTheDocument();
      expect(screen.getByText(/tối đa 1 lần/)).toBeInTheDocument();
      expect(screen.getByText(/25 phút/)).toBeInTheDocument();
      expect(get).toHaveBeenCalledWith('/trips/trip-2/refund-policy');
    } finally {
      get.mockRestore();
    }
  });
});

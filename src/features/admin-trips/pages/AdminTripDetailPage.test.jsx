import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import * as hooks from '../hooks/useAdminTrips';
import AdminTripDetailPage from './AdminTripDetailPage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../components/TripAttendanceMatrixTab', () => ({ default: () => null }));
vi.mock('../components/TripKanbanBoardTab', () => ({ default: () => null }));
vi.mock('../hooks/useAdminTrips', () => ({
  useAdminTripDetail: vi.fn(),
  useRecalculateProvidedItems: vi.fn(),
  useTripBookings: vi.fn(),
  useTripLifecycleActions: vi.fn(),
  useTripReadinessChecklist: vi.fn(),
  useUpdateAdminTrip: vi.fn(),
}));

const recalc = vi.fn().mockResolvedValue({ data: { providedItems: [{}, {}] } });

describe('AdminTripDetailPage provided items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const idle = { mutateAsync: vi.fn(), isPending: false };
    useAuth.mockReturnValue({ currentUser: { role: 'Staff' } });
    hooks.useAdminTripDetail.mockReturnValue({
      data: {
        tourName: 'Tour A',
        status: 'Open',
        startAt: '2026-12-01T00:00:00Z',
        endAt: '2026-12-02T00:00:00Z',
        tourVersion: 1,
      },
      isLoading: false,
      isError: false,
    });
    hooks.useTripReadinessChecklist.mockReturnValue({ data: null });
    hooks.useTripBookings.mockReturnValue({ data: [] });
    hooks.useUpdateAdminTrip.mockReturnValue(idle);
    hooks.useRecalculateProvidedItems.mockReturnValue({ mutateAsync: recalc, isPending: false });
    hooks.useTripLifecycleActions.mockReturnValue({
      openBooking: idle,
      closeBooking: idle,
      startTrip: idle,
      completeTrip: idle,
      cancelTrip: idle,
    });
  });

  it('links to the trip provided items page and recalculates', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/trips/t-1']}>
        <Routes>
          <Route path="/admin/trips/:tripId" element={<AdminTripDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Đồ cấp chuyến' })).toHaveAttribute(
      'href',
      '/ops/trips/t-1/provided-items',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Tính lại đồ cấp' }));
    expect(recalc).toHaveBeenCalled();
    expect(await screen.findByText(/Đã tính lại đồ cấp chuyến \(2 mục\)/)).toBeInTheDocument();
  });
});

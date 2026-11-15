import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGuideTrips } from '../hooks/useGuidePortal';
import GuideTripsPage from './GuideTripsPage';

vi.mock('../hooks/useGuidePortal', () => ({
  useGuideTrips: vi.fn(),
}));

const inProgressTrip = {
  tripId: '11111111-1111-1111-1111-111111111111',
  tourName: 'Trekking Tà Năng - Phan Dũng',
  groupId: '22222222-2222-2222-2222-222222222222',
  groupName: 'Đoàn Bình Minh',
  startAt: '2026-11-15T06:00:00+07:00',
  endAt: '2026-11-17T17:00:00+07:00',
  tripStatus: 'InProgress',
  participantCount: 12,
  maxParticipants: 15,
  meetingLocation: {
    name: 'Bìa rừng Tà Năng',
    address: 'Đức Trọng, Lâm Đồng',
    latitude: 11.573,
    longitude: 108.553,
  },
};

describe('GuideTripsPage', () => {
  beforeEach(() => {
    useGuideTrips.mockReturnValue({
      data: [inProgressTrip],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('prioritizes attendance for an InProgress trip', () => {
    render(
      <MemoryRouter>
        <GuideTripsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Điểm danh nhanh thực địa/ })).toHaveAttribute(
      'href',
      '/guide/trips/11111111-1111-1111-1111-111111111111/attendance',
    );
    expect(screen.getByText('Thực hiện Điểm danh nhanh tại chặng hiện tại')).toBeInTheDocument();
  });
});

import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useInvitationPreview } from '../hooks/useTripBookings';
import ParticipantInvitationClaimPage from './ParticipantInvitationClaimPage';

vi.mock('../hooks/useTripBookings', () => ({ useInvitationPreview: vi.fn() }));

const preview = {
  orderId: 'order-1',
  tourName: 'Tà Năng 2N1Đ',
  tripStartAt: '2026-12-06T23:00:00Z',
  tripEndAt: '2026-12-08T11:00:00Z',
  buyerName: 'Nguyễn Văn A',
  expiresAt: '2026-12-08T11:00:00Z',
  participantNames: ['Nguyễn Văn A', 'Bé Minh'],
  activities: [
    {
      activityId: 'a1',
      dayNumber: 1,
      dayTitle: 'Ngày 1: Khởi hành',
      startTime: '06:00:00',
      name: 'Tập trung',
      isCurrent: false,
    },
    {
      activityId: 'a2',
      dayNumber: 1,
      dayTitle: 'Ngày 1: Khởi hành',
      startTime: '08:30:00',
      name: 'Leo núi',
      isCurrent: true,
    },
    {
      activityId: 'a3',
      dayNumber: 2,
      dayTitle: null,
      startTime: '07:00:00',
      name: 'Xuống núi',
      description: 'Về bản',
      isCurrent: false,
    },
  ],
};

const renderPage = (hash = '#t=abc') =>
  render(
    <MemoryRouter initialEntries={[`/trip-bookings/order-1/join${hash}`]}>
      <Routes>
        <Route path="/trip-bookings/:orderId/join" element={<ParticipantInvitationClaimPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('ParticipantInvitationClaimPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useInvitationPreview.mockReturnValue({ data: preview, isLoading: false, isError: false });
  });

  it('reads the token from the hash and shows the group and schedule read-only', () => {
    renderPage();

    expect(useInvitationPreview).toHaveBeenCalledWith('order-1', 'abc');
    expect(screen.getByRole('heading', { name: 'Tà Năng 2N1Đ' })).toBeInTheDocument();
    expect(screen.getByText('Bé Minh')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ngày 1: Khởi hành' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ngày 2' })).toBeInTheDocument();
    expect(screen.getByText('08:30')).toBeInTheDocument();
    expect(screen.getByText('Đang diễn ra theo lịch')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each([
    ['', { data: undefined, isLoading: false, isError: false }],
    ['#t=old', { data: undefined, isLoading: false, isError: true }],
  ])('shows an invalid-link state for hash "%s"', (hash, query) => {
    useInvitationPreview.mockReturnValue(query);

    renderPage(hash);

    expect(screen.getByRole('heading', { name: 'Link không còn hiệu lực' })).toBeInTheDocument();
  });
});

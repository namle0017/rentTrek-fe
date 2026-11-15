import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import MyTripsPage from './MyTripsPage';

vi.mock('../hooks/useParticipations', () => ({
  useMyParticipations: () => ({
    data: [
      {
        participantId: 'p1',
        orderId: 'ord-1',
        tourId: 't1',
        tourName: 'Tà Năng',
        startAt: '2026-10-01T00:00:00Z',
        endAt: '2026-10-02T00:00:00Z',
        tripStatus: 'Completed',
        hasReview: true,
        canReview: false,
        reviewRating: 3,
        reviewComment: 'Tạm ổn',
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useParticipantPosts: () => ({ data: [], isLoading: false }),
  useMarkParticipantPostRead: () => ({ mutate: vi.fn() }),
  useSaveParticipantReview: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('MyTripsPage', () => {
  it('prefills rating and comment when editing and links to the booking', async () => {
    render(
      <MemoryRouter>
        <MyTripsPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /Xem đơn đặt tour/ })).toHaveAttribute(
      'href',
      '/trip-bookings/ord-1',
    );
    await userEvent.setup().click(screen.getByRole('button', { name: /Đánh giá/ }));
    expect(screen.getByLabelText('Nội dung đánh giá')).toHaveValue('Tạm ổn');
    expect(screen.getByRole('combobox')).toHaveValue('3');
  });
});

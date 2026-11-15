import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notificationRoute } from '../utils/notificationRoute';
import NotificationsPage from './NotificationsPage';
import { useNotifications } from '../hooks/useNotifications';

const markRead = vi.fn();
vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
  useMarkNotificationRead: () => ({ mutate: markRead, isPending: false }),
  useMarkAllNotificationsRead: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ currentUser: { role: 'Customer' } }) }));

describe('NotificationsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('marks as read and navigates to the related rental order on click', async () => {
    useNotifications.mockReturnValue({
      data: {
        items: [
          {
            notificationId: 'n1',
            type: 'RentalHandedOver',
            title: 'Đã bàn giao',
            content: 'x',
            isRead: false,
            createdAt: '2026-11-01T00:00:00Z',
            relatedEntityType: 'Order',
            relatedEntityId: 'o1',
          },
        ],
        pageNumber: 1,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
    });
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <Routes>
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/rental-orders/:id" element={<p>RENTAL DETAIL</p>} />
        </Routes>
      </MemoryRouter>,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: /Mở thông báo: Đã bàn giao/ }));
    expect(markRead).toHaveBeenCalledWith('n1');
    expect(screen.getByText('RENTAL DETAIL')).toBeInTheDocument();
  });
});

describe('notificationRoute', () => {
  it('maps entities per role', () => {
    const n = (relatedEntityType, type = 'X') => ({ relatedEntityType, relatedEntityId: 'i1', type });
    expect(notificationRoute(n('Order'), 'Customer')).toBe('/trip-bookings/i1');
    expect(notificationRoute(n('Order', 'RentalExtended'), 'Customer')).toBe('/rental-orders/i1');
    expect(notificationRoute(n('RefundCase'), 'Customer')).toBe('/refunds/i1');
    expect(notificationRoute(n('Trip'), 'Guide')).toBe('/guide/trips/i1/group');
    expect(notificationRoute(n('Trip'), 'Admin')).toBe('/admin/trips/i1');
    expect(notificationRoute(n('Unknown'), 'Admin')).toBeNull();
    expect(notificationRoute({ type: 'X' }, 'Admin')).toBeNull();
  });
});

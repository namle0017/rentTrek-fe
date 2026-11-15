import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { useAuth } from '@/hooks/useAuth';
import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../hooks/useNotifications';
import NotificationBell from './NotificationBell';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/operations/hooks/useOperations', () => ({ useOperations: vi.fn() }));
vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
  useUnreadNotificationCount: vi.fn(),
  useMarkNotificationRead: vi.fn(),
}));

const mutate = vi.fn();

const renderBell = (props) =>
  render(
    <MemoryRouter>
      <NotificationBell {...props} />
    </MemoryRouter>,
  );

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { role: 'Admin' }, isAuthenticated: true });
    useUnreadNotificationCount.mockReturnValue({ data: 2 });
    useMarkNotificationRead.mockReturnValue({ mutate });
    useNotifications.mockReturnValue({
      data: {
        items: [
          { notificationId: 'n-1', title: 'Đơn thuê mới', content: 'RT-001', isRead: false, createdAt: '2026-11-15T03:00:00Z' },
        ],
      },
      isFetching: false,
    });
    useOperations.mockImplementation((endpoint) =>
      endpoint
        ? {
            data: [{ entityId: 'a-1', title: '2 thiết bị quá hạn trả', message: 'Đơn #ORD-001', actionUrl: '/ops/rentals/return' }],
            isPending: false,
          }
        : { data: undefined, isPending: false },
    );
  });

  it('renders a single bell whose badge sums unread notifications and operation alerts', () => {
    renderBell({ alertsEndpoint: '/admin/dashboard/alerts' });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Thông báo, 3 mục mới' })).toHaveTextContent('3');
  });

  it('lists alerts and notifications together in one dropdown', async () => {
    renderBell({ alertsEndpoint: '/admin/dashboard/alerts' });
    await userEvent.click(screen.getByRole('button', { name: /Thông báo/ }));

    expect(screen.getByText('Cảnh báo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /2 thiết bị quá hạn trả/ })).toHaveAttribute('href', '/ops/rentals/return');
    expect(screen.getByRole('button', { name: /Đơn thuê mới/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem tất cả thông báo' })).toHaveAttribute('href', '/admin/notifications');
  });

  it('marks a notification as read when opened', async () => {
    renderBell({ alertsEndpoint: '/admin/dashboard/alerts' });
    await userEvent.click(screen.getByRole('button', { name: /Thông báo/ }));
    await userEvent.click(screen.getByRole('button', { name: /Đơn thuê mới/ }));
    expect(mutate).toHaveBeenCalledWith('n-1');
  });

  it('shows only personal notifications when no alerts endpoint is given (Guide)', async () => {
    useAuth.mockReturnValue({ currentUser: { role: 'Guide' }, isAuthenticated: true });
    renderBell();
    expect(screen.getByRole('button', { name: 'Thông báo, 2 mục mới' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Thông báo/ }));
    expect(screen.queryByText('Cảnh báo')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem tất cả thông báo' })).toHaveAttribute('href', '/guide/notifications');
  });
});

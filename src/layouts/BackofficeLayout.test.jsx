import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import BackofficeLayout from './BackofficeLayout';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/auth/hooks/useLogout', () => ({ useLogout: () => ({ mutate: vi.fn(), isPending: false }) }));
vi.mock('@/features/notifications/components/NotificationBell', () => ({
  default: () => <button type="button">Thông báo</button>,
}));
vi.mock('./DevClockBar', () => ({ default: () => null }));

const renderAt = (role) => {
  useAuth.mockReturnValue({ currentUser: { role, fullName: 'Lê Nhật Nam' } });
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <BackofficeLayout />
    </MemoryRouter>,
  );
};

describe('BackofficeLayout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('gives Admin the full management menu', () => {
    renderAt('Admin');
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Hệ thống')).toBeInTheDocument();
    expect(screen.getByText('Tài chính')).toBeInTheDocument();
    expect(screen.getByText('Nội dung')).toBeInTheDocument();
  });

  it('gives Staff its own warehouse-focused menu', () => {
    renderAt('Staff');
    expect(screen.getByText('Vận hành')).toBeInTheDocument();
    expect(screen.getByText('Kho & thiết bị')).toBeInTheDocument();
    expect(screen.getByText('Sản phẩm & đơn thuê')).toBeInTheDocument();
    expect(screen.getByText('Tour & chuyến đi')).toBeInTheDocument();
    expect(screen.getByText('Chính sách')).toBeInTheDocument();
    expect(screen.queryByText('Hệ thống')).not.toBeInTheDocument();
    expect(screen.queryByText('Tài chính')).not.toBeInTheDocument();
    expect(screen.queryByText('Nội dung')).not.toBeInTheDocument();
  });

  it('renders exactly one notification bell in the header', () => {
    renderAt('Admin');
    expect(screen.getAllByRole('button', { name: 'Thông báo' })).toHaveLength(1);
  });
});

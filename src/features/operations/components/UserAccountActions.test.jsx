import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { useWriteOperation } from '../hooks/useOperations';
import UserAccountActions from './UserAccountActions';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../hooks/useOperations', () => ({ useWriteOperation: vi.fn() }));

const account = {
  userId: 'customer-id',
  fullName: 'Khách thử nghiệm',
  email: 'customer@example.test',
  role: 'Customer',
  status: 'Active',
};
const mutate = vi.fn();
function renderActions(user = account) {
  render(
    <MemoryRouter>
      <UserAccountActions user={user} />
    </MemoryRouter>,
  );
}

describe('UserAccountActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { userId: 'admin-id', role: 'Admin' } });
    useWriteOperation.mockReturnValue({ mutate, isPending: false });
  });

  it('requires a reason and PATCHes the chosen role to the correct account', async () => {
    const user = userEvent.setup();
    renderActions();
    await user.click(screen.getByRole('button', { name: 'Đổi vai trò' }));
    const dialog = screen.getByRole('dialog', { name: 'Đổi vai trò tài khoản' });
    expect(within(dialog).queryByRole('option', { name: 'Quản trị viên' })).not.toBeInTheDocument();
    await user.selectOptions(within(dialog).getByRole('combobox'), 'Staff');
    await user.click(within(dialog).getByRole('button', { name: 'Đổi vai trò' }));
    expect(mutate).not.toHaveBeenCalled();
    await user.type(within(dialog).getByLabelText(/Lý do/), 'Điều chuyển sang nhân viên');
    await user.click(within(dialog).getByRole('button', { name: 'Đổi vai trò' }));
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          endpoint: '/admin/users/customer-id/role',
          method: 'patch',
          body: { role: 'Staff', reason: 'Điều chuyển sang nhân viên' },
        },
        expect.any(Object),
      ),
    );
  });

  it('explains session revocation and requires a reason before locking', async () => {
    const user = userEvent.setup();
    renderActions();
    await user.click(screen.getByRole('button', { name: 'Khóa tài khoản' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/mọi thiết bị sẽ bị thu hồi/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Khóa tài khoản' }));
    expect(mutate).not.toHaveBeenCalled();
    await user.type(within(dialog).getByLabelText(/Lý do/), 'Tạm khóa theo yêu cầu');
    await user.click(within(dialog).getByRole('button', { name: 'Khóa tài khoản' }));
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          endpoint: '/admin/users/customer-id/lock',
          method: 'post',
          body: { reason: 'Tạm khóa theo yêu cầu' },
        },
        expect.any(Object),
      ),
    );
  });

  it('confirms unlocking, submits to unlock, and closes after success', async () => {
    mutate.mockImplementationOnce((_, callbacks) => callbacks.onSuccess({ data: null }));
    const user = userEvent.setup();
    renderActions({ ...account, status: 'Locked' });
    await user.click(screen.getByRole('button', { name: 'Mở khóa' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/có thể đăng nhập lại/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Mở khóa tài khoản' }));
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { endpoint: '/admin/users/customer-id/unlock', method: 'post', body: {} },
        expect.any(Object),
      ),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['own account', { ...account, userId: 'admin-id' }],
    ['another admin', { ...account, role: 'Admin' }],
  ])('protects %s from role changes and locking', (_, protectedAccount) => {
    renderActions(protectedAccount);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Chi tiết' })).toBeInTheDocument();
  });

  it('does not expose administrative actions to staff', () => {
    useAuth.mockReturnValue({ currentUser: { userId: 'staff-id', role: 'Staff' } });
    renderActions();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

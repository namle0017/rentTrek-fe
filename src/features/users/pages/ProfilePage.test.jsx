import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { USER_ROLE } from '@/constants/enums';
import { useProfile } from '../hooks/useProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import ProfilePage from './ProfilePage';

vi.mock('../hooks/useProfile', () => ({
  useProfile: vi.fn(),
}));

vi.mock('../hooks/useUpdateProfile', () => ({
  useUpdateProfile: vi.fn(),
}));

vi.mock('../components/ChangePasswordForm', () => ({
  default: () => <div data-testid="mock-change-password-form">Đổi mật khẩu component</div>,
}));

vi.mock('../components/ActiveSessionsList', () => ({
  default: () => <div data-testid="mock-active-sessions-list">Danh sách phiên component</div>,
}));

const mockProfile = {
  userId: '11112222-3333-4444-5555-666677778888',
  email: 'thuha.tran@example.com',
  fullName: 'Trần Thu Hà',
  phone: '0912345678',
  role: USER_ROLE.CUSTOMER,
  status: 'Active',
  emailConfirmed: true,
  createdAt: '2026-09-02T10:00:00Z',
  updatedAt: '2026-10-18T08:42:00Z',
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );

describe('ProfilePage', () => {
  let mutateMock;

  beforeEach(() => {
    vi.clearAllMocks();
    mutateMock = vi.fn();
    useProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      isError: false,
    });
    useUpdateProfile.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    });
  });

  it('renders user identity, breadcrumbs, and basic info cards according to design system', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Hồ sơ cá nhân' })).toBeInTheDocument();
    expect(screen.getByText(/Tham gia từ 02\/09\/2026/)).toBeInTheDocument();

    // Identity card
    expect(screen.getByRole('heading', { level: 2, name: 'Trần Thu Hà' })).toBeInTheDocument();
    expect(screen.getByText('#11112222')).toBeInTheDocument();
    expect(screen.getAllByText('Khách hàng')).toHaveLength(2);
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();

    // Form inputs and readonly fields
    const nameInput = screen.getByLabelText(/Họ và tên/);
    expect(nameInput).toHaveValue('Trần Thu Hà');

    const phoneInput = screen.getByLabelText(/Số điện thoại/);
    expect(phoneInput).toHaveValue('0912345678');

    expect(screen.getByText('thuha.tran@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('Chỉ đọc')).toHaveLength(2);

    // Save and cancel buttons are disabled initially when clean
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Hủy thay đổi' })).toBeDisabled();
  });

  it('enables save and cancel buttons when inputs are modified, and resets on cancel', async () => {
    const user = userEvent.setup();
    renderPage();

    const nameInput = screen.getByLabelText(/Họ và tên/);
    await user.clear(nameInput);
    await user.type(nameInput, 'Trần Thu Hà Cập Nhật');

    const saveBtn = screen.getByRole('button', { name: 'Lưu thay đổi' });
    const cancelBtn = screen.getByRole('button', { name: 'Hủy thay đổi' });

    expect(saveBtn).not.toBeDisabled();
    expect(cancelBtn).not.toBeDisabled();
    expect(screen.getByText('Bạn có thay đổi chưa lưu')).toBeInTheDocument();

    // Click cancel
    await user.click(cancelBtn);
    expect(nameInput).toHaveValue('Trần Thu Hà');
    expect(saveBtn).toBeDisabled();
  });

  it('submits updated values when form is saved', async () => {
    const user = userEvent.setup();
    renderPage();

    const nameInput = screen.getByLabelText(/Họ và tên/);
    await user.clear(nameInput);
    await user.type(nameInput, 'Trần Minh Tâm');

    const saveBtn = screen.getByRole('button', { name: 'Lưu thay đổi' });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1);
    });

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Trần Minh Tâm',
        phone: '0912345678',
      }),
      expect.any(Object),
    );
  });

  it('displays validation error if required full name is cleared', async () => {
    const user = userEvent.setup();
    renderPage();

    const nameInput = screen.getByLabelText(/Họ và tên/);
    await user.clear(nameInput);

    const saveBtn = screen.getByRole('button', { name: 'Lưu thay đổi' });
    await user.click(saveBtn);

    expect(await screen.findByText('Vui lòng nhập họ và tên.')).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('copies user id when clicking copy button', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    renderPage();

    const copyBtn = screen.getByTitle('Sao chép toàn bộ mã định danh');
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(mockProfile.userId.toUpperCase());
    expect(await screen.findByText('✓ Đã chép')).toBeInTheDocument();
  });

  it('switches between profile and security tabs via sidebar nav', async () => {
    const user = userEvent.setup();
    renderPage();

    // Initially on Profile
    expect(screen.queryByTestId('mock-change-password-form')).not.toBeInTheDocument();

    // Click Security Nav Item
    const securityNavBtn = screen.getByRole('button', { name: /Bảo mật & phiên/ });
    await user.click(securityNavBtn);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Bảo mật & phiên đăng nhập' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-change-password-form')).toBeInTheDocument();
    expect(screen.getByTestId('mock-active-sessions-list')).toBeInTheDocument();

    // Switch back
    const profileNavBtn = screen.getByRole('button', { name: /Hồ sơ cá nhân/ });
    await user.click(profileNavBtn);
    expect(screen.getByRole('heading', { level: 1, name: 'Hồ sơ cá nhân' })).toBeInTheDocument();
  });
});

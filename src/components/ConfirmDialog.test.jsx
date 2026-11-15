import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

function setup(props = {}) {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <ConfirmDialog
      open
      title="Xoá chính sách"
      message="Bạn có chắc chắn muốn xoá?"
      confirmLabel="Xoá"
      onConfirm={onConfirm}
      onClose={onClose}
      {...props}
    />,
  );
  return { onConfirm, onClose };
}

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(<ConfirmDialog open={false} title="Tiêu đề" message="Nội dung" onConfirm={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Nội dung')).not.toBeInTheDocument();
  });

  it('shows title, message and labels', () => {
    setup({ cancelLabel: 'Để sau' });
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Xoá chính sách' })).toBeInTheDocument();
    expect(within(dialog).getByText('Bạn có chắc chắn muốn xoá?')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Xoá' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Để sau' })).toBeInTheDocument();
  });

  it('uses default labels', () => {
    setup({ confirmLabel: undefined });
    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
  });

  it('calls onConfirm only when confirm is clicked', async () => {
    const { onConfirm, onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel or the close icon is clicked', async () => {
    const { onConfirm, onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disables both buttons and shows progress while pending', async () => {
    const { onConfirm } = setup({ isPending: true });
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeDisabled();
    const confirm = screen.getByRole('button', { name: 'Đang xử lý...' });
    expect(confirm).toBeDisabled();
    await userEvent.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

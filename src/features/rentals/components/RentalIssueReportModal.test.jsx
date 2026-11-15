import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RentalIssueReportModal from './RentalIssueReportModal';
import { useReportRentalIssue } from '../hooks/useRentals';

vi.mock('../hooks/useRentals', () => ({
  useReportRentalIssue: vi.fn(),
}));

const mockOrder = {
  id: 'order-rent-123',
  orderCode: 'RT-202611-999',
  lines: [
    { id: 'line-1', displayName: 'Lều cắm trại 4 người', quantity: 1 },
    { id: 'line-2', displayName: 'Bếp gas dã ngoại gấp gọn', quantity: 2 },
  ],
};

describe('RentalIssueReportModal', () => {
  const mutateAsync = vi.fn();
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useReportRentalIssue.mockReturnValue({
      mutateAsync,
      isPending: false,
    });
  });

  it('renders modal with issue options and prevents submit when description is empty', async () => {
    render(
      <RentalIssueReportModal
        order={mockOrder}
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText('Báo cáo đồ thuê bị lỗi / hư hại')).toBeInTheDocument();
    expect(screen.getByLabelText(/Chọn món đồ bị sự cố/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vấn đề gặp phải/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mô tả chi tiết tình trạng lỗi/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: 'Gửi báo cáo sự cố' });
    expect(submitBtn).toBeDisabled();
  });

  it('requires a photo, then sends each photo with a note describing the issue', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue(undefined);
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview');
    globalThis.URL.revokeObjectURL = vi.fn();

    render(<RentalIssueReportModal order={mockOrder} isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await user.selectOptions(screen.getByLabelText(/Chọn món đồ bị sự cố/i), 'line-2');
    await user.selectOptions(screen.getByLabelText(/Vấn đề gặp phải/i), 'WrongVariant');
    await user.type(screen.getByLabelText(/Mô tả chi tiết tình trạng lỗi/i), 'Bếp giao nhầm loại đầu nối bình gas lớn');
    await user.click(screen.getByLabelText(/Hủy & Hoàn tiền món này/i));

    const submitBtn = screen.getByRole('button', { name: 'Gửi báo cáo sự cố' });
    expect(submitBtn).toBeDisabled();

    const photo = new File(['img'], 'loi.jpg', { type: 'image/jpeg' });
    await user.upload(document.querySelector('input[type="file"]'), photo);
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    expect(mutateAsync).toHaveBeenCalledWith({
      orderId: 'order-rent-123',
      files: [photo],
      note: expect.stringContaining('Bếp giao nhầm loại đầu nối bình gas lớn'),
    });
    const { note } = mutateAsync.mock.calls[0][0];
    expect(note).toContain('Mong muốn: huỷ & hoàn tiền món này');
    expect(note.length).toBeLessThanOrEqual(500);
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  }, 15000);

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RentalIssueReportModal
        order={mockOrder}
        isOpen={true}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Hủy bỏ' }));
    expect(onClose).toHaveBeenCalled();
  });
});


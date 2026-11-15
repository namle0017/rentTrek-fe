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

  it('fills form and calls mutation with contract RFP-12 payload', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({
      success: true,
      data: { issueReportId: 'issue-1', status: 'UnderReview' },
    });

    render(
      <RentalIssueReportModal
        order={mockOrder}
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // Select second item
    await user.selectOptions(screen.getByLabelText(/Chọn món đồ bị sự cố/i), 'line-2');

    // Select category 'WrongVariant'
    await user.selectOptions(screen.getByLabelText(/Vấn đề gặp phải/i), 'WrongVariant');

    // Type description
    await user.type(
      screen.getByLabelText(/Mô tả chi tiết tình trạng lỗi/i),
      'Bếp giao nhầm loại đầu nối bình gas lớn'
    );

    // Choose RefundItem
    await user.click(screen.getByLabelText(/Hủy & Hoàn tiền món này/i));

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Gửi báo cáo sự cố' });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    expect(mutateAsync).toHaveBeenCalledWith({
      orderId: 'order-rent-123',
      payload: {
        rentalOrderItemId: 'line-2',
        issueCategory: 'WrongVariant',
        description: 'Bếp giao nhầm loại đầu nối bình gas lớn',
        proofUrls: [],
        preferredAction: 'RefundItem',
        contactPhone: undefined,
      },
    });
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


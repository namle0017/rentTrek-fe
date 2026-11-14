import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RefundCompleteDialog from './RefundCompleteDialog';

const mockMutateAsync = vi.fn();
vi.mock('../hooks/useRefundCases', () => ({
  useCompleteRefund: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe('RefundCompleteDialog', () => {
  const mockItem = {
    refundCaseId: '00000000-1111-2222-3333-444455556666',
    customerName: 'Trần Thị B',
    amount: 1500000,
    rowVersion: 2,
  };

  it('renders modal with refund item details', () => {
    render(<RefundCompleteDialog item={mockItem} onClose={vi.fn()} />);

    expect(screen.getByText('Xác nhận đã hoàn tiền & Tải biên lai')).toBeInTheDocument();
    expect(screen.getByText(/Trần Thị B/)).toBeInTheDocument();
    expect(screen.getByLabelText('Mã giao dịch ngân hàng')).toBeInTheDocument();
  });

  it('submits transaction ID and calls mutateAsync', async () => {
    mockMutateAsync.mockResolvedValueOnce({ success: true });
    const onCloseMock = vi.fn();

    render(<RefundCompleteDialog item={mockItem} onClose={onCloseMock} />);

    const input = screen.getByLabelText('Mã giao dịch ngân hàng');
    fireEvent.change(input, { target: { value: 'VCB-20261113-9999' } });

    const submitBtn = screen.getByText('Xác nhận hoàn tất hồ sơ');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        refundCaseId: mockItem.refundCaseId,
        payload: {
          providerTransactionId: 'VCB-20261113-9999',
          expectedRowVersion: 2,
        },
      });
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('rejects files larger than 5MB', async () => {
    render(<RefundCompleteDialog item={mockItem} onClose={vi.fn()} />);

    const fileInput = document.querySelector('input[type="file"]');
    const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large_receipt.jpg', {
      type: 'image/jpeg',
    });

    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(await screen.findByText('Dung lượng tệp không được vượt quá 5MB.')).toBeInTheDocument();
  });
});

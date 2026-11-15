import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCancellationPreview, useCancelTripBooking } from '../hooks/useTripBookings';
import CancelBookingPanel from './CancelBookingPanel';

vi.mock('../hooks/useTripBookings', () => ({
  useCancellationPreview: vi.fn(),
  useCancelTripBooking: vi.fn(),
}));

const policy = {
  name: 'Chính sách hủy Tour',
  version: 2,
  rules: [
    { minHoursBefore: 72, refundPercentage: 80 },
    { minHoursBefore: 0, refundPercentage: 0 },
  ],
};

const unpaidPreview = {
  canCancel: true,
  isPaid: false,
  appliedCase: 'Hủy trước giờ khởi hành từ 72 giờ trở lên',
  paidAmount: 0,
  estimatedRefundAmount: 0,
  consentVersion: 'refund-bank-data-v1',
  refundPolicy: policy,
};

const paidPreview = {
  ...unpaidPreview,
  isPaid: true,
  paidAmount: 2000000,
  estimatedRefundAmount: 1600000,
};

// "Huỷ" (ỷ) và "Hủy" (ủ) đều là cách viết hợp lệ trong repo
const CANCEL_ORDER_BUTTON = /^H(uỷ|ủy) đơn$/;

describe('CancelBookingPanel - phase 01 (unpaid cancellation, plan 1.1 / item 2)', () => {
  const cancelAsync = vi.fn();
  const refetch = vi.fn();
  const showPreview = (data) =>
    useCancellationPreview.mockReturnValue({ data, isLoading: false, isError: false, refetch });

  const openDialog = async (user) => {
    render(<CancelBookingPanel orderId="order-1" />);
    await user.click(screen.getByRole('button', { name: 'Hủy booking' }));
    return screen.getByRole('dialog');
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cancelAsync.mockResolvedValue({});
    useCancelTripBooking.mockReturnValue({ mutateAsync: cancelAsync, isPending: false });
  });

  it('TC-PM-010: unpaid booking shows only a simple confirm box with no refund wording', async () => {
    showPreview(unpaidPreview);
    const user = userEvent.setup();
    const dialog = await openDialog(user);
    const view = within(dialog);

    expect(view.getByText(/không phát sinh hoàn tiền/i)).toBeInTheDocument();
    expect(view.getByText(/Chỗ giữ sẽ được nhả ngay/i)).toBeInTheDocument();
    expect(view.getByRole('button', { name: CANCEL_ORDER_BUTTON })).toBeInTheDocument();

    expect(view.queryByText('Đã thanh toán')).not.toBeInTheDocument();
    expect(view.queryByText('Dự kiến hoàn')).not.toBeInTheDocument();
    expect(view.queryByText('Khoản không hoàn')).not.toBeInTheDocument();
    expect(view.queryByText(/Bạn không được hoàn tiền vì/i)).not.toBeInTheDocument();
    expect(view.queryByText(/Xem chi tiết chính sách hoàn tiền/i)).not.toBeInTheDocument();
    expect(view.queryByRole('button', { name: 'Tiếp tục hủy' })).not.toBeInTheDocument();
    expect(view.queryByLabelText('Ngân hàng')).not.toBeInTheDocument();
    expect(view.queryByLabelText('Số tài khoản')).not.toBeInTheDocument();
    expect(view.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('TC-PM-011: unpaid cancel sends no bank info, consent, or embedded image data', async () => {
    showPreview(unpaidPreview);
    const user = userEvent.setup();
    const dialog = await openDialog(user);

    await user.click(within(dialog).getByRole('button', { name: CANCEL_ORDER_BUTTON }));

    expect(cancelAsync).toHaveBeenCalledTimes(1);
    const { orderId, payload } = cancelAsync.mock.calls[0][0];
    expect(orderId).toBe('order-1');
    expect(payload).not.toHaveProperty('bankAccount');
    expect(payload).not.toHaveProperty('consentAccepted');
    expect(payload).not.toHaveProperty('consentVersion');
    expect(String(payload.reason ?? '')).not.toContain('data:image');
  });

  it('TC-PM-012: unpaid cancel offers an optional text reason and forwards it as plain text', async () => {
    showPreview(unpaidPreview);
    const user = userEvent.setup();
    const dialog = await openDialog(user);

    await user.type(within(dialog).getByRole('textbox'), 'Đổi lịch công tác');
    await user.click(within(dialog).getByRole('button', { name: CANCEL_ORDER_BUTTON }));

    const { payload } = cancelAsync.mock.calls[0][0];
    expect(String(payload.reason)).toContain('Đổi lịch công tác');
    expect(String(payload.reason)).not.toContain('data:image');
    expect(payload).not.toHaveProperty('bankAccount');
  });

  it('TC-PM-013: cancel reason has no image attachment input on the unpaid confirm box', async () => {
    showPreview(unpaidPreview);
    const user = userEvent.setup();
    const dialog = await openDialog(user);
    expect(dialog.querySelector('input[type="file"]')).toBeNull();
    expect(within(dialog).queryByText(/Đính kèm ảnh/i)).not.toBeInTheDocument();
  });

  it('TC-PM-014: paid booking keeps refund amount, policy link, and bank step without image input', async () => {
    showPreview(paidPreview);
    const user = userEvent.setup();
    const dialog = await openDialog(user);
    const view = within(dialog);

    expect(view.getByText('Dự kiến hoàn')).toBeInTheDocument();
    expect(
      view.getAllByText('1.600.000 ₫', { normalizer: (text) => text.replace(/\s/g, ' ') }).length,
    ).toBeGreaterThan(0);
    expect(view.getByText(/Xem chi tiết chính sách hoàn tiền/i)).toBeInTheDocument();
    expect(view.queryByText(/không phát sinh hoàn tiền/i)).not.toBeInTheDocument();

    await user.click(view.getByRole('button', { name: 'Tiếp tục hủy' }));
    const bankDialog = screen.getByRole('dialog');
    expect(within(bankDialog).getByLabelText('Ngân hàng')).toBeInTheDocument();
    expect(within(bankDialog).getByLabelText('Số tài khoản')).toBeInTheDocument();
    expect(within(bankDialog).getByLabelText('Tên chủ tài khoản')).toBeInTheDocument();
    expect(bankDialog.querySelector('input[type="file"]')).toBeNull();
  });

  it('TC-PM-015: paid cancel payload keeps bank account and consent but no base64 in reason', async () => {
    showPreview(paidPreview);
    const user = userEvent.setup();
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Tiếp tục hủy' }));
    const bank = screen.getByRole('dialog');
    await user.selectOptions(within(bank).getByLabelText('Ngân hàng'), 'VCB');
    await user.type(within(bank).getByLabelText('Số tài khoản'), '0123456789');
    await user.type(within(bank).getByLabelText('Tên chủ tài khoản'), 'Nguyen Van A');
    await user.click(within(bank).getByRole('checkbox'));
    await user.click(within(bank).getByRole('button', { name: 'Hủy booking' }));

    expect(cancelAsync).toHaveBeenCalledTimes(1);
    const { payload } = cancelAsync.mock.calls[0][0];
    expect(payload.bankAccount).toEqual({
      bankCode: 'VCB',
      accountNumber: '0123456789',
      accountHolder: 'Nguyen Van A',
    });
    expect(payload.consentAccepted).toBe(true);
    expect(payload.expectedRefundAmount).toBe(1600000);
    expect(String(payload.reason ?? '')).not.toContain('data:image');
  });
});

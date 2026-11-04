import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCancellationPreview, useCancelTripBooking } from '../hooks/useTripBookings';
import CancelBookingPanel from './CancelBookingPanel';

vi.mock('../hooks/useTripBookings', () => ({
  useCancellationPreview: vi.fn(),
  useCancelTripBooking: vi.fn(),
}));

const preview = {
  canCancel: true,
  appliedCase: 'Hủy trước giờ khởi hành từ 72 giờ trở lên',
  paidAmount: 2000000,
  estimatedRefundAmount: 1600000,
  consentVersion: 'refund-bank-data-v1',
  refundPolicy: {
    name: 'Chính sách hủy Tour',
    version: 2,
    rules: [
      { minHoursBefore: 168, refundPercentage: 100 },
      { minHoursBefore: 72, refundPercentage: 80 },
      { minHoursBefore: 24, refundPercentage: 30 },
      { minHoursBefore: 0, refundPercentage: 0 },
    ],
  },
};

describe('CancelBookingPanel', () => {
  const cancelAsync = vi.fn();
  const refetch = vi.fn();
  const showPreview = (data) =>
    useCancellationPreview.mockReturnValue({ data, isLoading: false, isError: false, refetch });

  const openDialog = async (user) => {
    render(<CancelBookingPanel orderId="order-1" />);
    await user.click(screen.getByRole('button', { name: 'Hủy booking' }));
  };

  const fillBankForm = async (user) => {
    await user.selectOptions(screen.getByLabelText('Ngân hàng'), 'VCB');
    await user.type(screen.getByLabelText('Số tài khoản'), '0123456789');
    await user.type(screen.getByLabelText('Tên chủ tài khoản'), 'Nguyen Van A');
  };

  const clickDialogButton = async (user, name) => {
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    showPreview(preview);
    useCancelTripBooking.mockReturnValue({ mutateAsync: cancelAsync, isPending: false });
  });

  it('shows only the cancellation impact before asking for refund bank details', async () => {
    const user = userEvent.setup();
    await openDialog(user);

    expect(
      screen.getByText('1.600.000 ₫', { normalizer: (text) => text.replace(/\s/g, ' ') }),
    ).toBeInTheDocument();
    expect(screen.getByText(preview.appliedCase)).toBeInTheDocument();
    expect(screen.queryByLabelText('Ngân hàng')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Lý do hủy/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tiếp tục hủy' }));

    expect(screen.getByRole('heading', { name: 'Thông tin nhận hoàn tiền' })).toBeInTheDocument();
    expect(screen.getByLabelText('Ngân hàng')).toBeInTheDocument();
    expect(screen.getByLabelText('Số tài khoản')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên chủ tài khoản')).toBeInTheDocument();
  });

  it('opens the full policy screen and highlights the rule applied to this booking', async () => {
    const user = userEvent.setup();
    await openDialog(user);

    await user.click(screen.getByRole('button', { name: 'Xem chi tiết chính sách hoàn tiền' }));

    expect(screen.getByRole('heading', { name: 'Chính sách hủy booking' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const appliedRule = screen.getByRole('listitem', {
      name: /Hủy từ 3 ngày đến dưới 7 ngày trước giờ khởi hành/i,
    });
    expect(appliedRule).toHaveAttribute('aria-current', 'true');
    expect(appliedRule).toHaveTextContent('1.600.000 ₫');

    await user.click(screen.getByRole('button', { name: 'Quay lại xác nhận hủy' }));
    expect(screen.getByRole('dialog', { name: 'Xác nhận hủy booking' })).toBeInTheDocument();
  });

  it('keeps the consent checkbox unchecked and blocks submit until accepted', async () => {
    const user = userEvent.setup();
    await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Tiếp tục hủy' }));
    await fillBankForm(user);

    expect(screen.getByRole('checkbox')).not.toBeChecked();
    await clickDialogButton(user, 'Hủy booking');

    expect(await screen.findByText('Bạn cần đồng ý để tiếp tục')).toBeInTheDocument();
    expect(cancelAsync).not.toHaveBeenCalled();
  });

  it('sends the previewed amount, bank account and consent version', async () => {
    const user = userEvent.setup();
    cancelAsync.mockResolvedValue({});
    await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Tiếp tục hủy' }));
    await fillBankForm(user);
    await user.click(screen.getByRole('checkbox'));
    await clickDialogButton(user, 'Hủy booking');

    expect(cancelAsync).toHaveBeenCalledWith({
      orderId: 'order-1',
      payload: {
        reason: undefined,
        expectedRefundAmount: 1600000,
        bankAccount: { bankCode: 'VCB', accountNumber: '0123456789', accountHolder: 'Nguyen Van A' },
        consentVersion: 'refund-bank-data-v1',
        consentAccepted: true,
      },
    });
  });

  it('hides the bank form when nothing is refunded', async () => {
    const user = userEvent.setup();
    showPreview({ ...preview, estimatedRefundAmount: 0 });
    cancelAsync.mockResolvedValue({});
    await openDialog(user);

    expect(screen.queryByLabelText('Số tài khoản')).not.toBeInTheDocument();
    await clickDialogButton(user, 'Xác nhận hủy');
    expect(cancelAsync).toHaveBeenCalledWith({
      orderId: 'order-1',
      payload: { reason: undefined, expectedRefundAmount: 0 },
    });
  });

  it('reloads the preview when the refund amount changed', async () => {
    const user = userEvent.setup();
    cancelAsync.mockRejectedValue({
      statusCode: 409,
      message: 'x',
      errors: { code: ['REFUND_AMOUNT_CHANGED'] },
    });
    await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Tiếp tục hủy' }));
    await fillBankForm(user);
    await user.click(screen.getByRole('checkbox'));
    await clickDialogButton(user, 'Hủy booking');

    expect(await screen.findByRole('alert')).toHaveTextContent('Số tiền hoàn đã thay đổi');
    expect(refetch).toHaveBeenCalled();
  });

  it('maps server validation errors to the nested bank fields', async () => {
    const user = userEvent.setup();
    cancelAsync.mockRejectedValue({
      statusCode: 400,
      message: 'Dữ liệu không hợp lệ',
      errors: { 'bankAccount.bankCode': ['Ngân hàng không được hỗ trợ'] },
    });
    await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Tiếp tục hủy' }));
    await fillBankForm(user);
    await user.click(screen.getByRole('checkbox'));
    await clickDialogButton(user, 'Hủy booking');

    expect(await screen.findByText('Ngân hàng không được hỗ trợ')).toBeInTheDocument();
  });

  it('shows why a booking cannot be cancelled', async () => {
    showPreview({ ...preview, canCancel: false, blockedReason: 'Chuyến đi đã bắt đầu' });
    await openDialog(userEvent.setup());

    expect(screen.getByText('Chuyến đi đã bắt đầu')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xác nhận hủy' })).not.toBeInTheDocument();
  });
});

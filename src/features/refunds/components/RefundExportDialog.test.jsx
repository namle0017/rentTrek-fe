import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExportRefunds, useRequestExportCode } from '../hooks/useRefundCases';
import RefundExportDialog from './RefundExportDialog';

vi.mock('../hooks/useRefundCases', () => ({
  useExportRefunds: vi.fn(),
  useRequestExportCode: vi.fn(),
}));

describe('RefundExportDialog', () => {
  const requestCode = vi.fn();
  const exportRefunds = vi.fn();
  const onClose = vi.fn();

  const enterCode = async (user) => {
    await user.click(screen.getByRole('button', { name: 'Gửi mã tới email' }));
    await user.type(await screen.findByLabelText('Mã xác thực gửi tới email của bạn'), '123456');
  };

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:refund');
    URL.revokeObjectURL = vi.fn();
    requestCode.mockResolvedValue({ data: { challengeId: 'challenge-1' } });
    useRequestExportCode.mockReturnValue({ mutateAsync: requestCode, isPending: false });
    useExportRefunds.mockReturnValue({ mutateAsync: exportRefunds, isPending: false });
  });

  it('downloads the file after the OTP is verified', async () => {
    const user = userEvent.setup();
    exportRefunds.mockResolvedValue(new Blob(['xlsx']));
    render(<RefundExportDialog reExport={false} fromDate={null} toDate={null} onClose={onClose} />);

    await enterCode(user);
    await user.click(screen.getByRole('button', { name: 'Xác thực và tải file' }));

    expect(exportRefunds).toHaveBeenCalledWith({
      challengeId: 'challenge-1',
      verificationCode: '123456',
      reExport: false,
      fromDate: null,
      toDate: null,
    });
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:refund');
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps the dialog open and shows the error when the code is wrong', async () => {
    const user = userEvent.setup();
    exportRefunds.mockRejectedValue(new Error('Mã xác thực không đúng'));
    render(<RefundExportDialog reExport={false} fromDate={null} toDate={null} onClose={onClose} />);

    await enterCode(user);
    await user.click(screen.getByRole('button', { name: 'Xác thực và tải file' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Mã xác thực không đúng');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

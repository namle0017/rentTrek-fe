import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { refundService } from '../api/refundService';
import RefundCompleteDialog from './RefundCompleteDialog';

vi.mock('../api/refundService', () => {
  const service = { complete: vi.fn() };
  return { refundService: service, default: service };
});
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const item = {
  refundCaseId: 'a1b2c3d4-0000-0000-0000-000000000000',
  amount: 1600000,
  customerName: 'Nguyễn Văn A',
  rowVersion: 3,
};

const image = (name = 'bill.png', type = 'image/png', size = 1024) => {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

function renderDialog() {
  const onClose = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RefundCompleteDialog item={item} onClose={onClose} />
    </QueryClientProvider>,
  );
  return { onClose };
}

describe('RefundCompleteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    refundService.complete.mockResolvedValue({ data: {}, message: 'ok' });
  });

  it('marks the transaction id as required', () => {
    renderDialog();

    expect(screen.getByLabelText('Mã giao dịch ngân hàng *')).toBeInTheDocument();
    expect(screen.queryByText(/không bắt buộc/i)).not.toBeInTheDocument();
  });

  it('blocks submit without a transaction id', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), image());

    await user.click(screen.getByRole('button', { name: 'Hoàn tất hồ sơ' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Vui lòng nhập mã giao dịch ngân hàng');
    expect(refundService.complete).not.toHaveBeenCalled();
  });

  it('blocks submit without a proof image', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getByLabelText('Mã giao dịch ngân hàng *'), 'FT-1');

    await user.click(screen.getByRole('button', { name: 'Hoàn tất hồ sơ' }));

    expect(await screen.findByText('Vui lòng đính kèm ít nhất 1 ảnh chứng từ')).toBeInTheDocument();
    expect(refundService.complete).not.toHaveBeenCalled();
  });

  it('submits multipart FormData with transaction id, row version and files', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    const first = image('a.png');
    const second = image('b.jpg', 'image/jpeg');

    await user.type(screen.getByLabelText('Mã giao dịch ngân hàng *'), '  FT-123  ');
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), [first, second]);
    await user.click(screen.getByRole('button', { name: 'Hoàn tất hồ sơ' }));

    expect(refundService.complete).toHaveBeenCalledTimes(1);
    const { refundCaseId, formData } = refundService.complete.mock.calls[0][0];
    expect(refundCaseId).toBe(item.refundCaseId);
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('providerTransactionId')).toBe('FT-123');
    expect(formData.get('expectedRowVersion')).toBe('3');
    expect(formData.getAll('files')).toHaveLength(2);
    expect(onClose).toHaveBeenCalled();
  });

  it('rejects a fourth image and keeps the dialog open', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    await user.type(screen.getByLabelText('Mã giao dịch ngân hàng *'), 'FT-1');
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), [
      image('1.png'),
      image('2.png'),
      image('3.png'),
      image('4.png'),
    ]);

    await user.click(screen.getByRole('button', { name: 'Hoàn tất hồ sơ' }));

    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(refundService.complete).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('rejects a file larger than 5MB', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getByLabelText('Mã giao dịch ngân hàng *'), 'FT-1');
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), image('big.png', 'image/png', 6 * 1024 * 1024));

    expect(await screen.findByRole('alert')).toHaveTextContent('big.png');
    await user.click(screen.getByRole('button', { name: 'Hoàn tất hồ sơ' }));
    expect(refundService.complete).not.toHaveBeenCalled();
  });

  it('rejects a non-image file', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderDialog();
    await user.type(screen.getByLabelText('Mã giao dịch ngân hàng *'), 'FT-1');
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), image('doc.pdf', 'application/pdf'));

    expect(await screen.findByRole('alert')).toHaveTextContent('doc.pdf');
    await user.click(screen.getByRole('button', { name: 'Hoàn tất hồ sơ' }));
    expect(refundService.complete).not.toHaveBeenCalled();
  });

  it('removes a selected image with its remove button', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), image('bill.png'));

    await user.click(screen.getByRole('button', { name: 'Xóa ảnh bill.png' }));

    expect(screen.queryByRole('button', { name: 'Xóa ảnh bill.png' })).not.toBeInTheDocument();
  });

  it('shows the server error and stays open when completion fails', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    refundService.complete.mockRejectedValue(
      Object.assign(new Error('Mã giao dịch đã được dùng'), {
        errors: { providerTransactionId: ['Mã giao dịch đã được dùng cho hồ sơ khác'] },
      }),
    );
    await user.type(screen.getByLabelText('Mã giao dịch ngân hàng *'), 'FT-1');
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), image());

    await user.click(screen.getByRole('button', { name: 'Hoàn tất hồ sơ' }));

    expect(await screen.findByText('Mã giao dịch đã được dùng cho hồ sơ khác')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { refundService } from '../api/refundService';
import ManualRefundDialog from './ManualRefundDialog';

vi.mock('../api/refundService', () => {
  const service = { markManual: vi.fn() };
  return { refundService: service, default: service };
});
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const payment = { paymentId: 'pay-1', orderCode: 'RT-001', amount: -500000 };

const image = (name = 'bill.png', type = 'image/png') => new File(['x'], name, { type });

function renderDialog() {
  const onClose = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ManualRefundDialog payment={payment} onClose={onClose} />
    </QueryClientProvider>,
  );
  return { onClose };
}

describe('ManualRefundDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    refundService.markManual.mockResolvedValue({ data: {}, message: 'ok' });
  });

  it('shows the order code and required labels', () => {
    renderDialog();

    expect(screen.getByText(/RT-001/)).toBeInTheDocument();
    expect(screen.getByLabelText('Mã tham chiếu chuyển khoản *')).toBeInTheDocument();
    expect(screen.getByLabelText('Ghi chú')).toBeInTheDocument();
    expect(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/)).toBeInTheDocument();
  });

  it('requires the transfer reference', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), image());

    await user.click(screen.getByRole('button', { name: 'Ghi nhận đã chuyển' }));

    expect(await screen.findByText('Vui lòng nhập mã tham chiếu chuyển khoản')).toBeInTheDocument();
    expect(refundService.markManual).not.toHaveBeenCalled();
  });

  it('requires at least one proof image', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getByLabelText('Mã tham chiếu chuyển khoản *'), 'REF-1');

    await user.click(screen.getByRole('button', { name: 'Ghi nhận đã chuyển' }));

    expect(await screen.findByText('Vui lòng đính kèm ít nhất 1 ảnh chứng từ')).toBeInTheDocument();
    expect(refundService.markManual).not.toHaveBeenCalled();
  });

  it('submits multipart FormData with reference, note and files', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.type(screen.getByLabelText('Mã tham chiếu chuyển khoản *'), ' REF-1 ');
    await user.type(screen.getByLabelText('Ghi chú'), 'Chuyển tay');
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), image());
    await user.click(screen.getByRole('button', { name: 'Ghi nhận đã chuyển' }));

    expect(refundService.markManual).toHaveBeenCalledTimes(1);
    const { paymentId, formData } = refundService.markManual.mock.calls[0][0];
    expect(paymentId).toBe('pay-1');
    expect(formData.get('manualReference')).toBe('REF-1');
    expect(formData.get('note')).toBe('Chuyển tay');
    expect(formData.getAll('files')).toHaveLength(1);
    expect(onClose).toHaveBeenCalled();
  });

  it('omits the note field when it is blank', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getByLabelText('Mã tham chiếu chuyển khoản *'), 'REF-1');
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), image());

    await user.click(screen.getByRole('button', { name: 'Ghi nhận đã chuyển' }));

    expect(refundService.markManual.mock.calls[0][0].formData.has('note')).toBe(false);
  });

  it('rejects non-image files', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderDialog();
    await user.type(screen.getByLabelText('Mã tham chiếu chuyển khoản *'), 'REF-1');
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), image('x.pdf', 'application/pdf'));

    await user.click(screen.getByRole('button', { name: 'Ghi nhận đã chuyển' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('x.pdf');
    expect(refundService.markManual).not.toHaveBeenCalled();
  });

  it('shows the server error and stays open on failure', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    refundService.markManual.mockRejectedValue(new Error('Khoản hoàn không còn chờ xử lý'));
    await user.type(screen.getByLabelText('Mã tham chiếu chuyển khoản *'), 'REF-1');
    await user.upload(screen.getByLabelText(/Ảnh chứng từ chuyển khoản/), image());

    await user.click(screen.getByRole('button', { name: 'Ghi nhận đã chuyển' }));

    expect(await screen.findByText('Khoản hoàn không còn chờ xử lý')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

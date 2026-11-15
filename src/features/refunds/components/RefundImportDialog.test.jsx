import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { refundService } from '../api/refundService';
import RefundImportDialog from './RefundImportDialog';

vi.mock('../api/refundService', () => {
  const service = { importResult: vi.fn() };
  return { refundService: service, default: service };
});
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const row = (overrides) => ({
  rowNumber: 2,
  refundCaseId: 'c1',
  refundCode: 'HT-AAAAAAAA',
  customerName: 'Nguyễn Văn A',
  amount: 2000000,
  action: 'Complete',
  transactionId: 'FT-1',
  reason: null,
  imageCount: 1,
  errors: [],
  applied: false,
  resultStatus: null,
  ...overrides,
});

const preview = {
  batchId: null,
  fileName: 'ketqua.xlsx',
  dryRun: true,
  totalRows: 3,
  validRows: 2,
  completedCount: 0,
  failedCount: 0,
  errorCount: 1,
  rows: [
    row({}),
    row({ rowNumber: 3, refundCode: 'HT-BBBBBBBB', action: 'Fail', transactionId: null, imageCount: 0, reason: 'Sai STK' }),
    row({ rowNumber: 4, refundCode: 'HT-CCCCCCCC', action: 'Skip', imageCount: 0, errors: ['Chưa điền trạng thái'] }),
  ],
};

const xlsx = () =>
  new File(['x'], 'ketqua.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

function renderDialog(onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  render(
    <QueryClientProvider client={queryClient}>
      <RefundImportDialog onClose={onClose} />
    </QueryClientProvider>,
  );
  return { onClose, invalidate };
}

describe('RefundImportDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refundService.importResult.mockResolvedValue({ data: preview });
  });

  it('requests a dry-run preview as soon as an xlsx is chosen and lists every row', async () => {
    const user = userEvent.setup();
    renderDialog();
    const file = xlsx();

    await user.upload(screen.getByLabelText('Chọn file kết quả từ kế toán'), file);

    expect(refundService.importResult).toHaveBeenCalledTimes(1);
    expect(refundService.importResult).toHaveBeenCalledWith(file, true);
    expect(await screen.findByText('HT-AAAAAAAA')).toBeInTheDocument();
    expect(screen.getByText('HT-BBBBBBBB')).toBeInTheDocument();
    expect(screen.getByText('Hoàn tất')).toBeInTheDocument();
    expect(screen.getByText('Thất bại')).toBeInTheDocument();
    expect(screen.getByText('Bỏ qua')).toBeInTheDocument();
    expect(screen.getByText('Chưa điền trạng thái')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Áp dụng 2 dòng hợp lệ' })).toBeEnabled();
  });

  it('applies with dryRun=false, shows the summary and invalidates the queue', async () => {
    const user = userEvent.setup();
    const { invalidate } = renderDialog();
    const file = xlsx();
    refundService.importResult
      .mockResolvedValueOnce({ data: preview })
      .mockResolvedValueOnce({
        data: { ...preview, dryRun: false, batchId: 'b1', completedCount: 1, failedCount: 1, errorCount: 1 },
        message: 'ok',
      });

    await user.upload(screen.getByLabelText('Chọn file kết quả từ kế toán'), file);
    await user.click(await screen.findByRole('button', { name: 'Áp dụng 2 dòng hợp lệ' }));

    expect(refundService.importResult).toHaveBeenLastCalledWith(file, false);
    expect(await screen.findByText('Đã hoàn tất 1 · Thất bại 1 · Lỗi 1')).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /^Áp dụng/ })).not.toBeInTheDocument();
  });

  it('disables apply when no row is valid', async () => {
    const user = userEvent.setup();
    refundService.importResult.mockResolvedValue({
      data: { ...preview, validRows: 0, errorCount: 3, rows: [preview.rows[2]] },
    });
    renderDialog();

    await user.upload(screen.getByLabelText('Chọn file kết quả từ kế toán'), xlsx());

    expect(await screen.findByRole('button', { name: 'Áp dụng 0 dòng hợp lệ' })).toBeDisabled();
  });

  it('rejects a non-xlsx file without calling the API', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderDialog();

    await user.upload(
      screen.getByLabelText('Chọn file kết quả từ kế toán'),
      new File(['x'], 'ketqua.csv', { type: 'text/csv' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('.xlsx');
    expect(refundService.importResult).not.toHaveBeenCalled();
  });

  it('shows the server error when the preview fails', async () => {
    const user = userEvent.setup();
    refundService.importResult.mockRejectedValue(new Error('File thiếu cột Mã giao dịch'));
    renderDialog();

    await user.upload(screen.getByLabelText('Chọn file kết quả từ kế toán'), xlsx());

    expect(await screen.findByRole('alert')).toHaveTextContent('File thiếu cột Mã giao dịch');
    expect(screen.queryByRole('button', { name: /^Áp dụng/ })).not.toBeInTheDocument();
  });

  it('shows an error and stays on the preview when apply fails', async () => {
    const user = userEvent.setup();
    renderDialog();
    refundService.importResult
      .mockResolvedValueOnce({ data: preview })
      .mockRejectedValueOnce(new Error('Máy chủ bận'));

    await user.upload(screen.getByLabelText('Chọn file kết quả từ kế toán'), xlsx());
    await user.click(await screen.findByRole('button', { name: 'Áp dụng 2 dòng hợp lệ' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Máy chủ bận');
    expect(screen.getByRole('button', { name: 'Áp dụng 2 dòng hợp lệ' })).toBeEnabled();
  });
});

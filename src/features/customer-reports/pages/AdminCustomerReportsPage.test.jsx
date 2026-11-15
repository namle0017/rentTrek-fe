import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useAdminCustomerReport,
  useAdminCustomerReports,
  useCustomerReportSummary,
  useUpdateCustomerReportStatus,
} from '../hooks/useCustomerReports';
import AdminCustomerReportsPage from './AdminCustomerReportsPage';

vi.mock('../hooks/useCustomerReports', () => ({
  useAdminCustomerReports: vi.fn(),
  useAdminCustomerReport: vi.fn(),
  useCustomerReportSummary: vi.fn(),
  useUpdateCustomerReportStatus: vi.fn(),
}));

const report = {
  customerReportId: 'rep-1',
  sourceType: 'Trip',
  orderId: 'ord-1',
  orderCode: 'TB-001',
  orderStatus: 'Confirmed',
  tourName: 'Fansipan 2N1Đ',
  tripStartAt: '2026-11-20T01:00:00Z',
  category: 'Guide',
  description: 'Hướng dẫn viên đến trễ hơn 1 tiếng',
  photoUrls: ['https://cdn.example/a.jpg'],
  status: 'Open',
  reporterName: 'Nguyễn An',
  reporterEmail: 'an@example.com',
  createdAt: '2026-11-16T03:00:00Z',
};

const mutate = vi.fn();

describe('AdminCustomerReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLDialogElement.prototype.showModal ??= vi.fn();
    HTMLDialogElement.prototype.close ??= vi.fn();
    useAdminCustomerReports.mockReturnValue({
      data: { items: [report], pageNumber: 1, totalPages: 1, totalItems: 1 },
      isLoading: false,
      isError: false,
    });
    useCustomerReportSummary.mockReturnValue({ data: { open: 1, inProgress: 0, resolved: 0, rejected: 0 } });
    useAdminCustomerReport.mockImplementation((id) => ({ data: id ? report : undefined, isLoading: false }));
    useUpdateCustomerReportStatus.mockReturnValue({ mutate, isPending: false });
  });

  it('lists reports and requires a reply before resolving', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminCustomerReportsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('TB-001')).toBeInTheDocument();
    await user.click(screen.getByText('Nguyễn An'));

    await user.click(screen.getByRole('button', { name: 'Đánh dấu đã xử lý' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Nhập phản hồi cho khách');
    expect(mutate).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/Phản hồi cho khách/), 'Đã nhắc nhở HDV và tặng voucher');
    await user.click(screen.getByRole('button', { name: 'Đánh dấu đã xử lý' }));
    expect(mutate).toHaveBeenCalledWith(
      { id: 'rep-1', status: 'Resolved', adminNote: 'Đã nhắc nhở HDV và tặng voucher' },
      expect.any(Object),
    );
  });
});

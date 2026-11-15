import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '@/api/axiosClient';
import { rentalService } from '../api/rentalService';
import RentalIssueReportModal from './RentalIssueReportModal';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/api/axiosClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('../api/rentalService', () => ({
  rentalService: {
    uploadIssuePhoto: vi.fn(),
    reportItemIssue: vi.fn(),
  },
}));

const order = {
  id: 'order-rent-123',
  orderCode: 'RT-202611-999',
  lines: [{ id: 'line-1', displayName: 'Lều cắm trại 4 người', quantity: 1 }],
};

function renderModal(props = {}) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  render(
    <QueryClientProvider client={client}>
      <RentalIssueReportModal order={order} isOpen onClose={onClose} onSuccess={onSuccess} {...props} />
    </QueryClientProvider>,
  );
  return { onClose, onSuccess };
}

const image = (name) => new File([name], name, { type: 'image/jpeg' });

describe('RentalIssueReportModal - phase 01 (item 1: multipart per photo)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rentalService.uploadIssuePhoto.mockResolvedValue({ data: {}, message: 'ok' });
    rentalService.reportItemIssue.mockResolvedValue({ data: {}, message: 'ok' });
    axiosClient.post.mockResolvedValue({ data: {} });
  });

  it('TC-PM-030: uploads each selected photo as its own multipart call to issue-photos', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Mô tả chi tiết tình trạng lỗi/i), 'Khóa kéo lều bị kẹt');
    const input = document.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    const first = image('a.jpg');
    const second = image('b.jpg');
    await user.upload(input, [first, second]);
    await user.click(screen.getByRole('button', { name: 'Gửi báo cáo sự cố' }));

    await waitFor(() => expect(rentalService.uploadIssuePhoto).toHaveBeenCalledTimes(2));
    const calls = rentalService.uploadIssuePhoto.mock.calls;
    expect(calls.every(([orderId]) => orderId === 'order-rent-123')).toBe(true);
    expect(calls.map(([, arg]) => arg.file)).toEqual([first, second]);
  });

  it('TC-PM-031: never sends base64 proofUrls or posts to the non-existent /issues endpoint', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Mô tả chi tiết tình trạng lỗi/i), 'Cọc số 2 bị nứt');
    await user.upload(document.querySelector('input[type="file"]'), image('c.jpg'));
    await user.click(screen.getByRole('button', { name: 'Gửi báo cáo sự cố' }));

    await waitFor(() => expect(rentalService.uploadIssuePhoto).toHaveBeenCalled());
    for (const [, payload] of rentalService.reportItemIssue.mock.calls) {
      expect(JSON.stringify(payload ?? {})).not.toContain('data:image');
    }
    const issuePosts = axiosClient.post.mock.calls.filter(([url]) => /\/issues$/.test(String(url)));
    expect(issuePosts).toHaveLength(0);
  });

  it('TC-PM-032: without photos the report cannot be sent (BE only accepts photo uploads)', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Mô tả chi tiết tình trạng lỗi/i), 'Sai kích cỡ');
    expect(screen.getByRole('button', { name: 'Gửi báo cáo sự cố' })).toBeDisabled();
    expect(rentalService.uploadIssuePhoto).not.toHaveBeenCalled();
  });
});

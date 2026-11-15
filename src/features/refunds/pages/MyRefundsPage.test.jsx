import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyRefundsPage from './MyRefundsPage';
import { refundService } from '../api/refundService';

vi.mock('../api/refundService', () => {
  const refundService = { getMine: vi.fn() };
  return { refundService, default: refundService };
});

const page = (items) => ({
  data: { items, pageNumber: 1, pageSize: 10, totalItems: items.length, totalPages: 1, hasPrevious: false, hasNext: false },
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <MyRefundsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MyRefundsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists refunds and highlights the ones needing customer action', async () => {
    refundService.getMine.mockResolvedValue(
      page([
        {
          refundCaseId: '11111111-2222-3333-4444-555555555555',
          orderId: 'o1',
          orderCode: 'RT-1',
          orderType: 'TripBooking',
          tourName: 'Tà Xùa',
          source: 'TripCancellation',
          amount: 500000,
          status: 'Rejected',
          updatedAt: '2026-11-15T03:00:00Z',
          canResubmit: true,
          canSubmitBankInfo: false,
        },
      ]),
    );

    renderPage();

    expect(await screen.findByText('Tà Xùa')).toBeInTheDocument();
    expect(screen.getByText('Có thể nhập lại số tài khoản và gửi lại yêu cầu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tà Xùa/ })).toHaveAttribute(
      'href',
      '/refunds/11111111-2222-3333-4444-555555555555',
    );
  });

  it('filters by the "needs action" tab', async () => {
    refundService.getMine.mockResolvedValue(page([]));
    renderPage();
    await screen.findByText('Chưa có hồ sơ hoàn tiền nào.');

    await userEvent.click(screen.getByRole('button', { name: 'Cần bạn xử lý' }));

    expect(refundService.getMine).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'AwaitingBankInfo,Rejected,Failed', pageNumber: 1 }),
    );
  });
});

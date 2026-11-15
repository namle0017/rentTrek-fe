import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { useReconcileAccept, useReconcileRefund } from '@/features/finance/hooks/useRefunds';
import OrderDetailPage from './OrderDetailPage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/operations/hooks/useOperations', () => ({ useOperations: vi.fn() }));
vi.mock('@/features/finance/hooks/useRefunds', () => ({
  useReconcileAccept: vi.fn(),
  useReconcileRefund: vi.fn(),
}));

const acceptMutate = vi.fn();
const refundMutate = vi.fn();

const detail = (paymentStatus) => ({
  order: {
    orderId: 'order-1',
    orderCode: 'TR-1',
    orderType: 'Tour',
    serviceSummary: 'Tour A',
    status: 'PendingPayment',
    paymentStatus,
    totalAmount: 1000000,
    createdAt: '2026-11-01T00:00:00Z',
    customer: { fullName: 'Khách A', email: 'a@x.vn' },
  },
  participants: [],
  payments: [],
  lines: [],
  promotions: [],
  auditLogs: [],
  rentalPeriod: null,
  handlerFullName: null,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/orders/TR-1']}>
      <Routes>
        <Route path="/admin/orders/:orderCode" element={<OrderDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OrderDetailPage reconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { role: 'Admin' } });
    useOperations.mockReturnValue({
      isPending: false,
      isError: false,
      data: detail('NeedsReconciliation'),
      refetch: vi.fn(),
    });
    useReconcileAccept.mockReturnValue({ mutate: acceptMutate, isPending: false });
    useReconcileRefund.mockReturnValue({ mutate: refundMutate, isPending: false });
  });

  it('accepts the received amount after confirmation', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Chấp nhận khoản đã nhận' }));
    await userEvent.click(screen.getByRole('button', { name: 'Chấp nhận' }));
    expect(acceptMutate).toHaveBeenCalledWith('order-1', expect.any(Object));
    expect(refundMutate).not.toHaveBeenCalled();
  });

  it('refunds in full after confirmation', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Hoàn lại toàn bộ' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Hoàn lại toàn bộ' }).at(-1));
    expect(refundMutate).toHaveBeenCalledWith('order-1', expect.any(Object));
  });

  it('hides the buttons from Staff', () => {
    useAuth.mockReturnValue({ currentUser: { role: 'Staff' } });
    renderPage();
    expect(screen.queryByRole('button', { name: 'Chấp nhận khoản đã nhận' })).not.toBeInTheDocument();
  });

  it('hides the buttons when payment does not need reconciliation', () => {
    useOperations.mockReturnValue({ isPending: false, isError: false, data: detail('Paid'), refetch: vi.fn() });
    renderPage();
    expect(screen.queryByRole('button', { name: 'Hoàn lại toàn bộ' })).not.toBeInTheDocument();
  });
});

import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminRentalAdjustments, useAdminRentalOrder } from '../hooks/useRentalOps';
import AdminRentalOrderDetailPage from './AdminRentalOrderDetailPage';

vi.mock('@/hooks/useDevClock', () => ({ useDevClockControls: () => ({ canControl: false }) }));
vi.mock('../components/RentalAssetsPanel', () => ({ default: () => null }));
vi.mock('../components/RentalChargesPanel', () => ({ default: () => null }));
vi.mock('../hooks/useRentalOps', () => {
  const mutation = () => ({ mutate: vi.fn(), isPending: false });
  return {
    useAdminRentalOrder: vi.fn(),
    useAdminRentalAdjustments: vi.fn(),
    useAssessRentalCharge: mutation,
    useClaimRental: mutation,
    useCompleteRental: mutation,
    useCreateRentalCharge: mutation,
    useHandoverRental: mutation,
    useReturnRentalAssets: mutation,
    useVoidRentalCharge: mutation,
  };
});

const order = {
  orderId: 'o-1',
  orderCode: 'RT-100',
  status: 'Confirmed',
  paymentStatus: 'Paid',
  rentalStartAt: '2026-11-20T01:00:00Z',
  rentalEndAt: '2026-11-22T01:00:00Z',
  serverNow: '2026-11-15T01:00:00Z',
  customer: { fullName: 'Khách A', email: 'a@x.vn', phone: null },
  lines: [],
  assignments: [],
  charges: [],
  allowedActions: {},
  overdue: { isOverdue: false },
  settlement: { depositHeld: 0, validCharges: 0, depositToRefund: 0, additionalAmountDue: 0 },
  amounts: { paidAmount: 0 },
  evidencePhotos: [{ id: 'p1', stage: 'Handover', imageUrl: 'http://img/1.jpg', note: 'Lều trầy' }],
  reports: [
    {
      rentalReportId: 'r1',
      reportType: 'ReturnInspection',
      status: 'Submitted',
      amount: 50000,
      note: 'Rách túi',
      createdAt: '2026-11-22T02:00:00Z',
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/rental-orders/o-1']}>
      <Routes>
        <Route path="/admin/rental-orders/:orderId" element={<AdminRentalOrderDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminRentalOrderDetailPage', () => {
  beforeEach(() => {
    useAdminRentalOrder.mockReturnValue({ data: order, isLoading: false, isError: false });
    useAdminRentalAdjustments.mockReturnValue({ data: [] });
  });

  it('links to the handover, return and settlement steps by order code', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Giao đồ' })).toHaveAttribute('href', '/ops/rentals/RT-100/handover');
    expect(screen.getByRole('link', { name: 'Thu hồi' })).toHaveAttribute('href', '/ops/rentals/RT-100/return');
    expect(screen.getByRole('link', { name: 'Hoàn cọc' })).toHaveAttribute('href', '/ops/rentals/RT-100/settlement');
  });

  it('shows evidence photos and reports read-only', () => {
    renderPage();
    expect(screen.getByAltText('Lều trầy')).toBeInTheDocument();
    expect(screen.getByText('Rách túi', { exact: false })).toBeInTheDocument();
  });
});

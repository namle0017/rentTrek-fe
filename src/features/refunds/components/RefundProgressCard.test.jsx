import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRefundCase } from '../hooks/useRefundCases';
import RefundProgressCard from './RefundProgressCard';

vi.mock('../hooks/useRefundCases', () => ({
  useRefundCase: vi.fn(),
}));

const refundCase = {
  refundCaseId: 'a1b2c3d4-0000-0000-0000-000000000000',
  amount: 1600000,
  status: 'Approved',
  bankCode: 'VCB',
  maskedAccount: '******6789',
  timeline: [{ status: 'Approved', occurredAt: '2026-11-02T09:00:00Z' }],
};

describe('RefundProgressCard', () => {
  const show = (data) => useRefundCase.mockReturnValue({ data, isLoading: false, isError: false });

  beforeEach(() => {
    vi.clearAllMocks();
    show(refundCase);
  });

  it('shows the code, masked account and current step', () => {
    render(<RefundProgressCard refundCaseId={refundCase.refundCaseId} />);

    expect(screen.getByText('HỒ SƠ HT-A1B2C3D4')).toBeInTheDocument();
    expect(screen.getByText('Vietcombank · ******6789')).toBeInTheDocument();
    expect(screen.getByText('Kế toán đang xử lý', { selector: 'strong' }).closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('tells the customer to contact support after completion and offers no actions', () => {
    show({ ...refundCase, status: 'Completed' });
    render(<RefundProgressCard refundCaseId={refundCase.refundCaseId} />);

    expect(screen.getByText(/vui lòng liên hệ hỗ trợ/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

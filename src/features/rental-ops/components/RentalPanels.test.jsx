import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import RentalAssetsPanel from './RentalAssetsPanel';
import RentalChargesPanel from './RentalChargesPanel';

const assignments = [
  {
    assignmentId: 'a-1',
    assetCode: 'TENT-01',
    displayName: 'Lều — 2 người',
    status: 'Issued',
    assetStatus: 'Available',
    issuedAt: '2026-11-10T02:00:00Z',
  },
  {
    assignmentId: 'a-2',
    assetCode: 'TENT-02',
    displayName: 'Lều — 2 người',
    status: 'Issued',
    assetStatus: 'Available',
    issuedAt: '2026-11-10T02:00:00Z',
  },
  {
    assignmentId: 'a-3',
    assetCode: 'POLE-01',
    displayName: 'Gậy — cặp',
    status: 'Reserved',
    assetStatus: 'Available',
    issuedAt: null,
  },
];

describe('RentalAssetsPanel', () => {
  it('returns only checked issued assets with their condition and note', async () => {
    const user = userEvent.setup();
    const onReturn = vi.fn();
    render(
      <RentalAssetsPanel
        assignments={assignments}
        allowedActions={{
          canHandover: false,
          handoverBlockedReason: 'Đã quá thời gian thuê',
          canReturn: true,
        }}
        isPending={false}
        onHandover={vi.fn()}
        onReturn={onReturn}
      />,
    );

    // Thiết bị chưa giao (Reserved) không có ô chọn trả
    expect(screen.queryByLabelText('Nhận trả POLE-01')).not.toBeInTheDocument();
    expect(screen.getByText('Giao đồ: Đã quá thời gian thuê')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Nhận trả TENT-01'));
    await user.selectOptions(screen.getByLabelText('Tình trạng trả TENT-01'), 'Damaged');
    await user.type(screen.getByLabelText('Ghi chú TENT-01'), 'Rách cửa lều');
    await user.click(screen.getByLabelText('Nhận trả TENT-02'));
    await user.click(screen.getByRole('button', { name: 'Nhận trả 2 thiết bị đã chọn' }));

    expect(onReturn).toHaveBeenCalledWith(
      [
        { assignmentId: 'a-1', condition: 'Damaged', note: 'Rách cửa lều' },
        { assignmentId: 'a-2', condition: 'Normal', note: null },
      ],
      expect.any(Function),
    );
  });
});

describe('RentalChargesPanel', () => {
  const charges = [
    {
      chargeId: 'c-1',
      chargeType: 'LateReturn',
      amount: 80000,
      reason: 'Trả trễ 1 ngày',
      status: 'Draft',
      createdAt: '2026-11-12T05:00:00Z',
    },
  ];

  it('confirms a suggested late fee and requires an asset for damage charges', async () => {
    const user = userEvent.setup();
    const onAssess = vi.fn();
    const onCreate = vi.fn();
    render(
      <RentalChargesPanel
        charges={charges}
        assignments={assignments}
        canAddCharge
        isPending={false}
        onCreate={onCreate}
        onAssess={onAssess}
        onVoid={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Xác nhận phí' }));
    expect(onAssess).toHaveBeenCalledWith('c-1');

    // Phí hỏng chưa chọn thiết bị → chặn ở FE
    await user.type(screen.getByLabelText('Số tiền (₫)'), '150000');
    await user.type(screen.getByLabelText('Lý do'), 'Rách cửa lều 3 cm');
    await user.click(screen.getByRole('button', { name: 'Lập phí' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Phí hỏng / mất phải chọn thiết bị chịu phí.');
    expect(onCreate).not.toHaveBeenCalled();

    // Chỉ thiết bị đã giao mới chọn được (POLE-01 đang Reserved bị ẩn)
    expect(screen.queryByRole('option', { name: /POLE-01/ })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Thiết bị chịu phí *'), 'a-1');
    await user.click(screen.getByRole('button', { name: 'Lập phí' }));
    expect(onCreate).toHaveBeenCalledWith(
      { chargeType: 'Damage', amount: 150000, reason: 'Rách cửa lều 3 cm', assignmentId: 'a-1' },
      expect.any(Function),
    );
  });
});

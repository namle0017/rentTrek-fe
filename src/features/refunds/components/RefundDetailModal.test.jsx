import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RefundDetailModal from './RefundDetailModal';

describe('RefundDetailModal', () => {
  const mockItem = {
    refundCaseId: '00000000-1111-2222-3333-444455556666',
    orderId: 'aaaa0000-1111-2222-3333-444455556666',
    orderCode: 'TOUR-20261113-001',
    tourName: 'Chinh phục Đỉnh Fansipan',
    customerName: 'Nguyễn Văn A',
    orderTotalAmount: 3000000,
    amount: 2400000,
    status: 'Requested',
    bankCode: 'VCB',
    maskedAccount: '******6789',
    policyName: 'Chính sách hủy tour tiêu chuẩn',
    policyVersion: 2,
    cancelReason:
      '[Lý do: Medical] Tôi bị sốt xuất huyết nặng [Minh chứng: https://storage.vn/giay_vien.jpg]',
    providerTransactionId: null,
    createdAt: '2026-11-13T10:00:00Z',
    rowVersion: 1,
  };

  it('renders modal with correct customer, tour, financial info and parsed reason', () => {
    render(<RefundDetailModal item={mockItem} onClose={vi.fn()} />);

    expect(screen.getByText(/Hồ sơ HT-00000000/i)).toBeInTheDocument();
    expect(screen.getByText('Tour Trekking')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Chinh phục Đỉnh Fansipan')).toBeInTheDocument();
    expect(screen.getByText('Sức khỏe / Y tế khẩn cấp')).toBeInTheDocument();
    expect(screen.getByText('Tôi bị sốt xuất huyết nặng')).toBeInTheDocument();
  });

  it('renders proof images and opens lightbox zoom when clicked', () => {
    render(<RefundDetailModal item={mockItem} onClose={vi.fn()} />);

    const thumbnailBtn = screen.getByTitle('Bấm để xem ảnh phóng to');
    expect(thumbnailBtn).toBeInTheDocument();

    // Click thumbnail to open lightbox
    fireEvent.click(thumbnailBtn);

    const lightbox = screen.getByRole('dialog', { name: 'Xem ảnh phóng to' });
    expect(lightbox).toBeInTheDocument();

    // Click close lightbox button
    const closeBtn = screen.getByLabelText('Đóng phóng to');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog', { name: 'Xem ảnh phóng to' })).not.toBeInTheDocument();
  });

  it('calls onReject when reject button is clicked in Requested status', () => {
    const onRejectMock = vi.fn();
    render(<RefundDetailModal item={mockItem} onClose={vi.fn()} onReject={onRejectMock} />);

    const rejectBtn = screen.getByText('Từ chối');
    fireEvent.click(rejectBtn);

    expect(onRejectMock).toHaveBeenCalledWith(mockItem);
  });

  it('calls onApprove with standard policy when standard approve button is clicked', () => {
    const onApproveMock = vi.fn();
    render(<RefundDetailModal item={mockItem} onClose={vi.fn()} onApprove={onApproveMock} />);

    const approveBtn = screen.getByText(/Duyệt chuẩn/i);
    fireEvent.click(approveBtn);

    expect(onApproveMock).toHaveBeenCalledWith(mockItem, {
      overrideType: 'PolicyStandard',
      approvedAmount: 2400000,
    });
  });

  it('renders rental order correctly when tourName is null', () => {
    const rentalItem = {
      ...mockItem,
      tourName: null,
      orderCode: 'RENT-20261113-009',
    };

    render(<RefundDetailModal item={rentalItem} onClose={vi.fn()} />);
    expect(screen.getByText('Thuê Thiết Bị')).toBeInTheDocument();
  });

  it('renders refund percentage, departure date, policy rule and warning alert when no proof', () => {
    const itemWithDetails = {
      ...mockItem,
      departureDate: '2026-11-20T07:30:00Z',
      appliedRule: 'Hủy trước 7 ngày → Hoàn 80%',
      cancelReason: 'Bận việc gia đình đột xuất', // No proofs
    };

    render(<RefundDetailModal item={itemWithDetails} onClose={vi.fn()} />);

    // Check refund amount with percentage
    expect(screen.getByText(/2.400.000.*\(80%\)/)).toBeInTheDocument();

    // Check departure date & policy rule
    expect(screen.getByText('Ngày khởi hành')).toBeInTheDocument();
    expect(screen.getByText('Mức áp dụng chính sách')).toBeInTheDocument();
    expect(screen.getByText('Hủy trước 7 ngày → Hoàn 80%')).toBeInTheDocument();

    // Check warning alert box for no proof
    expect(
      screen.getByRole('alert')
    ).toHaveTextContent('Khách hàng không đính kèm tệp ảnh minh chứng');

    // Check footer buttons order and tooltip
    const overrideBtn = screen.getByRole('button', { name: 'Duyệt miễn trừ' });
    expect(overrideBtn).toHaveAttribute(
      'title',
      'Miễn trừ do thiên tai / sạt lở hoặc lỗi thiết bị từ RenTrek'
    );
  });
});


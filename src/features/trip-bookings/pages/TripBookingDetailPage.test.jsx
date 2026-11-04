import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMyOrders } from '@/features/orders/hooks/useOrders';
import {
  useCancelTripBooking,
  useCustomerTripGrouping,
  useInviteLink,
  useRotateInviteLink,
  useTripBooking,
  useUpdateParticipant,
} from '../hooks/useTripBookings';
import TripBookingDetailPage from './TripBookingDetailPage';

vi.mock('../components/TripPaymentPanel', () => ({
  default: ({ orderId }) => <div>payment-panel-{orderId}</div>,
}));

vi.mock('@/features/orders/hooks/useOrders', () => ({ useMyOrders: vi.fn() }));

vi.mock('../hooks/useTripBookings', () => ({
  useTripBooking: vi.fn(),
  useInviteLink: vi.fn(),
  useRotateInviteLink: vi.fn(),
  useCustomerTripGrouping: vi.fn(),
  useUpdateParticipant: vi.fn(),
  useCancelTripBooking: vi.fn(),
}));

const booking = {
  orderId: 'order-1',
  orderCode: 'RT-001',
  tripId: 'trip-1',
  tripStartAt: '2099-11-02T00:00:00Z',
  tripEndAt: '2099-11-04T00:00:00Z',
  tripStatus: 'Open',
  participantCount: 2,
  unitPrice: 1500000,
  subtotalAmount: 3000000,
  totalAmount: 3000000,
  status: 'PendingPayment',
  paymentStatus: 'Unpaid',
  holdExpiresAt: '2099-11-01T00:00:00Z',
  canManage: true,
  participants: [
    {
      participantId: 'p-1',
      fullName: 'Buyer',
      email: 'buyer@example.com',
      linkedUserId: 'u-1',
      status: 'Registered',
    },
    { participantId: 'p-2', fullName: 'Nguyễn An', email: 'an@example.com', status: 'Registered' },
  ],
};

const paidBooking = { ...booking, status: 'Confirmed', paymentStatus: 'Paid', holdExpiresAt: null };

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/trip-bookings/order-1']}>
      <Routes>
        <Route path="/trip-bookings/:orderId" element={<TripBookingDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('TripBookingDetailPage', () => {
  const refetch = vi.fn();
  const updateAsync = vi.fn();
  const cancelAsync = vi.fn();
  const showBooking = (data) =>
    useTripBooking.mockReturnValue({ data, isLoading: false, isError: false, refetch });

  beforeEach(() => {
    vi.clearAllMocks();
    showBooking(booking);
    useMyOrders.mockReturnValue({ data: { items: [{ title: 'Tà Năng 2N1Đ' }] } });
    useCustomerTripGrouping.mockReturnValue({
      data: { groupingStatus: 'Pending', groups: [] },
      isLoading: false,
      isError: false,
    });
    useRotateInviteLink.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useUpdateParticipant.mockReturnValue({ mutateAsync: updateAsync, isPending: false });
    useCancelTripBooking.mockReturnValue({ mutateAsync: cancelAsync, isPending: false });
    useInviteLink.mockReturnValue({
      data: {
        url: 'http://localhost:5173/trip-bookings/order-1/join#t=abc',
        expiresAt: '2099-11-04T00:00:00Z',
        totalSeats: 2,
      },
    });
  });

  it('shows the tour name, buyer totals and the payment panel while pending', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Tà Năng 2N1Đ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'RT-001' })).toBeInTheDocument();
    expect(screen.getByText('Tổng tiền')).toBeInTheDocument();
    expect(screen.getByText('payment-panel-order-1')).toBeInTheDocument();
    expect(screen.queryByLabelText('Link xem chuyến cho nhóm')).not.toBeInTheDocument();
    expect(screen.queryByText(/hoàn thiện phân nhóm/)).not.toBeInTheDocument();
  });

  it('shows a not-found state for 404 without retry', () => {
    useTripBooking.mockReturnValue({
      isLoading: false,
      isError: true,
      error: { statusCode: 404, message: 'Không tìm thấy' },
      refetch,
    });

    renderPage();

    expect(screen.getByText(/Không tìm thấy booking/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thử lại/ })).not.toBeInTheDocument();
  });

  it('hides buyer-only fields and actions from participant scope', () => {
    showBooking({ ...booking, canManage: false, totalAmount: 0, subtotalAmount: 0, paymentStatus: '' });

    renderPage();

    expect(screen.queryByText('Tổng tiền')).not.toBeInTheDocument();
    expect(screen.getByText('Thông tin tham gia của bạn')).toBeInTheDocument();
    expect(screen.queryByText(/payment-panel/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Sửa/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hủy booking' })).not.toBeInTheDocument();
  });

  it('lets the buyer edit a participant and clears emptied contact fields', async () => {
    const user = userEvent.setup();
    updateAsync.mockResolvedValue({});
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Sửa Nguyễn An' }));
    const nameInput = screen.getByLabelText('Họ và tên');
    await user.clear(nameInput);
    await user.type(nameInput, 'Nguyễn Văn An');
    await user.clear(screen.getByLabelText('Email'));
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(updateAsync).toHaveBeenCalledWith({
      orderId: 'order-1',
      participantId: 'p-2',
      payload: { fullName: 'Nguyễn Văn An', email: null, phone: null },
    });
    expect(screen.queryByRole('button', { name: 'Lưu' })).not.toBeInTheDocument();
  });

  it('warns that changing the email of a linked participant drops their access', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Sửa Buyer' }));
    await user.type(screen.getByLabelText('Email'), 'x');

    expect(screen.getByText(/gỡ quyền xem chuyến/)).toBeInTheDocument();
  });

  it('keeps the edit form open and shows the server error on conflict', async () => {
    const user = userEvent.setup();
    updateAsync.mockRejectedValue({ message: 'Email trùng chỗ khác', statusCode: 409 });
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Sửa Nguyễn An' }));
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email trùng chỗ khác');
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument();
  });

  it('stops editing and cancelling after departure', () => {
    showBooking({ ...paidBooking, tripStartAt: '2020-01-01T00:00:00Z' });

    renderPage();

    expect(screen.queryByRole('button', { name: /^Sửa/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hủy booking' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Link xem chuyến cho nhóm')).toBeInTheDocument();
  });

  it('cancels with a reason after confirmation', async () => {
    const user = userEvent.setup();
    cancelAsync.mockResolvedValue({});
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Hủy booking' }));
    expect(cancelAsync).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText(/Lý do/), '  Bận lịch  ');
    await user.click(screen.getByRole('button', { name: 'Xác nhận hủy' }));

    expect(cancelAsync).toHaveBeenCalledWith({ orderId: 'order-1', reason: 'Bận lịch' });
  });

  it('blocks cancelling while the payment is being reconciled', () => {
    showBooking({ ...booking, paymentStatus: 'NeedsReconciliation' });

    renderPage();

    expect(screen.getByText('Thanh toán đang chờ đối soát')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hủy booking' })).not.toBeInTheDocument();
    expect(screen.queryByText(/payment-panel/)).not.toBeInTheDocument();
  });

  it('shows the cancelled state without management actions', () => {
    showBooking({ ...paidBooking, status: 'Cancelled', paymentStatus: 'Refunded' });

    renderPage();

    expect(screen.getByText('Booking đã hủy')).toBeInTheDocument();
    expect(screen.getByText(/trạng thái hoàn tiền/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Sửa/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Tiến trình đơn')).not.toBeInTheDocument();
  });

  it('shows the read-only trip link once paid', () => {
    showBooking(paidBooking);

    renderPage();

    expect(screen.getByLabelText('Link xem chuyến cho nhóm')).toHaveValue(
      'http://localhost:5173/trip-bookings/order-1/join#t=abc',
    );
    expect(screen.getByText(/2 người trong đoàn/)).toBeInTheDocument();
  });

  it('refetches once and replaces the QR when the hold countdown reaches zero', async () => {
    vi.useFakeTimers();
    showBooking({ ...booking, holdExpiresAt: new Date(Date.now() + 1000).toISOString() });
    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/payment-panel/)).not.toBeInTheDocument();
    expect(screen.getByText('Đã hết thời gian giữ chỗ')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows the pending grouping message after payment', () => {
    showBooking(paidBooking);

    renderPage();

    expect(screen.getByText('Đơn vị tổ chức đang hoàn thiện phân nhóm')).toBeInTheDocument();
  });

  it('shows only the published group data returned for this booking', () => {
    showBooking(paidBooking);
    useCustomerTripGrouping.mockReturnValue({
      data: {
        groupingStatus: 'Published',
        groups: [
          {
            tripGroupId: 'group-1',
            groupName: 'Nhóm Mây 1',
            guide: { userId: 'guide-1', fullName: 'Đinh Văn Toàn' },
            participants: [{ participantId: 'p-1', fullName: 'Buyer' }],
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(screen.getByRole('heading', { name: 'Nhóm vận hành' })).toBeInTheDocument();
    expect(screen.getByText('Nhóm Mây 1')).toBeInTheDocument();
    expect(screen.getByText('Guide: Đinh Văn Toàn')).toBeInTheDocument();
    expect(screen.getByText('Buyer', { selector: 'li' })).toBeInTheDocument();
    expect(screen.getByText(/chỉ hiển thị thành viên mà bạn được phép xem/i)).toBeInTheDocument();
  });

  it('explains that paid bookings cannot add or remove people', () => {
    showBooking(paidBooking);

    renderPage();

    expect(screen.getByText(/đã thanh toán.*không thể thêm hoặc xóa người/i)).toBeInTheDocument();
    expect(within(screen.getByLabelText('Tiến trình đơn')).getByText('Chờ khởi hành')).toHaveAttribute(
      'aria-current',
      'step',
    );
  });
});

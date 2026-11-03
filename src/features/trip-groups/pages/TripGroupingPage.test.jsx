import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import {
  useAssignTripGroupGuide,
  useMoveBookingToGroup,
  usePublishTripGrouping,
  useSplitTripBooking,
  useTourGuideOptions,
  useTripGrouping,
} from '../hooks/useTripGroups';
import TripGroupingPage from './TripGroupingPage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../hooks/useTripGroups', () => ({
  useTripGrouping: vi.fn(),
  useAssignTripGroupGuide: vi.fn(),
  useMoveBookingToGroup: vi.fn(),
  usePublishTripGrouping: vi.fn(),
  useSplitTripBooking: vi.fn(),
  useTourGuideOptions: vi.fn(),
}));

const snapshot = {
  tripId: 'trip-1',
  tripStatus: 'ClosedForBooking',
  groupingStatus: 'Draft',
  totalSlots: 16,
  groupMaxParticipants: 6,
  overflowSlots: 2,
  standardCapacity: 18,
  operationalCapacity: 24,
  assignedParticipants: 6,
  unassignedParticipants: 2,
  rowVersion: 7,
  canPublish: false,
  publishBlockers: [{ code: 'UNASSIGNED_PARTICIPANTS', message: 'Còn 2 người chưa được xếp nhóm' }],
  groups: [
    {
      tripGroupId: 'group-1',
      groupName: 'Nhóm Mây 1',
      status: 'Draft',
      guide: { userId: 'guide-1', fullName: 'Đinh Văn Toàn' },
      maxParticipants: 6,
      overflowSlots: 2,
      participantCount: 6,
      remainingStandardSlots: 0,
      remainingOverflowSlots: 2,
      isOverflowing: false,
      bookings: [
        {
          bookingOrderId: 'order-1',
          orderCode: 'RT-001',
          participantCount: 2,
          isSplit: false,
          participants: [
            { participantId: 'p-1', fullName: 'Trần Thu Hà' },
            { participantId: 'p-2', fullName: 'Nguyễn Minh Anh' },
          ],
        },
      ],
    },
    {
      tripGroupId: 'group-2',
      groupName: 'Nhóm Mây 2',
      status: 'Draft',
      guide: null,
      maxParticipants: 6,
      overflowSlots: 2,
      participantCount: 0,
      remainingStandardSlots: 6,
      remainingOverflowSlots: 2,
      isOverflowing: false,
      bookings: [],
    },
  ],
  unassignedBookings: [
    {
      bookingOrderId: 'order-2',
      orderCode: 'RT-002',
      participantCount: 2,
      participants: [
        { participantId: 'p-3', fullName: 'Lê Văn B' },
        { participantId: 'p-4', fullName: 'Lê Văn C' },
      ],
    },
  ],
};

const moveAsync = vi.fn();
const guideAsync = vi.fn();
const publishAsync = vi.fn();
const splitAsync = vi.fn();

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/ops/trips/trip-1/groups']}>
      <Routes>
        <Route path="/ops/trips/:tripId/groups" element={<TripGroupingPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('TripGroupingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { role: 'Staff', fullName: 'Phan Thị Ngọc' } });
    useTripGrouping.mockReturnValue({
      data: snapshot,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    useMoveBookingToGroup.mockReturnValue({ mutateAsync: moveAsync, isPending: false });
    useAssignTripGroupGuide.mockReturnValue({ mutateAsync: guideAsync, isPending: false });
    usePublishTripGrouping.mockReturnValue({ mutateAsync: publishAsync, isPending: false });
    useSplitTripBooking.mockReturnValue({ mutateAsync: splitAsync, isPending: false });
    useTourGuideOptions.mockReturnValue({
      data: [
        { userId: 'guide-1', fullName: 'Đinh Văn Toàn' },
        { userId: 'guide-2', fullName: 'Nguyễn Minh Khoa' },
      ],
    });
  });

  it('moves the whole booking with the current row version', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText('Chuyển booking RT-002'), 'group-2');

    expect(moveAsync).toHaveBeenCalledWith({
      tripId: 'trip-1',
      bookingOrderId: 'order-2',
      targetGroupId: 'group-2',
      expectedTripRowVersion: 7,
    });
  });

  it('assigns a guide and keeps publish blocked from server blockers', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText('Guide của Nhóm Mây 2'), 'guide-2');

    expect(guideAsync).toHaveBeenCalledWith({
      tripId: 'trip-1',
      groupId: 'group-2',
      guideUserId: 'guide-2',
      expectedTripRowVersion: 7,
    });
    expect(screen.getByRole('button', { name: 'Chốt phân nhóm' })).toBeDisabled();
    expect(screen.getByText('Còn 2 người chưa được xếp nhóm')).toBeInTheDocument();
  });

  it('publishes when the server snapshot allows it', async () => {
    const user = userEvent.setup();
    useTripGrouping.mockReturnValue({
      data: { ...snapshot, canPublish: true, publishBlockers: [], unassignedBookings: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();
    await user.click(screen.getByRole('button', { name: 'Chốt phân nhóm' }));

    expect(publishAsync).toHaveBeenCalledWith({
      tripId: 'trip-1',
      expectedTripRowVersion: 7,
    });
  });

  it('shows assigned draft groups read-only for a guide', () => {
    useAuth.mockReturnValue({
      currentUser: { role: 'TourGuide', fullName: 'Đinh Văn Toàn' },
    });

    renderPage();

    expect(screen.getByText('Nhóm nháp')).toBeInTheDocument();
    expect(screen.getByText(/staff đang hoàn thiện phân nhóm/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Chuyển booking RT-001')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Chốt phân nhóm' })).not.toBeInTheDocument();
  });

  it('keeps the board visible and reports a rejected move', async () => {
    const user = userEvent.setup();
    moveAsync.mockRejectedValueOnce(new Error('Nhóm đã vượt sức chứa vận hành.'));
    renderPage();

    await user.selectOptions(screen.getByLabelText('Chuyển booking RT-002'), 'group-2');

    expect(await screen.findByRole('alert')).toHaveTextContent('Nhóm đã vượt sức chứa vận hành.');
    expect(screen.getByText('Đơn chưa xếp')).toBeInTheDocument();
  });

  it('requires a reason and sends every participant assignment when splitting', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('button', { name: 'Tách booking' })[0]);
    const submit = screen.getByRole('button', { name: 'Xác nhận tách' });
    expect(submit).toBeDisabled();

    await user.selectOptions(screen.getByLabelText('Nhóm của Lê Văn B'), 'group-1');
    await user.selectOptions(screen.getByLabelText('Nhóm của Lê Văn C'), 'group-2');
    await user.type(screen.getByLabelText(/Lý do tách/), 'Không còn nhóm đủ chỗ');
    await user.click(submit);

    expect(splitAsync).toHaveBeenCalledWith({
      tripId: 'trip-1',
      bookingOrderId: 'order-2',
      reason: 'Không còn nhóm đủ chỗ',
      expectedTripRowVersion: 7,
      assignments: [
        { tripGroupId: 'group-1', participantIds: ['p-3'] },
        { tripGroupId: 'group-2', participantIds: ['p-4'] },
      ],
    });
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import {
  useTripAttendanceHistory,
  useTripAttendanceMatrix,
  useUpdateTripAttendances,
} from '../hooks/useAdminTrips';
import TripAttendanceMatrixTab from './TripAttendanceMatrixTab';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../hooks/useAdminTrips', () => ({
  useTripAttendanceMatrix: vi.fn(),
  useTripAttendanceHistory: vi.fn(),
  useUpdateTripAttendances: vi.fn(),
}));

const mutateAsync = vi.fn().mockResolvedValue({});

const matrix = {
  activities: [{ activityId: 'act-1', dayNumber: 1, startTime: '07:00:00', name: 'Tập trung' }],
  participants: [{ participantId: 'p-1', fullName: 'Trần An', groupName: 'Nhóm 1', attendances: {} }],
};

describe('TripAttendanceMatrixTab permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTripAttendanceMatrix.mockReturnValue({ data: matrix, isLoading: false, isError: false });
    useTripAttendanceHistory.mockReturnValue({ data: [] });
    useUpdateTripAttendances.mockReturnValue({ mutateAsync, isPending: false });
  });

  it('shows Staff a read-only matrix', () => {
    useAuth.mockReturnValue({ currentUser: { role: 'Staff' } });
    render(<TripAttendanceMatrixTab tripId="trip-1" tripStatus="InProgress" />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('Bạn chỉ có quyền xem ma trận và lịch sử điểm danh.', { exact: false })).toBeInTheDocument();
  });

  it('keeps Admin read-only before the trip starts', () => {
    useAuth.mockReturnValue({ currentUser: { role: 'Admin' } });
    render(<TripAttendanceMatrixTab tripId="trip-1" tripStatus="Open" />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('requires Admin to give a reason even for a new record', async () => {
    useAuth.mockReturnValue({ currentUser: { role: 'Admin' } });
    render(<TripAttendanceMatrixTab tripId="trip-1" tripStatus="InProgress" />);

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Present');
    expect(mutateAsync).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText('Lý do điều chỉnh (bắt buộc) *'), 'HDV mất sóng');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu điều chỉnh' }));

    expect(mutateAsync).toHaveBeenCalledWith({
      activityId: 'act-1',
      records: [{ participantId: 'p-1', status: 'Present', reason: 'HDV mất sóng' }],
    });
  });
});

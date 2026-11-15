import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTourGuideOptions } from '@/features/trip-groups/hooks/useTripGroups';
import { useKanbanGroupMutations, useKanbanGroupsBoard } from '../hooks/useAdminTrips';
import TripKanbanBoardTab from './TripKanbanBoardTab';

vi.mock('@/features/trip-groups/hooks/useTripGroups', () => ({ useTourGuideOptions: vi.fn() }));
vi.mock('../hooks/useAdminTrips', () => ({
  useKanbanGroupsBoard: vi.fn(),
  useKanbanGroupMutations: vi.fn(),
}));

const createMutate = vi.fn().mockResolvedValue({});
const idle = { mutateAsync: vi.fn(), isPending: false };

describe('TripKanbanBoardTab guide select', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useKanbanGroupsBoard.mockReturnValue({
      data: { groups: [], unassignedParticipants: [] },
      isLoading: false,
      isError: false,
    });
    useKanbanGroupMutations.mockReturnValue({
      createGroup: { mutateAsync: createMutate, isPending: false },
      updateGroup: idle,
      deleteGroup: idle,
      assignParticipantGroup: idle,
      autoGroup: idle,
      approveSplit: idle,
    });
    useTourGuideOptions.mockReturnValue({
      data: [{ userId: 'g-1', fullName: 'Hướng Dẫn A', email: 'ga@x.vn' }],
    });
  });

  it('picks the guide from a list instead of typing a GUID', async () => {
    render(<TripKanbanBoardTab tripId="trip-1" />);
    await userEvent.click(screen.getByRole('button', { name: '+ Tạo nhóm mới' }));
    const select = screen.getByLabelText('Hướng dẫn viên phụ trách');
    expect(select.tagName).toBe('SELECT');
    await userEvent.selectOptions(select, 'g-1');
    const form = select.closest('form');
    await userEvent.type(form.querySelector('input[type="text"]'), 'Nhóm 1');
    await userEvent.click(form.querySelector('button[type="submit"]'));
    expect(createMutate).toHaveBeenCalledWith(expect.objectContaining({ guideUserId: 'g-1' }));
  });
});

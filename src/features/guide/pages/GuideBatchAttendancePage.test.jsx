import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useGuideBatchAttendance,
  useGuideGroupRoster,
  useGuideItinerary,
} from '../hooks/useGuidePortal';
import GuideBatchAttendancePage from './GuideBatchAttendancePage';

vi.mock('../hooks/useGuidePortal', () => ({
  useGuideBatchAttendance: vi.fn(),
  useGuideGroupRoster: vi.fn(),
  useGuideItinerary: vi.fn(),
}));

describe('GuideBatchAttendancePage', () => {
  beforeEach(() => {
    useGuideGroupRoster.mockReturnValue({
      data: { groupName: 'Đoàn Bình Minh', participants: [], currentActivity: null },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    useGuideItinerary.mockReturnValue({ data: { days: [] } });
    useGuideBatchAttendance.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it('describes offline attendance as manual synchronization', () => {
    render(
      <MemoryRouter initialEntries={['/guide/trips/trip-1/attendance']}>
        <Routes>
          <Route path="/guide/trips/:tripId/attendance" element={<GuideBatchAttendancePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Đồng bộ thủ công khi có mạng/)).toBeInTheDocument();
    expect(screen.queryByText(/Tự động đồng bộ Offline/)).not.toBeInTheDocument();
  });
});

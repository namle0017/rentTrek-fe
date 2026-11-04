import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminTour } from '../hooks/useAdminCatalog';
import AdminTourDetailPage from './AdminTourDetailPage';

vi.mock('../hooks/useAdminCatalog', () => ({
  useAdminTour: vi.fn(),
}));

const tour = {
  id: 'tour-1',
  name: 'Tà Xùa săn mây',
  description: 'Săn mây trên sống lưng khủng long.',
  difficultyLevel: 'Trung bình',
  durationDays: 2,
  durationNights: 1,
  basePrice: 2450000,
  equipmentDeposit: 500000,
  groupMaxParticipants: 12,
  status: 'Active', // giá trị cũ từ API chi tiết = Đang mở
  categoryName: 'Săn mây',
  locationName: 'Bắc Yên',
  images: [],
  activities: [{ id: 'a1', dayNumber: 1, timeFormatted: '06:00', name: 'Xuất phát', displayOrder: 1 }],
  providedItems: [],
  preparationItems: [],
  availableTrips: [],
};

describe('AdminTourDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminTour.mockReturnValue({ data: tour, isLoading: false, isError: false });
  });

  it('shows tour detail with its display status', () => {
    render(
      <MemoryRouter initialEntries={['/admin/tours/tour-1']}>
        <Routes>
          <Route path="/admin/tours/:tourId" element={<AdminTourDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Tà Xùa săn mây' })).toBeInTheDocument();
    expect(screen.getByText('Xuất phát')).toBeInTheDocument();
    // API chi tiết trả "Active" → hiển thị cùng nhãn với danh sách
    expect(screen.getByText('Đang mở')).toBeInTheDocument();
  });
});

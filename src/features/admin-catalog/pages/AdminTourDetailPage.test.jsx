import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { useAdminTour } from '../hooks/useAdminCatalog';
import { useArchiveTour, usePublishTour, useUpdateTourGroupSettings } from '../hooks/useTourAuthoring';
import AdminTourDetailPage from './AdminTourDetailPage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../hooks/useAdminCatalog', () => ({ useAdminTour: vi.fn() }));
vi.mock('../hooks/useTourAuthoring', () => ({
  usePublishTour: vi.fn(),
  useArchiveTour: vi.fn(),
  useUpdateTourGroupSettings: vi.fn(),
}));
vi.mock('../components/TourSuggestedBundlesEditor', () => ({ default: () => null }));

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

const publishMutate = vi.fn();
const archiveMutate = vi.fn();
const groupMutate = vi.fn();

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/tours/tour-1']}>
      <Routes>
        <Route path="/admin/tours/:tourId" element={<AdminTourDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminTourDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { role: 'Admin' } });
    useAdminTour.mockReturnValue({ data: tour, isLoading: false, isError: false });
    usePublishTour.mockReturnValue({ mutate: publishMutate, isPending: false });
    useArchiveTour.mockReturnValue({ mutate: archiveMutate, isPending: false });
    useUpdateTourGroupSettings.mockReturnValue({ mutate: groupMutate, isPending: false });
  });

  it('shows tour detail with its display status', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Tà Xùa săn mây' })).toBeInTheDocument();
    expect(screen.getByText('Xuất phát')).toBeInTheDocument();
    expect(screen.getByText('Đang mở')).toBeInTheDocument();
  });

  it('links to the editor and archives a published tour', async () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Chỉnh sửa' })).toHaveAttribute('href', '/admin/tours/tour-1/edit');
    expect(screen.queryByRole('button', { name: 'Xuất bản' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Lưu trữ' }));
    expect(archiveMutate).toHaveBeenCalledWith('tour-1');
  });

  it('publishes a draft tour', async () => {
    useAdminTour.mockReturnValue({ data: { ...tour, status: 'Draft' }, isLoading: false, isError: false });
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Xuất bản' }));
    expect(publishMutate).toHaveBeenCalledWith('tour-1');
  });

  it('saves group settings', async () => {
    renderPage();
    const input = screen.getByLabelText('Số khách tối đa mỗi nhóm');
    await userEvent.clear(input);
    await userEvent.type(input, '8');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu cấu hình nhóm' }));
    expect(groupMutate).toHaveBeenCalledWith({ tourId: 'tour-1', groupMaxParticipants: 8 });
  });

  it('hides admin actions from Staff', () => {
    useAuth.mockReturnValue({ currentUser: { role: 'Staff' } });
    renderPage();
    expect(screen.queryByRole('link', { name: 'Chỉnh sửa' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lưu trữ' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Số khách tối đa mỗi nhóm')).not.toBeInTheDocument();
  });
});

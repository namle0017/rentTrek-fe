import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminTours } from '../hooks/useAdminCatalog';
import AdminToursPage from './AdminToursPage';

vi.mock('../hooks/useAdminCatalog', () => ({
  useAdminTours: vi.fn(),
}));

const pagedTours = {
  items: [
    {
      tourId: 'tour-1',
      tourFamilyId: 'family-1',
      name: 'Tà Xùa săn mây',
      categoryName: 'Săn mây',
      mainLocationName: 'Bắc Yên',
      durationDays: 2,
      durationNights: 1,
      basePrice: 2450000,
      version: 3,
      isItineraryLocked: true,
      status: 'Published',
      primaryImageUrl: null,
      upcomingTripsCount: 4,
    },
  ],
  pageNumber: 1,
  pageSize: 10,
  totalItems: 1,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
};

describe('AdminToursPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminTours.mockReturnValue({
      data: pagedTours,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  it('renders the tour operations fields from the API contract', () => {
    render(
      <MemoryRouter>
        <AdminToursPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Tà Xùa săn mây')).toBeInTheDocument();
    expect(screen.getByText('2N 1Đ')).toBeInTheDocument();
    expect(screen.getByText('2.450.000 ₫')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Phiên bản' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tà Xùa săn mây' })).toHaveAttribute(
      'href',
      '/admin/tours/tour-1',
    );
    expect(
      within(screen.getByRole('row', { name: /Tà Xùa săn mây/ })).getByText('Đang mở'),
    ).toBeInTheDocument();
    expect(screen.getByText('4 chuyến')).toBeInTheDocument();
  });

  it('sends submitted search and status filters to the query hook', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminToursPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('Tìm tour'), 'Fansipan');
    await user.selectOptions(screen.getByLabelText('Trạng thái tour'), 'Draft');
    await user.click(screen.getByRole('button', { name: 'Lọc danh sách' }));

    expect(useAdminTours).toHaveBeenLastCalledWith({
      pageNumber: 1,
      pageSize: 10,
      search: 'Fansipan',
      status: 'Draft',
    });
  });
});

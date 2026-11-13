import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminProducts } from '../hooks/useAdminCatalog';
import AdminProductsPage from './AdminProductsPage';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));

vi.mock('../hooks/useAdminCatalog', () => ({
  useAdminProducts: vi.fn(),
}));

describe('AdminProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { role: 'Admin' } });
    useAdminProducts.mockReturnValue({
      data: {
        items: [
          {
            productId: 'product-1',
            name: 'Lều Naturehike Cloud Up 2',
            categoryName: 'Lều trại',
            primaryImageUrl: null,
            variantsCount: 3,
            totalAssetsCount: 12,
            availableAssetsCount: 8,
            status: 'Active',
            createdAt: '2026-10-20T03:00:00Z',
          },
        ],
        pageNumber: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  it('renders inventory counts and links to product creation', () => {
    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Thêm sản phẩm/ })).toHaveAttribute(
      'href',
      '/admin/products/new',
    );
    expect(screen.getByText('Lều Naturehike Cloud Up 2')).toBeInTheDocument();
    expect(screen.getByText('3 biến thể')).toBeInTheDocument();
    expect(screen.getByText('8 / 12')).toBeInTheDocument();
    expect(
      within(screen.getByRole('row', { name: /Lều Naturehike Cloud Up 2/ })).getByText('Đang cho thuê'),
    ).toBeInTheDocument();
  });

  it('hides product creation from staff', () => {
    useAuth.mockReturnValue({ currentUser: { role: 'Staff' } });
    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link', { name: 'Thêm sản phẩm' })).not.toBeInTheDocument();
  });
});

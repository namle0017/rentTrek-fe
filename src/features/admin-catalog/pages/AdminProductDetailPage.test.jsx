import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWriteOperation } from '@/features/operations/hooks/useOperations';
import { useAuth } from '@/hooks/useAuth';
import { useAdminProduct } from '../hooks/useAdminCatalog';
import AdminProductDetailPage from './AdminProductDetailPage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/operations/hooks/useOperations', () => ({
  useWriteOperation: vi.fn(),
}));
vi.mock('../hooks/useAdminCatalog', () => ({
  useAdminProduct: vi.fn(),
}));

const mutate = vi.fn();

function renderDetail(path = '/admin/products/product-1') {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin/products/:productId" element={<AdminProductDetailPage />} />
          <Route path="/admin/products" element={<h2>Danh sách sản phẩm sau khi xóa</h2>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdminProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { role: 'Admin' } });
    useWriteOperation.mockReturnValue({ mutate, isPending: false });
    useAdminProduct.mockReturnValue({
      data: {
        productId: 'product-1',
        name: 'Lều Naturehike Cloud Up 2',
        categoryId: 'cat-1',
        categoryName: 'Lều trại',
        description: 'Lều 2 người chống mưa',
        status: 'Active',
        createdAt: '2026-10-20T03:00:00Z',
        variants: [
          {
            variantId: 'variant-1',
            sku: 'TENT-NH-2P',
            name: 'Bản 210T Xanh',
            size: '2P',
            color: 'Xanh rừng',
            status: 'Active',
            imageUrls: [],
            images: [],
            priceTiers: [{ minDays: 1, maxDays: 3, dailyPrice: 120000 }],
            totalAssetsCount: 5,
            availableAssetsCount: 4,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('soft-deletes the product after confirmation and redirects to admin product list', async () => {
    mutate.mockImplementation((_, callbacks) => callbacks.onSuccess({ data: null }));
    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole('button', { name: 'Xóa sản phẩm' }));
    const dialog = screen.getByRole('dialog', { name: 'Xóa sản phẩm' });
    expect(dialog).toHaveTextContent('Lều Naturehike Cloud Up 2');

    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận xóa' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          endpoint: '/admin/products/product-1',
          method: 'delete',
          body: {},
        },
        expect.any(Object),
      ),
    );
    expect(await screen.findByRole('heading', { name: 'Danh sách sản phẩm sau khi xóa' })).toBeInTheDocument();
  });

  it('hides delete and edit actions from staff users', () => {
    useAuth.mockReturnValue({ currentUser: { role: 'Staff' } });
    renderDetail();

    expect(screen.queryByRole('button', { name: 'Xóa sản phẩm' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xóa biến thể' })).not.toBeInTheDocument();
  });
});


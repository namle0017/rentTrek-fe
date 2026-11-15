import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { USER_ROLE } from '@/constants/enums';
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

const mockProduct = {
  productId: 'prod-1',
  name: 'Lều cắm trại 4 người',
  description: 'Lều chống thấm nước 2 lớp cao cấp.',
  categoryName: 'Lều trại',
  status: 'Active',
  createdAt: '2026-10-15T10:00:00Z',
  variants: [
    {
      variantId: 'var-1',
      sku: 'TENT-4P-GRN',
      name: 'Lều 4P Xanh rêu',
      size: '4 người',
      color: 'Xanh rêu',
      status: 'Active',
      availableAssetsCount: 8,
      totalAssetsCount: 10,
      imageUrls: ['https://example.com/tent.jpg'],
      images: [],
      priceTiers: [
        { minDays: 1, maxDays: 3, dailyPrice: 80000 },
        { minDays: 4, maxDays: null, dailyPrice: 65000 },
      ],
    },
  ],
};

function renderPage(productId = 'prod-1') {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[`/admin/products/${productId}`]}>
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
    useAuth.mockReturnValue({ currentUser: { role: USER_ROLE.ADMIN } });
    useWriteOperation.mockReturnValue({ mutate, isPending: false });
    useAdminProduct.mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('renders product details, inventory stats, variant cards with price tiers, and management tools', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Lều cắm trại 4 người' })).toBeInTheDocument();
    expect(screen.getAllByText('Lều trại').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('1 biến thể')).toBeInTheDocument();
    expect(screen.getAllByText(/8 \/ 10/).length).toBe(2);
    expect(screen.getByText('Lều chống thấm nước 2 lớp cao cấp.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Lều 4P Xanh rêu' })).toBeInTheDocument();
    expect(screen.getByText('SKU: TENT-4P-GRN')).toBeInTheDocument();
    expect(screen.getByText('Cỡ: 4 người')).toBeInTheDocument();
    expect(screen.getByText('Màu: Xanh rêu')).toBeInTheDocument();
    expect(screen.getByText(/1–3 ngày:/)).toBeInTheDocument();
    expect(screen.getByText(/80\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Từ 4 ngày:/)).toBeInTheDocument();
    expect(screen.getByText(/65\.000/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Chỉnh sửa sản phẩm|Chỉnh sửa thông tin/ })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /Xem trang công khai/ })).toHaveLength(2);
  });

  it('soft-deletes the product after confirmation and redirects to admin product list', async () => {
    mutate.mockImplementation((_, callbacks) => callbacks.onSuccess({ data: null }));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Xóa sản phẩm' }));
    const dialog = screen.getByRole('dialog', { name: 'Xóa sản phẩm' });
    expect(dialog).toHaveTextContent('Lều cắm trại 4 người');

    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận xóa' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          endpoint: '/admin/products/prod-1',
          method: 'delete',
          body: {},
        },
        expect.any(Object),
      ),
    );
    expect(await screen.findByRole('heading', { name: 'Danh sách sản phẩm sau khi xóa' })).toBeInTheDocument();
  });

  it('hides delete and edit actions from staff users', () => {
    useAuth.mockReturnValue({ currentUser: { role: USER_ROLE.STAFF } });
    renderPage();

    expect(screen.queryByRole('button', { name: 'Xóa sản phẩm' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xóa biến thể' })).not.toBeInTheDocument();
  });
});

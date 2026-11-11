import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { USER_ROLE } from '@/constants/enums';
import { useAdminProduct } from '../hooks/useAdminCatalog';
import AdminProductDetailPage from './AdminProductDetailPage';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ currentUser: { role: USER_ROLE.ADMIN } }),
}));

vi.mock('../hooks/useAdminCatalog', () => ({
  useAdminProduct: vi.fn(),
}));

vi.mock('../components/ProductVariantTools', () => ({
  default: () => <div data-testid="mock-variant-tools">Tools</div>,
}));

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
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdminProductDetailPage - Redesigned UI/UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminProduct.mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
    });
  });

  it('renders product details, inventory stats, variant cards with price tiers, and management tools', () => {
    renderPage();

    // 1. Heading & Breadcrumb
    expect(screen.getByRole('heading', { level: 1, name: 'Lều cắm trại 4 người' })).toBeInTheDocument();
    expect(screen.getAllByText('Lều trại').length).toBeGreaterThanOrEqual(1);

    // 2. Fact sheet stats
    expect(screen.getByText('1 biến thể')).toBeInTheDocument();
    expect(screen.getAllByText(/8 \/ 10/).length).toBe(2);
    expect(screen.getByText('Lều chống thấm nước 2 lớp cao cấp.')).toBeInTheDocument();

    // 3. Variant card
    expect(screen.getByRole('heading', { level: 3, name: 'Lều 4P Xanh rêu' })).toBeInTheDocument();
    expect(screen.getByText('SKU: TENT-4P-GRN')).toBeInTheDocument();
    expect(screen.getByText('Cỡ: 4 người')).toBeInTheDocument();
    expect(screen.getByText('Màu: Xanh rêu')).toBeInTheDocument();

    // 4. Price tiers pills
    expect(screen.getByText(/1–3 ngày:/)).toBeInTheDocument();
    expect(screen.getByText(/80\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Từ 4 ngày:/)).toBeInTheDocument();
    expect(screen.getByText(/65\.000/)).toBeInTheDocument();

    // 5. Actions & Quick ops
    expect(screen.getAllByRole('link', { name: /Chỉnh sửa sản phẩm|Chỉnh sửa thông tin/ })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /Xem trang công khai/ })).toHaveLength(2);
  });
});

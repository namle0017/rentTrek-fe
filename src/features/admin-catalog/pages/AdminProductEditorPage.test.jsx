import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOperations, useWriteOperation } from '@/features/operations/hooks/useOperations';
import { useAdminProduct } from '../hooks/useAdminCatalog';
import AdminProductEditorPage from './AdminProductEditorPage';

vi.mock('@/features/operations/hooks/useOperations', () => ({
  useOperations: vi.fn(),
  useWriteOperation: vi.fn(),
}));
vi.mock('../hooks/useAdminCatalog', () => ({ useAdminProduct: vi.fn() }));
const mutate = vi.fn();
function renderEditor(path = '/admin/products/new') {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin/products/new" element={<AdminProductEditorPage />} />
          <Route path="/admin/products/:productId/edit" element={<AdminProductEditorPage />} />
          <Route path="/admin/products/:productId" element={<h2>Trang chi tiết sau khi lưu</h2>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
describe('admin product editor', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useAdminProduct.mockReturnValue({ data: undefined, isPending: false });
    useWriteOperation.mockReturnValue({ mutate, isPending: false });
    useOperations.mockReturnValue({
      data: [
        { categoryId: 'cat-1', name: 'Lều', categoryType: 'Equipment', isActive: true },
        { categoryId: 'tour-1', name: 'Tour núi', categoryType: 'Tour', isActive: true },
      ],
      isPending: false,
    });
  });
  it('creates through the admin API and navigates using the returned GUID string', async () => {
    mutate.mockImplementation((_, callbacks) => callbacks.onSuccess({ data: 'created-product-id' }));
    const user = userEvent.setup();
    renderEditor();
    expect(screen.queryByRole('option', { name: 'Tour núi' })).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/Tên sản phẩm/), 'Lều mới');
    await user.selectOptions(screen.getByLabelText(/Danh mục/), 'cat-1');
    await user.click(screen.getByRole('button', { name: 'Tạo sản phẩm' }));
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          endpoint: '/admin/products',
          method: 'post',
          body: { name: 'Lều mới', categoryId: 'cat-1', status: 'Inactive', description: null },
        },
        expect.any(Object),
      ),
    );
    expect(await screen.findByRole('heading', { name: 'Trang chi tiết sau khi lưu' })).toBeInTheDocument();
  });
  it('preloads categoryId and updates the existing product without creating another', async () => {
    useAdminProduct.mockReturnValue({
      data: {
        productId: 'product-1',
        name: 'Lều cũ',
        categoryId: 'cat-1',
        categoryName: 'Lều',
        description: 'Mô tả',
        status: 'Active',
      },
      isPending: false,
    });
    const user = userEvent.setup();
    renderEditor('/admin/products/product-1/edit');
    expect(screen.getByLabelText(/Danh mục/)).toHaveValue('cat-1');
    await user.clear(screen.getByLabelText(/Tên sản phẩm/));
    await user.type(screen.getByLabelText(/Tên sản phẩm/), 'Lều đã sửa');
    await user.click(screen.getByRole('button', { name: 'Lưu sản phẩm' }));
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/admin/products/product-1',
          method: 'put',
          body: expect.objectContaining({ name: 'Lều đã sửa', categoryId: 'cat-1' }),
        }),
        expect.any(Object),
      ),
    );
  });
});

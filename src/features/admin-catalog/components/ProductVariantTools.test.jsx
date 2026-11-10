import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '@/api/axiosClient';
import ProductVariantTools from './ProductVariantTools';

vi.mock('@/api/axiosClient', () => ({ default: { post: vi.fn() } }));
const variant = { variantId: 'variant-1', name: 'Lều 2 người', images: [], priceTiers: [] };
const url = 'https://res.cloudinary.com/test/image/upload/photo.png';
function renderTools() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ProductVariantTools productId="product-1" variant={variant} />
    </QueryClientProvider>,
  );
}
describe('product image uploads', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it('uploads multipart to the backend then attaches the secure URL to the variant', async () => {
    axiosClient.post.mockResolvedValueOnce({ data: { imageUrl: url } }).mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderTools();
    await user.click(screen.getByRole('checkbox', { name: 'Đặt làm ảnh đại diện' }));
    const file = new File(['png'], 'tent.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Thêm ảnh sản phẩm'), file);
    await waitFor(() => expect(axiosClient.post).toHaveBeenCalledTimes(2));
    expect(axiosClient.post.mock.calls[0][0]).toBe('/admin/products/images/upload');
    expect(axiosClient.post.mock.calls[0][1].get('file')).toBe(file);
    expect(axiosClient.post.mock.calls[1]).toEqual([
      '/admin/variants/variant-1/images',
      { imageUrl: url, isPrimary: true, displayOrder: 0 },
    ]);
  });
  it('rejects oversized images without an upload', async () => {
    const user = userEvent.setup();
    renderTools();
    const file = new File(['png'], 'tent.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 5242881 });
    await user.upload(screen.getByLabelText('Thêm ảnh sản phẩm'), file);
    expect(screen.getByRole('alert')).toHaveTextContent('5MB');
    expect(axiosClient.post).not.toHaveBeenCalled();
  });
  it('retries attaching the existing Cloudinary URL instead of uploading the same file again', async () => {
    axiosClient.post
      .mockResolvedValueOnce({ data: { imageUrl: url } })
      .mockRejectedValueOnce(new Error('Lỗi lưu ảnh'))
      .mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderTools();
    await user.upload(
      screen.getByLabelText('Thêm ảnh sản phẩm'),
      new File(['png'], 'tent.png', { type: 'image/png' }),
    );
    await user.click(await screen.findByRole('button', { name: 'Thử lưu ảnh vào biến thể lại' }));
    await waitFor(() => expect(axiosClient.post).toHaveBeenCalledTimes(3));
    expect(axiosClient.post.mock.calls[2][0]).toBe('/admin/variants/variant-1/images');
    expect(axiosClient.post.mock.calls.filter(([path]) => path.includes('/upload'))).toHaveLength(1);
  });
});

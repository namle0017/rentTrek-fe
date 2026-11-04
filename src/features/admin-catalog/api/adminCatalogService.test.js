import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '@/api/axiosClient';
import { adminCatalogService } from './adminCatalogService';

vi.mock('@/api/axiosClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('adminCatalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets admin tours with cleaned filters', async () => {
    await adminCatalogService.getTours({ pageNumber: 2, search: 'Tà Xùa', status: '' });

    expect(axiosClient.get).toHaveBeenCalledWith('/admin/tours', {
      params: { pageNumber: 2, search: 'Tà Xùa' },
    });
  });

  it('gets admin products with cleaned filters', async () => {
    await adminCatalogService.getProducts({ pageNumber: 1, status: 'Active', categoryId: null });

    expect(axiosClient.get).toHaveBeenCalledWith('/admin/products', {
      params: { pageNumber: 1, status: 'Active' },
    });
  });
});

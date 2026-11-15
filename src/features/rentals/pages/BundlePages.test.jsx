import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rentalCartActions } from '../hooks/useRentalCart';
import { useBundle, useBundles } from '../hooks/useRentals';
import { useRentalAvailabilityQuery } from '../hooks/useRentalQuoteQuery';
import BundleDetailPage from './BundleDetailPage';
import BundleListPage from './BundleListPage';

vi.mock('../hooks/useRentals', () => ({ useBundles: vi.fn(), useBundle: vi.fn() }));
vi.mock('../hooks/useRentalQuoteQuery', () => ({ useRentalAvailabilityQuery: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const bundle = {
  id: 'b1',
  name: 'Combo Cắm trại 2 người',
  description: 'Đủ đồ cho hai người',
  components: [
    { productVariantId: 'v1', productName: 'Lều', variantName: '2P', quantity: 1, primaryImageUrl: '/a.jpg' },
  ],
  priceTiers: [{ id: 't1', minDays: 1, maxDays: null, dailyPrice: 120000 }],
};

const renderWith = (ui, path, route) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={route} element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe('Bundle pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rentalCartActions.clear();
    useRentalAvailabilityQuery.mockReturnValue({ data: { isAllAvailable: true }, isFetching: false });
  });

  it('lists bundles with links to detail', () => {
    useBundles.mockReturnValue({
      data: {
        items: [{ id: 'b1', name: bundle.name, componentSummary: 'Lều ×1', priceFrom: 120000 }],
        pageNumber: 1,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
    });
    renderWith(<BundleListPage />, '/bundles', '/bundles');
    expect(screen.getByRole('link', { name: bundle.name })).toHaveAttribute('href', '/bundles/b1');
  });

  it('adds the bundle to the rental cart from the detail page', async () => {
    useBundle.mockReturnValue({ data: bundle, isLoading: false, isError: false });
    renderWith(<BundleDetailPage />, '/bundles/b1', '/bundles/:bundleId');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Thêm vào giỏ' }));
    const { items } = JSON.parse(localStorage.getItem('rentrek.rental-cart.v1'));
    expect(items[0]).toMatchObject({ key: 'b1', bundleId: 'b1', quantity: 1 });
  });
});

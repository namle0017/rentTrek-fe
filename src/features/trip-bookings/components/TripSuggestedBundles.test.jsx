import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { rentalCartActions } from '@/features/rentals/hooks/useRentalCart';
import { useTripSuggestedBundles } from '../hooks/useTripBookings';
import TripSuggestedBundles from './TripSuggestedBundles';

vi.mock('../hooks/useTripBookings', () => ({ useTripSuggestedBundles: vi.fn() }));
vi.mock('@/features/rentals/hooks/useRentalCart', () => ({
  rentalCartActions: { setPeriod: vi.fn(), add: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const bundle = (id, available) => ({
  id,
  name: `Combo ${id}`,
  priceTiers: [{ dailyPrice: 100000 }],
  availability: { availableQuantity: available },
  components: [
    { productVariantId: 'v-tent', productName: 'Lều', variantName: '2 người', quantity: 1 },
    { productVariantId: 'v-pole', productName: 'Gậy', variantName: 'Carbon', quantity: 2 },
  ],
});

const renderWith = (data, partySize = 3) => {
  useTripSuggestedBundles.mockReturnValue({ data });
  return render(
    <MemoryRouter>
      <TripSuggestedBundles tripId="trip-1" partySize={partySize} />
    </MemoryRouter>,
  );
};

describe('TripSuggestedBundles', () => {
  it('renders nothing without suggestions', () => {
    const { container } = renderWith({ bundles: [], providedVariantIds: [] });
    expect(container).toBeEmptyDOMElement();
  });

  it('marks gear the tour provides and adds party-size combos on trip dates', async () => {
    renderWith({
      rentalFrom: '2099-12-01T01:00:00Z',
      rentalTo: '2099-12-03T10:00:00Z',
      providedVariantIds: ['v-pole'],
      bundles: [
        { note: 'Đủ cho đoàn', bundle: bundle('a', 2) },
        { note: null, bundle: bundle('b', 0) },
      ],
    });

    expect(screen.getAllByText(/tour đã cung cấp/)).toHaveLength(2);
    expect(screen.getByText('Hết hàng trong ngày chuyến đi')).toBeInTheDocument();

    // Chỉ còn 2 combo nên số lượng = min(3 người, 2)
    await userEvent.click(screen.getByRole('button', { name: 'Thêm 2 combo vào giỏ thuê' }));
    expect(rentalCartActions.setPeriod).toHaveBeenCalledWith({
      start: '2099-12-01T08:00',
      end: '2099-12-03T17:00',
    });
    expect(rentalCartActions.add).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'bundle-a', bundleId: 'a', quantity: 2 }),
    );
  });
});

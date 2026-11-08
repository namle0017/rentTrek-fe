import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { RENTAL_CART_KEY, rentalCartActions, useRentalCart } from './useRentalCart';

const item = { key: 'variant-1', productVariantId: 'variant-1', productId: 'product-1', name: 'Lều xanh', quantity: 1 };
describe('rental cart', () => {
  beforeEach(() => rentalCartActions.clear());
  it('merges the same variant, persists and updates all subscribers', () => {
    const { result } = renderHook(() => useRentalCart());
    act(() => { rentalCartActions.add(item); rentalCartActions.add({ ...item, quantity: 2 }); });
    expect(result.current.items[0].quantity).toBe(3);
    expect(JSON.parse(localStorage.getItem(RENTAL_CART_KEY)).items[0].quantity).toBe(3);
  });
  it('rejects quantity overflow without silently changing the cart', () => {
    rentalCartActions.add({ ...item, quantity: 20 });
    expect(() => rentalCartActions.add(item)).toThrow(/20/);
    const { result } = renderHook(() => useRentalCart());
    expect(result.current.items[0].quantity).toBe(20);
  });
  it('removes only purchased quantities if another tab added items during checkout', () => {
    rentalCartActions.add({ ...item, quantity: 3 });
    rentalCartActions.removeOrderedItems([{ ...item, quantity: 2 }]);
    const { result } = renderHook(() => useRentalCart());
    expect(result.current.items[0].quantity).toBe(1);
  });
  it('syncs a cleared cart from another tab', () => {
    rentalCartActions.add(item);
    const { result } = renderHook(() => useRentalCart());
    act(() => { localStorage.removeItem(RENTAL_CART_KEY); window.dispatchEvent(new StorageEvent('storage', { key: RENTAL_CART_KEY })); });
    expect(result.current.items).toEqual([]);
  });
});

import { useSyncExternalStore } from 'react';
import { defaultRentalPeriod } from '../utils/rentalCheckout';

export const RENTAL_CART_KEY = 'rentrek.rental-cart.v1';
const listeners = new Set();
const emptyCart = () => ({ items: [], period: defaultRentalPeriod(), promotionCode: '' });
function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(RENTAL_CART_KEY));
    if (!value || !Array.isArray(value.items)) return emptyCart();
    return {
      items: value.items
        .filter(
          (item) =>
            item &&
            typeof item.key === 'string' &&
            typeof item.name === 'string' &&
            (item.productVariantId || item.bundleId) &&
            Number.isInteger(item.quantity) &&
            item.quantity >= 1 &&
            item.quantity <= 20,
        )
        .slice(0, 20),
      period:
        typeof value.period?.start === 'string' && typeof value.period?.end === 'string'
          ? value.period
          : defaultRentalPeriod(),
      promotionCode: typeof value.promotionCode === 'string' ? value.promotionCode.slice(0, 50) : '',
    };
  } catch {
    return emptyCart();
  }
}
let cart = readCart();
const snapshot = () => cart;
function publish(next) {
  cart = next;
  try {
    localStorage.setItem(RENTAL_CART_KEY, JSON.stringify(cart));
  } catch {
    /* Keep the current in-memory cart usable. */
  }
  listeners.forEach((listener) => listener());
}
function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (event) => {
    if (event.key === RENTAL_CART_KEY || event.key === null) {
      cart = readCart();
      listeners.forEach((notify) => notify());
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}
export const rentalCartActions = {
  add(item) {
    const existing = cart.items.find((line) => line.key === item.key);
    const quantity = (existing?.quantity || 0) + item.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
      throw new Error('Mỗi phiên bản được thuê tối đa 20 thiết bị.');
    if (!existing && cart.items.length >= 20) throw new Error('Giỏ thuê tối đa 20 dòng sản phẩm.');
    publish({
      ...cart,
      items: existing
        ? cart.items.map((line) => (line.key === item.key ? { ...line, ...item, quantity } : line))
        : [...cart.items, { ...item, quantity }],
    });
  },
  setQuantity(key, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return;
    publish({ ...cart, items: cart.items.map((line) => (line.key === key ? { ...line, quantity } : line)) });
  },
  remove(key) {
    publish({ ...cart, items: cart.items.filter((line) => line.key !== key) });
  },
  setPeriod(period) {
    publish({ ...cart, period });
  },
  setPromotionCode(promotionCode) {
    publish({ ...cart, promotionCode });
  },
  removeOrderedItems(ordered) {
    publish({
      ...cart,
      items: cart.items.flatMap((line) => {
        const quantity = line.quantity - (ordered.find((item) => item.key === line.key)?.quantity || 0);
        return quantity > 0 ? [{ ...line, quantity }] : [];
      }),
      promotionCode: '',
    });
  },
  clear() {
    publish(emptyCart());
  },
};
export function useRentalCart() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

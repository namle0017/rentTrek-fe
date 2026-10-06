const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

/** 120000 → "120.000 ₫" */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '';
  return currencyFormatter.format(value);
}

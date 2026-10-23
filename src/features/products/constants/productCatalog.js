export const PRODUCT_OFFERING_TYPE = Object.freeze({
  RENTAL: 'Rental',
  SALE: 'Sale',
  BOTH: 'Both',
});

export const PRODUCT_OFFERING_LABEL = {
  [PRODUCT_OFFERING_TYPE.RENTAL]: 'Cho thuê',
  [PRODUCT_OFFERING_TYPE.SALE]: 'Bán',
  [PRODUCT_OFFERING_TYPE.BOTH]: 'Thuê & bán',
};

export const PRODUCT_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Mới nhất' },
  { value: 'name:asc', label: 'Tên A → Z' },
  { value: 'pricePerDay:asc', label: 'Giá thuê tăng dần' },
  { value: 'pricePerDay:desc', label: 'Giá thuê giảm dần' },
  { value: 'salePrice:asc', label: 'Giá bán tăng dần' },
  { value: 'salePrice:desc', label: 'Giá bán giảm dần' },
];

export const PRODUCT_IMAGE_FALLBACK = '/images/products/placeholder.svg';

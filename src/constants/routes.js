export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (productId = ':productId') => `/products/${productId}`,
  ADMIN: '/admin',
  ADMIN_PRODUCT_CREATE: '/admin/products/new',
  FORBIDDEN: '/403',
};

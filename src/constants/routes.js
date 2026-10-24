export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (productId = ':productId') => `/products/${productId}`,
  ADMIN: '/admin',
  ADMIN_PRODUCT_CREATE: '/admin/products/new',
  FORBIDDEN: '/403',
};

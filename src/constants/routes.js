export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (productId = ':productId') => `/products/${productId}`,
  TOURS: '/tours',
  TOUR_DETAIL: (tourId = ':tourId') => `/tours/${tourId}`,
  ADMIN: '/admin',
  ADMIN_PRODUCT_CREATE: '/admin/products/new',
  FORBIDDEN: '/403',
};

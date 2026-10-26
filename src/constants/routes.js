export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (productId = ':productId') => `/products/${productId}`,
  TOURS: '/tours',
  TOUR_DETAIL: (tourId = ':tourId') => `/tours/${tourId}`,
  TRIP_BOOKING_CREATE: '/trip-bookings/new',
  ADMIN: '/admin',
  ADMIN_PRODUCT_CREATE: '/admin/products/new',
  FORBIDDEN: '/403',
};

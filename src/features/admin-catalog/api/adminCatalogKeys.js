export const adminCatalogKeys = {
  all: ['admin-catalog'],
  tours: (params) => [...adminCatalogKeys.all, 'tours', params],
  tourDetail: (tourId) => [...adminCatalogKeys.all, 'tour-detail', tourId],
  products: (params) => [...adminCatalogKeys.all, 'products', params],
  productDetail: (productId) => [...adminCatalogKeys.all, 'product-detail', productId],
};

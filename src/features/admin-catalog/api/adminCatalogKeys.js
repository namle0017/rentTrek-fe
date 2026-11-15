export const adminCatalogKeys = {
  all: ['admin-catalog'],
  tours: (params) => [...adminCatalogKeys.all, 'tours', params],
  tourDetail: (tourId) => [...adminCatalogKeys.all, 'tour-detail', tourId],
  // Màn soạn tour: [..., tourId, 'images' | 'activities' | ...]
  tourAuthoring: (tourId, part) => [...adminCatalogKeys.all, 'tour-authoring', tourId, part],
  products: (params) => [...adminCatalogKeys.all, 'products', params],
  productDetail: (productId) => [...adminCatalogKeys.all, 'product-detail', productId],
  bundles: (params) => [...adminCatalogKeys.all, 'bundles', params],
  bundleDetail: (bundleId) => [...adminCatalogKeys.all, 'bundle-detail', bundleId],
  tourSuggestedBundles: (tourId) => [...adminCatalogKeys.all, 'tour-suggested-bundles', tourId],
};

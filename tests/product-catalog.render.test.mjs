// Requires the local backend and demo catalog. Uses actual Axios services and renders React in Node.
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createServer } from 'vite';

let server;
let productService;
let productKeys;
let ProductListPage;
let ProductDetailPage;
let catalog;
let categories;

before(async () => {
  // The shared Axios interceptor reads browser token storage; use an empty store for public requests.
  globalThis.localStorage = { getItem: () => null };
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  ({ productService } = await server.ssrLoadModule('/src/features/products/api/productService.js'));
  ({ productKeys } = await server.ssrLoadModule('/src/features/products/api/productKeys.js'));
  ({ default: ProductListPage } = await server.ssrLoadModule(
    '/src/features/products/pages/ProductListPage.jsx',
  ));
  ({ default: ProductDetailPage } = await server.ssrLoadModule(
    '/src/features/products/pages/ProductDetailPage.jsx',
  ));
  catalog = await productService.getAll({ pageSize: 100 });
  categories = await productService.getCategories();
  assert.ok(catalog.data.items.length > 0, 'Seed the local demo catalog first');
});

after(async () => {
  await server?.close();
  delete globalThis.localStorage;
});

function renderPage(Page, path, queryEntries, routePath = '/products') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  queryEntries.forEach(([key, response]) => client.setQueryData(key, response));
  try {
    return renderToStaticMarkup(
      React.createElement(
        QueryClientProvider,
        { client },
        React.createElement(
          MemoryRouter,
          { initialEntries: [path] },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, { path: routePath, element: React.createElement(Page) }),
          ),
        ),
      ),
    );
  } finally {
    client.clear();
  }
}

test('list renders actual Axios data, product links, filters and pagination', async () => {
  const params = {
    pageNumber: 1,
    pageSize: 8,
    search: '',
    categoryId: '',
    offeringType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };
  const products = await productService.getAll(params);
  const html = renderPage(ProductListPage, '/products', [
    [productKeys.list(params), products],
    [productKeys.categories(), categories],
  ]);
  for (const product of products.data.items) {
    assert.ok(html.includes(product.name));
    assert.ok(html.includes(`href="/products/${product.id}"`));
  }
  assert.ok(html.toLocaleLowerCase('vi-VN').includes('tìm sản phẩm'));
  assert.ok(html.toLocaleLowerCase('vi-VN').includes('hình thức'));
  assert.ok(html.includes('Phân trang'));
});

test('detail renders variants, gallery, and rental tiers from Axios', async () => {
  const product = catalog.data.items.find((item) => item.isRentable && item.isForSale);
  assert.ok(product, 'Demo catalog must include a combined offering');
  const response = await productService.getById(product.id);
  const html = renderPage(
    ProductDetailPage,
    `/products/${product.id}`,
    [[productKeys.detail(String(product.id)), response]],
    '/products/:productId',
  );
  assert.ok(html.includes(product.name));
  assert.ok(html.includes('Bảng giá thuê'));
  assert.ok(html.includes('Giá bán'));
  for (const variant of response.data.variants) assert.ok(html.includes(variant.name));
  assert.ok(html.includes(response.data.variants[0].sku));
});

test('sale-only product does not render a misleading rental price', async () => {
  const product = catalog.data.items.find((item) => item.isForSale && !item.isRentable);
  assert.ok(product, 'Demo catalog must include a sale-only offering');
  const response = await productService.getById(product.id);
  const html = renderPage(
    ProductDetailPage,
    `/products/${product.id}`,
    [[productKeys.detail(String(product.id)), response]],
    '/products/:productId',
  );
  assert.ok(html.includes('Giá bán'));
  assert.ok(!html.includes('Bảng giá thuê'));
  assert.ok(!html.includes('NaN'));
});

test('unmatched search renders empty state and a reset action', async () => {
  const params = {
    pageNumber: 1,
    pageSize: 8,
    search: '__no_product_should_match_this__',
    categoryId: '',
    offeringType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };
  const response = await productService.getAll(params);
  const html = renderPage(ProductListPage, `/products?search=${params.search}`, [
    [productKeys.list(params), response],
    [productKeys.categories(), categories],
  ]);
  assert.ok(html.includes('Không tìm thấy sản phẩm phù hợp'));
  assert.ok(html.includes('Xem tất cả sản phẩm'));
});

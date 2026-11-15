import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/constants/routes';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BE_ROOT = path.resolve(SRC, '..', '..', 'BE');
const read = (relative) => fs.readFileSync(path.join(SRC, relative), 'utf8');
const routerSource = read('routes/router.jsx');

/** Resolve every `path: ROUTES.X` / `path: ROUTES.X()` / `path: '/literal'` in router.jsx to a URL pattern. */
function collectPaths() {
  const found = [];
  const refPattern = /path:\s*ROUTES\.([A-Z0-9_]+)(\(\))?/g;
  for (const match of routerSource.matchAll(refPattern)) {
    const value = ROUTES[match[1]];
    const resolved = typeof value === 'function' ? value() : value;
    found.push({ key: match[1], path: resolved });
  }
  for (const match of routerSource.matchAll(/path:\s*'(\/[^']*)'/g)) {
    found.push({ key: match[1], path: match[1] });
  }
  return found.filter((entry) => typeof entry.path === 'string');
}

describe('router - phase 01 (item 9 + 0.4)', () => {
  it('TC-PM-001: declares each absolute path at most once (no duplicate /admin/posts/:postId)', () => {
    const counts = new Map();
    for (const { path: routePath } of collectPaths()) {
      counts.set(routePath, (counts.get(routePath) || 0) + 1);
    }
    const duplicates = [...counts.entries()].filter(([, count]) => count > 1).map(([routePath]) => routePath);
    expect(duplicates).toEqual([]);
  });

  it('TC-PM-002: /admin/posts/:postId is declared exactly once', () => {
    const matches = collectPaths().filter((entry) => entry.path === '/admin/posts/:postId');
    expect(matches).toHaveLength(1);
  });

  it('TC-PM-003: /admin/rental-policy redirects to /admin/rental-policies and the old page is gone', () => {
    const oldPath = /path:\s*(ROUTES\.ADMIN_RENTAL_POLICY\b|'\/admin\/rental-policy')\s*,\s*element:\s*<Navigate to=\{ROUTES\.ADMIN_RENTAL_POLICIES\}/;
    expect(routerSource).toMatch(oldPath);
    expect(routerSource).not.toContain('AdminRentalPolicyPage');
    expect(ROUTES.ADMIN_RENTAL_POLICIES).toBe('/admin/rental-policies');
  });

  it('TC-PM-004: /guide route allows Guide and no longer allows Staff', () => {
    const layoutIndex = routerSource.indexOf('<GuideLayout');
    expect(layoutIndex).toBeGreaterThan(0);
    const guard = routerSource.slice(Math.max(0, layoutIndex - 600), layoutIndex);
    const rolesLine = guard.split('\n').filter((line) => line.includes('ProtectedRoute')).pop();
    expect(rolesLine).toContain('USER_ROLE.GUIDE');
    expect(rolesLine).not.toContain('USER_ROLE.STAFF');
  });
});

describe('static checks - phase 01', () => {
  it('TC-PM-005: AWAITING_BANK_INFO is declared once in the status enum and once in the label map', () => {
    const source = read('constants/enums.js');
    const lines = source.split(/\r?\n/).filter((line) => line.includes('AWAITING_BANK_INFO'));
    expect(lines).toHaveLength(2);
    expect(source).toContain('Chờ khách cung cấp tài khoản');
    expect(source).not.toContain('Chờ khách nhập STK');
  });

  it('TC-PM-006: refundProofHelper base64 helper is no longer used by refund/rental views', () => {
    const files = [
      'features/refunds/components/RefundProgressCard.jsx',
      'features/finance/pages/RefundQueue.jsx',
      'features/refunds/components/RefundDetailModal.jsx',
      'features/rentals/pages/RentalOrderDetailPage.jsx',
    ];
    for (const file of files) {
      const full = path.join(SRC, file);
      if (!fs.existsSync(full)) continue;
      // Nhãn lý do (CANCEL_CATEGORIES...) vẫn ở refundProofHelper; chỉ cấm cách nhét ảnh vào mã giao dịch
      expect(fs.readFileSync(full, 'utf8'), file).not.toMatch(/AdminTransactionWithProof|#proof=/);
    }
  });

  it('TC-PM-007: product detail asset link goes to ROUTES.OPS_ASSETS, not the dead warehouse path', () => {
    const page = read('features/admin-catalog/pages/AdminProductDetailPage.jsx');
    expect(page).not.toContain('/ops/warehouse/assets');
    expect(ROUTES.OPS_ASSETS).toBe('/ops/assets');
  });

  it('TC-PM-008: issue-photo and post endpoints are defined (issue-photos, publish, archive, images)', () => {
    const endpoints = read('api/endpoints.js');
    expect(endpoints).toMatch(/issue-photos/);
    expect(endpoints).toMatch(/publish/);
    expect(endpoints).toMatch(/archive/);
    expect(endpoints).toMatch(/admin\/posts\/images|POST_IMAGES|IMAGES/);
  });

  it('TC-PM-009: bundle admin form keeps replacementValue in its payload', () => {
    const page = read('features/admin-catalog/pages/AdminBundleDetailPage.jsx');
    expect(page).toMatch(/replacementValue/);
  });

  const guideController = path.join(BE_ROOT, 'src/RenTrek.API/Controllers/GuideController.cs');
  it.skipIf(!fs.existsSync(guideController))('TC-PM-050: BE GuideController authorizes TourGuide', () => {
    const source = fs.readFileSync(guideController, 'utf8');
    const attribute = source.split('\n').find((line) => line.includes('[Authorize(Roles'));
    expect(attribute).toContain('RoleNames.TourGuide');
  });

  const reportService = path.join(BE_ROOT, 'src/RenTrek.BLL/Services/Implementations/AdminReportService.cs');
  it.skipIf(!fs.existsSync(reportService))('TC-PM-051: overdue rental alert link uses OrderId', () => {
    const source = fs.readFileSync(reportService, 'utf8');
    const line = source.split('\n').find((l) => l.includes('"OverdueRental"'));
    expect(line).toContain('/admin/rental-orders/{x.OrderId}');
    expect(line).not.toContain('/admin/rental-orders/{x.OrderCode}');
  });
});

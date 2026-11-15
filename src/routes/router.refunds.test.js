import { describe, expect, it, vi } from 'vitest';
import { ROUTES } from '@/constants/routes';

// jsdom không có matchMedia; một số trang (gsap) cần nó khi router được nạp
vi.hoisted(() => {
  window.matchMedia ??= () => ({
    matches: false,
    media: '',
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
});
import { router } from './router';
import ProtectedRoute from './ProtectedRoute';

// Trả về danh sách roles của mọi ProtectedRoute bọc route có `path`
function guardRolesFor(routes, path, inherited = []) {
  for (const route of routes) {
    const roles =
      route.element?.type === ProtectedRoute ? [...inherited, route.element.props.roles ?? []] : inherited;
    if (route.path === path) return roles;
    if (route.children) {
      const found = guardRolesFor(route.children, path, roles);
      if (found) return found;
    }
  }
  return null;
}

describe('refund queue routes', () => {
  it.each([ROUTES.ADMIN_REFUNDS, ROUTES.OPS_REFUNDS])('%s is open to Admin and Staff (Staff approves or rejects)', (path) => {
    const guards = guardRolesFor(router.routes, path);
    expect(guards).not.toBeNull();
    expect(guards.at(-1)).toEqual(['Admin', 'Staff']);
  });
});

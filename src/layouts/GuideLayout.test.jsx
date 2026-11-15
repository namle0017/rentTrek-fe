import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import GuideLayout from './GuideLayout';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/auth/hooks/useLogout', () => ({ useLogout: vi.fn() }));

describe('GuideLayout', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ currentUser: { fullName: 'Phạm Văn Dẫn', role: 'Guide' } });
    useLogout.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('renders the mobile brand without nested links', () => {
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/guide']}>
        <Routes>
          <Route path="/guide" element={<GuideLayout />}>
            <Route index element={<div>Nội dung Guide</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(container.querySelector('a a')).toBeNull();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Breadcrumb from './Breadcrumb';

describe('Shared Breadcrumb component', () => {
  it('renders breadcrumb items with default slash separator', () => {
    render(
      <MemoryRouter>
        <Breadcrumb
          items={[
            { label: 'Trang chủ', to: '/' },
            { label: 'Tour Trekking', to: '/tours' },
            { label: 'Lào Cai' },
            { label: 'Lảo Thẩn' },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Tour Trekking' })).toHaveAttribute('href', '/tours');
    expect(screen.getByText('Lào Cai')).toBeInTheDocument();

    const currentItem = screen.getByText('Lảo Thẩn');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
    expect(currentItem.closest('a')).toBeNull();

    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(3);
  });

  it('filters out falsy and null items automatically', () => {
    render(
      <MemoryRouter>
        <Breadcrumb
          items={[
            { label: 'Trang chủ', to: '/' },
            null,
            undefined,
            false,
            { label: 'Dụng cụ thuê', to: '/products' },
            { label: 'Lều cắm trại' },
          ]}
        />
      </MemoryRouter>,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(screen.getByText('Lều cắm trại')).toHaveAttribute('aria-current', 'page');
  });

  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(
      <MemoryRouter>
        <Breadcrumb
          items={[
            { label: 'Trang chủ', to: '/' },
            { label: 'Tour Trekking', to: '/tours' },
          ]}
          isLoading={true}
        />
      </MemoryRouter>,
    );

    expect(container.querySelector('._skeleton_e489c6, [class*="skeleton"]')).toBeInTheDocument();
  });

  it('returns null if there are no items and not loading', () => {
    const { container } = render(
      <MemoryRouter>
        <Breadcrumb items={[]} />
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });
});


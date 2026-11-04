import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BrandLogo from './BrandLogo';

describe('BrandLogo', () => {
  it('renders wordmark RenTrekk with dot and links to home by default', () => {
    render(
      <MemoryRouter>
        <BrandLogo />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'RenTrekk - Trang chủ' });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveTextContent('RenTrekk.');
  });

  it('renders suffix when provided (e.g. Admin)', () => {
    render(
      <MemoryRouter>
        <BrandLogo suffix="Admin" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders as non-link when asLink is false', () => {
    render(<BrandLogo asLink={false} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('RenTrekk')).toBeInTheDocument();
  });
});


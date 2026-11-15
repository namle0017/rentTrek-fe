import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PolicyStatusBadge from './PolicyStatusBadge';

describe('PolicyStatusBadge', () => {
  it.each([
    ['Draft', 'Bản nháp'],
    ['Scheduled', 'Sắp hiệu lực'],
    ['Active', 'Đang áp dụng'],
    ['Expired', 'Hết hiệu lực'],
    ['Archived', 'Ngừng áp dụng'],
  ])('shows the Vietnamese label for %s', (status, label) => {
    render(<PolicyStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('falls back for unknown or missing status', () => {
    const { rerender } = render(<PolicyStatusBadge status="Weird" />);
    expect(screen.getByText('Không xác định')).toBeInTheDocument();
    rerender(<PolicyStatusBadge />);
    expect(screen.getByText('Không xác định')).toBeInTheDocument();
  });

  it('uses a different tone class for different statuses', () => {
    const { rerender } = render(<PolicyStatusBadge status="Active" />);
    const activeClass = screen.getByText('Đang áp dụng').className;
    rerender(<PolicyStatusBadge status="Archived" />);
    expect(screen.getByText('Ngừng áp dụng').className).not.toBe(activeClass);
  });
});

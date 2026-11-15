import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostReadAnalytics } from '../hooks/usePosts';
import PostReadAnalyticsPanel from './PostReadAnalyticsPanel';

vi.mock('../hooks/usePosts', () => ({ usePostReadAnalytics: vi.fn() }));

describe('PostReadAnalyticsPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows read analytics numbers', () => {
    usePostReadAnalytics.mockReturnValue({
      data: { postId: 'p1', participantsCount: 20, readCount: 15, readRate: 75 },
      isLoading: false,
      isError: false,
    });
    render(<PostReadAnalyticsPanel postId="p1" />);
    expect(usePostReadAnalytics).toHaveBeenCalledWith('p1');
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows an error message', () => {
    usePostReadAnalytics.mockReturnValue({ isLoading: false, isError: true, error: { message: 'Lỗi tải' } });
    render(<PostReadAnalyticsPanel postId="p1" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Lỗi tải');
  });
});

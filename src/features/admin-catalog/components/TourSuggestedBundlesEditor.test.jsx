import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  useAdminBundles,
  useSetTourSuggestedBundles,
  useTourSuggestedBundles,
} from '../hooks/useAdminCatalog';
import TourSuggestedBundlesEditor from './TourSuggestedBundlesEditor';

vi.mock('../hooks/useAdminCatalog', () => ({
  useAdminBundles: vi.fn(),
  useSetTourSuggestedBundles: vi.fn(),
  useTourSuggestedBundles: vi.fn(),
}));

const mutate = vi.fn();
const setup = (canEdit = true) => {
  useTourSuggestedBundles.mockReturnValue({
    isLoading: false,
    data: [{ bundleId: 'b1', name: 'Combo A', status: 'Active', sortOrder: 0, note: 'Cho 2 người' }],
  });
  useAdminBundles.mockReturnValue({
    data: {
      items: [
        { bundleId: 'b1', name: 'Combo A', status: 'Active' },
        { bundleId: 'b2', name: 'Combo B', status: 'Active' },
      ],
    },
  });
  useSetTourSuggestedBundles.mockReturnValue({ mutate, isPending: false });
  render(<TourSuggestedBundlesEditor tourId="t1" canEdit={canEdit} styles={{}} />);
};

describe('TourSuggestedBundlesEditor', () => {
  it('adds a bundle, moves it first and saves the ordered list', async () => {
    setup();
    await userEvent.selectOptions(screen.getByLabelText('Chọn combo để gợi ý'), 'b2');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    await userEvent.click(screen.getByRole('button', { name: 'Đưa Combo B lên' }));
    await userEvent.click(screen.getByRole('button', { name: 'Lưu combo gợi ý' }));

    expect(mutate).toHaveBeenCalledWith({
      tourId: 't1',
      items: [
        { bundleId: 'b2', sortOrder: 0, note: null },
        { bundleId: 'b1', sortOrder: 1, note: 'Cho 2 người' },
      ],
    });
  });

  it('is read-only for staff', () => {
    setup(false);
    expect(screen.getByText('Combo A')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lưu combo gợi ý' })).not.toBeInTheDocument();
  });
});

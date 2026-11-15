import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EvidencePhotoCapture from './EvidencePhotoCapture';
import { fulfillmentService } from '../api/fulfillmentService';

vi.mock('../api/fulfillmentService', () => ({
  fulfillmentService: { uploadEvidence: vi.fn(), deleteEvidence: vi.fn() },
}));

function renderCapture(props = {}) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <EvidencePhotoCapture
        orderCode="RT-1"
        assignmentId="a-1"
        assetCode="TENT-001"
        stage="Handover"
        photos={[]}
        minPhotos={1}
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe('EvidencePhotoCapture', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads each chosen image with the stage and assignment', async () => {
    fulfillmentService.uploadEvidence.mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    renderCapture();
    expect(screen.getByText('0/1 ảnh')).toBeInTheDocument();

    const file = new File(['img'], 'tent.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText('Chọn ảnh tình trạng cho TENT-001'), file);

    await waitFor(() =>
      expect(fulfillmentService.uploadEvidence).toHaveBeenCalledWith('RT-1', {
        file,
        stage: 'Handover',
        assignmentId: 'a-1',
      }),
    );
  });

  it('rejects non-image files without calling the API', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderCapture();

    await user.upload(
      screen.getByLabelText('Chọn ảnh tình trạng cho TENT-001'),
      new File(['x'], 'note.pdf', { type: 'application/pdf' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('JPG/PNG/WebP');
    expect(fulfillmentService.uploadEvidence).not.toHaveBeenCalled();
  });

  it('shows existing photos, lets staff delete them, and hides controls once the step is done', async () => {
    fulfillmentService.deleteEvidence.mockResolvedValue({});
    const user = userEvent.setup();
    const photos = [{ id: 'p-1', imageUrl: 'https://cdn.test/p.jpg' }];
    const { unmount } = renderCapture({ photos });

    expect(screen.getByText('1/1 ảnh')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Xoá ảnh của TENT-001' }));
    await waitFor(() => expect(fulfillmentService.deleteEvidence).toHaveBeenCalledWith('RT-1', 'p-1'));

    unmount();
    renderCapture({ photos, disabled: true });
    expect(screen.queryByRole('button', { name: /Chụp \/ tải ảnh/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xoá ảnh của TENT-001' })).not.toBeInTheDocument();
  });
});

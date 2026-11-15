import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { refundService } from '../api/refundService';
import ProofGallery from './ProofGallery';

vi.mock('../api/refundService', () => {
  const service = { fetchProofBlob: vi.fn() };
  return { refundService: service, default: service };
});

const proofs = [
  { proofId: 'p1', fileName: 'bien-lai-1.png' },
  { proofId: 'p2', fileName: 'bien-lai-2.jpg' },
];
const buildUrl = (proofId) => `/admin/refund-cases/case-1/proofs/${proofId}`;

describe('ProofGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let counter = 0;
    URL.createObjectURL = vi.fn(() => `blob:proof-${++counter}`);
    URL.revokeObjectURL = vi.fn();
    refundService.fetchProofBlob.mockResolvedValue(new Blob(['img']));
  });

  it('shows an empty message when there are no proofs', () => {
    render(<ProofGallery proofs={[]} buildUrl={buildUrl} />);

    expect(screen.getByText('Chưa có chứng từ')).toBeInTheDocument();
    expect(refundService.fetchProofBlob).not.toHaveBeenCalled();
  });

  it('treats undefined proofs as empty', () => {
    render(<ProofGallery buildUrl={buildUrl} />);

    expect(screen.getByText('Chưa có chứng từ')).toBeInTheDocument();
  });

  it('loads every proof through the authenticated service and renders thumbnails', async () => {
    render(<ProofGallery proofs={proofs} buildUrl={buildUrl} />);

    expect(await screen.findByAltText('bien-lai-1.png')).toHaveAttribute('src', expect.stringMatching(/^blob:/));
    expect(await screen.findByAltText('bien-lai-2.jpg')).toBeInTheDocument();
    expect(refundService.fetchProofBlob).toHaveBeenCalledWith('/admin/refund-cases/case-1/proofs/p1');
    expect(refundService.fetchProofBlob).toHaveBeenCalledWith('/admin/refund-cases/case-1/proofs/p2');
  });

  it('shows an error placeholder when a proof fails to load', async () => {
    refundService.fetchProofBlob.mockRejectedValue(new Error('403'));
    render(<ProofGallery proofs={[proofs[0]]} buildUrl={buildUrl} />);

    expect(await screen.findByText('Lỗi tải ảnh')).toBeInTheDocument();
  });

  it('opens the full-size image when a thumbnail is clicked', async () => {
    const user = userEvent.setup();
    render(<ProofGallery proofs={[proofs[0]]} buildUrl={buildUrl} />);

    await user.click(await screen.findByRole('button', { name: 'Xem ảnh bien-lai-1.png' }));

    expect(await screen.findByAltText('bien-lai-1.png (phóng to)')).toBeInTheDocument();
  });

  it('revokes blob URLs on unmount', async () => {
    const { unmount } = render(<ProofGallery proofs={[proofs[0]]} buildUrl={buildUrl} />);
    await screen.findByAltText('bien-lai-1.png');

    unmount();

    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:proof-1'));
  });
});

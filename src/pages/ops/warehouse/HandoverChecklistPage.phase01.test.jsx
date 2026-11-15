import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RentalFulfillmentLayout from '@/layouts/RentalFulfillmentLayout';
import { rentalOpsService } from '@/features/rental-ops/api/rentalOpsService';
import { fulfillmentService } from './api/fulfillmentService';
import HandoverChecklistPage from './HandoverChecklistPage';

vi.mock('./api/fulfillmentService', () => ({
  fulfillmentService: {
    getHandoverChecklist: vi.fn(),
    scanHandover: vi.fn(),
    completeHandover: vi.fn(),
    uploadEvidencePhoto: vi.fn(),
    deleteEvidencePhoto: vi.fn(),
  },
}));
vi.mock('@/features/rental-ops/api/rentalOpsService', () => ({
  rentalOpsService: {
    getById: vi.fn(),
    uploadEvidence: vi.fn(),
    deleteEvidence: vi.fn(),
    reportNoShow: vi.fn(),
    submitReturnReport: vi.fn(),
  },
}));
vi.mock('./utils/soundHelper', () => ({ playSuccessBeep: vi.fn(), playErrorBuzz: vi.fn() }));
vi.mock('@/api/axiosClient', () => ({ default: { get: vi.fn(() => Promise.resolve({ data: { items: [] } })) } }));

const assets = [
  { assignmentId: 'as-1', assetCode: 'TENT-001', displayName: 'Lều 2 người', status: 'Reserved', photos: [] },
  { assignmentId: 'as-2', assetCode: 'TENT-002', displayName: 'Lều 2 người', status: 'Reserved', photos: [] },
];

const checklist = {
  orderId: 'order-1',
  orderCode: 'RT-202611-001',
  customerName: 'Khách kiểm thử',
  rentalStartAt: '2026-11-08T06:00:00Z',
  rentalEndAt: '2026-11-09T18:00:00Z',
  orderStatus: 'Confirmed',
  totalRequiredCount: 2,
  scannedCount: 0,
  minPhotos: 1,
  assets,
  items: [
    {
      rentalOrderItemId: 'item-1',
      productName: 'Lều',
      variantName: '2 người',
      variantSku: 'TENT-2',
      quantityRequired: 2,
      scannedCount: 0,
      scannedAssets: [],
    },
  ],
};

const rentalOrder = {
  orderId: 'order-1',
  assignments: assets.map((a) => ({ ...a })),
  evidencePhotos: [],
  reports: [],
  allowedActions: { minPhotosPerAsset: 1, canReportNoShow: true },
};

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/ops/rentals/RT-202611-001/handover']}>
        <Routes>
          <Route element={<RentalFulfillmentLayout />}>
            <Route path="/ops/rentals/:orderCode/handover" element={<HandoverChecklistPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('HandoverChecklistPage - phase 01 (item 0.2: single evidence photo UI)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fulfillmentService.getHandoverChecklist.mockResolvedValue({ data: checklist });
    rentalOpsService.getById.mockResolvedValue({ data: rentalOrder });
  });

  it('TC-PM-020: renders exactly one photo uploader per asset (EvidencePhotoCapture only)', async () => {
    const { container } = renderPage();
    await screen.findByText('Khách kiểm thử');
    await screen.findByRole('button', { name: 'Báo khách không đến nhận' });

    expect(container.querySelectorAll('input[type="file"]')).toHaveLength(assets.length);
    expect(screen.getByLabelText('Chọn ảnh tình trạng cho TENT-001')).toBeInTheDocument();
    expect(screen.getByLabelText('Chọn ảnh tình trạng cho TENT-002')).toBeInTheDocument();
    expect(screen.queryByText('Chụp / chọn ảnh')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ảnh tình trạng lúc giao' })).not.toBeInTheDocument();
  });

  it('TC-PM-021: still offers the no-show report action', async () => {
    renderPage();
    expect(await screen.findByRole('button', { name: 'Báo khách không đến nhận' })).toBeInTheDocument();
  });
});

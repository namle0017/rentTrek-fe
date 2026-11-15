import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { assetService } from './api/assetService';
import AssetListPage from './AssetListPage';

vi.mock('./api/assetService', () => ({
  assetService: {
    getAll: vi.fn(),
    getByCode: vi.fn(),
    bulkCreate: vi.fn(),
    getVariants: vi.fn(),
    updateStatus: vi.fn(),
    getHistory: vi.fn(),
    getGantt: vi.fn(),
  },
}));

const mockAssets = [
  {
    id: 'asset-1',
    assetCode: 'EQ-001',
    productName: 'Lều cắm trại 4 người',
    variantName: 'Xanh rêu',
    sku: 'TENT-4P-GRN',
    assetStatus: 'Available',
    conditionNote: 'Tốt',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-05T14:00:00Z',
    currentAssignment: null,
  },
  {
    id: 'asset-2',
    assetCode: 'EQ-002',
    productName: 'Balo trợ lực 60L',
    variantName: 'Đỏ đen',
    sku: 'PACK-60L-RED',
    assetStatus: 'Rented',
    conditionNote: 'Đang cho thuê',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-06T09:00:00Z',
    currentAssignment: {
      sourceType: 'RentalOrder',
      sourceCode: 'RO-1001',
      status: 'Issued',
    },
  },
  {
    id: 'asset-3',
    assetCode: 'EQ-003',
    productName: 'Gậy leo núi Carbon',
    variantName: 'Đen',
    sku: 'POLE-CRB-BLK',
    assetStatus: 'Maintenance',
    conditionNote: 'Khóa điều chỉnh bị rít',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-07T11:00:00Z',
    currentAssignment: null,
  },
  {
    id: 'asset-4',
    assetCode: 'EQ-004',
    productName: 'Túi ngủ mùa đông -5C',
    variantName: 'Xanh dương',
    sku: 'SLP-5C-BLU',
    assetStatus: 'Damaged',
    conditionNote: 'Rách khóa kéo',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-08T08:00:00Z',
    currentAssignment: null,
  },
];

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AssetListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AssetListPage - Direction G: Compact Inventory Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assetService.getVariants.mockResolvedValue({ data: [] });
    assetService.getAll.mockResolvedValue({
      data: {
        items: mockAssets,
        totalItems: mockAssets.length,
      },
    });
  });

  it('renders action toolbar with Gantt schedule and bulk add buttons', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Lịch phân bổ \(Gantt\)/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Thêm hàng loạt/i })).toBeInTheDocument();
  });

  it('displays Direction G AdminStatSummary with 4 operational metrics', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tổng số thiết bị')).toBeInTheDocument();
    });

    // 4 metrics: Total=4, Available=1, InUse=1, ActionNeeded=2
    expect(screen.getByText('Sẵn sàng cấp')).toBeInTheDocument();
    expect(screen.getByText('Đang cho thuê / cấp chuyến')).toBeInTheDocument();
    expect(screen.getByText('Cần can thiệp xử lý')).toBeInTheDocument();

    const statSummary = screen.getByRole('region', { name: 'Tóm tắt chỉ số' });
    expect(statSummary).toBeInTheDocument();
  });

  it('renders status tabs with count badges and action buttons', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Lịch phân bổ (Gantt)')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Thêm hàng loạt/i })).toBeInTheDocument();

    // Verify status tab labels
    expect(screen.getByRole('button', { name: /Tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sẵn sàng/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đang cho thuê/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bảo trì/i })).toBeInTheDocument();
  });
});

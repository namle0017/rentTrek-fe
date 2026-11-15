import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useActiveRefundPolicies,
  useCreateAdminTrip,
  usePublishedTours,
  useTripCoordinators,
} from '../hooks/useAdminTrips';
import AdminTripCreatePage from './AdminTripCreatePage';

vi.mock('../hooks/useAdminTrips', () => ({
  useActiveRefundPolicies: vi.fn(),
  useCreateAdminTrip: vi.fn(),
  usePublishedTours: vi.fn(),
  useTripCoordinators: vi.fn(),
}));

const mockMutateAsync = vi.fn();

function renderCreatePage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/trips/new']}>
        <Routes>
          <Route path="/admin/trips/new" element={<AdminTripCreatePage />} />
          <Route path="/admin/trips" element={<h2>Danh sách chuyến đi</h2>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdminTripCreatePage - Direction D Unified Form', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    usePublishedTours.mockReturnValue({
      data: [
        {
          tourId: 'tour-1',
          tourCode: 'TR-LAOTHAN',
          title: 'Lảo Thẩn Săn Mây',
          durationDays: 2,
          durationNights: 1,
          basePrice: 2500000,
          location: 'Y Tý, Lào Cai',
          difficulty: 'Trung bình',
          maxParticipants: 15,
          minParticipants: 8,
        },
      ],
      isLoading: false,
    });

    useActiveRefundPolicies.mockReturnValue({
      data: [
        {
          refundPolicyId: 'pol-1',
          policyCode: 'STANDARD',
          policyName: 'Chính sách hoàn tiền tiêu chuẩn',
        },
      ],
      isLoading: false,
    });

    useTripCoordinators.mockReturnValue({
      data: [
        {
          userId: 'user-coord-1',
          fullName: 'Nguyễn Văn Điều Phối',
          role: 'Staff',
          email: 'coord@rentrek.vn',
        },
      ],
      isLoading: false,
    });

    useCreateAdminTrip.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders unified form layout with inherited readonly price and side-by-side date fields', () => {
    renderCreatePage();

    expect(screen.getByRole('link', { name: /Quản lý chuyến đi/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /1\. Thông tin chuyến đi & Tour/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /2\. Lịch trình & Điều phối đoàn/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /3\. Sức chứa & Điều kiện khởi hành/ })).toBeInTheDocument();

    const priceInput = screen.getByLabelText(/Giá mỗi khách/);
    expect(priceInput).toHaveAttribute('readonly');
    expect(priceInput).toBeDisabled();

    expect(screen.getByLabelText(/Thời điểm khởi hành/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Thời điểm kết thúc/)).toBeInTheDocument();
  });

  it('inherits tour facts and opens review confirmation modal upon valid submit', async () => {
    const user = userEvent.setup();
    renderCreatePage();

    await user.selectOptions(screen.getByLabelText(/Tour Trekking/), 'tour-1');

    expect(screen.getByText('TR-LAOTHAN')).toBeInTheDocument();
    expect(screen.getByText('Y Tý, Lào Cai')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Chính sách hoàn tiền/), 'pol-1');
    fireEvent.change(screen.getByLabelText(/Thời điểm khởi hành/), { target: { value: '2026-12-01T06:00' } });
    fireEvent.change(screen.getByLabelText(/Thời điểm kết thúc/), { target: { value: '2026-12-02T18:00' } });

    const submitBtn = screen.getByRole('button', { name: /Xem lại & Xác nhận tạo chuyến/ });
    await user.click(submitBtn);

    expect(await screen.findByText('Xác nhận tạo chuyến đi mới')).toBeInTheDocument();
    expect(screen.getByText(/Tối thiểu 8 khách — Tối đa 15 chỗ/)).toBeInTheDocument();
  });
});


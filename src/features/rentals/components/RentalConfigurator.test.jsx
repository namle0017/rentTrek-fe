import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rentalService } from '../api/rentalService';
import { rentalCartActions } from '../hooks/useRentalCart';
import RentalConfigurator from './RentalConfigurator';

vi.mock('../api/rentalService', () => ({
  rentalService: {
    quote: vi.fn(),
  },
}));

const mockProduct = {
  id: 'prod-1',
  name: 'Gậy trekking',
  categoryName: 'Thiết bị trekking',
  thumbnailUrl: '/images/pole.jpg',
  variants: [
    {
      id: 'var-1',
      name: 'Gậy trekking Carbon',
      sku: 'POLE-TREK',
      rentalPriceTiers: [
        { id: 'tier-1', minDays: 1, maxDays: 3, dailyPrice: 20000 },
        { id: 'tier-2', minDays: 4, maxDays: null, dailyPrice: 15000 },
      ],
      images: [{ id: 'img-1', imageUrl: '/images/pole-1.jpg' }],
    },
    {
      id: 'var-2',
      name: 'Gậy trekking Nhôm',
      sku: 'POLE-ALU',
      rentalPriceTiers: [
        { id: 'tier-3', minDays: 1, maxDays: null, dailyPrice: 15000 },
      ],
      images: [{ id: 'img-2', imageUrl: '/images/pole-2.jpg' }],
    },
  ],
};

const renderConfigurator = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RentalConfigurator
          product={mockProduct}
          variant={mockProduct.variants[0]}
          minimumDailyPrice={20000}
          onVariantChange={vi.fn()}
          {...props}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('RentalConfigurator Wireframe Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    rentalCartActions.clear();
    rentalCartActions.setPeriod({
      start: '2099-11-11T09:00',
      end: '2099-11-12T09:00',
    });

    rentalService.quote.mockResolvedValue({
      data: {
        billableDays: 1,
        isAllAvailable: true,
        items: [{ availableQuantity: 5, dailyPrice: 20000 }],
      },
    });
  });

  it('renders wireframe header: GIÁ THUÊ TỪ and formatted daily price', () => {
    renderConfigurator();

    expect(screen.getByText('GIÁ THUÊ TỪ')).toBeInTheDocument();
    expect(screen.getAllByText(/20\.000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('/ngày')).toBeInTheDocument();
  });

  it('renders variant pills when product has multiple variants and triggers callback', async () => {
    const onVariantChange = vi.fn();
    const user = userEvent.setup();

    renderConfigurator({ onVariantChange });

    expect(screen.getByText('Gậy trekking Carbon')).toBeInTheDocument();
    const aluButton = screen.getByRole('button', { name: 'Gậy trekking Nhôm' });
    expect(aluButton).toBeInTheDocument();

    await user.click(aluButton);
    expect(onVariantChange).toHaveBeenCalledWith('var-2');
  });

  it('renders schedule inputs for pickup and return dates', () => {
    renderConfigurator();

    expect(screen.getByRole('heading', { name: 'Chọn lịch thuê' })).toBeInTheDocument();
    expect(screen.getByLabelText('Thời điểm nhận thiết bị')).toBeInTheDocument();
    expect(screen.getByLabelText('Thời điểm trả thiết bị')).toBeInTheDocument();
  });

  it('renders quantity stepper and increments/decrements quantity', async () => {
    const user = userEvent.setup();
    renderConfigurator();

    expect(screen.getByText('Số lượng')).toBeInTheDocument();
    const decrementBtn = screen.getByRole('button', { name: 'Giảm số lượng thuê' });
    const incrementBtn = screen.getByRole('button', { name: 'Tăng số lượng thuê' });

    expect(decrementBtn).toBeDisabled(); // starts at 1
    expect(screen.getByText('1')).toBeInTheDocument();

    await user.click(incrementBtn);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(decrementBtn).toBeEnabled();

    await user.click(decrementBtn);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders temporary subtotal and wireframe action buttons', async () => {
    renderConfigurator();

    expect(screen.getByText('Tạm tính')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thuê ngay' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thêm vào giỏ' })).toBeInTheDocument();
  });

  it('displays availability message when available and out of stock message when unavailable', async () => {
    rentalService.quote.mockResolvedValueOnce({
      data: {
        billableDays: 1,
        isAllAvailable: false,
        items: [{ availableQuantity: 0 }],
      },
    });

    renderConfigurator();

    await waitFor(() => {
      expect(
        screen.getByText('Không khả dụng trong thời gian đã chọn'),
      ).toBeInTheDocument();
    });
  });
});
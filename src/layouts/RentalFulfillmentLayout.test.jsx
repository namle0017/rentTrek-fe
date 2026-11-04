import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RentalFulfillmentLayout from './RentalFulfillmentLayout';

function Step({ label }) {
  const { orderCode } = useParams();
  return (
    <h1>
      {label}: {orderCode || 'RT-202611-001'}
    </h1>
  );
}
function renderLayout(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<RentalFulfillmentLayout />}>
          <Route path="/ops/rentals/:orderCode/handover" element={<Step label="Giao" />} />
          <Route path="/ops/rentals/:orderCode/return" element={<Step label="Nhận" />} />
          <Route path="/ops/rentals/return" element={<Step label="Nhận" />} />
          <Route path="/ops/rentals/:orderCode/settlement" element={<Step label="Quyết toán" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}
describe('RentalFulfillmentLayout', () => {
  it('preserves the selected order when navigating between all three operations', async () => {
    const user = userEvent.setup();
    renderLayout('/ops/rentals/ORDER-42/handover');
    await user.click(screen.getByRole('link', { name: 'Nhận lại thiết bị' }));
    expect(screen.getByRole('heading', { name: 'Nhận: ORDER-42' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nhận lại thiết bị' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('link', { name: 'Quyết toán & Phí' }));
    expect(screen.getByRole('heading', { name: 'Quyết toán: ORDER-42' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Tìm đơn' })).toHaveLength(1);
  });
  it('looks up another order without leaving the current operation', async () => {
    const user = userEvent.setup();
    renderLayout('/ops/rentals/return');
    const input = screen.getByLabelText('Mã đơn thuê');
    await user.clear(input);
    await user.type(input, 'ORDER-67');
    await user.click(screen.getByRole('button', { name: 'Tìm đơn' }));
    expect(screen.getByRole('heading', { name: 'Nhận: ORDER-67' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Giao thiết bị' })).toHaveAttribute(
      'href',
      '/ops/rentals/ORDER-67/handover',
    );
    expect(screen.getByLabelText('Mã đơn thuê')).toHaveValue('ORDER-67');
  });
});

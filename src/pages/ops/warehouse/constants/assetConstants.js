export const ASSET_STATUS = Object.freeze({
  AVAILABLE: 'Available',
  MAINTENANCE: 'Maintenance',
  DAMAGED: 'Damaged',
  LOST: 'Lost',
  RETIRED: 'Retired',
});

export const ASSET_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: ASSET_STATUS.AVAILABLE, label: 'Sẵn sàng (Available)' },
  { value: ASSET_STATUS.MAINTENANCE, label: 'Bảo trì (Maintenance)' },
  { value: ASSET_STATUS.DAMAGED, label: 'Hư hỏng (Damaged)' },
  { value: ASSET_STATUS.LOST, label: 'Mất (Lost)' },
  { value: ASSET_STATUS.RETIRED, label: 'Thanh lý (Retired)' },
];

export const ASSET_STATUS_BADGE = {
  [ASSET_STATUS.AVAILABLE]: { label: 'Sẵn sàng', bg: '#DCFCE7', color: '#166534', border: '#86EFAC' },
  [ASSET_STATUS.MAINTENANCE]: { label: 'Bảo trì', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  [ASSET_STATUS.DAMAGED]: { label: 'Hư hỏng', bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
  [ASSET_STATUS.LOST]: { label: 'Mất đồ', bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' },
  [ASSET_STATUS.RETIRED]: { label: 'Thanh lý', bg: '#E5E7EB', color: '#4B5563', border: '#9CA3AF' },
};

export const SOURCE_TYPE_BADGE = {
  RentalOrder: { label: 'Đơn thuê', bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
  TripProvided: { label: 'Trip cung cấp', bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
  Promotion: { label: 'Khuyến mãi', bg: '#F3E8FF', color: '#6B21A8', border: '#D8B4FE' },
};

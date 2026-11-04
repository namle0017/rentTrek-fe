// Value = đúng string BE (contract 03.1 phụ lục A)
export const ASSIGNMENT_STATUS = Object.freeze({
  RESERVED: 'Reserved',
  ISSUED: 'Issued',
  RETURNED: 'Returned',
  LOST_OR_EXCEPTION: 'LostOrException',
});

export const ASSIGNMENT_STATUS_LABEL = {
  Reserved: 'Đã giữ',
  Issued: 'Đang ở khách',
  Returned: 'Đã trả',
  LostOrException: 'Mất / ngoại lệ',
  Cancelled: 'Đã hủy',
};

export const ASSET_STATUS_LABEL = {
  Available: 'Sẵn sàng',
  Good: 'Tốt',
  Maintenance: 'Bảo trì',
  Damaged: 'Hỏng',
  Lost: 'Mất',
  Retired: 'Ngừng dùng',
};

export const RETURN_CONDITION_OPTIONS = [
  { value: 'Normal', label: 'Bình thường' },
  { value: 'Damaged', label: 'Hư hỏng' },
  { value: 'MissingAccessory', label: 'Thiếu phụ kiện' },
  { value: 'Lost', label: 'Mất' },
];

export const RETURN_CONDITION_LABEL = Object.fromEntries(RETURN_CONDITION_OPTIONS.map((o) => [o.value, o.label]));

export const CHARGE_TYPE_OPTIONS = [
  { value: 'Damage', label: 'Hư hỏng' },
  { value: 'Loss', label: 'Mất thiết bị' },
  { value: 'LateReturn', label: 'Trả trễ' },
  { value: 'Other', label: 'Khác' },
];

export const CHARGE_TYPE_LABEL = Object.fromEntries(CHARGE_TYPE_OPTIONS.map((o) => [o.value, o.label]));

// Hỏng / mất bắt buộc chọn thiết bị (FR-C03)
export const CHARGE_TYPES_REQUIRE_ASSET = ['Damage', 'Loss'];

export const CHARGE_STATUS = Object.freeze({
  DRAFT: 'Draft',
  ASSESSED: 'Assessed',
  SETTLED: 'Settled',
  VOIDED: 'Voided',
});

export const CHARGE_STATUS_LABEL = {
  Draft: 'Đề xuất (chưa tính)',
  Assessed: 'Đã xác định',
  Settled: 'Đã quyết toán',
  Voided: 'Đã hủy',
};

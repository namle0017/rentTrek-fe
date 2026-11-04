import { options } from './opsOptions';

export const promotionFields = [
  { name: 'name', label: 'Tên chương trình', required: true, maxLength: 200 },
  { name: 'promotionCode', label: 'Mã khuyến mãi', maxLength: 50 },
  { name: 'description', label: 'Mô tả', type: 'textarea' },
  { name: 'startAt', label: 'Bắt đầu', type: 'datetime-local', required: true },
  { name: 'endAt', label: 'Kết thúc', type: 'datetime-local', required: true },
  { name: 'appliesTo', label: 'Áp dụng cho', type: 'select', options: options('Tour', 'Rental', 'All'), required: true },
  { name: 'applicationScope', label: 'Phạm vi', type: 'select', options: options('Order', 'Line'), required: true },
  { name: 'maxUses', label: 'Tổng lượt dùng tối đa', type: 'number', min: 1, step: 1 },
  { name: 'maxUsesPerUser', label: 'Lượt dùng mỗi khách', type: 'number', min: 1, step: 1 },
  { name: 'priority', label: 'Độ ưu tiên', type: 'number', min: 0, step: 1, defaultValue: 0, required: true },
  { name: 'isStackable', label: 'Cho phép cộng dồn ưu đãi', type: 'checkbox' },
];

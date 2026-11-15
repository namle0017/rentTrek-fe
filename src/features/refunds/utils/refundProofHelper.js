/**
 * Nhãn lý do huỷ / sự cố và đọc lại lý do huỷ cũ (có thể còn link ảnh trong dữ liệu trước đây).
 * Chứng từ chuyển khoản của admin dùng proofs[] + ProofGallery, không còn nhét vào mã giao dịch.
 */

export const CANCEL_CATEGORIES = {
  Medical: 'Sức khỏe / Y tế khẩn cấp',
  ForceMajeure: 'Thiên tai / Sạt lở / Mưa bão',
  PersonalEmergency: 'Việc cá nhân đột xuất',
  ScheduleChange: 'Thay đổi lịch trình',
  DefectiveEquipment: 'Thiết bị thuê bị lỗi / hư hại',
  Other: 'Lý do khác',
};

export const OVERRIDE_TYPES = {
  PolicyStandard: 'Theo chính sách bậc thang chuẩn',
  ForceMajeureException: 'Miễn trừ Thiên tai / Sạt lở / Bão lũ',
  ProviderDefect: 'Miễn trừ Lỗi thiết bị / Tổ chức từ RenTrek',
  MedicalEmergency: 'Miễn trừ Sự cố Y tế có xác nhận viện',
};

export const ISSUE_CATEGORIES = {
  Damaged: 'Hư hỏng / Rách / Gãy cọc',
  WrongVariant: 'Sai kích cỡ / Sai loại',
  MissingAccessory: 'Thiếu linh kiện / Phụ kiện',
  NotAsDescribed: 'Không đúng như mô tả',
};

/**
 * Đóng gói danh mục lý do, chi tiết và danh sách link ảnh thành chuỗi lưu vào Reason/CancelReason.
 */
export function packCancelReasonWithProofs(category = 'Other', detail = '', proofUrls = []) {
  const cleanCategory = category || 'Other';
  const cleanDetail = (detail || '').trim();
  const validUrls = Array.isArray(proofUrls)
    ? proofUrls.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean)
    : [];

  const parts = [];
  if (cleanCategory) {
    parts.push(`[Lý do: ${cleanCategory}]`);
  }
  if (cleanDetail) {
    parts.push(cleanDetail);
  }
  if (validUrls.length > 0) {
    parts.push(`[Minh chứng: ${validUrls.join(', ')}]`);
  }

  return parts.join(' ').trim();
}

/**
 * Phân tích chuỗi Reason/CancelReason lấy ra category, mô tả và danh sách ảnh minh chứng.
 */
export function parseCancelReasonWithProofs(rawReason) {
  if (!rawReason || typeof rawReason !== 'string') {
    return {
      category: 'Other',
      categoryLabel: CANCEL_CATEGORIES.Other,
      detail: '',
      proofUrls: [],
      hasProofs: false,
    };
  }

  const trimmed = rawReason.trim();

  // 1. Trích xuất Category: [Lý do: ...]
  let category = 'Other';
  let remainingText = trimmed;
  const categoryMatch = remainingText.match(/\[Lý do:\s*([^\]]+)\]/i);
  if (categoryMatch) {
    const rawCat = categoryMatch[1].trim();
    category = CANCEL_CATEGORIES[rawCat] ? rawCat : 'Other';
    remainingText = remainingText.replace(categoryMatch[0], '').trim();
  }

  // 2. Trích xuất Proof URLs: [Minh chứng: url1, url2]
  let proofUrls = [];
  const proofMatch = remainingText.match(/\[Minh chứng:\s*([^\]]+)\]/i);
  if (proofMatch) {
    const urlsString = proofMatch[1].trim();
    proofUrls = urlsString
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    remainingText = remainingText.replace(proofMatch[0], '').trim();
  }

  const categoryLabel = CANCEL_CATEGORIES[category] || category;

  return {
    category,
    categoryLabel,
    detail: remainingText,
    proofUrls,
    hasProofs: proofUrls.length > 0,
  };
}

/**
 * Helper đóng gói và phân tích minh chứng hoàn tiền hai chiều (User & Admin).
 * Đảm bảo tương thích ngược 100% với dữ liệu cũ.
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

/**
 * Đóng gói mã giao dịch ngân hàng và link ảnh biên lai chuyển tiền từ Admin.
 */
export function packAdminTransactionWithProof(transactionId, proofUrl) {
  const cleanTxId = (transactionId || '').trim();
  const cleanProof = (proofUrl || '').trim();
  if (!cleanProof) return cleanTxId;
  return `${cleanTxId}#proof=${cleanProof}`;
}

/**
 * Phân tích chuỗi ProviderTransactionId lấy ra mã giao dịch và link ảnh biên lai ngân hàng.
 */
export function parseAdminTransactionWithProof(rawTransaction) {
  if (!rawTransaction || typeof rawTransaction !== 'string') {
    return {
      transactionId: '',
      proofUrl: null,
      hasProof: false,
    };
  }

  const trimmed = rawTransaction.trim();
  if (trimmed.includes('#proof=')) {
    const [txId, proofUrl] = trimmed.split('#proof=');
    const validProof = (proofUrl || '').trim();
    return {
      transactionId: (txId || '').trim(),
      proofUrl: validProof || null,
      hasProof: Boolean(validProof),
    };
  }

  return {
    transactionId: trimmed,
    proofUrl: null,
    hasProof: false,
  };
}

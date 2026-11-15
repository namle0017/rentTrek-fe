export const PROOF_MAX_FILES = 3;
export const PROOF_MAX_BYTES = 5 * 1024 * 1024;
export const PROOF_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

/** Kiểm tra danh sách ảnh chứng từ trước khi gửi lên server. */
export function validateProofFiles(files, { required = true } = {}) {
  const list = Array.from(files ?? []);

  if (list.length === 0) {
    return required
      ? { isValid: false, error: 'Vui lòng đính kèm ít nhất 1 ảnh chứng từ' }
      : { isValid: true, error: null };
  }
  if (list.length > PROOF_MAX_FILES) {
    return { isValid: false, error: `Chỉ được đính kèm tối đa ${PROOF_MAX_FILES} ảnh chứng từ` };
  }
  const wrongType = list.find((file) => !PROOF_ACCEPT.includes(file.type));
  if (wrongType) {
    return { isValid: false, error: `Ảnh "${wrongType.name}" không hợp lệ. Chỉ hỗ trợ JPG, PNG hoặc WEBP` };
  }
  const tooLarge = list.find((file) => file.size > PROOF_MAX_BYTES);
  if (tooLarge) {
    return { isValid: false, error: `Ảnh "${tooLarge.name}" vượt quá dung lượng tối đa 5MB` };
  }
  return { isValid: true, error: null };
}

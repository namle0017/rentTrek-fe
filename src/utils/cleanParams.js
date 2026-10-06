/** Bỏ các param undefined / null / chuỗi rỗng trước khi gửi query string. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

/**
 * Gắn lỗi validation từ BE (ApiError.errors) vào form của React Hook Form.
 * Key trong `errors` của BE là camelCase → trùng tên field của form.
 */
export function applyServerErrors(error, setError) {
  if (!error?.errors) return;
  Object.entries(error.errors).forEach(([field, messages]) => {
    setError(field, { type: 'server', message: messages[0] });
  });
}

import { USER_ROLE } from '@/constants/enums';

/**
 * Chuẩn hóa giá trị vai trò (role) về enum chuẩn: Admin, Staff, Customer, TourGuide.
 * Xử lý mọi biến thể hoa/thường (admin, ADMIN, Administrator, staff, ...)
 */
export function normalizeRole(rawRole) {
  if (!rawRole || typeof rawRole !== 'string') return USER_ROLE.CUSTOMER;
  const lower = rawRole.trim().toLowerCase();
  if (lower === 'admin' || lower === 'administrator') return USER_ROLE.ADMIN;
  if (lower === 'staff' || lower === 'employee') return USER_ROLE.STAFF;
  if (lower === 'tourguide' || lower === 'tour_guide' || lower === 'guide') return USER_ROLE.TOUR_GUIDE;
  return USER_ROLE.CUSTOMER;
}

/**
 * Giải mã payload JWT token an toàn trong trình duyệt (hỗ trợ Unicode tiếng Việt)
 */
export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Trích xuất thông tin người dùng từ JWT token
 * Hỗ trợ cả chuẩn JWT claim chuẩn (sub, email, role, name) lẫn Microsoft claim schemas
 */
export function extractUserFromToken(token) {
  const payload = parseJwt(token);
  if (!payload) return null;

  const rawRole =
    payload.role ||
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    payload.Role ||
    payload.roles;

  const email =
    payload.email ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    payload.Email ||
    '';

  const fullName =
    payload.fullName ||
    payload.name ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    payload.unique_name ||
    email;

  const userId =
    payload.userId ||
    payload.sub ||
    payload.nameid ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    '';

  return {
    userId,
    email,
    fullName,
    role: normalizeRole(rawRole),
  };
}


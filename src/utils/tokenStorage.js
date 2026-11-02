import { extractUserFromToken, normalizeRole } from './jwt';

const ACCESS_TOKEN_KEY = 'rentrek_access_token';
const REFRESH_TOKEN_KEY = 'rentrek_refresh_token';
const USER_KEY = 'rentrek_user';

// Nơi DUY NHẤT được đọc / ghi token & user — không gọi localStorage rải rác trong code.
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  getUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Bỏ qua lỗi JSON
    }
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return token ? extractUserFromToken(token) : null;
  },

  setUser: (user) => {
    if (user) {
      const normalizedUser = {
        ...user,
        role: normalizeRole(user.role),
      };
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  setTokens: (data = {}) => {
    const accessToken =
      data.accessToken || data.token || data.jwt || data.access_token;
    const refreshToken = data.refreshToken || data.refresh_token;

    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    let resolvedUser = data.user;
    if (!resolvedUser && accessToken) {
      resolvedUser = extractUserFromToken(accessToken);
    }
    if (resolvedUser) {
      const normalizedUser = {
        ...resolvedUser,
        role: normalizeRole(resolvedUser.role),
      };
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    }
  },

  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

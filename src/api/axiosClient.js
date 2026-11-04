import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import { tokenStorage } from '@/utils/tokenStorage';
import { normalizeError } from './apiError';
import { API_ENDPOINTS } from './endpoints';

// KHÔNG set mặc định 'Content-Type: application/json' — axios tự set theo kiểu body,
// nếu set cứng thì axios sẽ chuyển FormData (upload file) thành JSON.
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  // Bỏ trang cảnh báo của ngrok free (nếu không, ngrok trả HTML thay vì JSON). BE thật bỏ qua header này.
  headers: { 'ngrok-skip-browser-warning': 'true' },
});

axiosClient.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers['Accept-Language'] = 'vi';
  return config;
});

// Nhiều request cùng bị 401 → chỉ gọi refresh 1 lần, các request khác chờ chung promise này
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('Missing refresh token');

  // Dùng axios gốc, không dùng axiosClient để tránh lặp vô hạn qua interceptor
  const { data: res } = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
    { refreshToken },
    { headers: { 'ngrok-skip-browser-warning': 'true' } },
  );
  tokenStorage.setTokens(res.data); // { accessToken, refreshToken } — theo API Contract
  return res.data.accessToken;
}

axiosClient.interceptors.response.use(
  (response) => response.data, // Trả thẳng body ApiResponse<T>
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isAuthRequest = originalRequest?.url?.startsWith('/auth/'); // login sai mật khẩu cũng trả 401
    const isUserMeRequest = originalRequest?.url?.includes(API_ENDPOINTS.USERS.ME);

    if (isUnauthorized && !isAuthRequest && !originalRequest._retry) {
      // Nếu endpoint lấy profile /users/me bị 401 (chưa kích hoạt auth ở BE),
      // không được xóa token và đá user về login. Để AuthProvider dùng session trong cache/JWT.
      if (isUserMeRequest) {
        return Promise.reject(normalizeError(error));
      }

      originalRequest._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch {
        tokenStorage.clear();
        window.location.replace(ROUTES.LOGIN);
      }
    }

    // Request tải file nhận lỗi dạng Blob, phải đọc lại JSON để lấy message của BE
    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        error.response.data = null;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

export default axiosClient;

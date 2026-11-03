import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';

// Refresh token do axiosClient tự xử lý, không gọi từ đây.
export const authService = {
  login: (payload) => axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, payload),
  register: (payload) => axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, payload),
  logout: (payload) => axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT, payload),
  forgotPassword: (payload) => axiosClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload),
  resetPassword: (payload) => axiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload),
  googleLogin: (payload) => axiosClient.post(API_ENDPOINTS.AUTH.GOOGLE, payload),
  verifyEmail: (token) => axiosClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),
  resendVerificationEmail: () => axiosClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION_EMAIL),
};

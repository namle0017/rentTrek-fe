import { API_BASE_URL } from '@/constants/config';

/** Ảnh lưu local trả đường dẫn tương đối (/uploads/...) của API; ảnh Supabase là URL đầy đủ. */
export function resolveMediaUrl(url) {
  if (!url || /^https?:\/\//i.test(url)) return url;
  try {
    return `${new URL(API_BASE_URL).origin}${url.startsWith('/') ? '' : '/'}${url}`;
  } catch {
    return url;
  }
}

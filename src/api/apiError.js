const DEFAULT_MESSAGES = {
  0: 'Không thể kết nối tới máy chủ, vui lòng kiểm tra mạng',
  401: 'Phiên đăng nhập đã hết hạn',
  403: 'Bạn không có quyền thực hiện thao tác này',
  404: 'Không tìm thấy dữ liệu',
  500: 'Hệ thống đang gặp sự cố, vui lòng thử lại sau',
};

export class ApiError extends Error {
  constructor({ statusCode, message, errors = null }) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/** Chuyển mọi lỗi của axios về 1 dạng ApiError { statusCode, message, errors }. */
export function normalizeError(error) {
  if (error instanceof ApiError) return error;

  if (error.response) {
    const { status, data } = error.response;
    return new ApiError({
      statusCode: data?.statusCode ?? status,
      message: data?.message || DEFAULT_MESSAGES[status] || DEFAULT_MESSAGES[500],
      errors: data?.errors ?? null,
    });
  }

  if (error.code === 'ECONNABORTED') {
    return new ApiError({ statusCode: 0, message: 'Yêu cầu quá thời gian, vui lòng thử lại' });
  }

  return new ApiError({ statusCode: 0, message: DEFAULT_MESSAGES[0] });
}

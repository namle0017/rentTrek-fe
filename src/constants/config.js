export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7000/api/v1';
export const REQUEST_TIMEOUT_MS = 15000;

// Khi Backend hoàn thiện API, đổi giá trị này thành false hoặc đặt VITE_USE_MOCK_FINANCE_API=false trong .env.local
export const USE_MOCK_FINANCE_API =
  import.meta.env.VITE_USE_MOCK_FINANCE_API !== undefined
    ? import.meta.env.VITE_USE_MOCK_FINANCE_API === 'true'
    : true;

export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const SEARCH_DEBOUNCE_MS = 400;

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';

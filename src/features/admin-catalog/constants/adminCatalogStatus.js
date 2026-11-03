export const TOUR_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
});

export const PRODUCT_STATUS = Object.freeze({
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DISCONTINUED: 'Discontinued',
});

export const TOUR_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: TOUR_STATUS.PUBLISHED, label: 'Đang mở' },
  { value: TOUR_STATUS.DRAFT, label: 'Nháp' },
  { value: TOUR_STATUS.ARCHIVED, label: 'Hết hạn' },
];

export const PRODUCT_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: PRODUCT_STATUS.ACTIVE, label: 'Đang cho thuê' },
  { value: PRODUCT_STATUS.INACTIVE, label: 'Ngừng cho thuê' },
  { value: PRODUCT_STATUS.DRAFT, label: 'Nháp' },
  { value: PRODUCT_STATUS.DISCONTINUED, label: 'Ngừng kinh doanh' },
];

export const ADMIN_CATALOG_STATUS = {
  Published: { label: 'Đang mở', tone: 'success' },
  Active: { label: 'Đang cho thuê', tone: 'success' },
  Draft: { label: 'Nháp', tone: 'warning' },
  Archived: { label: 'Hết hạn', tone: 'neutral' },
  Inactive: { label: 'Ngừng cho thuê', tone: 'neutral' },
  Discontinued: { label: 'Ngừng kinh doanh', tone: 'danger' },
  Expired: { label: 'Hết hạn', tone: 'neutral' },
};


// API chi tiết tour còn trả giá trị cũ Active / Expired
export function normalizeTourStatus(status) {
  if (status === 'Active') return TOUR_STATUS.PUBLISHED;
  if (status === 'Expired') return TOUR_STATUS.ARCHIVED;
  return status;
}

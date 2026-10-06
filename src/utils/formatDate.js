import dayjs from 'dayjs';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@/constants/config';

/** BE trả ISO UTC → hiển thị theo giờ local của trình duyệt. */
export function formatDate(value, format = DATE_FORMAT) {
  if (!value) return '';
  return dayjs(value).format(format);
}

export function formatDateTime(value) {
  return formatDate(value, DATE_TIME_FORMAT);
}

/** Giá trị từ input → ISO UTC để gửi lên BE. */
export function toIsoString(value) {
  if (!value) return null;
  return dayjs(value).toISOString();
}

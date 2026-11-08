import { vietnamDateTime } from '../utils/rentalCheckout';
import styles from '../pages/RentalCustomer.module.css';

export default function RentalPeriodFields({ period, onChange, disabled = false }) {
  return (
    <fieldset className={styles.period} disabled={disabled}>
      <legend>Thời gian thuê · giờ Việt Nam</legend>
      <label>
        Nhận thiết bị
        <input
          aria-label="Thời điểm nhận thiết bị"
          type="datetime-local"
          value={period.start}
          min={vietnamDateTime()}
          onChange={(event) => onChange({ ...period, start: event.target.value })}
          required
        />
      </label>
      <label>
        Trả thiết bị
        <input
          aria-label="Thời điểm trả thiết bị"
          type="datetime-local"
          value={period.end}
          min={period.start}
          onChange={(event) => onChange({ ...period, end: event.target.value })}
          required
        />
      </label>
      <small>
        Áp dụng cho toàn bộ giỏ. Một ngày tính theo mỗi 24 giờ, phần lẻ làm tròn lên; tối đa 60 ngày.
      </small>
    </fieldset>
  );
}

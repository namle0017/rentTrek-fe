import OutdoorIcon from '@/components/OutdoorIcon';
import { vietnamDateTime } from '../utils/rentalCheckout';
import styles from '../pages/RentalCustomer.module.css';

export default function RentalPeriodFields({ period, onChange, disabled = false }) {
  return (
    <div className={styles.scheduleFields} aria-label="Thời gian thuê">
      <div className={styles.dateField}>
        <label htmlFor="rental-start-date" className={styles.dateLabel}>
          Ngày nhận thiết bị
        </label>
        <div className={styles.dateInputWrapper}>
          <OutdoorIcon name="calendar" size={17} className={styles.calendarIcon} />
          <input
            id="rental-start-date"
            aria-label="Thời điểm nhận thiết bị"
            type="datetime-local"
            value={period.start}
            min={vietnamDateTime()}
            onChange={(event) => onChange({ ...period, start: event.target.value })}
            required
            disabled={disabled}
            className={styles.dateInputField}
          />
        </div>
      </div>

      <div className={styles.dateField}>
        <label htmlFor="rental-end-date" className={styles.dateLabel}>
          Ngày trả thiết bị
        </label>
        <div className={styles.dateInputWrapper}>
          <OutdoorIcon name="calendar" size={17} className={styles.calendarIcon} />
          <input
            id="rental-end-date"
            aria-label="Thời điểm trả thiết bị"
            type="datetime-local"
            value={period.end}
            min={period.start}
            onChange={(event) => onChange({ ...period, end: event.target.value })}
            required
            disabled={disabled}
            className={styles.dateInputField}
          />
        </div>
      </div>
    </div>
  );
}

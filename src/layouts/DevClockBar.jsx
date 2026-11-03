import { useState } from 'react';
import dayjs from 'dayjs';
import { useDevClockControls } from '@/hooks/useDevClock';
import { formatDateTime } from '@/utils/formatDate';
import styles from './DevClockBar.module.css';

/**
 * Thanh đồng hồ giả lập (chỉ hiện khi BE chạy Development).
 * Khách chỉ thấy cảnh báo khi đang giả lập; Admin/Staff chỉnh được giờ.
 */
export default function DevClockBar() {
  const { clock, isAvailable, canControl, isPending, jumpTo, reset } = useDevClockControls();
  const [value, setValue] = useState('');

  if (!isAvailable || (!clock.isSimulated && !canControl)) return null;

  const shiftHours = (hours) => jumpTo(dayjs(clock.now).add(hours, 'hour').toISOString());

  const handleSubmit = (event) => {
    event.preventDefault();
    if (value) jumpTo(dayjs(value).toISOString());
  };

  return (
    <div className={clock.isSimulated ? `${styles.bar} ${styles.active}` : styles.bar} role="status">
      <span className={styles.label}>
        <span aria-hidden="true">⏱ </span>
        {clock.isSimulated ? (
          <>
            <strong>Đang giả lập thời gian:</strong> {formatDateTime(clock.now)}
            <span className={styles.real}> · giờ thật {formatDateTime(clock.realNow)}</span>
          </>
        ) : (
          'Đồng hồ giả lập (Development) — đang dùng giờ thật'
        )}
      </span>

      {canControl && (
        <form className={styles.controls} onSubmit={handleSubmit}>
          <input
            type="datetime-local"
            aria-label="Chọn thời điểm giả lập"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button type="submit" disabled={!value || isPending}>
            Đặt giờ
          </button>
          <button type="button" disabled={isPending} onClick={() => shiftHours(1)}>
            +1 giờ
          </button>
          <button type="button" disabled={isPending} onClick={() => shiftHours(24)}>
            +1 ngày
          </button>
          {clock.isSimulated && (
            <button type="button" disabled={isPending} onClick={reset}>
              Về giờ thật
            </button>
          )}
        </form>
      )}
    </div>
  );
}

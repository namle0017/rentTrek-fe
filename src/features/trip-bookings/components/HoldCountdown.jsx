import { useEffect, useRef, useState } from 'react';
import { getHoldSeconds, splitHoldSeconds } from '../utils/bookingStatus';

const pad = (value) => String(value).padStart(2, '0');

export default function HoldCountdown({ expiresAt, onExpire }) {
  const [now, setNow] = useState(() => Date.now());
  const notifiedExpiry = useRef(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const remaining = getHoldSeconds(expiresAt, now);

  useEffect(() => {
    if (remaining === 0 && notifiedExpiry.current !== expiresAt) {
      notifiedExpiry.current = expiresAt;
      onExpire?.();
    }
  }, [expiresAt, onExpire, remaining]);

  const time = splitHoldSeconds(remaining);

  return (
    <div aria-live="polite">
      {remaining > 0
        ? `Giữ chỗ còn ${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`
        : 'Thời gian giữ chỗ đã hết'}
    </div>
  );
}

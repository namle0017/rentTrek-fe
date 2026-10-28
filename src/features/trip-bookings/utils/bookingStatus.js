import { BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/enums';

export function getHoldSeconds(expiresAt, now = Date.now()) {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000));
}

export function splitHoldSeconds(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  return {
    hours: Math.floor(safeSeconds / 3600),
    minutes: Math.floor((safeSeconds % 3600) / 60),
    seconds: safeSeconds % 60,
  };
}

export function canGenerateInvitations(booking) {
  return Boolean(
    booking?.canManage &&
      booking.status === BOOKING_STATUS.CONFIRMED &&
      booking.paymentStatus === PAYMENT_STATUS.PAID,
  );
}

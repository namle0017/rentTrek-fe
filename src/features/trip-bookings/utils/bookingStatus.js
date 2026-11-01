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

/** Link xem chuyến: đơn đã thanh toán đủ và chuyến chưa kết thúc (vẫn lấy được khi đang diễn ra). */
export function canShareTripLink(booking, now = Date.now()) {
  return Boolean(
    booking?.canManage &&
      booking.status === BOOKING_STATUS.CONFIRMED &&
      booking.paymentStatus === PAYMENT_STATUS.PAID &&
      now < new Date(booking.tripEndAt).getTime(),
  );
}

const CLOSED_STATUSES = [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.EXPIRED, BOOKING_STATUS.COMPLETED];

/** Buyer còn sửa người đi được: đơn chưa đóng và chuyến chưa khởi hành. */
export function canEditParticipants(booking, now = Date.now()) {
  return Boolean(
    booking?.canManage &&
      !CLOSED_STATUSES.includes(booking.status) &&
      now < new Date(booking.tripStartAt).getTime(),
  );
}

/** Như sửa người đi, nhưng đơn đang đối soát thì chưa cho hủy (Staff phải xử lý khoản tiền trước). */
export function canCancelBooking(booking, now = Date.now()) {
  return canEditParticipants(booking, now) && booking.paymentStatus !== PAYMENT_STATUS.NEEDS_RECONCILIATION;
}

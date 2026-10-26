const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class BookingValidationError extends Error {
  constructor(errors) {
    super('Dữ liệu đặt tour chưa hợp lệ.');
    this.name = 'BookingValidationError';
    this.errors = errors;
  }
}

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

const optional = (value) => {
  const normalized = clean(value);
  return normalized || undefined;
};

const isValidIsoDate = (value) => {
  if (!ISO_DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const addOptional = (target, key, value) => {
  if (value) target[key] = value;
};

export function normalizeBookingPayload(values, buyerEmail) {
  const errors = {};
  const tripId = clean(values?.tripId);
  const note = optional(values?.note);
  const participants = Array.isArray(values?.additionalParticipants)
    ? values.additionalParticipants
    : [];

  if (!tripId) errors.tripId = 'Vui lòng chọn chuyến đi.';
  if (note && note.length > 1000) errors.note = 'Ghi chú tối đa 1000 ký tự.';
  if (participants.length > 20) {
    errors.additionalParticipants = 'Tối đa 20 người đi cùng.';
  }

  const buyerEmailNormalized = clean(buyerEmail).toLowerCase();
  const seenEmails = new Set();

  const additionalParticipants = participants.map((participant, index) => {
    const prefix = `additionalParticipants.${index}`;
    const fullName = clean(participant?.fullName);
    const email = clean(participant?.email).toLowerCase();
    const phone = optional(participant?.phone);
    const dateOfBirth = optional(participant?.dateOfBirth);
    const emergencyContactName = optional(participant?.emergencyContactName);
    const emergencyContactPhone = optional(participant?.emergencyContactPhone);

    if (!fullName) errors[`${prefix}.fullName`] = 'Vui lòng nhập họ tên.';
    else if (fullName.length > 200) {
      errors[`${prefix}.fullName`] = 'Họ tên tối đa 200 ký tự.';
    }

    if (!email) errors[`${prefix}.email`] = 'Vui lòng nhập email.';
    else if (email.length > 255 || !EMAIL_PATTERN.test(email)) {
      errors[`${prefix}.email`] = 'Email không hợp lệ.';
    } else if (buyerEmailNormalized && email === buyerEmailNormalized) {
      errors[`${prefix}.email`] = 'Email người đi cùng không được trùng email người đặt.';
    } else if (seenEmails.has(email)) {
      errors[`${prefix}.email`] = 'Email người đi cùng không được trùng nhau.';
    }
    seenEmails.add(email);

    if (phone && phone.length > 20) errors[`${prefix}.phone`] = 'Số điện thoại tối đa 20 ký tự.';
    if (dateOfBirth && !isValidIsoDate(dateOfBirth)) {
      errors[`${prefix}.dateOfBirth`] = 'Ngày sinh không hợp lệ.';
    }
    if (emergencyContactName && emergencyContactName.length > 200) {
      errors[`${prefix}.emergencyContactName`] = 'Tên liên hệ tối đa 200 ký tự.';
    }
    if (emergencyContactPhone && emergencyContactPhone.length > 20) {
      errors[`${prefix}.emergencyContactPhone`] = 'Số liên hệ tối đa 20 ký tự.';
    }

    const normalized = { fullName, email };
    addOptional(normalized, 'phone', phone);
    addOptional(normalized, 'dateOfBirth', dateOfBirth);
    addOptional(normalized, 'emergencyContactName', emergencyContactName);
    addOptional(normalized, 'emergencyContactPhone', emergencyContactPhone);
    return normalized;
  });

  if (Object.keys(errors).length) throw new BookingValidationError(errors);

  return {
    tripId,
    ...(note ? { note } : {}),
    additionalParticipants,
  };
}

export function resolveBookingSubmission(previousSubmission, payload) {
  const payloadSnapshot = JSON.stringify(payload);

  if (previousSubmission?.payloadSnapshot === payloadSnapshot) return previousSubmission;

  return {
    idempotencyKey: globalThis.crypto.randomUUID(),
    payloadSnapshot,
  };
}

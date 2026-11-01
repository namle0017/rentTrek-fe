export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const definedOnly = (object) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

export function normalizeBookingPayload(values, buyerEmail) {
  const errors = {};
  const tripId = clean(values?.tripId);
  const contactPhone = clean(values?.contactPhone);
  const buyerParticipates = values?.buyerParticipates !== false;
  const note = optional(values?.note);
  const participants = Array.isArray(values?.additionalParticipants)
    ? values.additionalParticipants
    : [];

  if (!tripId) errors.tripId = 'Vui lòng chọn chuyến đi.';
  if (!contactPhone) errors.contactPhone = 'Vui lòng nhập số điện thoại liên hệ.';
  else if (contactPhone.length > 20) errors.contactPhone = 'Số điện thoại tối đa 20 ký tự.';
  if (note && note.length > 1000) errors.note = 'Ghi chú tối đa 1000 ký tự.';
  if (participants.length > 20) {
    errors.additionalParticipants = 'Tối đa 20 người đi cùng.';
  }
  if (!buyerParticipates && participants.length === 0) {
    errors.additionalParticipants = 'Đặt giùm cần ít nhất 1 người đi.';
  }

  // Đặt giùm: người đi được dùng trùng email người đặt
  const buyerEmailNormalized = buyerParticipates ? clean(buyerEmail).toLowerCase() : '';
  const seenEmails = new Set();

  const additionalParticipants = participants.map((participant, index) => {
    const prefix = `additionalParticipants.${index}`;
    const fullName = clean(participant?.fullName);
    const email = clean(participant?.email).toLowerCase();

    if (!fullName) errors[`${prefix}.fullName`] = 'Vui lòng nhập họ tên.';
    else if (fullName.length > 200) {
      errors[`${prefix}.fullName`] = 'Họ tên tối đa 200 ký tự.';
    }

    if (email) {
      if (email.length > 255 || !EMAIL_PATTERN.test(email)) {
        errors[`${prefix}.email`] = 'Email không hợp lệ.';
      } else if (email === buyerEmailNormalized) {
        errors[`${prefix}.email`] = 'Email người đi cùng không được trùng email người đặt.';
      } else if (seenEmails.has(email)) {
        errors[`${prefix}.email`] = 'Email người đi cùng không được trùng nhau.';
      }
      seenEmails.add(email);
    }

    return definedOnly({
      fullName,
      email: email || undefined,
      phone: optional(participant?.phone),
      dateOfBirth: optional(participant?.dateOfBirth),
      emergencyContactName: optional(participant?.emergencyContactName),
      emergencyContactPhone: optional(participant?.emergencyContactPhone),
    });
  });

  if (Object.keys(errors).length) throw new BookingValidationError(errors);

  return {
    tripId,
    contactPhone,
    buyerParticipates,
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

import { describe, expect, it } from 'vitest';
import {
  BookingValidationError,
  normalizeBookingPayload,
  resolveBookingSubmission,
} from './bookingSubmission';

const validParticipant = {
  fullName: '  Nguyễn An  ',
  email: '  AN@example.com  ',
  phone: '  0901234567  ',
  dateOfBirth: '',
  emergencyContactName: '  ',
  emergencyContactPhone: undefined,
};

describe('normalizeBookingPayload', () => {
  it('normalizes fields and omits empty optional values', () => {
    expect(
      normalizeBookingPayload(
        {
          tripId: ' trip-1 ',
          note: '  Ăn chay  ',
          ignoredField: 'must not reach API',
          additionalParticipants: [validParticipant],
        },
        'buyer@example.com',
      ),
    ).toEqual({
      tripId: 'trip-1',
      note: 'Ăn chay',
      additionalParticipants: [
        {
          fullName: 'Nguyễn An',
          email: 'an@example.com',
          phone: '0901234567',
        },
      ],
    });
  });

  it('rejects more than 20 additional participants', () => {
    const additionalParticipants = Array.from({ length: 21 }, (_, index) => ({
      fullName: `Khách ${index + 1}`,
      email: `guest${index + 1}@example.com`,
    }));

    expect(() =>
      normalizeBookingPayload({ tripId: 'trip-1', additionalParticipants }, 'buyer@example.com'),
    ).toThrowError(BookingValidationError);

    try {
      normalizeBookingPayload({ tripId: 'trip-1', additionalParticipants }, 'buyer@example.com');
    } catch (error) {
      expect(error.errors.additionalParticipants).toBeTruthy();
    }
  });

  it('rejects duplicate participant emails and buyer email', () => {
    const additionalParticipants = [
      { fullName: 'Khách một', email: 'DUPLICATE@example.com' },
      { fullName: 'Khách hai', email: ' duplicate@example.com ' },
      { fullName: 'Chủ đơn', email: 'BUYER@example.com' },
    ];

    try {
      normalizeBookingPayload({ tripId: 'trip-1', additionalParticipants }, 'buyer@example.com');
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(BookingValidationError);
      expect(error.errors['additionalParticipants.1.email']).toBeTruthy();
      expect(error.errors['additionalParticipants.2.email']).toBeTruthy();
    }
  });

  it('validates required and maximum-length fields', () => {
    try {
      normalizeBookingPayload(
        {
          tripId: '',
          note: 'x'.repeat(1001),
          additionalParticipants: [
            {
              fullName: '',
              email: 'invalid',
              phone: '1'.repeat(21),
              dateOfBirth: '26/10/2026',
            },
          ],
        },
        'buyer@example.com',
      );
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(BookingValidationError);
      expect(error.errors.tripId).toBeTruthy();
      expect(error.errors.note).toBeTruthy();
      expect(error.errors['additionalParticipants.0.fullName']).toBeTruthy();
      expect(error.errors['additionalParticipants.0.email']).toBeTruthy();
      expect(error.errors['additionalParticipants.0.phone']).toBeTruthy();
      expect(error.errors['additionalParticipants.0.dateOfBirth']).toBeTruthy();
    }
  });
});

describe('resolveBookingSubmission', () => {
  it('reuses the idempotency key for an unchanged normalized payload', () => {
    const payload = { tripId: 'trip-1', additionalParticipants: [] };
    const first = resolveBookingSubmission(undefined, payload);
    const retry = resolveBookingSubmission(first, { ...payload });

    expect(first.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/i);
    expect(retry).toBe(first);
  });

  it('creates a fresh key when the payload changes', () => {
    const first = resolveBookingSubmission(undefined, {
      tripId: 'trip-1',
      additionalParticipants: [],
    });
    const changed = resolveBookingSubmission(first, {
      tripId: 'trip-2',
      additionalParticipants: [],
    });

    expect(changed.idempotencyKey).not.toBe(first.idempotencyKey);
    expect(changed.idempotencyKey.length).toBeLessThanOrEqual(100);
  });
});

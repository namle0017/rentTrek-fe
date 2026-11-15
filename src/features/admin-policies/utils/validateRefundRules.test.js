import { describe, expect, it } from 'vitest';
import { hasZeroHourRule, validateRefundRules } from './validateRefundRules';

const rule = (minHoursBefore, refundPercentage) => ({ minHoursBefore, refundPercentage });
const validRules = () => [rule(168, 100), rule(72, 80), rule(24, 50), rule(0, 0)];
const keys = (result) => Object.keys(result.fieldErrors ?? {});
const hasKey = (result, field) => keys(result).some((key) => key.endsWith(`.${field}`));

describe('validateRefundRules', () => {
  it('accepts a valid step table', () => {
    const result = validateRefundRules(validRules());
    expect(result.isValid).toBe(true);
    expect(keys(result)).toHaveLength(0);
    expect(result.rootError ?? null).toBeNull();
  });

  it('accepts numeric strings coming from form inputs', () => {
    expect(validateRefundRules([rule('72', '100'), rule('0', '0')]).isValid).toBe(true);
  });

  it('accepts equal percentages and unordered input', () => {
    expect(validateRefundRules([rule(24, 50), rule(72, 50)]).isValid).toBe(true);
    expect(validateRefundRules([rule(0, 0), rule(168, 100), rule(24, 50)]).isValid).toBe(true);
  });

  it('rejects an empty list with a root error', () => {
    const result = validateRefundRules([]);
    expect(result.isValid).toBe(false);
    expect(result.rootError).toBeTruthy();
  });

  it('allows 20 rules and rejects 21', () => {
    const make = (n) => Array.from({ length: n }, (_, i) => rule((n - i) * 10, 100 - i));
    expect(validateRefundRules(make(20)).isValid).toBe(true);
    const tooMany = validateRefundRules(make(21));
    expect(tooMany.isValid).toBe(false);
    expect(tooMany.rootError).toBeTruthy();
  });

  it('flags duplicated hours on a minHoursBefore field', () => {
    const result = validateRefundRules([rule(24, 50), rule(24, 40)]);
    expect(result.isValid).toBe(false);
    expect(hasKey(result, 'minHoursBefore')).toBe(true);
  });

  it.each([[-1], [8761], [1.5], ['abc'], ['']])('rejects invalid hours %s', (hours) => {
    const result = validateRefundRules([rule(hours, 50)]);
    expect(result.isValid).toBe(false);
    expect(result.fieldErrors['rules.0.minHoursBefore']).toBeTruthy();
  });

  it.each([[0], [8760]])('accepts boundary hours %s', (hours) => {
    expect(validateRefundRules([rule(hours, 50)]).isValid).toBe(true);
  });

  it.each([[-1], [100.01], [101], ['abc'], ['']])('rejects invalid percentage %s', (percent) => {
    const result = validateRefundRules([rule(24, percent)]);
    expect(result.isValid).toBe(false);
    expect(result.fieldErrors['rules.0.refundPercentage']).toBeTruthy();
  });

  it.each([[0], [100], [33.5]])('accepts percentage %s', (percent) => {
    expect(validateRefundRules([rule(24, percent)]).isValid).toBe(true);
  });

  it('rejects percentage that increases as the departure gets closer', () => {
    const result = validateRefundRules([rule(168, 50), rule(72, 80)]);
    expect(result.isValid).toBe(false);
    expect(hasKey(result, 'refundPercentage')).toBe(true);
  });

  it('reports errors per row index', () => {
    const result = validateRefundRules([rule(168, 100), rule(72, 150)]);
    expect(result.fieldErrors['rules.1.refundPercentage']).toBeTruthy();
    expect(result.fieldErrors['rules.0.refundPercentage']).toBeUndefined();
  });
});

describe('hasZeroHourRule', () => {
  it('detects a 0-hour rule', () => {
    expect(hasZeroHourRule(validRules())).toBe(true);
    expect(hasZeroHourRule([rule('0', '0')])).toBe(true);
  });

  it('returns false without a 0-hour rule', () => {
    expect(hasZeroHourRule([rule(24, 50), rule(72, 80)])).toBe(false);
    expect(hasZeroHourRule([])).toBe(false);
  });
});

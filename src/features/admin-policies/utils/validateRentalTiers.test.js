import { describe, expect, it } from 'vitest';
import { validateRentalTiers } from './validateRentalTiers';

const tier = (scope, minDaysLate, percentOfDeposit, isTerminal = false) => ({ scope, minDaysLate, percentOfDeposit, isTerminal });
const pickup = () => [tier('PickupLate', 1, 5), tier('PickupLate', 3, 100, true)];
const returned = () => [tier('ReturnLate', 2, 10), tier('ReturnLate', 5, 100, true)];

describe('validateRentalTiers', () => {
  it('accepts valid tiers for both scopes', () => {
    const result = validateRentalTiers([...pickup(), ...returned()]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('requires at least one tier per scope', () => {
    const result = validateRentalTiers(pickup());
    expect(result.isValid).toBe(false);
    expect(result.errors.ReturnLate).toBeTruthy();
    expect(result.errors.PickupLate).toBeUndefined();
    expect(validateRentalTiers([]).errors.PickupLate).toBeTruthy();
  });

  it.each([[0], [-1], [1.5]])('rejects days late = %s', (days) => {
    const result = validateRentalTiers([...pickup(), tier('ReturnLate', days, 100, true)]);
    expect(result.isValid).toBe(false);
    expect(result.errors.ReturnLate).toBeTruthy();
  });

  it('rejects duplicated days late', () => {
    const result = validateRentalTiers([tier('PickupLate', 2, 5), tier('PickupLate', 2, 100, true), ...returned()]);
    expect(result.errors.PickupLate).toBeTruthy();
  });

  it.each([[-1], [101]])('rejects percent %s', (percent) => {
    const result = validateRentalTiers([...pickup(), tier('ReturnLate', 1, 5), tier('ReturnLate', 3, percent, true)]);
    expect(result.errors.ReturnLate).toBeTruthy();
  });

  it('rejects percent that decreases as days late increase', () => {
    const result = validateRentalTiers([tier('PickupLate', 1, 50), tier('PickupLate', 3, 20, true), ...returned()]);
    expect(result.errors.PickupLate).toBeTruthy();
    expect(result.errors.ReturnLate).toBeUndefined();
  });

  it('requires exactly one terminal tier', () => {
    const none = validateRentalTiers([tier('PickupLate', 1, 5), tier('PickupLate', 3, 100), ...returned()]);
    const two = validateRentalTiers([tier('PickupLate', 1, 100, true), tier('PickupLate', 3, 100, true), ...returned()]);
    expect(none.errors.PickupLate).toBeTruthy();
    expect(two.errors.PickupLate).toBeTruthy();
  });

  it('requires the terminal tier to be the last one', () => {
    const result = validateRentalTiers([tier('PickupLate', 1, 100, true), tier('PickupLate', 3, 100), ...returned()]);
    expect(result.isValid).toBe(false);
    expect(result.errors.PickupLate).toBeTruthy();
  });

  it('sorts by days late before checking the order', () => {
    const result = validateRentalTiers([tier('PickupLate', 3, 100, true), tier('PickupLate', 1, 5), ...returned()]);
    expect(result.isValid).toBe(true);
  });

  it('reports errors for both scopes independently', () => {
    const result = validateRentalTiers([tier('PickupLate', 1, 5), tier('ReturnLate', 1, 5)]);
    expect(result.errors.PickupLate).toBeTruthy();
    expect(result.errors.ReturnLate).toBeTruthy();
  });
});

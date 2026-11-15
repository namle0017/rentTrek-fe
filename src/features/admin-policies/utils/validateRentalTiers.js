const SCOPES = ['PickupLate', 'ReturnLate'];

/**
 * Mô phỏng RentalPolicyService.Validate của BE cho các bậc phạt.
 * @param {Array<{scope: string, minDaysLate: number|string, percentOfDeposit: number|string, isTerminal: boolean}>} tiers
 * @returns {{ isValid: boolean, errors: { PickupLate?: string, ReturnLate?: string } }}
 */
export function validateRentalTiers(tiers) {
  const list = Array.isArray(tiers) ? tiers : [];
  const errors = {};

  SCOPES.forEach((scope) => {
    const scoped = list
      .filter((tier) => tier.scope === scope)
      .map((tier) => ({
        days: tier.minDaysLate === '' || tier.minDaysLate === null || tier.minDaysLate === undefined ? NaN : Number(tier.minDaysLate),
        pct: tier.percentOfDeposit === '' || tier.percentOfDeposit === null || tier.percentOfDeposit === undefined ? NaN : Number(tier.percentOfDeposit),
        isTerminal: Boolean(tier.isTerminal),
      }))
      .sort((a, b) => a.days - b.days);

    if (scoped.length === 0) {
      errors[scope] = 'Cần ít nhất một bậc phạt';
      return;
    }
    const distinctDays = new Set(scoped.map((t) => t.days));
    if (distinctDays.size !== scoped.length || scoped.some((t) => !Number.isInteger(t.days) || t.days <= 0)) {
      errors[scope] = 'Số ngày trễ của các bậc phải là số nguyên lớn hơn 0 và không trùng nhau';
    } else if (scoped.some((t) => !Number.isFinite(t.pct) || t.pct < 0 || t.pct > 100)) {
      errors[scope] = '% cọc của bậc phải từ 0 đến 100';
    } else if (scoped.some((t, i) => i > 0 && t.pct < scoped[i - 1].pct)) {
      errors[scope] = 'Bậc sau không được thấp hơn bậc trước';
    } else if (scoped.filter((t) => t.isTerminal).length !== 1 || !scoped[scoped.length - 1].isTerminal) {
      errors[scope] = 'Phải có đúng một bậc mất cọc và là bậc cuối';
    }
  });

  return { isValid: Object.keys(errors).length === 0, errors };
}

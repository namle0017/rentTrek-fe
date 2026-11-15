export const PICKUP_SCOPE = 'PickupLate';
export const RETURN_SCOPE = 'ReturnLate';

const DEFAULT_PICKUP = [
  { minDaysLate: 1, percentOfDeposit: 20, isTerminal: false },
  { minDaysLate: 3, percentOfDeposit: 100, isTerminal: true },
];
const DEFAULT_RETURN = [
  { minDaysLate: 1, percentOfDeposit: 30, isTerminal: false },
  { minDaysLate: 7, percentOfDeposit: 100, isTerminal: true },
];

const tiersOf = (policy, scope) =>
  (policy?.tiers ?? [])
    .filter((tier) => tier.scope === scope)
    .sort((a, b) => a.minDaysLate - b.minDaysLate)
    .map((tier) => ({
      minDaysLate: tier.minDaysLate,
      percentOfDeposit: tier.percentOfDeposit,
      isTerminal: Boolean(tier.isTerminal),
    }));

/** Response chính sách thuê → giá trị mặc định của form tạo version mới. */
export function toRentalFormValues(policy) {
  return {
    name: policy?.name ?? '',
    depositPercent: policy?.depositPercent ?? 30,
    freeCancelLimit: policy?.freeCancelLimit ?? 2,
    freeCancelWindowDays: policy?.freeCancelWindowDays ?? 30,
    overLimitCancelFeePercent: policy?.overLimitCancelFeePercent ?? 10,
    returnGraceHours: policy?.returnGraceHours ?? 2,
    extensionMaxDaysLate: policy?.extensionMaxDaysLate ?? 3,
    suspectedLossAfterDays: policy?.suspectedLossAfterDays ?? 7,
    receiptAutoConfirmHours: policy?.receiptAutoConfirmHours ?? 48,
    minPhotosPerAsset: policy?.minPhotosPerAsset ?? 2,
    pickupTiers: tiersOf(policy, PICKUP_SCOPE).length ? tiersOf(policy, PICKUP_SCOPE) : DEFAULT_PICKUP,
    returnTiers: tiersOf(policy, RETURN_SCOPE).length ? tiersOf(policy, RETURN_SCOPE) : DEFAULT_RETURN,
  };
}

/** Gộp hai danh sách bậc phạt theo scope thành mảng phẳng như BE yêu cầu. */
export function flattenTiers(values) {
  const map = (scope) => (tier) => ({
    scope,
    minDaysLate: tier.minDaysLate,
    percentOfDeposit: tier.percentOfDeposit,
    isTerminal: Boolean(tier.isTerminal),
  });
  return [...(values.pickupTiers ?? []).map(map(PICKUP_SCOPE)), ...(values.returnTiers ?? []).map(map(RETURN_SCOPE))];
}

export function toRentalPayload(values, sourcePolicyId) {
  const payload = {
    name: values.name.trim(),
    depositPercent: Number(values.depositPercent),
    freeCancelLimit: Number(values.freeCancelLimit),
    freeCancelWindowDays: Number(values.freeCancelWindowDays),
    overLimitCancelFeePercent: Number(values.overLimitCancelFeePercent),
    returnGraceHours: Number(values.returnGraceHours),
    extensionMaxDaysLate: Number(values.extensionMaxDaysLate),
    suspectedLossAfterDays: Number(values.suspectedLossAfterDays),
    receiptAutoConfirmHours: Number(values.receiptAutoConfirmHours),
    minPhotosPerAsset: Number(values.minPhotosPerAsset),
    tiers: flattenTiers(values).map((tier) => ({
      ...tier,
      minDaysLate: Number(tier.minDaysLate),
      percentOfDeposit: Number(tier.percentOfDeposit),
    })),
  };
  if (sourcePolicyId) payload.sourcePolicyId = sourcePolicyId;
  return payload;
}

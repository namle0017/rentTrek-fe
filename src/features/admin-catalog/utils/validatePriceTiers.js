export function validatePriceTiers(rows) {
  if (!rows.length || rows.length > 20) throw new Error('Cần từ 1 đến 20 bậc giá.');
  const tiers = rows.map((row) => ({
    minDays: Number(row.minDays),
    maxDays:
      row.maxDays === '' || row.maxDays === null || row.maxDays === undefined ? null : Number(row.maxDays),
    dailyPrice: Number(row.dailyPrice),
  }));
  let nextDay = 1;
  tiers.forEach((tier, index) => {
    if (!Number.isInteger(tier.minDays) || tier.minDays !== nextDay || tier.minDays < 1)
      throw new Error('Các bậc giá phải bắt đầu từ ngày 1 và liên tục, không chồng lấn.');
    if (
      tier.maxDays === null
        ? index !== tiers.length - 1
        : !Number.isInteger(tier.maxDays) || tier.maxDays < tier.minDays
    )
      throw new Error('Chỉ bậc cuối được để trống ngày tối đa; ngày tối đa phải từ ngày tối thiểu trở lên.');
    if (rows[index].dailyPrice === '' || !Number.isFinite(tier.dailyPrice) || tier.dailyPrice < 0)
      throw new Error('Giá thuê/ngày phải là số không âm.');
    nextDay = tier.maxDays + 1;
  });
  return tiers;
}

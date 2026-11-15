const MAX_RULES = 20;
const MAX_HOURS = 8760;

const isBlank = (value) => value === '' || value === null || value === undefined;

/**
 * Mô phỏng validator BE của danh sách mốc hoàn tiền.
 * @param {Array<{minHoursBefore: number|string, refundPercentage: number|string}>} rules
 * @returns {{ isValid: boolean, fieldErrors: Record<string, string>, rootError: string|null }}
 */
export function validateRefundRules(rules) {
  const list = Array.isArray(rules) ? rules : [];
  const fieldErrors = {};
  let rootError = null;

  if (list.length < 1 || list.length > MAX_RULES) {
    rootError = `Chính sách cần từ 1 đến ${MAX_RULES} mốc hoàn tiền`;
  }

  const seenHours = new Set();
  const validForOrder = [];

  list.forEach((rule, index) => {
    const hoursKey = `rules.${index}.minHoursBefore`;
    const pctKey = `rules.${index}.refundPercentage`;
    let hoursOk = false;

    if (isBlank(rule?.minHoursBefore)) {
      fieldErrors[hoursKey] = 'Vui lòng nhập số giờ';
    } else {
      const hours = Number(rule.minHoursBefore);
      if (!Number.isInteger(hours)) fieldErrors[hoursKey] = 'Số giờ phải là số nguyên';
      else if (hours < 0 || hours > MAX_HOURS) fieldErrors[hoursKey] = `Số giờ phải từ 0 đến ${MAX_HOURS}`;
      else if (seenHours.has(hours)) fieldErrors[hoursKey] = 'Mốc giờ bị trùng với mốc khác';
      else {
        seenHours.add(hours);
        hoursOk = true;
      }
    }

    let pctOk = false;
    if (isBlank(rule?.refundPercentage)) {
      fieldErrors[pctKey] = 'Vui lòng nhập % hoàn tiền';
    } else {
      const pct = Number(rule.refundPercentage);
      if (!Number.isFinite(pct)) fieldErrors[pctKey] = '% hoàn tiền không hợp lệ';
      else if (pct < 0 || pct > 100) fieldErrors[pctKey] = '% hoàn tiền phải từ 0 đến 100';
      else pctOk = true;
    }

    if (hoursOk && pctOk) {
      validForOrder.push({ index, hours: Number(rule.minHoursBefore), pct: Number(rule.refundPercentage) });
    }
  });

  // Càng gần ngày đi (giờ càng nhỏ) thì % hoàn không được tăng
  const sorted = [...validForOrder].sort((a, b) => b.hours - a.hours);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].pct > sorted[i - 1].pct) {
      const key = `rules.${sorted[i].index}.refundPercentage`;
      if (!fieldErrors[key]) {
        fieldErrors[key] = 'Càng gần ngày khởi hành, % hoàn tiền không được cao hơn mốc trước';
      }
    }
  }

  return { isValid: !rootError && Object.keys(fieldErrors).length === 0, fieldErrors, rootError };
}

/** Cảnh báo mềm: chưa có mốc "0 giờ" nên sát giờ đi không rõ mức hoàn. */
export function hasZeroHourRule(rules) {
  return (rules ?? []).some((rule) => !isBlank(rule?.minHoursBefore) && Number(rule.minHoursBefore) === 0);
}

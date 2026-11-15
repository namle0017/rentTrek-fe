/** 72 → "3 ngày (72 giờ)", 36 → "1,5 ngày (36 giờ)", 5 → "5 giờ". */
export function formatHours(h) {
  const hours = Number(h);
  if (!Number.isFinite(hours)) return '';
  if (hours < 24) return `${hours} giờ`;
  const days = hours / 24;
  const text = Number.isInteger(days) ? String(days) : days.toFixed(1).replace('.', ',');
  return `${text} ngày (${hours} giờ)`;
}

/** Mã ngắn hiển thị thay cho GUID. */
export function formatRefundCode(refundCaseId) {
  return `HT-${refundCaseId.replaceAll('-', '').slice(0, 8).toUpperCase()}`;
}

export function getBankName(banks, bankCode) {
  return banks.find((bank) => bank.code === bankCode)?.name ?? bankCode;
}

/** Mã ngắn hiển thị thay cho GUID. */
export function formatRefundCode(refundCaseId) {
  return `HT-${refundCaseId.replaceAll('-', '').slice(0, 8).toUpperCase()}`;
}

export function getBankName(banks, bankCode) {
  return banks.find((bank) => bank.code === bankCode)?.name ?? bankCode;
}

/** Trạng thái hồ sơ cần khách thao tác: nhập STK (chờ STK) hoặc gửi lại yêu cầu (bị từ chối / thất bại). */
export const REFUND_ACTION_STATUSES = ['AwaitingBankInfo', 'Rejected', 'Failed'];

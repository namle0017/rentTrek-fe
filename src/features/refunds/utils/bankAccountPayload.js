/** Chuyển giá trị form RefundBankAccountFields thành payload BE (trim). */
export function toBankAccountPayload(values) {
  return {
    bankCode: values.bankAccount.bankCode,
    accountNumber: values.bankAccount.accountNumber.trim(),
    accountHolder: values.bankAccount.accountHolder.trim(),
  };
}

import FormField from '@/components/FormField';
import { REFUND_BANKS, REFUND_CONSENT_TEXT } from '@/constants/enums';

/**
 * Nhóm trường tài khoản nhận hoàn (react-hook-form): bankAccount.{bankCode, accountNumber, accountHolder} + consentAccepted.
 * Ràng buộc khớp RefundCaseService.ApplyBankAccount ở BE.
 */
export default function RefundBankAccountFields({ register, errors, idPrefix = 'refund', disabled = false }) {
  return (
    <fieldset disabled={disabled} style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 12 }}>
      <legend className="visually-hidden">Tài khoản nhận hoàn tiền</legend>
      <FormField label="Ngân hàng" htmlFor={`${idPrefix}-bank`} error={errors?.bankAccount?.bankCode}>
        <select id={`${idPrefix}-bank`} {...register('bankAccount.bankCode', { required: 'Vui lòng chọn ngân hàng' })}>
          <option value="">Chọn ngân hàng</option>
          {REFUND_BANKS.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Số tài khoản" htmlFor={`${idPrefix}-account`} error={errors?.bankAccount?.accountNumber}>
        <input
          id={`${idPrefix}-account`}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Nhập số tài khoản"
          {...register('bankAccount.accountNumber', {
            required: 'Vui lòng nhập số tài khoản',
            pattern: { value: /^\d{6,20}$/, message: 'Số tài khoản gồm 6–20 chữ số' },
          })}
        />
      </FormField>
      <FormField label="Tên chủ tài khoản" htmlFor={`${idPrefix}-holder`} error={errors?.bankAccount?.accountHolder}>
        <input
          id={`${idPrefix}-holder`}
          autoComplete="name"
          placeholder="Ví dụ: NGUYEN MINH ANH"
          {...register('bankAccount.accountHolder', {
            required: 'Vui lòng nhập tên chủ tài khoản',
            minLength: { value: 2, message: 'Tên chủ tài khoản gồm 2–100 ký tự' },
            maxLength: { value: 100, message: 'Tên chủ tài khoản tối đa 100 ký tự' },
          })}
        />
      </FormField>
      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <input
          type="checkbox"
          {...register('consentAccepted', { validate: (accepted) => accepted || 'Bạn cần đồng ý để tiếp tục' })}
        />
        <span>{REFUND_CONSENT_TEXT}</span>
      </label>
      {errors?.consentAccepted && <p className="text-error">{errors.consentAccepted.message}</p>}
    </fieldset>
  );
}


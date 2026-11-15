import { useForm } from 'react-hook-form';
import FormField from '@/components/FormField';
import { REFUND_BANKS, REFUND_CONSENT_TEXT, REFUND_CONSENT_VERSION } from '@/constants/enums';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { useSubmitRefundBankInfo } from '../hooks/useRefundCases';
import styles from './RefundProgressCard.module.css';

/** Khách nhập (lại) tài khoản nhận hoàn khi hồ sơ đang chờ STK, kể cả khi admin báo chuyển khoản thất bại. */
export default function RefundBankInfoForm({ refundCaseId, mode = 'submit', requireReason = false }) {
  const submit = useSubmitRefundBankInfo(refundCaseId, mode);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bankAccount: { bankCode: '', accountNumber: '', accountHolder: '' },
      consentAccepted: false,
      reason: '',
    },
  });

  const onSubmit = handleSubmit((values) =>
    submit.mutate(
      {
        bankAccount: {
          bankCode: values.bankAccount.bankCode,
          accountNumber: values.bankAccount.accountNumber.trim(),
          accountHolder: values.bankAccount.accountHolder.trim(),
        },
        consentAccepted: values.consentAccepted,
        consentVersion: REFUND_CONSENT_VERSION,
        ...(requireReason && { reason: values.reason.trim() }),
      },
      {
        onError: (error) => {
          applyServerErrors(error, setError);
          if (!error?.errors) setError('root', { message: error?.message || 'Không gửi được tài khoản' });
        },
      },
    ),
  );

  return (
    <form className={styles.bankForm} onSubmit={onSubmit} noValidate aria-label="Nhập tài khoản nhận hoàn tiền">
      <FormField label="Ngân hàng" htmlFor="refund-bank-info-bank" error={errors.bankAccount?.bankCode}>
        <select
          id="refund-bank-info-bank"
          {...register('bankAccount.bankCode', { required: 'Vui lòng chọn ngân hàng' })}
        >
          <option value="">Chọn ngân hàng</option>
          {REFUND_BANKS.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Số tài khoản" htmlFor="refund-bank-info-account" error={errors.bankAccount?.accountNumber}>
        <input
          id="refund-bank-info-account"
          inputMode="numeric"
          autoComplete="off"
          {...register('bankAccount.accountNumber', {
            required: 'Vui lòng nhập số tài khoản',
            pattern: { value: /^\d{6,20}$/, message: 'Số tài khoản gồm 6–20 chữ số' },
          })}
        />
      </FormField>
      <FormField label="Chủ tài khoản" htmlFor="refund-bank-info-holder" error={errors.bankAccount?.accountHolder}>
        <input
          id="refund-bank-info-holder"
          autoComplete="off"
          {...register('bankAccount.accountHolder', {
            required: 'Vui lòng nhập tên chủ tài khoản',
            minLength: { value: 2, message: 'Tên chủ tài khoản gồm 2–100 ký tự' },
            maxLength: { value: 100, message: 'Tên chủ tài khoản gồm 2–100 ký tự' },
          })}
        />
      </FormField>
      {requireReason && (
        <FormField label="Lý do khiếu nại" htmlFor="refund-bank-info-reason" error={errors.reason}>
          <textarea
            id="refund-bank-info-reason"
            rows={3}
            {...register('reason', {
              validate: (value) => value.trim().length > 0 || 'Vui lòng nhập lý do khiếu nại',
              maxLength: { value: 1000, message: 'Lý do tối đa 1000 ký tự' },
            })}
          />
        </FormField>
      )}
      <label className={styles.consent}>
        <input type="checkbox" {...register('consentAccepted', { required: 'Bạn cần đồng ý để tiếp tục' })} />
        <span>{REFUND_CONSENT_TEXT}</span>
      </label>
      {errors.consentAccepted && <p className="text-error">{errors.consentAccepted.message}</p>}
      {errors.root && (
        <p className="text-error" role="alert">
          {errors.root.message}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={submit.isPending}>
        {submit.isPending ? 'Đang gửi...' : mode === 'resubmit' ? 'Gửi lại yêu cầu hoàn tiền' : 'Gửi tài khoản nhận hoàn tiền'}
      </button>
    </form>
  );
}

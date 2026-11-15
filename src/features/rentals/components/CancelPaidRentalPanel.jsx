import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/Modal';
import RefundBankAccountFields from '@/features/refunds/components/RefundBankAccountFields';
import { toBankAccountPayload } from '@/features/refunds/utils/bankAccountPayload';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCancelPaidRentalOrder, useRentalCancellationPreview } from '../hooks/useRentals';
import styles from '../pages/RentalCustomer.module.css';

const TYPE_LABEL = {
  FreeCancel: 'Huỷ miễn phí (trước giờ nhận 24 giờ)',
  OverLimitCancel: 'Đã dùng hết lượt huỷ miễn phí',
  LateCancel: 'Huỷ khi đã trễ nhận đồ',
  NoShow: 'Đã quá hạn nhận đồ',
};

/** Khách huỷ đơn đã thanh toán, chưa nhận đồ. Số tiền do server tính; khách xác nhận đúng số đã xem. */
export default function CancelPaidRentalPanel({ orderId, onCancelled }) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const preview = useRentalCancellationPreview(orderId, { enabled: open });
  const cancel = useCancelPaidRentalOrder();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reason: '',
      bankAccount: { bankCode: '', accountNumber: '', accountHolder: '' },
      consentAccepted: false,
    },
  });
  const data = preview.data;

  const submit = handleSubmit(async (values) => {
    setSubmitError('');
    const payload = { reason: values.reason.trim() || undefined, expectedRefundAmount: data.refundAmount };
    if (data.requiresBankAccount) {
      payload.bankAccount = toBankAccountPayload(values);
      payload.consentAccepted = values.consentAccepted;
      payload.consentVersion = data.consentVersion;
    }
    try {
      await cancel.mutateAsync({ orderId, payload });
      setOpen(false);
      onCancelled?.();
    } catch (error) {
      if (error?.statusCode === 409 && error?.errors?.refundAmount) {
        setSubmitError('Số tiền hoàn vừa thay đổi (đã qua mốc tính phí). Vui lòng kiểm tra lại trước khi xác nhận.');
        await preview.refetch();
        return;
      }
      setSubmitError(error?.message || 'Không thể huỷ đơn.');
    }
  });

  return (
    <>
      <button className={styles.secondary} type="button" onClick={() => setOpen(true)}>
        Huỷ đơn đã thanh toán
      </button>
      {open && (
        <Modal title="Huỷ đơn thuê" onClose={() => !cancel.isPending && setOpen(false)}>
          {preview.isLoading && <p role="status">Đang tính số tiền hoàn theo chính sách...</p>}
          {preview.isError && (
            <p role="alert" className={styles.error}>
              {preview.error?.message || 'Không lấy được báo giá huỷ.'}
            </p>
          )}
          {data && (
            <form className={styles.stack} onSubmit={submit}>
              <p>
                <strong>{TYPE_LABEL[data.cancellationType] || data.cancellationType}</strong>
                {data.daysLate > 0 && ` · trễ ${data.daysLate} ngày`}
              </p>
              <dl className={styles.amounts}>
                <div>
                  <dt>Đã thanh toán (thuê + cọc)</dt>
                  <dd>{formatCurrency(data.amountPaid)}</dd>
                </div>
                <div>
                  <dt>
                    Phí huỷ
                    {data.appliedTierPercent !== null && data.appliedTierPercent !== undefined && ` (${data.appliedTierPercent}% cọc)`}
                  </dt>
                  <dd>−{formatCurrency(data.fee)}</dd>
                </div>
                <div className={styles.total}>
                  <dt>Số tiền được hoàn</dt>
                  <dd>{formatCurrency(data.refundAmount)}</dd>
                </div>
              </dl>
              <p className={styles.hint}>
                Đã dùng {data.freeCancellationsUsed}/{data.freeCancelLimit} lượt huỷ miễn phí trong{' '}
                {data.freeCancelWindowDays} ngày. Tiền hoàn được kế toán chuyển khoản thủ công sau khi đơn huỷ.
              </p>
              {!data.allowed ? (
                <p role="alert" className={styles.error}>
                  {data.blockedReason}
                </p>
              ) : (
                <>
                  <label className={styles.field}>
                    Lý do huỷ (không bắt buộc)
                    <textarea rows={2} maxLength={500} {...register('reason')} />
                  </label>
                  {data.requiresBankAccount && (
                    <RefundBankAccountFields
                      register={register}
                      errors={errors}
                      idPrefix="rental-cancel"
                      disabled={cancel.isPending}
                    />
                  )}
                  {submitError && (
                    <p role="alert" className={styles.error}>
                      {submitError}
                    </p>
                  )}
                  <div className={styles.actions}>
                    <button type="button" className={styles.secondary} onClick={() => setOpen(false)}>
                      Giữ lại đơn
                    </button>
                    <button type="submit" className={styles.primary} disabled={cancel.isPending || preview.isFetching}>
                      {cancel.isPending ? 'Đang huỷ...' : `Xác nhận huỷ, hoàn ${formatCurrency(data.refundAmount)}`}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

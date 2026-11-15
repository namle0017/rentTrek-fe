import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { refundService } from '@/features/refunds/api/refundService';
import RefundBankAccountFields from '@/features/refunds/components/RefundBankAccountFields';
import { toBankAccountPayload } from '@/features/refunds/utils/bankAccountPayload';
import { REFUND_CONSENT_VERSION } from '@/constants/enums';
import { formatCurrency } from '@/utils/formatCurrency';
import { rentalKeys } from '../api/rentalKeys';
import styles from '../pages/RentalCustomer.module.css';

const SOURCE_TEXT = {
  RentalNoShow: 'Đơn đã huỷ do không đến nhận đồ. Phần tiền thuê còn lại (sau khi trừ cọc) sẽ được hoàn cho bạn.',
  RentalDepositReturn: 'Bạn đã trả đồ. Phần cọc còn lại sau khi trừ phí phát sinh sẽ được hoàn cho bạn.',
  RentalCancellation: 'Đơn đã huỷ theo chính sách.',
};

/** Hồ sơ hoàn tiền đang chờ khách nhập STK (no-show / hoàn cọc sau khi trả đồ). */
export default function RefundBankInfoPanel({ orderId, refundCase }) {
  const queryClient = useQueryClient();
  const submit = useMutation({
    mutationFn: refundService.submitBankInfo,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: rentalKeys.orderDetail(orderId) });
      toast.success(res?.message || 'Đã ghi nhận tài khoản nhận hoàn.');
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { bankAccount: { bankCode: '', accountNumber: '', accountHolder: '' }, consentAccepted: false },
  });

  return (
    <section className={styles.card} aria-label="Nhập tài khoản nhận hoàn tiền">
      <h2>Nhập tài khoản để nhận {formatCurrency(refundCase.amount)}</h2>
      <p>{SOURCE_TEXT[refundCase.source] || 'Bạn có khoản tiền chờ hoàn.'}</p>
      <form
        className={styles.stack}
        onSubmit={handleSubmit((values) =>
          submit.mutate({
            refundCaseId: refundCase.refundCaseId,
            payload: {
              bankAccount: toBankAccountPayload(values),
              consentAccepted: values.consentAccepted,
              consentVersion: REFUND_CONSENT_VERSION,
            },
          }),
        )}
      >
        <RefundBankAccountFields register={register} errors={errors} idPrefix="rental-refund" disabled={submit.isPending} />
        {submit.isError && (
          <p role="alert" className={styles.error}>
            {submit.error?.message || 'Không gửi được thông tin tài khoản.'}
          </p>
        )}
        <button type="submit" className={styles.primary} disabled={submit.isPending}>
          {submit.isPending ? 'Đang gửi...' : 'Gửi thông tin nhận hoàn'}
        </button>
        <p className={styles.hint}>
          Số tài khoản được mã hoá, chỉ kế toán thấy khi chuyển khoản và tự xoá sau thời hạn lưu trữ.
        </p>
      </form>
    </section>
  );
}

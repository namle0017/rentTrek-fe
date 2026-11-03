import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import ErrorState from '@/components/ErrorState';
import FormField from '@/components/FormField';
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import { API_ERROR_CODE, REFUND_BANKS, REFUND_CONSENT_TEXT } from '@/constants/enums';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCancellationPreview, useCancelTripBooking } from '../hooks/useTripBookings';
import styles from './CancelBookingPanel.module.css';

const CANCELLATION_SCREEN = Object.freeze({
  CONFIRM: 'confirm',
  POLICY: 'policy',
  BANK: 'bank',
});

function formatDuration(hours) {
  if (hours % 24 === 0) return `${hours / 24} ngày`;
  return `${hours} giờ`;
}

function getAppliedMinHours(appliedCase) {
  if (/sát giờ/i.test(appliedCase)) return 0;
  const match = appliedCase.match(/từ\s+(\d+)\s+giờ/i);
  return match ? Number(match[1]) : null;
}

function describePolicyOutcome(rule, paidAmount) {
  const refundAmount = Math.floor((paidAmount * rule.refundPercentage) / 100);
  const retainedAmount = Math.max(0, paidAmount - refundAmount);

  if (rule.refundPercentage === 100) {
    return `Bạn được hoàn toàn bộ ${formatCurrency(paidAmount)} đã thanh toán.`;
  }

  if (rule.refundPercentage === 0) {
    return 'Bạn không được hoàn tiền vì dịch vụ đã được chốt để phục vụ đoàn.';
  }

  return `Bạn được hoàn ${formatCurrency(refundAmount)}. RenTrekk giữ lại ${formatCurrency(retainedAmount)} cho chi phí đã chuẩn bị.`;
}

function getPolicyCases(preview) {
  const sortedRules = [...(preview.refundPolicy?.rules || [])].sort(
    (left, right) => right.minHoursBefore - left.minHoursBefore,
  );
  const appliedMinHours = getAppliedMinHours(preview.appliedCase);

  return sortedRules.map((rule, index) => {
    const upperBound = sortedRules[index - 1]?.minHoursBefore;
    let title;

    if (rule.minHoursBefore === 0 && upperBound !== undefined) {
      title = `Hủy dưới ${formatDuration(upperBound)} trước giờ khởi hành`;
    } else if (upperBound === undefined) {
      title = `Hủy từ ${formatDuration(rule.minHoursBefore)} trước giờ khởi hành`;
    } else {
      title = `Hủy từ ${formatDuration(rule.minHoursBefore)} đến dưới ${formatDuration(upperBound)} trước giờ khởi hành`;
    }

    return {
      id: rule.minHoursBefore,
      title,
      description: describePolicyOutcome(rule, preview.paidAmount),
      isApplied: rule.minHoursBefore === appliedMinHours,
    };
  });
}

function hasErrorCode(error, code) {
  return Object.values(error?.errors || {})
    .flat()
    .includes(code);
}

function CancellationPolicyScreen({ preview, onBack }) {
  const policyCases = getPolicyCases(preview);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <section className={styles.policyScreen} aria-labelledby="cancellation-policy-title">
      <header className={styles.policyTopbar}>
        <div className={styles.policyTopbarInner}>
          <span className={styles.policyBrand}>RenTrekk</span>
        </div>
      </header>
      <main className={styles.policyContent}>
        <button type="button" className={styles.policyBack} onClick={onBack}>
          <span aria-hidden="true">←</span> Quay lại xác nhận hủy
        </button>
        <h1 id="cancellation-policy-title">Chính sách hủy booking</h1>
        <p className={styles.policyIntro}>
          Chính sách chung áp dụng cho mọi booking tour của RenTrekk. Thời điểm hủy được tính theo giờ
          khởi hành ghi trên đơn.
        </p>
        <div className={styles.policyMeta}>
          <span>{preview.refundPolicy.name}</span>
          <span>Phiên bản {preview.refundPolicy.version}</span>
        </div>

        <ol className={styles.policyList}>
          {policyCases.map((policyCase, index) => (
            <li
              key={policyCase.id}
              className={policyCase.isApplied ? styles.policyCaseApplied : undefined}
              aria-label={policyCase.title}
              aria-current={policyCase.isApplied ? 'true' : undefined}
            >
              <span className={styles.policyIndex}>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{policyCase.title}</h2>
                <p>{policyCase.description}</p>
                {policyCase.isApplied && (
                  <span className={styles.appliedTag}>Đơn của bạn đang áp dụng trường hợp này</span>
                )}
              </div>
            </li>
          ))}
        </ol>

        <p className={styles.policyNote}>
          Nếu RenTrekk chủ động hủy chuyến, khách được hoàn toàn bộ số tiền đã thanh toán. Đơn cũ luôn
          dùng phiên bản chính sách đã chấp nhận lúc đặt.
        </p>
      </main>
    </section>,
    document.body,
  );
}

function CancellationForm({ orderId, preview, screen, onScreenChange, onClose, refetchPreview }) {
  const cancelBooking = useCancelTripBooking();
  const [submitError, setSubmitError] = useState('');
  const needsBankAccount = preview.estimatedRefundAmount > 0;
  const lostAmount = Math.max(0, preview.paidAmount - preview.estimatedRefundAmount);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bankAccount: { bankCode: '', accountNumber: '', accountHolder: '' },
      consentAccepted: false,
    },
  });

  const submitCancellation = handleSubmit(async (values) => {
    setSubmitError('');
    const payload = {
      reason: undefined,
      expectedRefundAmount: preview.estimatedRefundAmount,
    };

    if (needsBankAccount) {
      payload.bankAccount = {
        bankCode: values.bankAccount.bankCode,
        accountNumber: values.bankAccount.accountNumber.trim(),
        accountHolder: values.bankAccount.accountHolder.trim(),
      };
      payload.consentVersion = preview.consentVersion;
      payload.consentAccepted = values.consentAccepted;
    }

    try {
      await cancelBooking.mutateAsync({ orderId, payload });
      onClose();
    } catch (error) {
      if (hasErrorCode(error, API_ERROR_CODE.REFUND_AMOUNT_CHANGED)) {
        setSubmitError(
          'Số tiền hoàn đã thay đổi. Hệ thống đã cập nhật lại để bạn kiểm tra trước khi xác nhận.',
        );
        await refetchPreview();
        onScreenChange(CANCELLATION_SCREEN.CONFIRM);
        return;
      }

      applyServerErrors(error, setError);
      setSubmitError(error?.message || 'Không thể hủy booking.');
    }
  });

  const handleContinue = () => {
    if (needsBankAccount) {
      setSubmitError('');
      onScreenChange(CANCELLATION_SCREEN.BANK);
      return;
    }
    submitCancellation();
  };

  return (
    <form className={styles.form} onSubmit={submitCancellation} noValidate>
      {screen === CANCELLATION_SCREEN.CONFIRM && (
        <>
          <section className={styles.appliedCase}>
            <span>Trường hợp áp dụng</span>
            <strong>{preview.appliedCase}</strong>
            <p>
              Đơn này được hoàn {formatCurrency(preview.estimatedRefundAmount)} theo chính sách đã chấp
              nhận lúc đặt.
            </p>
          </section>

          <dl className={styles.refundSummary}>
            <div>
              <dt>Đã thanh toán</dt>
              <dd>{formatCurrency(preview.paidAmount)}</dd>
            </div>
            <div className={styles.refundAmount}>
              <dt>Dự kiến hoàn</dt>
              <dd>{formatCurrency(preview.estimatedRefundAmount)}</dd>
            </div>
            <div>
              <dt>Khoản không hoàn</dt>
              <dd>{formatCurrency(lostAmount)}</dd>
            </div>
          </dl>

          {preview.refundPolicy?.rules?.length > 0 && (
            <button
              type="button"
              className={styles.policyLink}
              onClick={() => onScreenChange(CANCELLATION_SCREEN.POLICY)}
            >
              Xem chi tiết chính sách hoàn tiền <span aria-hidden="true">›</span>
            </button>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={onClose}
              disabled={cancelBooking.isPending}
            >
              Giữ booking
            </button>
            <button
              type="button"
              className={styles.danger}
              onClick={handleContinue}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending
                ? 'Đang hủy...'
                : needsBankAccount
                  ? 'Tiếp tục hủy'
                  : 'Xác nhận hủy'}
            </button>
          </div>
        </>
      )}

      {screen === CANCELLATION_SCREEN.BANK && (
        <>
          <div className={styles.amountStrip}>
            <span>Số tiền dự kiến hoàn</span>
            <strong>{formatCurrency(preview.estimatedRefundAmount)}</strong>
          </div>

          <fieldset className={styles.bankFields}>
            <legend className={styles.visuallyHidden}>Tài khoản nhận hoàn tiền</legend>
            <FormField label="Ngân hàng" htmlFor="refund-bank" error={errors.bankAccount?.bankCode}>
              <select
                id="refund-bank"
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

            <FormField
              label="Số tài khoản"
              htmlFor="refund-account-number"
              error={errors.bankAccount?.accountNumber}
            >
              <input
                id="refund-account-number"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Nhập số tài khoản"
                {...register('bankAccount.accountNumber', {
                  required: 'Vui lòng nhập số tài khoản',
                  pattern: { value: /^\d{6,20}$/, message: 'Số tài khoản gồm 6–20 chữ số' },
                })}
              />
            </FormField>

            <FormField
              label="Tên chủ tài khoản"
              htmlFor="refund-account-holder"
              error={errors.bankAccount?.accountHolder}
            >
              <input
                id="refund-account-holder"
                autoComplete="name"
                placeholder="Ví dụ: NGUYEN MINH ANH"
                {...register('bankAccount.accountHolder', {
                  required: 'Vui lòng nhập tên chủ tài khoản',
                  minLength: { value: 2, message: 'Tên chủ tài khoản gồm 2–100 ký tự' },
                  maxLength: { value: 100, message: 'Tên chủ tài khoản tối đa 100 ký tự' },
                })}
              />
            </FormField>

            <div className={styles.consent}>
              <label>
                <input
                  type="checkbox"
                  {...register('consentAccepted', {
                    validate: (accepted) => accepted || 'Bạn cần đồng ý để tiếp tục',
                  })}
                />
                <span>{REFUND_CONSENT_TEXT}</span>
              </label>
              {errors.consentAccepted && (
                <p className={styles.fieldError}>{errors.consentAccepted.message}</p>
              )}
            </div>
          </fieldset>

          <p className={styles.bankNote}>
            Booking chỉ bị hủy sau khi bạn hoàn tất bước này. Nhân viên sẽ cập nhật tiến độ xử lý trong
            chi tiết đơn.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => onScreenChange(CANCELLATION_SCREEN.CONFIRM)}
              disabled={cancelBooking.isPending}
            >
              Quay lại
            </button>
            <button type="submit" className={styles.danger} disabled={cancelBooking.isPending}>
              {cancelBooking.isPending ? 'Đang hủy...' : 'Hủy booking'}
            </button>
          </div>
        </>
      )}

      {submitError && (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      )}
    </form>
  );
}

export default function CancelBookingPanel({ orderId }) {
  const [screen, setScreen] = useState(null);
  const previewQuery = useCancellationPreview(orderId, { enabled: screen !== null });
  const closeFlow = () => setScreen(null);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setScreen(CANCELLATION_SCREEN.CONFIRM)}
      >
        Hủy booking
      </button>

      {screen === CANCELLATION_SCREEN.POLICY && previewQuery.data?.canCancel && (
        <CancellationPolicyScreen
          preview={previewQuery.data}
          onBack={() => setScreen(CANCELLATION_SCREEN.CONFIRM)}
        />
      )}

      {screen !== null && screen !== CANCELLATION_SCREEN.POLICY && (
        <Modal
          title={
            screen === CANCELLATION_SCREEN.BANK
              ? 'Thông tin nhận hoàn tiền'
              : 'Xác nhận hủy booking'
          }
          onClose={closeFlow}
        >
          {previewQuery.isLoading && <Spinner />}
          {previewQuery.isError && (
            <ErrorState
              message={previewQuery.error?.message || 'Không thể tính số tiền hoàn.'}
              onRetry={previewQuery.refetch}
            />
          )}
          {previewQuery.data?.canCancel === false && (
            <section className={styles.blocked} role="alert">
              <strong>Không thể hủy booking</strong>
              <p>
                {previewQuery.data.blockedReason ||
                  'Trạng thái booking hiện tại không cho phép hủy.'}
              </p>
            </section>
          )}
          {previewQuery.data?.canCancel && (
            <CancellationForm
              orderId={orderId}
              preview={previewQuery.data}
              screen={screen}
              onScreenChange={setScreen}
              onClose={closeFlow}
              refetchPreview={previewQuery.refetch}
            />
          )}
        </Modal>
      )}
    </>
  );
}

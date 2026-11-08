import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import FormField from '@/components/FormField';
import { authService } from '../api/authService';
import styles from './ForgotPasswordModal.module.css';

/**
 * Modal xác thực tài khoản qua mã OTP 6 số gửi tới email khi vừa đăng ký.
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   email: string,
 *   onSuccessVerified: (email: string) => void
 * }} props
 */
export default function EmailVerificationModal({
  isOpen,
  onClose,
  email = '',
  onSuccessVerified,
}) {
  const [serverError, setServerError] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút (900 giây)
  const [resendCooldown, setResendCooldown] = useState(60); // 60s cooldown ban đầu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { otp: '' },
  });

  // Countdown timer cho hiệu lực OTP (15 phút)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Cooldown timer cho nút gửi lại mã OTP (60 giây)
  useEffect(() => {
    if (!isOpen || resendCooldown <= 0) return;
    const cooldownTimer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(cooldownTimer);
  }, [isOpen, resendCooldown]);

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (isSubmitting || isResending) return;
    setServerError('');
    reset();
    onClose();
  };

  const onVerify = async (values) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await authService.verifyEmail({
        email: email.trim(),
        otp: values.otp.trim(),
      });
      toast.success('Kích hoạt tài khoản thành công! Vui lòng đăng nhập để tiếp tục.');
      reset();
      onSuccessVerified(email.trim());
    } catch (err) {
      setServerError(err.message || 'Mã xác thực không chính xác hoặc đã hết hạn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setServerError('');
    setIsResending(true);
    try {
      await authService.resendVerificationEmail({ email: email.trim() });
      toast.success('Đã gửi lại mã xác thực mới vào email của bạn!');
      setTimeLeft(900);
      setResendCooldown(60);
    } catch (err) {
      setServerError(err.message || 'Không thể gửi lại mã xác thực. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🛡️</span>
            <h3 className={styles.modalTitle}>Kích hoạt tài khoản renTrek</h3>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Đóng modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <p className={styles.helperText} style={{ marginTop: 0 }}>
            Hệ thống đã gửi mã OTP 6 chữ số tới email: <br />
            <strong style={{ color: 'var(--color-primary, #1B4332)' }}>{email}</strong>
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Thời hạn mã xác thực:
            </span>
            <span className={styles.timerBadge}>
              ⏱️ {formatTimer(timeLeft)}
            </span>
          </div>

          {serverError && <div className={styles.errorAlert}>{serverError}</div>}

          <form onSubmit={handleSubmit(onVerify)} noValidate>
            <FormField
              label="Nhập mã xác thực OTP (6 chữ số)"
              htmlFor="verify-otp"
              error={errors.otp}
            >
              <input
                id="verify-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className={`input ${styles.otpInput}`}
                placeholder="000000"
                autoFocus
                {...register('otp', {
                  required: 'Vui lòng nhập mã OTP 6 chữ số',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Mã OTP phải gồm đúng 6 chữ số',
                  },
                })}
              />
            </FormField>

            <div
              style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: '#64748b',
              }}
            >
              Chưa nhận được mã?{' '}
              <button
                type="button"
                className={styles.changeEmailButton}
                onClick={onResendOtp}
                disabled={resendCooldown > 0 || isResending}
                style={{
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  opacity: resendCooldown > 0 ? 0.6 : 1,
                }}
              >
                {isResending
                  ? 'Đang gửi...'
                  : resendCooldown > 0
                  ? `Gửi lại sau (${resendCooldown}s)`
                  : 'Gửi lại mã'}
              </button>
            </div>

            <div
              className={styles.modalFooter}
              style={{ padding: '1.5rem 0 0', background: 'transparent' }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || timeLeft === 0}
              >
                {isSubmitting ? 'Đang kích hoạt...' : 'KÍCH HOẠT TÀI KHOẢN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

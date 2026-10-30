import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import FormField from '@/components/FormField';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { useResetPassword } from '../hooks/useResetPassword';
import styles from './ForgotPasswordModal.module.css';

/**
 * Modal xử lý luồng quên mật khẩu và đặt lại mật khẩu bằng mã xác thực Email OTP.
 * @param {{ isOpen: boolean, onClose: () => void, defaultEmail?: string, onSuccessReset?: (email: string) => void }} props
 */
export default function ForgotPasswordModal({ isOpen, onClose, defaultEmail = '', onSuccessReset }) {
  const [step, setStep] = useState(1); // 1: Gửi OTP, 2: Nhập OTP & Mật khẩu mới
  const [serverError, setServerError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút (900 giây)
  const [resendCooldown, setResendCooldown] = useState(0);

  const forgotMutation = useForgotPassword();
  const resetMutation = useResetPassword();

  // Step 1 Form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    getValues: getEmailValues,
    formState: { errors: emailErrors },
  } = useForm({
    defaultValues: { email: defaultEmail },
  });

  // Step 2 Form
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    getValues: getResetValues,
    control: controlReset,
    reset: resetResetForm,
    formState: { errors: resetErrors },
  } = useForm({
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = useWatch({ control: controlReset, name: 'newPassword', defaultValue: '' });

  // Countdown timer cho OTP
  useEffect(() => {
    if (!isOpen || step !== 2) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, step]);

  // Cooldown timer cho nút gửi lại
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const cooldownTimer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(cooldownTimer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (forgotMutation.isPending || resetMutation.isPending) return;
    setStep(1);
    setServerError('');
    resetResetForm();
    onClose();
  };

  const onSendOtp = (values) => {
    setServerError('');
    forgotMutation.mutate(
      { email: values.email.trim() },
      {
        onSuccess: () => {
          setStep(2);
          setTimeLeft(900);
          setResendCooldown(60);
        },
        onError: (err) => {
          setServerError(err.message || 'Không thể gửi mã xác thực. Vui lòng kiểm tra lại email.');
        },
      },
    );
  };

  const onResendOtp = () => {
    if (resendCooldown > 0) return;
    const email = getEmailValues('email').trim();
    if (!email) return;

    setServerError('');
    forgotMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setTimeLeft(900);
          setResendCooldown(60);
        },
        onError: (err) => {
          setServerError(err.message || 'Không thể gửi lại mã.');
        },
      },
    );
  };

  const onResetPassword = (values) => {
    setServerError('');
    const email = getEmailValues('email').trim();

    resetMutation.mutate(
      {
        email,
        otp: values.otp.trim(),
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: () => {
          if (onSuccessReset) {
            onSuccessReset(email);
          }
          handleClose();
        },
        onError: (err) => {
          setServerError(err.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
        },
      },
    );
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {step === 1 ? 'Khôi phục mật khẩu' : 'Xác thực OTP & Đổi mật khẩu'}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepItem} ${step >= 1 ? styles.stepActive : ''}`}>
              <div className={styles.stepNumber}>1</div>
              <span>Nhận mã OTP</span>
            </div>
            <div className={`${styles.stepLine} ${step === 2 ? styles.stepLineActive : ''}`} />
            <div className={`${styles.stepItem} ${step === 2 ? styles.stepActive : ''}`}>
              <div className={styles.stepNumber}>2</div>
              <span>Mật khẩu mới</span>
            </div>
          </div>

          {serverError && <div className={styles.errorBanner}>{serverError}</div>}

          {/* STEP 1: NHẬP EMAIL */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit(onSendOtp)} noValidate>
              <p className={styles.helperText}>
                Nhập địa chỉ email tài khoản của bạn. renTrek sẽ gửi mã xác thực gồm 6 chữ số để giúp bạn
                thiết lập lại mật khẩu an toàn.
              </p>

              <FormField label="Địa chỉ Email" htmlFor="forgot-email" error={emailErrors.email}>
                <input
                  id="forgot-email"
                  type="email"
                  className="input"
                  placeholder="name@example.com"
                  autoComplete="email"
                  {...registerEmail('email', {
                    required: 'Vui lòng nhập địa chỉ email',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Định dạng email không hợp lệ',
                    },
                  })}
                />
              </FormField>

              <div className={styles.modalFooter} style={{ padding: '1.25rem 0 0', background: 'transparent' }}>
                <button type="button" className="btn btn-outline" onClick={handleClose}>
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending ? 'Đang gửi mã...' : 'Gửi mã xác thực'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: NHẬP OTP & ĐẶT LẠI MẬT KHẨU */}
          {step === 2 && (
            <form onSubmit={handleResetSubmit(onResetPassword)} noValidate>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.helperText} style={{ margin: 0 }}>
                  Mã đã được gửi tới <strong>{getEmailValues('email')}</strong>
                </span>
                <span className={styles.timerBadge}>
                  ⏱️ {formatTimer(timeLeft)}
                </span>
              </div>

              <FormField label="Mã xác thực OTP (6 số)" htmlFor="reset-otp" error={resetErrors.otp}>
                <input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  className={`input ${styles.otpInput}`}
                  placeholder="000000"
                  autoFocus
                  {...registerReset('otp', {
                    required: 'Vui lòng nhập mã OTP 6 chữ số',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Mã OTP phải là 6 chữ số',
                    },
                  })}
                />
              </FormField>

              <FormField label="Mật khẩu mới" htmlFor="reset-newpassword" error={resetErrors.newPassword}>
                <div className={styles.passwordWrapper}>
                  <input
                    id="reset-newpassword"
                    type={showNewPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Tối thiểu 8 ký tự"
                    autoComplete="new-password"
                    {...registerReset('newPassword', {
                      required: 'Vui lòng nhập mật khẩu mới',
                      minLength: { value: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
                      validate: {
                        hasUpper: (v) => /[A-Z]/.test(v) || 'Cần ít nhất 1 chữ in hoa (A-Z)',
                        hasLower: (v) => /[a-z]/.test(v) || 'Cần ít nhất 1 chữ in thường (a-z)',
                        hasDigit: (v) => /[0-9]/.test(v) || 'Cần ít nhất 1 chữ số (0-9)',
                        hasSpecial: (v) => /[\W_]/.test(v) || 'Cần ít nhất 1 ký tự đặc biệt (!@#$...)',
                      },
                    })}
                  />
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showNewPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </FormField>

              <PasswordStrengthMeter password={newPasswordValue} />

              <FormField
                label="Xác nhận mật khẩu mới"
                htmlFor="reset-confirmpassword"
                error={resetErrors.confirmPassword}
              >
                <div className={styles.passwordWrapper}>
                  <input
                    id="reset-confirmpassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                    {...registerReset('confirmPassword', {
                      required: 'Vui lòng xác nhận lại mật khẩu mới',
                      validate: (v) =>
                        v === getResetValues('newPassword') || 'Mật khẩu xác nhận không khớp',
                    })}
                  />
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </FormField>

              <div className={styles.resendRow}>
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={onResendOtp}
                  disabled={resendCooldown > 0 || forgotMutation.isPending}
                >
                  {resendCooldown > 0 ? `Gửi lại mã sau (${resendCooldown}s)` : 'Gửi lại mã OTP'}
                </button>
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={() => setStep(1)}
                  style={{ color: '#64748b' }}
                >
                  Đổi email khác
                </button>
              </div>

              <div className={styles.modalFooter} style={{ padding: '1.25rem 0 0', background: 'transparent' }}>
                <button type="button" className="btn btn-outline" onClick={handleClose}>
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resetMutation.isPending || timeLeft === 0}
                >
                  {resetMutation.isPending ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

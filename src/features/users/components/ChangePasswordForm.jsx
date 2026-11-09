import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import FormField from '@/components/FormField';
import PasswordStrengthMeter from '@/features/auth/components/PasswordStrengthMeter';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { userService } from '../api/userService';
import { useChangePassword } from '../hooks/useChangePassword';
import styles from './ChangePasswordForm.module.css';

const EyeIcon = ({ isVisible }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {isVisible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

export default function ChangePasswordForm() {
  const changePasswordMutation = useChangePassword();
  const [serverErrorMsg, setServerErrorMsg] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    getValues,
    control,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      otp: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPasswordValue = useWatch({ control, name: 'newPassword', defaultValue: '' });

  // Cooldown countdown timer cho nút gửi OTP (60 giây)
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    setServerErrorMsg('');
    setIsSendingOtp(true);
    try {
      await userService.requestPasswordOtp();
      setOtpSent(true);
      setOtpCooldown(60);
      toast.success('Mã OTP xác thực đã được gửi về email của bạn!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể gửi mã OTP lúc này';
      setServerErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = (values) => {
    setServerErrorMsg('');
    changePasswordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        otp: values.otp.trim(),
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      },
      {
        onSuccess: () => {
          toast.success('Đổi mật khẩu thành công! Các thiết bị khác đã được đăng xuất an toàn.');
          reset({
            currentPassword: '',
            otp: '',
            newPassword: '',
            confirmNewPassword: '',
          });
          setOtpSent(false);
        },
        onError: (error) => {
          setServerErrorMsg(error.message);
          applyServerErrors(error, setError);
        },
      },
    );
  };

  const handleReset = () => {
    reset({
      currentPassword: '',
      otp: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setServerErrorMsg('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Đổi mật khẩu tài khoản</h2>
        <p className={styles.subtitle}>
          Để bảo vệ tài khoản, bạn cần xác thực mã OTP gửi về email trước khi đặt mật khẩu mới.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverErrorMsg && <div className={styles.errorBanner}>{serverErrorMsg}</div>}

        {/* Mật khẩu hiện tại */}
        <FormField label="Mật khẩu hiện tại" htmlFor="currentPassword" error={errors.currentPassword}>
          <div className={styles.passwordWrapper}>
            <input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              className="input"
              placeholder="Nhập mật khẩu hiện tại của bạn"
              {...register('currentPassword', {
                required: 'Vui lòng nhập mật khẩu hiện tại',
              })}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <EyeIcon isVisible={showCurrentPassword} />
            </button>
          </div>
        </FormField>

        {/* Mã xác thực OTP qua Email */}
        <FormField label="Mã xác thực OTP (6 chữ số gửi qua email)" htmlFor="otp" error={errors.otp}>
          <div className={styles.otpRow}>
            <input
              id="otp"
              type="text"
              maxLength={6}
              inputMode="numeric"
              className="input"
              placeholder="Nhập 6 chữ số OTP"
              {...register('otp', {
                required: 'Vui lòng nhập mã OTP nhận từ email',
                pattern: { value: /^\d{6}$/, message: 'Mã OTP gồm đúng 6 chữ số' },
              })}
            />
            <button
              type="button"
              className={`btn btn-outline ${styles.otpBtn}`}
              onClick={handleSendOtp}
              disabled={isSendingOtp || otpCooldown > 0}
            >
              {isSendingOtp
                ? 'Đang gửi...'
                : otpCooldown > 0
                ? `Gửi lại (${otpCooldown}s)`
                : 'Gửi mã qua Email'}
            </button>
          </div>
          <div className={styles.inputHelper}>
            {otpSent
              ? 'Mã OTP đã được gửi tới email tài khoản của bạn (hiệu lực 15 phút).'
              : 'Nhấn nút "Gửi mã qua Email" để nhận mã xác thực bảo mật trước khi đổi mật khẩu.'}
          </div>
        </FormField>

        {/* Mật khẩu mới */}
        <FormField label="Mật khẩu mới" htmlFor="newPassword" error={errors.newPassword}>
          <div className={styles.passwordWrapper}>
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              className="input"
              placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
              {...register('newPassword', {
                required: 'Vui lòng nhập mật khẩu mới',
                minLength: { value: 8, message: 'Mật khẩu mới phải có tối thiểu 8 ký tự' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                  message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
                },
                validate: (val) =>
                  val !== getValues('currentPassword') ||
                  'Mật khẩu mới không được trùng với mật khẩu hiện tại',
              })}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <EyeIcon isVisible={showNewPassword} />
            </button>
          </div>
          <div className={styles.inputHelper}>
            Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ hoa (A-Z), chữ thường (a-z), chữ số (0-9) và ký tự đặc biệt.
          </div>
        </FormField>

        <PasswordStrengthMeter password={newPasswordValue} />

        {/* Xác nhận mật khẩu mới */}
        <FormField
          label="Xác nhận mật khẩu mới"
          htmlFor="confirmNewPassword"
          error={errors.confirmNewPassword}
        >
          <div className={styles.passwordWrapper}>
            <input
              id="confirmNewPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className="input"
              placeholder="Nhập lại mật khẩu mới để xác nhận"
              {...register('confirmNewPassword', {
                required: 'Vui lòng xác nhận mật khẩu mới',
                validate: (val) => val === getValues('newPassword') || 'Xác nhận mật khẩu mới không khớp',
              })}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <EyeIcon isVisible={showConfirmPassword} />
            </button>
          </div>
        </FormField>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleReset}
            disabled={!isDirty || changePasswordMutation.isPending}
          >
            Đặt lại
          </button>
          <button
            type="submit"
            className={`btn btn-primary ${styles.btnSubmit}`}
            disabled={!isDirty || changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  );
}

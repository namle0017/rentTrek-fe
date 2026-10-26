import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '@/components/FormField';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { useChangePassword } from '../hooks/useChangePassword';
import styles from './ChangePasswordForm.module.css';

export default function ChangePasswordForm() {
  const changePasswordMutation = useChangePassword();
  const [serverErrorMsg, setServerErrorMsg] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = (values) => {
    setServerErrorMsg('');
    changePasswordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      },
      {
        onSuccess: () => {
          reset({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
          });
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
          Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh và không chia sẻ cho người khác.
        </p>
      </div>

      <div className={styles.securityAlert}>
        <span className={styles.securityAlertIcon}>ℹ️</span>
        <div>
          <strong>Cơ chế bảo vệ phiên (Phương án A):</strong> Sau khi đổi mật khẩu thành công, toàn
          bộ các thiết bị khác đang đăng nhập sẽ tự động bị đăng xuất. Phiên làm việc trên thiết bị
          này vẫn được duy trì an toàn.
        </div>
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
              {showCurrentPassword ? '🙈' : '👁️'}
            </button>
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
                  message:
                    'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
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
              {showNewPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <div className={styles.inputHelper}>
            Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ hoa (A-Z), chữ thường (a-z), chữ số
            (0-9) và ký tự đặc biệt (@, #, $, %, ...).
          </div>
        </FormField>

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
                validate: (val) =>
                  val === getValues('newPassword') || 'Xác nhận mật khẩu mới không khớp',
              })}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
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

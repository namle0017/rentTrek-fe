import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import FormField from '@/components/FormField';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { applyServerErrors } from '@/utils/applyServerErrors';
import AuthLayout from '../components/AuthLayout';
import { useRegister } from '../hooks/useRegister';
import styles from './AuthForm.module.css';

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (isAuthenticated) return <Navigate to={ROUTES.HOME} replace />;

  const handleRegister = (values) => {
    setServerErrorMsg('');
    registerMutation.mutate(
      {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || null,
        password: values.password,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: () => navigate(ROUTES.HOME, { replace: true }),
        onError: (error) => {
          if (error.statusCode === 409) {
            setError('email', { type: 'server', message: error.message });
          } else {
            setServerErrorMsg(error.message);
          }
          applyServerErrors(error, setError);
        },
      },
    );
  };

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Đăng ký để khám phá các gói tour trekking và thuê trang bị dã ngoại"
      alternateText="Đã có tài khoản?"
      alternateLinkText="Đăng nhập ngay"
      alternateLinkTo={ROUTES.LOGIN}
    >
      <form className={styles.authForm} onSubmit={handleSubmit(handleRegister)} noValidate>
        {serverErrorMsg && <div className={styles.errorBanner}>{serverErrorMsg}</div>}

        <FormField label="Họ và tên" htmlFor="fullName" error={errors.fullName}>
          <input
            id="fullName"
            type="text"
            className="input"
            placeholder="VD: Nguyễn Văn A"
            autoComplete="name"
            {...register('fullName', {
              required: 'Họ và tên không được để trống',
              minLength: { value: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' },
              maxLength: { value: 100, message: 'Họ và tên tối đa 100 ký tự' },
            })}
          />
        </FormField>

        <FormField label="Địa chỉ Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="name@example.com"
            autoComplete="email"
            {...register('email', {
              required: 'Email không được để trống',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không đúng định dạng' },
            })}
          />
        </FormField>

        <FormField label="Số điện thoại (tùy chọn)" htmlFor="phone" error={errors.phone}>
          <input
            id="phone"
            type="tel"
            className="input"
            placeholder="VD: 0987654321"
            autoComplete="tel"
            {...register('phone', {
              pattern: {
                value: /^(03|05|07|08|09)\d{8}$/,
                message: 'Số điện thoại Việt Nam không hợp lệ (10 số bắt đầu bằng 03, 05, 07, 08, 09)',
              },
            })}
          />
        </FormField>

        <FormField label="Mật khẩu" htmlFor="password" error={errors.password}>
          <div className={styles.passwordInputWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Tối thiểu 8 ký tự, có hoa, thường, số, ký tự đặc biệt"
              autoComplete="new-password"
              {...register('password', {
                required: 'Mật khẩu không được để trống',
                minLength: { value: 8, message: 'Mật khẩu phải chứa ít nhất 8 ký tự' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
                  message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
                },
              })}
            />
            <button
              type="button"
              className={styles.passwordToggleBtn}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
        </FormField>

        <FormField label="Xác nhận mật khẩu" htmlFor="confirmPassword" error={errors.confirmPassword}>
          <div className={styles.passwordInputWrapper}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className="input"
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Mật khẩu xác nhận không được để trống',
                validate: (val) => val === getValues('password') || 'Mật khẩu xác nhận không khớp',
              })}
            />
            <button
              type="button"
              className={styles.passwordToggleBtn}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showConfirmPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
        </FormField>

        <button
          type="submit"
          className={`btn btn-primary btn-block ${styles.submitBtn}`}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
        </button>
      </form>
    </AuthLayout>
  );
}

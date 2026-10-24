import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import FormField from '@/components/FormField';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { applyServerErrors } from '@/utils/applyServerErrors';
import AuthLayout from '../components/AuthLayout';
import { useLogin } from '../hooks/useLogin';
import styles from './AuthForm.module.css';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const redirectTo = location.state?.from?.pathname ?? ROUTES.HOME;

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const handleLogin = (values) => {
    setServerErrorMsg('');
    loginMutation.mutate(
      { email: values.email.trim(), password: values.password },
      {
        onSuccess: () => navigate(redirectTo, { replace: true }),
        onError: (error) => {
          if (error.statusCode === 401 || error.statusCode === 403) {
            setServerErrorMsg(error.message);
          }
          applyServerErrors(error, setError);
        },
      },
    );
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục trải nghiệm"
      alternateText="Chưa có tài khoản renTrek?"
      alternateLinkText="Đăng ký ngay"
      alternateLinkTo={ROUTES.REGISTER}
    >
      <form className={styles.authForm} onSubmit={handleSubmit(handleLogin)} noValidate>
        {serverErrorMsg && <div className={styles.errorBanner}>{serverErrorMsg}</div>}

        <FormField label="Địa chỉ Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="name@example.com"
            autoComplete="email"
            {...register('email', {
              required: 'Email không được để trống',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không hợp lệ' },
            })}
          />
        </FormField>

        <FormField label="Mật khẩu" htmlFor="password" error={errors.password}>
          <div className={styles.passwordInputWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Nhập mật khẩu của bạn"
              autoComplete="current-password"
              {...register('password', { required: 'Mật khẩu không được để trống' })}
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

        <button
          type="submit"
          className={`btn btn-primary btn-block ${styles.submitBtn}`}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </AuthLayout>
  );
}

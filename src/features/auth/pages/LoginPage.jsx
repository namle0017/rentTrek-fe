import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import FormField from '@/components/FormField';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { useLogin } from '../hooks/useLogin';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const redirectTo = location.state?.from?.pathname ?? ROUTES.HOME;

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  // TODO: đồng bộ tên field với API Contract 1.2 (POST /auth/login) khi BE chốt
  const handleLogin = (values) => {
    loginMutation.mutate(
      { email: values.email.trim(), password: values.password },
      {
        onSuccess: () => navigate(redirectTo, { replace: true }),
        onError: (error) => applyServerErrors(error, setError),
      },
    );
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit(handleLogin)} noValidate>
        <Link to={ROUTES.HOME} className="auth-logo">
          renTrek
        </Link>
        <h1 className="page-title">Đăng nhập</h1>

        <FormField label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            {...register('email', {
              required: 'Email không được để trống',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không hợp lệ' },
            })}
          />
        </FormField>

        <FormField label="Mật khẩu" htmlFor="password" error={errors.password}>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="current-password"
            {...register('password', { required: 'Mật khẩu không được để trống' })}
          />
        </FormField>

        <button type="submit" className="btn btn-primary btn-block" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}

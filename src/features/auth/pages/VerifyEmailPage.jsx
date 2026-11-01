import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '../api/authService';
import styles from './VerifyEmailPage.module.css';

/** Link trong email: /verify-email#t=<token>. Dùng query để StrictMode không gửi token hai lần. */
export default function VerifyEmailPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const token = new URLSearchParams(location.hash.slice(1)).get('t') ?? '';
  const verify = useQuery({
    queryKey: ['auth', 'verify-email', token],
    queryFn: () => authService.verifyEmail(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
  });
  const resend = useMutation({
    mutationFn: authService.resendVerificationEmail,
    onSuccess: (response) => toast.success(response.message || 'Đã gửi lại email xác thực.'),
    onError: (error) => toast.error(error?.message || 'Không thể gửi lại email.'),
  });

  if (verify.isLoading) return <Spinner fullScreen />;

  return (
    <section className={styles.card}>
      {verify.isSuccess ? (
        <>
          <h1>Xác thực email thành công</h1>
          <p>Các chuyến đi đã thanh toán có khai email này đã được gán vào tài khoản của bạn.</p>
          <Link className={styles.action} to={isAuthenticated ? ROUTES.MY_ORDERS : ROUTES.LOGIN}>
            {isAuthenticated ? 'Xem đơn của tôi' : 'Đăng nhập'}
          </Link>
        </>
      ) : (
        <>
          <h1>Không thể xác thực email</h1>
          <p>{verify.error?.message || 'Link xác thực không hợp lệ hoặc đã hết hạn.'}</p>
          {isAuthenticated ? (
            <button type="button" className={styles.action} onClick={() => resend.mutate()} disabled={resend.isPending}>
              {resend.isPending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
            </button>
          ) : (
            <Link className={styles.action} to={ROUTES.LOGIN}>
              Đăng nhập để gửi lại
            </Link>
          )}
        </>
      )}
    </section>
  );
}

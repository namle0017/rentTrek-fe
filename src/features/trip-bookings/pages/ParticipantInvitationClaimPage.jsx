import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import OutdoorIcon from '@/components/OutdoorIcon';
import { ROUTES } from '@/constants/routes';
import { useClaimParticipantInvitation } from '../hooks/useTripBookings';
import styles from './ParticipantInvitationClaimPage.module.css';

export default function ParticipantInvitationClaimPage() {
  const claimInvitation = useClaimParticipantInvitation();
  const [showToken, setShowToken] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [claimedBooking, setClaimedBooking] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { token: '' } });

  const submit = async ({ token }) => {
    setServerMessage('');
    setClaimedBooking(null);
    try {
      const response = await claimInvitation.mutateAsync(token.trim());
      reset({ token: '' });
      setShowToken(false);
      setClaimedBooking(response.data);
    } catch (error) {
      setServerMessage(error?.message || 'Không thể xác nhận lời mời.');
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icon}><OutdoorIcon name="users" size={28} /></div>
        <span className={styles.kicker}>LỜI MỜI THAM GIA</span>
        <h1>Tham gia chuyến đi</h1>
        <p className={styles.intro}>
          Đăng nhập bằng email đã được mời, sau đó nhập token buyer gửi riêng cho bạn.
        </p>

        <form onSubmit={handleSubmit(submit)} noValidate>
          <label htmlFor="invitation-token">Token lời mời</label>
          <div className={styles.inputRow}>
            <input
              id="invitation-token"
              type={showToken ? 'text' : 'password'}
              autoComplete="off"
              spellCheck="false"
              aria-invalid={errors.token ? 'true' : 'false'}
              aria-describedby={errors.token ? 'invitation-token-error' : 'invitation-token-help'}
              placeholder="Nhập token một lần"
              {...register('token', {
                validate: (value) => value.trim().length > 0 || 'Vui lòng nhập token lời mời.',
              })}
            />
            <button type="button" onClick={() => setShowToken((current) => !current)} aria-label={showToken ? 'Ẩn token' : 'Hiện token'}>
              {showToken ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          {errors.token ? (
            <p id="invitation-token-error" className={styles.fieldError} role="alert">{errors.token.message}</p>
          ) : (
            <p id="invitation-token-help" className={styles.help}>Token phân biệt chữ hoa, chữ thường và chỉ dùng một lần.</p>
          )}

          {serverMessage && <div className={styles.serverError}>{serverMessage}</div>}

          <button type="submit" className={styles.submit} disabled={claimInvitation.isPending}>
            {claimInvitation.isPending ? 'Đang xác nhận...' : 'Xác nhận lời mời'}
          </button>
        </form>

        {claimedBooking && (
          <div className={styles.success}>
            <OutdoorIcon name="check" size={21} />
            <div>
              <strong>Đã liên kết tài khoản với chuyến đi.</strong>
              <Link to={ROUTES.TRIP_BOOKING_DETAIL(claimedBooking.orderId)}>
                Xem booking {claimedBooking.orderCode || claimedBooking.orderId}
              </Link>
            </div>
          </div>
        )}

        <aside className={styles.securityNote}>
          Không dán token vào URL, tin nhắn công khai hoặc công cụ phân tích.
        </aside>
      </section>
    </main>
  );
}

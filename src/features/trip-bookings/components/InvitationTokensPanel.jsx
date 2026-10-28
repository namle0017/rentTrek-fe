import { toast } from 'react-toastify';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/formatDate';
import styles from './InvitationTokensPanel.module.css';

export default function InvitationTokensPanel({ invitations }) {
  const copyToken = async (token) => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success('Đã sao chép token.');
    } catch {
      toast.error('Không thể sao chép. Vui lòng chọn và sao chép thủ công.');
    }
  };

  if (!invitations?.length) return null;

  return (
    <section className={styles.panel} aria-labelledby="invitation-token-title">
      <span className={styles.kicker}>TOKEN MỘT LẦN</span>
      <h2 id="invitation-token-title">Lời mời người tham gia</h2>
      <p className={styles.warning}>
        Token chỉ hiển thị trong phiên này. Hãy gửi riêng đúng người nhận và không đưa token vào URL.
        Người nhận đăng nhập bằng email được mời rồi nhập token tại{' '}
        <strong>{window.location.origin}{ROUTES.PARTICIPANT_INVITATION_CLAIM}</strong>.
      </p>
      <div className={styles.list}>
        {invitations.map((invitation) => (
          <article className={styles.item} key={invitation.participantId}>
            <div>
              <strong>{invitation.fullName}</strong>
              <span>{invitation.email}</span>
            </div>
            <code>{invitation.token}</code>
            <small>Hết hạn: {formatDateTime(invitation.expiresAt)}</small>
            <button type="button" onClick={() => copyToken(invitation.token)}>
              Sao chép token
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

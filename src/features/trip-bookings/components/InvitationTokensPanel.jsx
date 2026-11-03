import { toast } from 'react-toastify';
import { formatDateTime } from '@/utils/formatDate';
import { useInviteLink, useRotateInviteLink } from '../hooks/useTripBookings';
import styles from './InvitationTokensPanel.module.css';

const copy = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success('Đã sao chép link.');
  } catch {
    toast.error('Không thể sao chép. Vui lòng chọn và sao chép thủ công.');
  }
};

/** Link chỉ đọc để người đặt dán vào Zalo/Messenger: xem đoàn và lịch hoạt động, không cần đăng nhập. */
export function InviteLinkBox({ orderId }) {
  const { data: link, isError, error } = useInviteLink(orderId);
  const rotateLink = useRotateInviteLink();

  if (isError) return <small>{error?.message || 'Không thể tải link xem chuyến.'}</small>;
  if (!link) return null;

  const share = () =>
    navigator
      .share({ title: 'Xem chuyến đi', text: 'Mở link để xem đoàn và lịch hoạt động.', url: link.url })
      .catch(() => {});
  const rotate = () => {
    if (window.confirm('Link cũ sẽ không dùng được nữa. Bạn có chắc muốn đổi link?')) {
      rotateLink.mutate(orderId);
    }
  };

  return (
    <div className={styles.linkBox}>
      <label htmlFor="invite-link">Link xem chuyến cho nhóm</label>
      <div>
        <input id="invite-link" readOnly value={link.url} onFocus={(event) => event.target.select()} />
        <button type="button" onClick={() => copy(link.url)}>
          Sao chép
        </button>
        {typeof navigator.share === 'function' && (
          <button type="button" onClick={share}>
            Chia sẻ
          </button>
        )}
      </div>
      <small>
        {link.totalSeats} người trong đoàn · Hết hạn: {formatDateTime(link.expiresAt)}
      </small>
      <small>Chỉ hiện họ tên đoàn và lịch hoạt động, không có giá tiền hay liên hệ.</small>
      <div>
        <button type="button" onClick={rotate} disabled={rotateLink.isPending}>
          Đổi link
        </button>
      </div>
    </div>
  );
}

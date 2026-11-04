import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { useUpdateParticipant } from '../hooks/useTripBookings';
import { EMAIL_PATTERN } from '../utils/bookingSubmission';
import styles from './ParticipantRow.module.css';

const linkLabel = (participant) => {
  if (participant.linkedUserId) return 'Đã liên kết tài khoản';
  return participant.email ? 'Chờ tài khoản xác thực email' : 'Không dùng tài khoản';
};

function ParticipantEditForm({ orderId, participant, onClose }) {
  const updateParticipant = useUpdateParticipant();
  const [serverMessage, setServerMessage] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: participant.fullName,
      email: participant.email ?? '',
      phone: participant.phone ?? '',
    },
  });
  const email = watch('email').trim().toLowerCase();
  const emailChanged = participant.linkedUserId && email !== (participant.email ?? '').toLowerCase();

  const save = async (values) => {
    setServerMessage('');
    try {
      await updateParticipant.mutateAsync({
        orderId,
        participantId: participant.participantId,
        payload: {
          fullName: values.fullName.trim(),
          email: values.email.trim() || null,
          phone: values.phone.trim() || null,
        },
      });
      onClose();
    } catch (error) {
      setServerMessage(error?.message || 'Không thể cập nhật người tham gia.');
      applyServerErrors(error, setError);
    }
  };

  const field = (name) => `participant-${participant.participantId}-${name}`;

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(save)(event)} noValidate>
      <div className={styles.grid}>
        <div>
          <label htmlFor={field('fullName')}>Họ và tên</label>
          <input
            id={field('fullName')}
            aria-invalid={errors.fullName ? 'true' : 'false'}
            {...register('fullName', {
              validate: (value) => value.trim() !== '' || 'Vui lòng nhập họ tên.',
              maxLength: { value: 200, message: 'Họ tên tối đa 200 ký tự.' },
            })}
          />
          {errors.fullName && <p role="alert">{errors.fullName.message}</p>}
        </div>
        <div>
          <label htmlFor={field('email')}>Email</label>
          <input
            id={field('email')}
            type="email"
            placeholder="Không bắt buộc"
            aria-invalid={errors.email ? 'true' : 'false'}
            {...register('email', {
              validate: (value) => !value.trim() || EMAIL_PATTERN.test(value.trim()) || 'Email không hợp lệ.',
              maxLength: { value: 255, message: 'Email tối đa 255 ký tự.' },
            })}
          />
          {errors.email && <p role="alert">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor={field('phone')}>Điện thoại</label>
          <input
            id={field('phone')}
            type="tel"
            placeholder="Không bắt buộc"
            aria-invalid={errors.phone ? 'true' : 'false'}
            {...register('phone', { maxLength: { value: 20, message: 'Tối đa 20 ký tự.' } })}
          />
          {errors.phone && <p role="alert">{errors.phone.message}</p>}
        </div>
      </div>
      {emailChanged && (
        <p className={styles.warning}>Đổi email sẽ gỡ quyền xem chuyến của tài khoản đang liên kết.</p>
      )}
      {serverMessage && (
        <p className={styles.serverError} role="alert">
          {serverMessage}
        </p>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onClose}>
          Hủy
        </button>
        <button type="submit" className={styles.primary} disabled={updateParticipant.isPending}>
          {updateParticipant.isPending ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}

export default function ParticipantRow({ orderId, participant, index, canEdit }) {
  const [editing, setEditing] = useState(false);
  const contact = [participant.email, participant.phone].filter(Boolean).join(' · ');

  return (
    <article className={styles.row}>
      <div className={styles.summary}>
        <span className={styles.avatar}>{String(index + 1).padStart(2, '0')}</span>
        <div>
          <strong>{participant.fullName}</strong>
          <small>{contact || 'Không khai liên hệ'}</small>
        </div>
        <span className={participant.linkedUserId ? styles.linked : styles.status}>
          {linkLabel(participant)}
        </span>
        {canEdit && !editing && (
          <button
            type="button"
            className={styles.editButton}
            aria-label={`Sửa ${participant.fullName}`}
            onClick={() => setEditing(true)}
          >
            Sửa
          </button>
        )}
      </div>
      {editing && (
        <ParticipantEditForm orderId={orderId} participant={participant} onClose={() => setEditing(false)} />
      )}
    </article>
  );
}

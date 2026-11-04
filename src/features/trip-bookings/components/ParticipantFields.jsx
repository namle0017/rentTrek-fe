import styles from './ParticipantFields.module.css';

function Field({ id, label, error, required = false, children }) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children(errorId)}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

const MAX_LENGTH = { value: 20, message: 'Tối đa 20 ký tự.' };

export default function ParticipantFields({ index, register, errors = {}, onRemove }) {
  const number = index + 1;
  const input = (field, type, autoComplete, rules) => (errorId) => (
    <input
      id={`participant-${index}-${field}`}
      type={type}
      className={styles.input}
      autoComplete={autoComplete}
      placeholder={rules?.required ? undefined : 'Không bắt buộc'}
      aria-invalid={errors[field] ? 'true' : 'false'}
      aria-describedby={errors[field] ? errorId : undefined}
      {...register(`additionalParticipants.${index}.${field}`, rules)}
    />
  );

  return (
    <section className={styles.card} aria-labelledby={`participant-${index}-title`}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>THÀNH VIÊN {String(number).padStart(2, '0')}</span>
          <h2 id={`participant-${index}-title`}>Người tham gia {number}</h2>
        </div>
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={`Xóa người tham gia ${number}`}
        >
          Xóa
        </button>
      </div>

      <div className={styles.grid}>
        <Field
          id={`participant-${index}-fullName`}
          label={`Họ và tên người ${number}`}
          error={errors.fullName}
          required
        >
          {input('fullName', 'text', 'name', {
            required: 'Vui lòng nhập họ tên.',
            maxLength: { value: 200, message: 'Họ tên tối đa 200 ký tự.' },
          })}
        </Field>
        <Field id={`participant-${index}-email`} label={`Email người ${number}`} error={errors.email}>
          {input('email', 'email', 'email', {
            maxLength: { value: 255, message: 'Email tối đa 255 ký tự.' },
          })}
        </Field>
        <Field id={`participant-${index}-phone`} label={`Số điện thoại người ${number}`} error={errors.phone}>
          {input('phone', 'tel', 'tel', { maxLength: MAX_LENGTH })}
        </Field>
        <Field
          id={`participant-${index}-dateOfBirth`}
          label={`Ngày sinh người ${number}`}
          error={errors.dateOfBirth}
        >
          {input('dateOfBirth', 'date', 'bday')}
        </Field>
        <Field
          id={`participant-${index}-emergencyContactName`}
          label="Người liên hệ khẩn cấp"
          error={errors.emergencyContactName}
        >
          {input('emergencyContactName', 'text', 'off', {
            maxLength: { value: 200, message: 'Tối đa 200 ký tự.' },
          })}
        </Field>
        <Field
          id={`participant-${index}-emergencyContactPhone`}
          label="SĐT khẩn cấp"
          error={errors.emergencyContactPhone}
        >
          {input('emergencyContactPhone', 'tel', 'off', { maxLength: MAX_LENGTH })}
        </Field>
      </div>
      <p className={styles.hint}>
        Email và số điện thoại không bắt buộc. Có email, chuyến sẽ tự xuất hiện trong tài khoản của người tham
        gia sau khi thanh toán.
      </p>
    </section>
  );
}

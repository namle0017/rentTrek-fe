import styles from './ParticipantFields.module.css';

function Field({ id, label, error, required = false, children }) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      {children(errorId)}
      {error && <p id={errorId} className={styles.error} role="alert">{error.message}</p>}
    </div>
  );
}

export default function ParticipantFields({ index, register, errors = {}, onRemove }) {
  const number = index + 1;
  const fieldProps = (name) => ({
    'aria-invalid': errors[name] ? 'true' : 'false',
    'aria-describedby': errors[name] ? `participant-${index}-${name}-error` : undefined,
  });

  return (
    <section className={styles.card} aria-labelledby={`participant-${index}-title`}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>THÀNH VIÊN {String(number).padStart(2, '0')}</span>
          <h2 id={`participant-${index}-title`}>Người tham gia {number}</h2>
        </div>
        <button type="button" className={styles.removeButton} onClick={onRemove} aria-label={`Xóa người tham gia ${number}`}>
          Xóa
        </button>
      </div>

      <div className={styles.grid}>
        <Field id={`participant-${index}-fullName`} label={`Họ và tên người ${number}`} error={errors.fullName} required>
          {(errorId) => <input id={`participant-${index}-fullName`} className={styles.input} autoComplete="name" {...fieldProps('fullName')} aria-describedby={errors.fullName ? errorId : undefined} {...register(`additionalParticipants.${index}.fullName`, { required: 'Vui lòng nhập họ tên.', maxLength: { value: 200, message: 'Họ tên tối đa 200 ký tự.' } })} />}
        </Field>
        <Field id={`participant-${index}-email`} label={`Email người ${number}`} error={errors.email} required>
          {(errorId) => <input id={`participant-${index}-email`} type="email" className={styles.input} autoComplete="email" {...fieldProps('email')} aria-describedby={errors.email ? errorId : undefined} {...register(`additionalParticipants.${index}.email`, { required: 'Vui lòng nhập email.', maxLength: { value: 255, message: 'Email tối đa 255 ký tự.' } })} />}
        </Field>
        <Field id={`participant-${index}-phone`} label="Số điện thoại" error={errors.phone}>
          {(errorId) => <input id={`participant-${index}-phone`} type="tel" className={styles.input} autoComplete="tel" {...fieldProps('phone')} aria-describedby={errors.phone ? errorId : undefined} {...register(`additionalParticipants.${index}.phone`, { maxLength: { value: 20, message: 'Số điện thoại tối đa 20 ký tự.' } })} />}
        </Field>
        <Field id={`participant-${index}-dateOfBirth`} label="Ngày sinh" error={errors.dateOfBirth}>
          {(errorId) => <input id={`participant-${index}-dateOfBirth`} type="date" className={styles.input} {...fieldProps('dateOfBirth')} aria-describedby={errors.dateOfBirth ? errorId : undefined} {...register(`additionalParticipants.${index}.dateOfBirth`)} />}
        </Field>
        <Field id={`participant-${index}-emergencyName`} label="Người liên hệ khẩn cấp" error={errors.emergencyContactName}>
          {(errorId) => <input id={`participant-${index}-emergencyName`} className={styles.input} {...fieldProps('emergencyContactName')} aria-describedby={errors.emergencyContactName ? errorId : undefined} {...register(`additionalParticipants.${index}.emergencyContactName`, { maxLength: { value: 200, message: 'Tên liên hệ tối đa 200 ký tự.' } })} />}
        </Field>
        <Field id={`participant-${index}-emergencyPhone`} label="Số liên hệ khẩn cấp" error={errors.emergencyContactPhone}>
          {(errorId) => <input id={`participant-${index}-emergencyPhone`} type="tel" className={styles.input} {...fieldProps('emergencyContactPhone')} aria-describedby={errors.emergencyContactPhone ? errorId : undefined} {...register(`additionalParticipants.${index}.emergencyContactPhone`, { maxLength: { value: 20, message: 'Số liên hệ tối đa 20 ký tự.' } })} />}
        </Field>
      </div>
    </section>
  );
}

import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { useWriteOperation } from '@/features/operations/hooks/useOperations';
import { applyServerErrors } from '@/utils/applyServerErrors';
import styles from './Operations.module.css';

export default function OperationForm({ fields, values = {}, endpoint, method = 'post', onSuccess, onCancel, submitLabel = 'Lưu thay đổi', transform, children }) {
  const mutation = useWriteOperation();
  const defaults = Object.fromEntries(fields.map((field) => [field.name, values[field.name] ?? field.defaultValue ?? (field.type === 'checkbox' ? false : field.type === 'multiselect' ? [] : '')]));
  const { register, handleSubmit, setError, formState: { errors } } = useForm({ defaultValues: defaults });

  const handleSave = (formValues) => {
    const body = Object.fromEntries(fields.map((field) => {
      let value = formValues[field.name];
      if (typeof value === 'string') value = value.trim();
      if (field.type === 'number') value = value === '' || Number.isNaN(value) ? null : Number(value);
      if (field.type === 'datetime-local') value = value ? dayjs(value).toISOString() : null;
      if (field.type === 'date') value ||= null;
      if (!field.required && value === '' && field.nullable !== false) value = null;
      return [field.name, value];
    }));
    let payload;
    try { payload = transform ? transform(body) : body; }
    catch (error) { setError('root', { message: error.message }); return; }
    mutation.mutate({ endpoint, method, body: payload }, {
      onSuccess: (response) => onSuccess?.(response.data),
      onError: (error) => { applyServerErrors(error, setError); setError('root', { message: error.message }); },
    });
  };

  return <form className={styles.form} onSubmit={handleSubmit(handleSave)}>
    <div className={styles.formGrid}>{fields.map((field) => <label className={styles.field} key={field.name}>
      <span>{field.label}{field.required && ' *'}</span>
      {field.type === 'textarea' ? <textarea {...register(field.name, { required: field.required && 'Vui lòng nhập trường này', maxLength: field.maxLength })} />
        : field.type === 'select' || field.type === 'multiselect' ? <select multiple={field.type === 'multiselect'} {...register(field.name, { required: field.required && 'Vui lòng chọn giá trị' })}>
          {field.type !== 'multiselect' && <option value="">Chọn {field.label.toLowerCase()}</option>}
          {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
          : <input type={field.type ?? 'text'} step={field.step ?? (field.type === 'number' ? 'any' : undefined)} autoComplete={field.type === 'password' ? 'new-password' : undefined} {...register(field.name, {
            required: field.required && 'Vui lòng nhập trường này',
            maxLength: field.maxLength ? { value: field.maxLength, message: `Tối đa ${field.maxLength} ký tự` } : undefined,
            minLength: field.minLength ? { value: field.minLength, message: `Ít nhất ${field.minLength} ký tự` } : undefined,
            min: field.min === undefined ? undefined : { value: field.min, message: `Giá trị nhỏ nhất: ${field.min}` },
            max: field.max === undefined ? undefined : { value: field.max, message: `Giá trị lớn nhất: ${field.max}` },
            pattern: field.type === 'tel' ? { value: /^(03|05|07|08|09)\d{8}$/, message: 'Số điện thoại Việt Nam gồm 10 chữ số' } : field.type === 'email' ? { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' } : undefined,
          })} />}
      {field.hint && <small>{field.hint}</small>}{errors[field.name] && <span className={styles.error} role="alert">{errors[field.name].message}</span>}
    </label>)}</div>
    {children}
    {errors.root && <p role="alert" className={styles.error}>{errors.root.message}</p>}
    <footer className={styles.footer}>{onCancel && <button type="button" className={styles.secondary} disabled={mutation.isPending} onClick={onCancel}>Đóng</button>}<button className={styles.primary} disabled={mutation.isPending}>{mutation.isPending ? 'Đang lưu…' : submitLabel}</button></footer>
  </form>;
}

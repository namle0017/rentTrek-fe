import { useForm } from 'react-hook-form';
import FormField from '@/components/FormField';

const EMPTY_VALUES = { name: '', pricePerDay: '', quantity: '', description: '' };

/**
 * Form dùng chung cho tạo / sửa sản phẩm.
 * `onSubmit(values, { setError })` — page gọi mutation và gắn lỗi BE qua applyServerErrors.
 */
export default function ProductForm({
  defaultValues = EMPTY_VALUES,
  onSubmit,
  isSubmitting,
  submitLabel = 'Lưu',
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues });

  const handleFormSubmit = (values) => {
    onSubmit({ ...values, name: values.name.trim(), description: values.description.trim() }, { setError });
  };

  return (
    <form className="card form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <FormField label="Tên sản phẩm" htmlFor="name" error={errors.name}>
        <input
          id="name"
          className="input"
          {...register('name', {
            required: 'Tên sản phẩm không được để trống',
            maxLength: { value: 200, message: 'Tên sản phẩm tối đa 200 ký tự' },
          })}
        />
      </FormField>

      <FormField label="Giá thuê / ngày (VND)" htmlFor="pricePerDay" error={errors.pricePerDay}>
        <input
          id="pricePerDay"
          type="number"
          className="input"
          {...register('pricePerDay', {
            valueAsNumber: true,
            required: 'Giá thuê không được để trống',
            min: { value: 1, message: 'Giá thuê phải lớn hơn 0' },
          })}
        />
      </FormField>

      <FormField label="Số lượng" htmlFor="quantity" error={errors.quantity}>
        <input
          id="quantity"
          type="number"
          className="input"
          {...register('quantity', {
            valueAsNumber: true,
            required: 'Số lượng không được để trống',
            min: { value: 0, message: 'Số lượng không được âm' },
          })}
        />
      </FormField>

      <FormField label="Mô tả" htmlFor="description" error={errors.description}>
        <textarea id="description" rows={4} className="input" {...register('description')} />
      </FormField>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : submitLabel}
      </button>
    </form>
  );
}

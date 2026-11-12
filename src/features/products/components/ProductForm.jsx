import { useForm } from 'react-hook-form';
import FormField from '@/components/FormField';
import { useProductCategories } from '../hooks/useProducts';

// Khớp BE SaveProductRequest { name, categoryId, description, status }
const EMPTY_VALUES = { name: '', categoryId: '', description: '', status: 'Draft' };
const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Nháp' },
  { value: 'Active', label: 'Đang bán' },
  { value: 'Inactive', label: 'Ngừng bán' },
];

/**
 * Form dùng chung cho tạo / sửa sản phẩm cha. Giá thuê và tồn kho nằm ở biến thể / thiết bị, không ở đây.
 * `onSubmit(values, { setError })` — page gọi mutation và gắn lỗi BE qua applyServerErrors.
 */
export default function ProductForm({
  defaultValues = EMPTY_VALUES,
  onSubmit,
  isSubmitting,
  submitLabel = 'Lưu',
}) {
  const { data: categories = [], isLoading: isLoadingCategories } = useProductCategories();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues });

  const handleFormSubmit = (values) => {
    onSubmit(
      { ...values, name: values.name.trim(), description: values.description.trim() || null },
      { setError },
    );
  };

  return (
    <form className="card form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <FormField label="Tên sản phẩm" htmlFor="name" error={errors.name}>
        <input
          id="name"
          className="input"
          {...register('name', {
            validate: (value) => value.trim() !== '' || 'Tên sản phẩm không được để trống',
            maxLength: { value: 255, message: 'Tên sản phẩm tối đa 255 ký tự' },
          })}
        />
      </FormField>

      <FormField label="Danh mục" htmlFor="categoryId" error={errors.categoryId}>
        <select
          id="categoryId"
          className="input"
          disabled={isLoadingCategories}
          {...register('categoryId', { required: 'Danh mục không được để trống' })}
        >
          <option value="">{isLoadingCategories ? 'Đang tải danh mục...' : '-- Chọn danh mục --'}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Trạng thái" htmlFor="status" error={errors.status}>
        <select id="status" className="input" {...register('status')}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Mô tả" htmlFor="description" error={errors.description}>
        <textarea
          id="description"
          rows={4}
          className="input"
          {...register('description', { maxLength: { value: 4000, message: 'Mô tả tối đa 4000 ký tự' } })}
        />
      </FormField>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : submitLabel}
      </button>
    </form>
  );
}

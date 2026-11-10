import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { useOperations } from '@/features/operations/hooks/useOperations';
import OperationForm from '@/features/operations/components/OperationForm';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import { useAdminProduct } from '../hooks/useAdminCatalog';
import styles from './AdminCatalogPage.module.css';

export default function AdminProductEditorPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productQuery = useAdminProduct(productId);
  const categories = useOperations(API_ENDPOINTS.ADMIN.CATEGORIES);
  if (categories.isPending || (productId && productQuery.isPending)) return <Spinner />;
  const failed = categories.isError ? categories : productQuery.isError ? productQuery : null;
  if (failed) return <ErrorState message={failed.error.message} onRetry={failed.refetch} />;
  const product = productQuery.data;
  const categoryOptions = categories.data
    .filter(
      (category) =>
        category.categoryType !== 'Tour' &&
        (category.isActive || category.categoryId === product?.categoryId),
    )
    .map((category) => ({ value: category.categoryId, label: category.name }));
  if (product?.categoryId && !categoryOptions.some((category) => category.value === product.categoryId)) {
    categoryOptions.push({ value: product.categoryId, label: product.categoryName });
  }
  const fields = [
    { name: 'name', label: 'Tên sản phẩm', required: true, maxLength: 255 },
    { name: 'categoryId', label: 'Danh mục', type: 'select', required: true, options: categoryOptions },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select',
      required: true,
      options: [
        { value: 'Inactive', label: 'Tạm ngưng / chưa đăng' },
        { value: 'Active', label: 'Đăng công khai' },
      ],
    },
    { name: 'description', label: 'Mô tả', type: 'textarea', maxLength: 4000 },
  ];
  return (
    <section className={styles.page}>
      <Link to={productId ? ROUTES.ADMIN_PRODUCT_DETAIL(productId) : ROUTES.ADMIN_PRODUCTS}>
        ← Quay lại sản phẩm
      </Link>
      <div className={styles.header}>
        <div>
          <h1>{productId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
          <p className={styles.description}>
            {productId
              ? 'Cập nhật thông tin và trạng thái hiển thị.'
              : 'Lưu thông tin trước, sau đó thêm biến thể, ảnh và giá thuê ở trang chi tiết.'}
          </p>
        </div>
      </div>
      {!categoryOptions.length ? (
        <p>Chưa có danh mục thiết bị. Vui lòng tạo danh mục trong phần Danh mục & địa điểm.</p>
      ) : (
        <div className="card">
          <OperationForm
            key={productId ?? 'new'}
            fields={fields}
            values={product ?? { status: 'Inactive' }}
            endpoint={
              productId
                ? API_ENDPOINTS.PRODUCT_MANAGEMENT.BY_ID(productId)
                : API_ENDPOINTS.PRODUCT_MANAGEMENT.ROOT
            }
            method={productId ? 'put' : 'post'}
            submitLabel={productId ? 'Lưu sản phẩm' : 'Tạo sản phẩm'}
            onCancel={() =>
              navigate(productId ? ROUTES.ADMIN_PRODUCT_DETAIL(productId) : ROUTES.ADMIN_PRODUCTS)
            }
            onSuccess={(createdId) => {
              queryClient.invalidateQueries();
              navigate(ROUTES.ADMIN_PRODUCT_DETAIL(productId ?? createdId));
            }}
          />
        </div>
      )}
    </section>
  );
}

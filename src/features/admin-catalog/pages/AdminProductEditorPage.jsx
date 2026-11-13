import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, HelpCircle, Layers } from 'lucide-react';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { useOperations } from '@/features/operations/hooks/useOperations';
import OperationForm from '@/features/operations/components/OperationForm';
import Breadcrumb from '@/components/Breadcrumb';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import { useAdminProduct } from '../hooks/useAdminCatalog';
import styles from './AdminProductEditorPage.module.css';

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
    <section className={styles.page} aria-label="Soạn thảo sản phẩm">
      {/* 1. Breadcrumb */}
      <header className={styles.pageHeader}>
        <Breadcrumb
          items={[
            { label: 'Quản lý Sản phẩm', to: ROUTES.ADMIN_PRODUCTS },
            productId && product?.name
              ? { label: product.name, to: ROUTES.ADMIN_PRODUCT_DETAIL(productId) }
              : null,
            { label: productId ? 'Chỉnh sửa' : 'Thêm sản phẩm mới' },
          ]}
        />
      </header>

      {/* 2. 2-Column Layout */}
      {!categoryOptions.length ? (
        <div className={styles.emptyNotice}>
          Chưa có danh mục thiết bị trong hệ thống. Vui lòng tạo danh mục thiết bị trong phần{' '}
          <Link to="/admin/master-data">Danh mục & địa điểm</Link> trước khi tạo sản phẩm.
        </div>
      ) : (
        <div className={styles.layout}>
          {/* CỘT TRÁI (65%): Form nhập liệu */}
          <div className={styles.mainCol}>
            <div className={styles.formCard}>
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
          </div>

          {/* CỘT PHẢI (35%): Hướng dẫn & Ngữ cảnh sản phẩm */}
          <aside className={styles.sideCol}>
            <div className={styles.guideCard}>
              <div className={styles.guideHeading}>
                <Layers size={18} />
                <h2>Quy trình thiết lập sản phẩm</h2>
              </div>

              <ol className={styles.stepsList}>
                <li className={styles.stepItem}>
                  <span className={styles.stepNumberActive}>1</span>
                  <div className={styles.stepBody}>
                    <strong className={styles.stepTitle}>Thông tin cơ bản (Hiện tại)</strong>
                    <p className={styles.stepDesc}>
                      Xác định tên hiển thị, danh mục thiết bị và mô tả tính năng.
                    </p>
                  </div>
                </li>

                <li className={styles.stepItem}>
                  <span className={styles.stepNumberUpcoming}>2</span>
                  <div className={styles.stepBody}>
                    <strong className={styles.stepTitle}>Biến thể SKU & Hình ảnh</strong>
                    <p className={styles.stepDesc}>
                      Thêm kích cỡ, màu sắc, mã SKU và tải ảnh thực tế cho từng biến thể.
                    </p>
                  </div>
                </li>

                <li className={styles.stepItem}>
                  <span className={styles.stepNumberUpcoming}>3</span>
                  <div className={styles.stepBody}>
                    <strong className={styles.stepTitle}>Cấu hình bậc giá thuê</strong>
                    <p className={styles.stepDesc}>
                      Thiết lập bảng giá theo ngày (1–3 ngày, 4–7 ngày...) để kích hoạt đặt thuê.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {productId && product && (
              <div className={styles.contextSummaryCard}>
                <h3 className={styles.contextTitle}>Thông tin sản phẩm đang sửa</h3>
                <div className={styles.contextMetaList}>
                  <span>
                    Danh mục: <strong>{product.categoryName}</strong>
                  </span>
                  <span>
                    Biến thể hiện có: <strong>{product.variants?.length || 0} biến thể</strong>
                  </span>
                </div>
                <Link
                  to={ROUTES.ADMIN_PRODUCT_DETAIL(productId)}
                  className={styles.returnLink}
                >
                  <ArrowLeft size={13} /> Quay lại trang chi tiết sản phẩm
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { applyServerErrors } from '@/utils/applyServerErrors';
import ProductForm from '../components/ProductForm';
import { useCreateProduct } from '../hooks/useProducts';

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  const handleCreate = (values, { setError }) => {
    createProduct.mutate(values, {
      // BE trả ApiResponse<Guid> → res.data chính là id
      onSuccess: (res) => navigate(ROUTES.ADMIN_PRODUCT_DETAIL(res.data)),
      onError: (error) => applyServerErrors(error, setError),
    });
  };

  return (
    <section>
      <button
        type="button"
        className="btn btn-outline"
        style={{ fontSize: "var(--font-size-control)", padding: '5px 12px', marginBottom: 12 }}
        onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
      >
        ← Quay lại danh sách sản phẩm
      </button>
      <h1 className="page-title">Thêm sản phẩm</h1>
      <ProductForm
        onSubmit={handleCreate}
        isSubmitting={createProduct.isPending}
        submitLabel="Tạo sản phẩm"
      />
    </section>
  );
}

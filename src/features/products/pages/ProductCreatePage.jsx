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
      onSuccess: (res) => navigate(ROUTES.PRODUCT_DETAIL(res.data.id)),
      onError: (error) => applyServerErrors(error, setError),
    });
  };

  return (
    <section>
      <h1 className="page-title">Thêm sản phẩm</h1>
      <ProductForm
        onSubmit={handleCreate}
        isSubmitting={createProduct.isPending}
        submitLabel="Tạo sản phẩm"
      />
    </section>
  );
}

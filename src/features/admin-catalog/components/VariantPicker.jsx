import { useState } from 'react';
import { PRODUCT_STATUS } from '../constants/adminCatalogStatus';
import { useAdminProduct, useAdminProducts } from '../hooks/useAdminCatalog';
import pageStyles from '../pages/AdminCatalogPage.module.css';
import bundleStyles from '../pages/AdminBundle.module.css';

const PRODUCT_PICKER_PARAMS = { pageNumber: 1, pageSize: 100 };

/** Chọn sản phẩm → biến thể đang cho thuê + số lượng. Dùng cho combo và đồ cấp theo tour. */
export default function VariantPicker({ onAdd, children }) {
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { data: pagedProducts } = useAdminProducts(PRODUCT_PICKER_PARAMS);
  const { data: product } = useAdminProduct(productId);
  const variants = product?.variants.filter((variant) => variant.status === PRODUCT_STATUS.ACTIVE) ?? [];

  const handleAdd = () => {
    const variant = variants.find((item) => item.variantId === variantId);
    if (!variant) return;
    onAdd({
      productVariantId: variant.variantId,
      productName: product.name,
      variantName: variant.name,
      sku: variant.sku,
      quantity: Math.max(1, Number(quantity) || 1),
    });
    setVariantId('');
    setQuantity(1);
  };

  return (
    <div className={bundleStyles.row}>
      <label className={pageStyles.field}>
        <span>Sản phẩm</span>
        <select
          value={productId}
          onChange={(event) => {
            setProductId(event.target.value);
            setVariantId('');
          }}
        >
          <option value="">Chọn sản phẩm</option>
          {pagedProducts?.items.map((item) => (
            <option key={item.productId} value={item.productId}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className={pageStyles.field}>
        <span>Biến thể</span>
        <select
          value={variantId}
          disabled={!productId}
          onChange={(event) => setVariantId(event.target.value)}
        >
          <option value="">Chọn biến thể</option>
          {variants.map((variant) => (
            <option key={variant.variantId} value={variant.variantId}>
              {variant.name} · {variant.sku}
            </option>
          ))}
        </select>
      </label>
      <label className={pageStyles.field}>
        <span>Số lượng</span>
        <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
      </label>
      {children}
      <button type="button" className="btn btn-outline" disabled={!variantId} onClick={handleAdd}>
        Thêm
      </button>
    </div>
  );
}

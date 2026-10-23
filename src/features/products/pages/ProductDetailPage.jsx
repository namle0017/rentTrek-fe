import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import NotFoundPage from '@/pages/NotFoundPage';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductImage from '../components/ProductImage';
import ProductOfferingBadges from '../components/ProductOfferingBadges';
import { useProduct } from '../hooks/useProducts';
import styles from './ProductCatalog.module.css';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const [selection, setSelection] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);

  if (isLoading) return <Spinner />;
  if (isError && error.statusCode === 404) return <NotFoundPage />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!product?.variants.length) return <EmptyState message="Sản phẩm chưa có biến thể để hiển thị" />;

  const variant =
    product.variants.find(
      (candidate) => selection?.productId === product.id && candidate.id === selection.variantId,
    ) ?? product.variants[0];
  const selectedImage = variant.images.find((image) => image.id === selectedImageId) ?? variant.images[0];
  const isRentable = variant.rentalPriceTiers.length > 0;
  const isForSale = variant.salePrice !== null;

  const handleVariantChange = (variantId) => {
    setSelection({ productId: product.id, variantId });
    setSelectedImageId(null);
  };

  return (
    <article>
      <nav className={styles.breadcrumb} aria-label="Đường dẫn">
        <Link to={ROUTES.PRODUCTS}>← Sản phẩm</Link>
        <span>/</span>
        <span>{product.categoryName}</span>
      </nav>
      <div className={styles.detailGrid}>
        <section aria-label="Ảnh sản phẩm">
          <ProductImage
            src={selectedImage?.imageUrl}
            alt={`${product.name} — ${variant.name}`}
            className={styles.mainImage}
            loading="eager"
          />
          {variant.images.length > 1 && (
            <div className={styles.thumbnails}>
              {variant.images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={styles.thumbnailButton}
                  aria-label={`Xem ảnh ${index + 1}`}
                  aria-pressed={selectedImage?.id === image.id}
                  onClick={() => setSelectedImageId(image.id)}
                >
                  <ProductImage src={image.imageUrl} alt={`${product.name}, ảnh ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </section>
        <section className={`card ${styles.productInfo}`}>
          <p className={styles.eyebrow}>{product.categoryName}</p>
          <h1>{product.name}</h1>
          <ProductOfferingBadges isRentable={isRentable} isForSale={isForSale} />
          <fieldset className={styles.variantPicker}>
            <legend>Chọn phiên bản</legend>
            <div className={styles.variantButtons}>
              {product.variants.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className="btn btn-outline"
                  aria-pressed={variant.id === candidate.id}
                  onClick={() => handleVariantChange(candidate.id)}
                >
                  {candidate.name}
                </button>
              ))}
            </div>
          </fieldset>
          <dl className={styles.specifications}>
            <dt>Mã sản phẩm</dt>
            <dd>{variant.sku}</dd>
            {variant.size && (
              <>
                <dt>Kích cỡ</dt>
                <dd>{variant.size}</dd>
              </>
            )}
            {variant.color && (
              <>
                <dt>Màu sắc</dt>
                <dd>{variant.color}</dd>
              </>
            )}
          </dl>
          {isForSale && (
            <div className={styles.salePrice}>
              Giá bán <strong>{formatCurrency(variant.salePrice)}</strong>
            </div>
          )}
          {isRentable && (
            <div className={styles.rentalPrices}>
              <h2>Bảng giá thuê</h2>
              <table>
                <caption>Giá theo ngày cho phiên bản {variant.name}</caption>
                <thead>
                  <tr>
                    <th scope="col">Thời gian thuê</th>
                    <th scope="col">Giá / ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {variant.rentalPriceTiers.map((tier) => (
                    <tr key={tier.id}>
                      <td>
                        {tier.maxDays === null
                          ? `Từ ${tier.minDays} ngày`
                          : tier.minDays === tier.maxDays
                            ? `${tier.minDays} ngày`
                            : `${tier.minDays}–${tier.maxDays} ngày`}
                      </td>
                      <td>{formatCurrency(tier.dailyPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className={styles.note}>
            Giá tính bằng VND. Tình trạng còn hàng và lịch thuê cần được xác nhận khi đặt hàng.
          </p>
        </section>
      </div>
      <section className={`card ${styles.description}`}>
        <h2>Thông tin sản phẩm</h2>
        <p>{product.description || 'Thông tin chi tiết đang được cập nhật.'}</p>
      </section>
    </article>
  );
}

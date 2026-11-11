import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import { DetailSkeleton } from '@/components/skeleton';
import { ROUTES } from '@/constants/routes';
import NotFoundPage from '@/pages/NotFoundPage';
import { formatCurrency } from '@/utils/formatCurrency';
import RentalConfigurator from '@/features/rentals/components/RentalConfigurator';
import ProductImage from '../components/ProductImage';
import { useProduct } from '../hooks/useProducts';
import styles from './ProductDetail.module.css';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const [selection, setSelection] = useState(null);
  const [imageSelection, setImageSelection] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [productId]);

  if (isLoading) return <DetailSkeleton />;
  if (isError && error.statusCode === 404) return <NotFoundPage />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!product?.variants?.length) return <EmptyState message="Sản phẩm chưa có biến thể để hiển thị" />;

  const variant =
    product.variants.find(
      (candidate) => selection?.productId === product.id && candidate.id === selection.variantId,
    ) ?? product.variants[0];
  const images = variant.images || [];
  const selectedImageIndex =
    imageSelection?.variantId === variant.id
      ? Math.max(
          0,
          images.findIndex((image) => image.id === imageSelection.imageId),
        )
      : 0;
  const selectedImage = images[selectedImageIndex];
  const isRentable = (variant.rentalPriceTiers?.length ?? 0) > 0;
  const isForSale = variant.salePrice !== null && variant.salePrice !== undefined;
  const minimumDailyPrice = isRentable
    ? Math.min(...variant.rentalPriceTiers.map((tier) => tier.dailyPrice))
    : null;

  const selectImage = (index) => setImageSelection({ variantId: variant.id, imageId: images[index].id });
  const moveImage = (direction) =>
    selectImage((selectedImageIndex + direction + images.length) % images.length);
  const handleVariantChange = (variantId) => {
    setSelection({ productId: product.id, variantId });
    setImageSelection(null);
  };

  return (
    <article className={styles.detailPage}>
      {/* 1. Breadcrumb Full-width */}
      <Breadcrumb
        items={[
          { label: 'Trang chủ', to: ROUTES.HOME },
          { label: 'Dụng cụ thuê', to: ROUTES.PRODUCTS },
          product.categoryName ? { label: product.categoryName } : null,
          { label: product.name },
        ]}
      />

      {/* 2. Main Content: Hai cột 58% / 42% */}
      <div className={styles.detailGrid}>
        {/* CỘT TRÁI (55–60%): Gallery 4:3, Cho thuê badge, Tên h1, SKU, Divider, Thông tin sản phẩm */}
        <div className={styles.story}>
          {/* Gallery 4:3 với Thumbnail bên dưới */}
          <section
            className={styles.gallery}
            aria-label="Ảnh sản phẩm"
            aria-roledescription="thư viện ảnh"
            onKeyDown={(event) => {
              if (images.length < 2 || event.target.closest('button')) return;
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                moveImage(-1);
              }
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                moveImage(1);
              }
            }}
            tabIndex={images.length > 1 ? 0 : undefined}
          >
            {/* Ảnh chính tỷ lệ chuẩn 4:3 */}
            <div className={styles.mainImageWrapper}>
              <ProductImage
                src={
                  selectedImage?.imageUrl === '/images/products/tent.svg'
                    ? '/images/product-detail/tent-forest.jpg'
                    : selectedImage?.imageUrl
                }
                alt={`${product.name} — ${variant.name}`}
                className={styles.mainImage}
                loading="eager"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.galleryArrow} ${styles.previous}`}
                    aria-label="Ảnh trước"
                    onClick={() => moveImage(-1)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={`${styles.galleryArrow} ${styles.next}`}
                    aria-label="Ảnh tiếp theo"
                    onClick={() => moveImage(1)}
                  >
                    ›
                  </button>
                  <span className={styles.imageCounter} aria-live="polite" aria-atomic="true">
                    {images.length > 0 ? `${selectedImageIndex + 1} / ${images.length}` : 'Chưa có ảnh'}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail strip bên dưới nếu có nhiều ảnh */}
            {images.length > 1 && (
              <div className={styles.thumbnailStrip} role="tablist" aria-label="Danh sách ảnh thu nhỏ">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    role="tab"
                    className={`${styles.thumbnailBtn} ${selectedImageIndex === index ? styles.thumbnailActive : ''}`}
                    aria-label={`Xem ảnh ${index + 1}`}
                    aria-selected={selectedImageIndex === index}
                    onClick={() => selectImage(index)}
                  >
                    <ProductImage
                      src={
                        image.imageUrl === '/images/products/tent.svg'
                          ? '/images/product-detail/tent-forest.jpg'
                          : image.imageUrl
                      }
                      alt=""
                      className={styles.thumbnailImage}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Badge Cho thuê */}
          <div className={styles.badgeRow}>
            {isRentable && <span className={styles.rentalBadge}>Cho thuê</span>}
            {isForSale && <span className={styles.saleBadge}>Bán đứt</span>}
          </div>

          {/* Tên sản phẩm h1 */}
          <h1 className={styles.productName}>{product.name}</h1>

          {/* Mã sản phẩm */}
          <p className={styles.productSku}>
            Mã sản phẩm: <span>{variant.sku}</span>
          </p>

          {/* Đường kẻ phân cách */}
          <hr className={styles.divider} />

          {/* Bảng Thông tin sản phẩm */}
          <section className={styles.productInfoSection} aria-labelledby="product-info-heading">
            <h2 id="product-info-heading" className={styles.productInfoHeading}>
              Thông tin sản phẩm
            </h2>

            <div className={styles.infoTable}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Danh mục</span>
                <span className={styles.infoValue}>{product.categoryName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phiên bản</span>
                <span className={styles.infoValue}>{variant.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Mã sản phẩm</span>
                <span className={styles.infoValue}>{variant.sku}</span>
              </div>
              {variant.size && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Kích cỡ</span>
                  <span className={styles.infoValue}>{variant.size}</span>
                </div>
              )}
              {variant.color && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Màu sắc</span>
                  <span className={styles.infoValue}>{variant.color}</span>
                </div>
              )}
            </div>

            {/* Mô tả chi tiết nếu có */}
            {product.description && (
              <div className={styles.descriptionSection}>
                <h3 className={styles.descriptionHeading}>Mô tả chi tiết</h3>
                <p className={styles.descriptionText}>{product.description}</p>
              </div>
            )}
          </section>

          {/* Khám phá thêm thiết bị (nằm ngoài form chính theo yêu cầu) */}
          <section className={styles.exploreSection} aria-label="Khám phá thêm">
            <div className={styles.exploreCard}>
              <div className={styles.exploreContent}>
                <span className={styles.exploreKicker}>TRANG BỊ DÃ NGOẠI</span>
                <h3>Cần thêm trang bị cho hành trình?</h3>
                <p>Khám phá đầy đủ lều trại, túi ngủ, balo leo núi và dụng cụ cắm trại chuyên dụng.</p>
              </div>
              <Link to={ROUTES.PRODUCTS} className={styles.exploreLink}>
                <span>Xem tất cả thiết bị</span>
                <OutdoorIcon name="arrow" size={16} />
              </Link>
            </div>
          </section>
        </div>

        {/* CỘT PHẢI (40–45%): Unified Rental Configuration Card */}
        <aside className={styles.sidebarColumn} aria-label="Cấu hình thuê sản phẩm">
          {isRentable ? (
            <RentalConfigurator
              key={variant.id}
              product={product}
              variant={variant}
              onVariantChange={handleVariantChange}
              minimumDailyPrice={minimumDailyPrice}
            />
          ) : (
            <div className={styles.saleOnlyCard}>
              <header className={styles.saleOnlyHeader}>
                <span className={styles.saleOnlyEyebrow}>SẢN PHẨM MUA ĐỨT</span>
                <h2>{variant.name}</h2>
              </header>
              {isForSale && (
                <div className={styles.salePriceRow}>
                  <span>Giá bán:</span>
                  <strong>{formatCurrency(variant.salePrice)}</strong>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}

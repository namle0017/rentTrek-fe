import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import NotFoundPage from '@/pages/NotFoundPage';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductImage from '../components/ProductImage';
import ProductOfferingBadges from '../components/ProductOfferingBadges';
import { useProduct } from '../hooks/useProducts';
import styles from './ProductDetail.module.css';

const informationTabs = [
  { id: 'specifications', label: 'Thông số kỹ thuật' },
  { id: 'description', label: 'Thông tin sản phẩm' },
];

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const [selection, setSelection] = useState(null);
  const [imageSelection, setImageSelection] = useState(null);
  const [activeTab, setActiveTab] = useState('specifications');

  if (isLoading) return <Spinner />;
  if (isError && error.statusCode === 404) return <NotFoundPage />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!product?.variants.length) return <EmptyState message="Sản phẩm chưa có biến thể để hiển thị" />;

  const variant =
    product.variants.find(
      (candidate) => selection?.productId === product.id && candidate.id === selection.variantId,
    ) ?? product.variants[0];
  const images = variant.images;
  const selectedImageIndex =
    imageSelection?.variantId === variant.id
      ? Math.max(
          0,
          images.findIndex((image) => image.id === imageSelection.imageId),
        )
      : 0;
  const selectedImage = images[selectedImageIndex];
  const isRentable = variant.rentalPriceTiers.length > 0;
  const isForSale = variant.salePrice !== null && variant.salePrice !== undefined;
  const minimumDailyPrice = isRentable
    ? Math.min(...variant.rentalPriceTiers.map((tier) => tier.dailyPrice))
    : null;
  const specifications = [
    { label: 'Mã sản phẩm', value: variant.sku },
    ...(variant.size ? [{ label: 'Kích cỡ', value: variant.size }] : []),
    ...(variant.color ? [{ label: 'Màu sắc', value: variant.color }] : []),
  ];
  const selectImage = (index) => setImageSelection({ variantId: variant.id, imageId: images[index].id });
  const moveImage = (direction) =>
    selectImage((selectedImageIndex + direction + images.length) % images.length);
  const handleVariantChange = (variantId) => {
    setSelection({ productId: product.id, variantId });
    setImageSelection(null);
  };
  const selectTabWithKeyboard = (event, index) => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % informationTabs.length;
    else if (event.key === 'ArrowLeft')
      nextIndex = (index + informationTabs.length - 1) % informationTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = informationTabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(informationTabs[nextIndex].id);
    document.getElementById(`detail-tab-${informationTabs[nextIndex].id}`)?.focus();
  };

  return (
    <article className={styles.detailPage}>
      <nav className={styles.breadcrumb} aria-label="Đường dẫn">
        <Link to={ROUTES.PRODUCTS}>← Dụng cụ thuê</Link>
        <span>/</span>
        <span>{product.categoryName}</span>
      </nav>
      <div className={styles.detailGrid}>
        <div className={styles.story}>
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
            {images.length > 1 && (
              <ProductImage
                src={images[(selectedImageIndex + 1) % images.length].imageUrl}
                alt=""
                className={styles.backdropImage}
                loading="eager"
              />
            )}
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
                <div className={styles.imageDots} aria-label="Chọn ảnh sản phẩm">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      aria-label={`Xem ảnh ${index + 1}`}
                      aria-pressed={selectedImageIndex === index}
                      onClick={() => selectImage(index)}
                    />
                  ))}
                </div>
              </>
            )}
            <span className={styles.imageCounter} aria-live="polite" aria-atomic="true">
              {images.length > 0 ? `${selectedImageIndex + 1} / ${images.length}` : 'Chưa có ảnh'}
            </span>
          </section>
          <section className={styles.productIntro} aria-labelledby="product-title">
            <ProductOfferingBadges isRentable={isRentable} isForSale={isForSale} />
            <h1 id="product-title">{product.name}</h1>
            <p className={styles.introDescription}>
              {product.description || 'Thông tin chi tiết đang được cập nhật.'}
            </p>
            <dl className={styles.highlights}>
              {specifications.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className={styles.information} aria-label="Thông tin chi tiết">
            <div className={styles.tabs} role="tablist" aria-label="Thông tin sản phẩm">
              {informationTabs.map((tab, index) => (
                <button
                  key={tab.id}
                  id={`detail-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`detail-panel-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(event) => selectTabWithKeyboard(event, index)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div
              id="detail-panel-specifications"
              role="tabpanel"
              aria-labelledby="detail-tab-specifications"
              hidden={activeTab !== 'specifications'}
              tabIndex={0}
              className={styles.tabPanel}
            >
              <dl className={styles.specifications}>
                <div>
                  <dt>Danh mục</dt>
                  <dd>{product.categoryName}</dd>
                </div>
                <div>
                  <dt>Phiên bản</dt>
                  <dd>{variant.name}</dd>
                </div>
                {specifications.map((spec) => (
                  <div key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div
              id="detail-panel-description"
              role="tabpanel"
              aria-labelledby="detail-tab-description"
              hidden={activeTab !== 'description'}
              tabIndex={0}
              className={styles.tabPanel}
            >
              <p>{product.description || 'Thông tin chi tiết đang được cập nhật.'}</p>
            </div>
          </section>
        </div>
        <aside className={styles.pricingCard} aria-labelledby="pricing-title">
          <header className={styles.pricingHeading}>
            <p>{isRentable ? 'THÔNG TIN GIÁ THUÊ' : 'THÔNG TIN GIÁ BÁN'}</p>
            <h2 id="pricing-title">{isRentable ? 'Sẵn Sàng Cho Chuyến Đi' : 'Trang Bị Cho Hành Trình'}</h2>
          </header>
          <fieldset className={styles.variantPicker}>
            <legend>Chọn phiên bản</legend>
            <div className={styles.variantButtons}>
              {product.variants.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  aria-pressed={variant.id === candidate.id}
                  onClick={() => handleVariantChange(candidate.id)}
                >
                  {candidate.name}
                </button>
              ))}
            </div>
          </fieldset>
          {isRentable && (
            <>
              <div className={styles.featuredPrice}>
                <span>Giá thuê từ</span>
                <p>
                  <strong>{formatCurrency(minimumDailyPrice)}</strong>
                  <span>/ ngày</span>
                </p>
              </div>
              <section className={styles.rentalPrices} aria-labelledby="rental-prices-title">
                <h3 id="rental-prices-title">Bảng giá thuê</h3>
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
              </section>
            </>
          )}
          {isForSale && (
            <div className={isRentable ? styles.salePrice : styles.featuredPrice}>
              <span>Giá bán</span>
              <strong>{formatCurrency(variant.salePrice)}</strong>
            </div>
          )}
          <div className={styles.priceNote}>
            <OutdoorIcon name="shield" size={20} />
            <p>Giá tính bằng VND. Tình trạng còn hàng và lịch thuê cần được xác nhận khi đặt hàng.</p>
          </div>
          <Link to={ROUTES.PRODUCTS} className={styles.catalogLink}>
            Khám phá thêm thiết bị <OutdoorIcon name="arrow" size={17} />
          </Link>
        </aside>
      </div>
    </article>
  );
}

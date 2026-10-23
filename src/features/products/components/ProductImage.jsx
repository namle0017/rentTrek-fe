import { PRODUCT_IMAGE_FALLBACK } from '../constants/productCatalog';

export default function ProductImage({ src, alt, className, loading = 'lazy' }) {
  const handleImageError = (event) => {
    if (event.currentTarget.getAttribute('src') !== PRODUCT_IMAGE_FALLBACK) {
      event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
    }
  };

  return (
    <img
      src={src || PRODUCT_IMAGE_FALLBACK}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleImageError}
    />
  );
}

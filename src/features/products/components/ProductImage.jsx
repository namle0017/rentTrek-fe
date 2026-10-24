import { PRODUCT_IMAGE_FALLBACK } from '../constants/productCatalog';

// Replace only the bundled demo illustrations; uploaded product photos keep their URL.
const demoPhotos = {
  '/images/products/tent.svg': '/images/discovery/tent.jpg',
  '/images/products/tent-sand.svg': '/images/discovery/tent.jpg',
  '/images/products/backpack.svg': '/images/discovery/backpack.jpg',
  '/images/products/sleeping-bag.svg': '/images/discovery/sleeping-bag.jpg',
};

export default function ProductImage({ src, alt, className, loading = 'lazy' }) {
  const handleImageError = (event) => {
    if (event.currentTarget.getAttribute('src') !== PRODUCT_IMAGE_FALLBACK) {
      event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
    }
  };

  return (
    <img
      src={demoPhotos[src] || src || PRODUCT_IMAGE_FALLBACK}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleImageError}
    />
  );
}

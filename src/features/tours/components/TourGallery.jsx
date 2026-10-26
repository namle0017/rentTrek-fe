import { useState } from 'react';
import styles from './TourGallery.module.css';

export default function TourGallery({ images = [], tourName = 'Tour trekking' }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const fallbackImages = [
    { imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', caption: 'Khung cảnh Fansipan' },
    { imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', caption: 'Bình minh trên mây' },
    { imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba', caption: 'Đường leo núi' },
    { imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', caption: 'Cắm trại đêm' },
    { imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800', caption: 'Chóp đỉnh Fansipan' },
  ];

  const displayImages = images.length >= 5 ? images : [...images, ...fallbackImages.slice(images.length)];
  const primaryImage = displayImages[0];
  const subImages = displayImages.slice(1, 5);

  return (
    <>
      <div className={styles.galleryContainer}>
        <div
          className={styles.mainImageWrapper}
          onClick={() => setSelectedImage(primaryImage.imageUrl)}
        >
          <img
            src={primaryImage.imageUrl}
            alt={primaryImage.caption || tourName}
            className={styles.image}
          />
        </div>

        {subImages.map((img, idx) => (
          <div
            key={img.id || idx}
            className={styles.subImageWrapper}
            onClick={() => setSelectedImage(img.imageUrl)}
          >
            <img src={img.imageUrl} alt={img.caption || `Ảnh ${idx + 2}`} className={styles.image} />
          </div>
        ))}

        <button
          type="button"
          className={styles.btnViewAll}
          onClick={() => setSelectedImage(primaryImage.imageUrl)}
        >
          <span>📷</span> Xem tất cả 5 ảnh
        </button>
      </div>

      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Preview"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  );
}

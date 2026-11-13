import { useState } from 'react';
import styles from './TourGallery.module.css';

export default function TourGallery({ images = [], tourName = 'Tour trekking' }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const primaryImage = images[0];
  const subImages = images.slice(1, 5);
  // Giữ khung lưới 5 ô; ô trống hiện nền xám thay vì ảnh minh hoạ không thuộc tour
  const emptySlots = subImages.length > 0 ? 4 - subImages.length : 0;

  if (!primaryImage) {
    return (
      <div className={`${styles.galleryContainer} ${styles.single}`}>
        <div className={`${styles.mainImageWrapper} ${styles.noImage}`}>Tour chưa có ảnh</div>
      </div>
    );
  }

  return (
    <>
      <div className={`${styles.galleryContainer} ${subImages.length === 0 ? styles.single : ''}`}>
        <div className={styles.mainImageWrapper} onClick={() => setSelectedImage(primaryImage.imageUrl)}>
          <img src={primaryImage.imageUrl} alt={primaryImage.caption || tourName} className={styles.image} />
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

        {Array.from({ length: emptySlots }, (_, idx) => (
          <div key={`empty-${idx}`} className={styles.subImageWrapper} aria-hidden="true" />
        ))}

        {images.length > 1 && (
          <button
            type="button"
            className={styles.btnViewAll}
            onClick={() => setSelectedImage(primaryImage.imageUrl)}
          >
            <span>📷</span> Xem tất cả {images.length} ảnh
          </button>
        )}
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

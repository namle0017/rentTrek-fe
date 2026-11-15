import { EVIDENCE_STAGE_LABEL } from '@/features/rental-ops/constants/rentalOpsLabels';
import styles from './EvidencePhotoGallery.module.css';

/** Lưới ảnh bằng chứng theo giai đoạn; onDelete chỉ truyền ở màn staff khi còn được xoá. */
export default function EvidencePhotoGallery({ photos, title = 'Ảnh bằng chứng', onOpen, onDelete, canDelete }) {
  if (!photos?.length) return null;
  const stages = [...new Set(photos.map((p) => p.stage))];
  return (
    <section className={styles.gallery} aria-label={title}>
      <h3>{title}</h3>
      {stages.map((stage) => (
        <div key={stage}>
          <p className={styles.stage}>{EVIDENCE_STAGE_LABEL[stage] || stage}</p>
          <ul className={styles.grid}>
            {photos
              .filter((p) => p.stage === stage)
              .map((photo) => (
                <li key={photo.id} className={styles.item}>
                  <button type="button" className={styles.thumb} onClick={() => onOpen?.(photo.imageUrl)}>
                    <img src={photo.imageUrl} alt={photo.note || EVIDENCE_STAGE_LABEL[stage] || stage} loading="lazy" />
                  </button>
                  {photo.note && <small>{photo.note}</small>}
                  {onDelete && canDelete?.(photo) && (
                    <button type="button" className={styles.remove} onClick={() => onDelete(photo)} aria-label="Xoá ảnh">
                      ✕
                    </button>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

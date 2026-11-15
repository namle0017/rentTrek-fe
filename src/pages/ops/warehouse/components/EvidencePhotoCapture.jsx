import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { useEvidencePhotos } from '../hooks/useFulfillment';
import styles from './EvidencePhotoCapture.module.css';

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Chụp / tải ảnh tình trạng cho một thiết bị ở bước giao (Handover) hoặc nhận lại (Return).
 * BE yêu cầu mỗi thiết bị có ít nhất `minPhotos` ảnh trước khi giao / nhận.
 */
export default function EvidencePhotoCapture({
  orderCode,
  assignmentId,
  assetCode,
  stage,
  photos = [],
  minPhotos = 1,
  disabled,
}) {
  const inputRef = useRef(null);
  const { upload, remove } = useEvidencePhotos(orderCode);
  const [error, setError] = useState('');
  const [uploadingCount, setUploadingCount] = useState(0);
  const enough = photos.length >= minPhotos;
  const busy = uploadingCount > 0 || remove.isPending;

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (inputRef.current) inputRef.current.value = '';
    if (!files.length) return;
    const invalid = files.find((file) => !ACCEPT.includes(file.type) || file.size > MAX_BYTES);
    if (invalid) {
      setError(`Ảnh "${invalid.name}" phải là JPG/PNG/WebP và tối đa 5MB.`);
      return;
    }
    setError('');
    setUploadingCount(files.length);
    try {
      for (const file of files) {
        await upload.mutateAsync({ file, stage, assignmentId });
        setUploadingCount((count) => count - 1);
      }
    } catch (uploadError) {
      setError(uploadError?.message || 'Không tải được ảnh. Vui lòng thử lại.');
    } finally {
      setUploadingCount(0);
    }
  };

  return (
    <div className={styles.capture}>
      <div className={styles.header}>
        <span
          className={styles.count}
          data-enough={enough}
          aria-label={`Ảnh ${assetCode}: ${photos.length} trên ${minPhotos} tối thiểu`}
        >
          {photos.length}/{minPhotos} ảnh
        </span>
        {!disabled && (
          <>
            <button
              type="button"
              className={styles.addBtn}
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <Camera size={16} aria-hidden="true" />
              {uploadingCount > 0 ? `Đang tải ${uploadingCount} ảnh…` : 'Chụp / tải ảnh'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT.join(',')}
              capture="environment"
              multiple
              hidden
              aria-label={`Chọn ảnh tình trạng cho ${assetCode}`}
              onChange={(event) => handleFiles(event.target.files)}
            />
          </>
        )}
      </div>
      {photos.length > 0 && (
        <ul className={styles.thumbs} aria-label={`Ảnh tình trạng của ${assetCode}`}>
          {photos.map((photo) => (
            <li key={photo.id}>
              <a href={resolveMediaUrl(photo.imageUrl)} target="_blank" rel="noreferrer">
                <img
                  src={resolveMediaUrl(photo.imageUrl)}
                  alt={`Ảnh tình trạng ${assetCode}`}
                  loading="lazy"
                />
              </a>
              {!disabled && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label={`Xoá ảnh của ${assetCode}`}
                  disabled={busy}
                  onClick={() => remove.mutate(photo.id)}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

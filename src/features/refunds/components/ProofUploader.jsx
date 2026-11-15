import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PROOF_ACCEPT, PROOF_MAX_FILES } from '../utils/validateProofFiles';
import styles from './ProofUploader.module.css';

const canPreview = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';

/** Chọn / kéo thả ảnh chứng từ. Không tự kiểm tra: component cha gọi validateProofFiles và truyền `error`. */
export default function ProofUploader({ files = [], onChange, error, disabled = false }) {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const previews = useMemo(() => files.map((file) => (canPreview ? URL.createObjectURL(file) : '')), [files]);
  useEffect(
    () => () => {
      if (canPreview) previews.forEach((url) => url && URL.revokeObjectURL(url));
    },
    [previews],
  );

  const addFiles = (picked) => {
    const incoming = Array.from(picked ?? []);
    if (incoming.length > 0) onChange([...files, ...incoming]);
  };

  const handleInputChange = (event) => {
    addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) addFiles(event.dataTransfer.files);
  };

  const removeFile = (index) => onChange(files.filter((_, position) => position !== index));

  return (
    <div className="form-field">
      <label htmlFor={inputId}>Ảnh chứng từ chuyển khoản *</label>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${
          disabled ? styles.dropzoneDisabled : ''
        }`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={PROOF_ACCEPT.join(',')}
          className={styles.hiddenInput}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onClick={(event) => event.stopPropagation()}
          onChange={handleInputChange}
        />
        <strong>Nhấn để chọn ảnh hoặc kéo thả vào đây</strong>
        <span className={styles.hint}>
          Tối đa {PROOF_MAX_FILES} ảnh JPG, PNG, WEBP, mỗi ảnh không quá 5MB
        </span>
      </div>

      {files.length > 0 && (
        <ul className={styles.thumbs} aria-label="Ảnh đã chọn">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className={styles.thumb}>
              {previews[index] && <img src={previews[index]} alt={file.name} />}
              <small title={file.name}>{file.name}</small>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Xóa ảnh ${file.name}`}
                disabled={disabled}
                onClick={() => removeFile(index)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={errorId} className="text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

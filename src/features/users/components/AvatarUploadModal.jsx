import { useEffect, useRef, useState } from 'react';
import { useUploadAvatar } from '../hooks/useUploadAvatar';
import styles from './AvatarUploadModal.module.css';

/**
 * Modal tải lên và xem trước ảnh đại diện người dùng.
 * @param {{ isOpen: boolean, onClose: () => void, currentAvatarUrl?: string }} props
 */
export default function AvatarUploadModal({ isOpen, onClose, currentAvatarUrl }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [clientError, setClientError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const uploadMutation = useUploadAvatar();

  // Giải phóng object URL khi component unmount hoặc thay đổi ảnh
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (uploadMutation.isPending) return;
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setClientError('');
    onClose();
  };

  const validateAndSetFile = (file) => {
    setClientError('');
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setClientError('Chỉ hỗ trợ file ảnh định dạng JPG, PNG hoặc WEBP');
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setClientError('Dung lượng file không được vượt quá 2MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setClientError('Vui lòng chọn một file ảnh trước khi lưu');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        handleClose();
      },
      onError: (err) => {
        setClientError(err.message || 'Tải ảnh thất bại');
      },
    });
  };

  const displayImage = previewUrl || currentAvatarUrl;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Cập nhật ảnh đại diện</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={uploadMutation.isPending}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.previewContainer}>
            {displayImage ? (
              <img src={displayImage} alt="Xem trước ảnh đại diện" className={styles.previewImg} />
            ) : (
              <div className={styles.previewPlaceholder}>
                <span className={styles.previewPlaceholderIcon}>📷</span>
                <span>Chưa chọn ảnh</span>
              </div>
            )}
          </div>

          <div
            className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className={styles.hiddenFileInput}
              onChange={handleFileChange}
            />
            <div className={styles.dropzoneText}>
              {selectedFile ? selectedFile.name : 'Nhấn để chọn ảnh hoặc kéo thả vào đây'}
            </div>
            <div className={styles.dropzoneSubtext}>Định dạng JPG, PNG, WEBP (Tối đa 2MB)</div>
          </div>

          {clientError && <div className={styles.errorBanner}>{clientError}</div>}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Đang tải lên...' : 'Lưu ảnh đại diện'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useUploadAvatar } from '../hooks/useUploadAvatar';
import styles from './AvatarUploadModal.module.css';

const VIEWPORT = 240; // px — khung cắt vuông, hiển thị dạng tròn
const OUTPUT = 512; // px — ảnh gửi lên BE
const MAX_ZOOM = 3;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024; // ảnh gốc; ảnh sau cắt luôn nhỏ hơn giới hạn 2MB của BE

const coverScale = (size, zoom) => Math.max(VIEWPORT / size.w, VIEWPORT / size.h) * zoom;

// Giữ ảnh luôn phủ kín khung: tâm ảnh chỉ được lệch tối đa nửa phần dư
const clampOffset = (offset, size, zoom) => {
  const scale = coverScale(size, zoom);
  const maxX = (size.w * scale - VIEWPORT) / 2;
  const maxY = (size.h * scale - VIEWPORT) / 2;
  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  };
};

/**
 * Modal tải lên ảnh đại diện: chọn ảnh → kéo/phóng to trong khung tròn → cắt ra JPEG 512×512.
 * @param {{ isOpen: boolean, onClose: () => void, currentAvatarUrl?: string }} props
 */
export default function AvatarUploadModal({ isOpen, onClose, currentAvatarUrl }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [clientError, setClientError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [imageSize, setImageSize] = useState(null); // kích thước gốc { w, h }
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);
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
    setImageSize(null);
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

    if (file.size > MAX_SOURCE_BYTES) {
      setClientError('Dung lượng file không được vượt quá 10MB');
      return;
    }

    setSelectedFile(file);
    setImageSize(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files?.[0]);
    e.target.value = ''; // chọn lại cùng file vẫn kích hoạt onChange
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
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const changeZoom = (next) => {
    const value = Math.min(MAX_ZOOM, Math.max(1, next));
    setZoom(value);
    if (imageSize) setOffset((current) => clampOffset(current, imageSize, value));
  };

  const moveBy = (dx, dy) => {
    if (!imageSize) return;
    setOffset((current) => clampOffset({ x: current.x + dx, y: current.y + dy }, imageSize, zoom));
  };

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    moveBy(e.clientX - dragRef.current.x, e.clientY - dragRef.current.y);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  const stopDrag = () => {
    dragRef.current = null;
  };

  const handleCropKeyDown = (e) => {
    const step = e.shiftKey ? 20 : 5;
    const moves = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (moves[e.key]) {
      e.preventDefault();
      moveBy(...moves[e.key]);
    } else if (e.key === '+' || e.key === '=') {
      changeZoom(zoom + 0.1);
    } else if (e.key === '-') {
      changeZoom(zoom - 0.1);
    }
  };

  // Vẽ đúng vùng đang thấy trong khung ra canvas OUTPUT×OUTPUT rồi xuất JPEG
  const exportCroppedFile = () =>
    new Promise((resolve, reject) => {
      const ratio = OUTPUT / VIEWPORT;
      const scale = coverScale(imageSize, zoom) * ratio;
      const width = imageSize.w * scale;
      const height = imageSize.h * scale;
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; // PNG trong suốt → nền trắng thay vì đen khi sang JPEG
      ctx.fillRect(0, 0, OUTPUT, OUTPUT);
      ctx.drawImage(
        imageRef.current,
        OUTPUT / 2 + offset.x * ratio - width / 2,
        OUTPUT / 2 + offset.y * ratio - height / 2,
        width,
        height,
      );
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
            : reject(new Error('Không thể xử lý ảnh, vui lòng chọn ảnh khác')),
        'image/jpeg',
        0.9,
      );
    });

  const handleSubmit = async () => {
    if (!selectedFile || !imageSize) {
      setClientError('Vui lòng chọn một file ảnh trước khi lưu');
      return;
    }

    let cropped;
    try {
      cropped = await exportCroppedFile();
    } catch (err) {
      setClientError(err.message);
      return;
    }

    const formData = new FormData();
    formData.append('file', cropped);

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        handleClose();
      },
      onError: (err) => {
        setClientError(err.message || 'Tải ảnh thất bại');
      },
    });
  };

  const displayScale = imageSize ? coverScale(imageSize, zoom) : 0;

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
          {previewUrl ? (
            <>
              <div
                className={styles.cropViewport}
                style={{ width: VIEWPORT, height: VIEWPORT }}
                role="group"
                tabIndex={0}
                aria-label="Khung cắt ảnh: kéo hoặc dùng phím mũi tên để chỉnh vị trí, phím + và - để phóng to, thu nhỏ"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
                onWheel={(e) => changeZoom(zoom - Math.sign(e.deltaY) * 0.1)}
                onKeyDown={handleCropKeyDown}
              >
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Ảnh đang cắt"
                  draggable={false}
                  className={styles.cropImage}
                  onLoad={(e) => setImageSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                  style={
                    imageSize
                      ? {
                          width: imageSize.w * displayScale,
                          height: imageSize.h * displayScale,
                          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                        }
                      : { visibility: 'hidden' }
                  }
                />
                <div className={styles.cropMask} aria-hidden="true" />
              </div>
              <label className={styles.zoomRow}>
                <span>Thu phóng</span>
                <input
                  type="range"
                  min="1"
                  max={MAX_ZOOM}
                  step="0.01"
                  value={zoom}
                  onChange={(e) => changeZoom(Number(e.target.value))}
                />
              </label>
              <p className={styles.cropHint}>Kéo ảnh để chọn vùng hiển thị</p>
            </>
          ) : (
            <div className={styles.previewContainer}>
              {currentAvatarUrl ? (
                <img src={currentAvatarUrl} alt="Ảnh đại diện hiện tại" className={styles.previewImg} />
              ) : (
                <div className={styles.previewPlaceholder}>
                  <span className={styles.previewPlaceholderIcon}>📷</span>
                  <span>Chưa chọn ảnh</span>
                </div>
              )}
            </div>
          )}

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
              {selectedFile
                ? `${selectedFile.name} · Chọn ảnh khác`
                : 'Nhấn để chọn ảnh hoặc kéo thả vào đây'}
            </div>
            <div className={styles.dropzoneSubtext}>Định dạng JPG, PNG, WEBP (Tối đa 10MB)</div>
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
            disabled={!imageSize || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Đang tải lên...' : 'Lưu ảnh đại diện'}
          </button>
        </div>
      </div>
    </div>
  );
}
